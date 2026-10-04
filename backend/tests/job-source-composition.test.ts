import { describe, expect, it } from 'vitest';
import { FixtureJobSourceAdapter } from '../src/modules/jobs/fixture-source.adapter';
import { createJobSourceAdapterRegistry } from '../src/modules/jobs/job-source-adapter';

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
});
