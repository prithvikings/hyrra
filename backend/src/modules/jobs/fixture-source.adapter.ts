import type { RawJobRecord } from './job-normalizer';
import type { JobSourceAdapter } from './job-source-adapter';

export class FixtureJobSourceAdapter implements JobSourceAdapter {
  readonly sourceType = 'FIXTURE' as const;
  constructor(private readonly jobs: RawJobRecord[]) {}
  async fetchJobs() { return this.jobs; }
}
