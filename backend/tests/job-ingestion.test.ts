import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  source: { id: 'source-1', enabled: true, type: 'FIXTURE' as const },
  run: { id: 'run-1' },
  createRun: vi.fn().mockResolvedValue({ id: 'run-1' }),
  updateRun: vi.fn().mockResolvedValue({ id: 'run-1' })
}));

vi.mock('../src/db/prisma', () => ({ getPrisma: () => ({ jobSource: { findUnique: vi.fn().mockResolvedValue(mocks.source) }, jobIngestionRun: { create: mocks.createRun, update: mocks.updateRun } }) }));

import { FixtureJobSourceAdapter } from '../src/modules/jobs/fixture-source.adapter';
import { JobSourceAdapterRegistry } from '../src/modules/jobs/job-source-adapter';
import { JobIngestionService } from '../src/modules/jobs/job-ingestion.service';

const valid = { externalJobId: '1', title: 'Engineer', company: { name: 'Acme' }, description: 'Build things', skills: [] };

describe('job ingestion service', () => {
  it('continues after malformed records and tracks skipped records', async () => {
    const repository = { upsert: vi.fn().mockResolvedValue({ jobId: 'job-1', created: true }) };
    const adapter = new FixtureJobSourceAdapter([valid, { externalJobId: '', title: '', company: { name: '' }, description: '', skills: [] } as never]);
    const registry = new JobSourceAdapterRegistry().register(adapter);
    const service = new JobIngestionService(repository, registry);
    const result = await service.ingestSource('source-1');
    expect(result.fetchedCount).toBe(2);
    expect(result.createdCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.failedCount).toBe(0);
    expect(mocks.updateRun).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'run-1' }, data: expect.objectContaining({ status: 'COMPLETED', skippedCount: 1 }) }));
  });

  it('records source failures without hiding them', async () => {
    const failingAdapter = { sourceType: 'FIXTURE' as const, fetchJobs: vi.fn().mockRejectedValue(new Error('provider unavailable')) };
    const registry = new JobSourceAdapterRegistry().register(failingAdapter);
    const service = new JobIngestionService({ upsert: vi.fn() }, registry);
    await expect(service.ingestSource('source-1')).rejects.toThrow('provider unavailable');
    expect(mocks.updateRun).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED', errorCode: 'SOURCE_FETCH_FAILED' }) }));
  });
});
