import { describe, expect, it } from 'vitest';
import { FixtureJobSourceAdapter } from '../src/modules/jobs/fixture-source.adapter';
import { JobSourceAdapterRegistry } from '../src/modules/jobs/job-source-adapter';

describe('job source adapters', () => {
  it('returns deterministic fixture records', async () => {
    const adapter = new FixtureJobSourceAdapter([{ externalJobId: 'fixture-1', title: 'Engineer', company: { name: 'Acme' }, description: 'Build things', skills: [] }]);
    await expect(adapter.fetchJobs()).resolves.toHaveLength(1);
    await expect(adapter.fetchJobs()).resolves.toEqual(await adapter.fetchJobs());
  });

  it('resolves adapters by source type', () => {
    const adapter = new FixtureJobSourceAdapter([]);
    const registry = new JobSourceAdapterRegistry().register(adapter);
    expect(registry.resolve('FIXTURE')).toBe(adapter);
    expect(() => registry.resolve('API')).toThrow('No job source adapter registered');
  });
});
