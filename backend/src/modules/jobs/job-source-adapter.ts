import type { JobSourceType } from '@prisma/client';
import type { RawJobRecord } from './job-normalizer';

export interface JobSourceAdapter {
  readonly sourceType: JobSourceType;
  fetchJobs(): Promise<RawJobRecord[]>;
}

export class JobSourceAdapterRegistry {
  private readonly adapters = new Map<JobSourceType, JobSourceAdapter>();

  register(adapter: JobSourceAdapter) {
    this.adapters.set(adapter.sourceType, adapter);
    return this;
  }

  resolve(sourceType: JobSourceType) {
    const adapter = this.adapters.get(sourceType);
    if (!adapter) throw new Error(`No job source adapter registered for ${sourceType}`);
    return adapter;
  }
}

export function createJobSourceAdapterRegistry(adapters: readonly JobSourceAdapter[] = []) {
  return adapters.reduce((registry, adapter) => registry.register(adapter), new JobSourceAdapterRegistry());
}
