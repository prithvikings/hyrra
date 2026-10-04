import { describe, expect, it, vi } from 'vitest';
import { FixtureJobSourceAdapter } from '../src/modules/jobs/fixture-source.adapter';
import { createJobSourceAdapterRegistry } from '../src/modules/jobs/job-source-adapter';
import { JobIngestionService } from '../src/modules/jobs/job-ingestion.service';

const valid = { externalJobId: '1', title: 'Engineer', company: { name: 'Acme' }, description: 'Build things', skills: [] };

describe('job source composition', () => {
  it('composes a registry externally with the fixture adapter for tests', () => {
    const adapter = new FixtureJobSourceAdapter([valid]);
    const registry = createJobSourceAdapterRegistry([adapter]);

    expect(registry.resolve('FIXTURE')).toBe(adapter);
  });

  it('does not make the default registry depend on the fixture adapter', () => {
    const registry = createJobSourceAdapterRegistry();
    expect(() => registry.resolve('FIXTURE')).toThrow('No job source adapter registered for FIXTURE');
  });

  it('keeps adapter composition outside the ingestion service', async () => {
    const adapter = { sourceType: 'FIXTURE' as const, fetchJobs: vi.fn().mockResolvedValue([valid]) };
    const registry = createJobSourceAdapterRegistry([adapter]);
    const repository = { upsert: vi.fn().mockResolvedValue({ jobId: 'job-1', created: true }) };
    const prisma = {
      jobSource: { findUnique: vi.fn().mockResolvedValue({ id: 'source-1', enabled: true, type: 'FIXTURE' }) },
      jobIngestionRun: { create: vi.fn().mockResolvedValue({ id: 'run-1' }), update: vi.fn().mockResolvedValue({ id: 'run-1' }) }
    };
    const service = new JobIngestionService(repository, registry, prisma as never);

    await service.ingestSource('source-1');

    expect(adapter.fetchJobs).toHaveBeenCalledOnce();
  });
});
