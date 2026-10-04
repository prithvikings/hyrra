import { describe, expect, it, vi } from 'vitest';
import { JobRepository } from '../src/modules/jobs/job.repository';
import { normalizeJob } from '../src/modules/jobs/job-normalizer';

const input = normalizeJob({
  externalJobId: 'external-1',
  title: 'Senior Software Engineer',
  company: { name: 'Acme' },
  description: 'Build payments infrastructure',
  location: 'Remote',
  workMode: 'Remote',
  employmentType: 'Full Time',
  experienceLevel: 'Senior',
  sourceUrl: 'https://jobs.example.com/123',
  skills: []
});

function makeDb({ existingSource = null, candidates = [] }: { existingSource?: { jobId: string } | null; candidates?: unknown[] } = {}) {
  const canonicalJobId = existingSource?.jobId ?? (candidates[0] as { id?: string } | undefined)?.id ?? 'job-1';
  const tx = {
    company: { upsert: vi.fn().mockResolvedValue({ id: 'company-1' }) },
    jobSourceRecord: {
      findUnique: vi.fn().mockResolvedValue(existingSource),
      upsert: vi.fn().mockResolvedValue({ id: 'source-record-1' })
    },
    job: {
      findMany: vi.fn().mockResolvedValue(candidates),
      update: vi.fn().mockResolvedValue({ id: canonicalJobId }),
      create: vi.fn().mockResolvedValue({ id: 'job-1' })
    },
    skill: { upsert: vi.fn() },
    jobSkill: { upsert: vi.fn() }
  };
  return { db: { $transaction: vi.fn((callback: (transaction: typeof tx) => unknown) => callback(tx)) } as never, tx };
}

describe('job repository identity handling', () => {
  it('uses source identity before cross-source deduplication', async () => {
    const { db, tx } = makeDb({ existingSource: { jobId: 'existing-job' }, candidates: [{ id: 'other-job', sourceRecords: [{ normalizedExternalUrl: input.normalizedSourceUrl, descriptionSignature: input.descriptionSignature }] }] });
    const repository = new JobRepository(db);

    const result = await repository.upsert('source-1', input);

    expect(result).toEqual({ jobId: 'existing-job', created: false });
    expect(tx.job.findMany).not.toHaveBeenCalled();
    expect(tx.job.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'existing-job' } }));
  });

  it('creates a separate canonical job when the core fingerprint matches but strong evidence does not', async () => {
    const { db, tx } = makeDb({ candidates: [{ id: 'other-job', sourceRecords: [{ normalizedExternalUrl: 'https://other.example/jobs/9', descriptionSignature: 'different-signature' }] }] });
    const repository = new JobRepository(db);

    const result = await repository.upsert('source-2', input);

    expect(result).toEqual({ jobId: 'job-1', created: true });
    expect(tx.job.create).toHaveBeenCalledOnce();
    expect(tx.job.update).not.toHaveBeenCalled();
  });

  it('reuses a canonical job when a strong cross-source signal matches', async () => {
    const { db, tx } = makeDb({ candidates: [{ id: 'canonical-job', sourceRecords: [{ normalizedExternalUrl: input.normalizedSourceUrl, descriptionSignature: 'different-signature' }] }] });
    const repository = new JobRepository(db);

    const result = await repository.upsert('source-2', input);

    expect(result).toEqual({ jobId: 'canonical-job', created: false });
    expect(tx.job.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'canonical-job' } }));
    expect(tx.job.create).not.toHaveBeenCalled();
  });
});
