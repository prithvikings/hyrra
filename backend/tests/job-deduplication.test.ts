import { describe, expect, it } from 'vitest';
import { hasStrongCrossSourceEvidence } from '../src/modules/jobs/job.repository';
import { normalizeJob } from '../src/modules/jobs/job-normalizer';

const base = {
  externalJobId: 'new-job',
  title: 'Senior Software Engineer',
  company: { name: 'Acme' },
  location: 'Remote',
  workMode: 'Remote',
  employmentType: 'Full Time',
  experienceLevel: 'Senior',
  skills: ['TypeScript']
};

describe('cross-source deduplication safety', () => {
  it('does not merge same core fingerprint when description and URL differ', () => {
    const input = normalizeJob({ ...base, description: 'Build payments infrastructure', sourceUrl: 'https://source-a.example/jobs/1' });
    const candidate = {
      sourceRecords: [{ normalizedExternalUrl: 'https://source-b.example/jobs/9', descriptionSignature: normalizeJob({ ...base, externalJobId: 'old-job', description: 'Build an entirely different analytics platform', sourceUrl: 'https://source-b.example/jobs/9' }).descriptionSignature }]
    };

    expect(input.dedupeFingerprint).toBe(normalizeJob({ ...base, externalJobId: 'other', description: 'Build an entirely different analytics platform', sourceUrl: 'https://source-b.example/jobs/9' }).dedupeFingerprint);
    expect(hasStrongCrossSourceEvidence(candidate, input)).toBe(false);
  });

  it('accepts the same normalized source URL as strong evidence', () => {
    const input = normalizeJob({ ...base, description: 'Build payments infrastructure', sourceUrl: 'https://jobs.example.com/123?utm_source=feed' });
    const candidate = { sourceRecords: [{ normalizedExternalUrl: 'https://jobs.example.com/123', descriptionSignature: 'different' }] };

    expect(hasStrongCrossSourceEvidence(candidate, input)).toBe(true);
  });

  it('accepts an exact normalized description signature as strong evidence', () => {
    const input = normalizeJob({ ...base, description: 'Build payments infrastructure', sourceUrl: 'https://source-a.example/jobs/1' });
    const candidate = { sourceRecords: [{ normalizedExternalUrl: 'https://source-b.example/jobs/2', descriptionSignature: input.descriptionSignature }] };

    expect(hasStrongCrossSourceEvidence(candidate, input)).toBe(true);
  });
});
