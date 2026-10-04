import { getPrisma } from '../../db/prisma';
import { JobRepository } from './job.repository';
import { normalizeJob } from './job-normalizer';
import type { JobSourceAdapterRegistry } from './job-source-adapter';
import { ZodError } from 'zod';

export type IngestionResult = { runId: string; fetchedCount: number; createdCount: number; updatedCount: number; skippedCount: number; failedCount: number };
export interface JobPersistence { upsert(sourceId: string, input: ReturnType<typeof normalizeJob>): Promise<{ jobId: string; created: boolean }> }

export class JobIngestionService {
  constructor(private readonly repository: JobPersistence = new JobRepository(), private readonly adapters: JobSourceAdapterRegistry) {}

  async ingestSource(sourceId: string): Promise<IngestionResult> {
    const db = getPrisma();
    const source = await db.jobSource.findUnique({ where: { id: sourceId } });
    if (!source) throw new Error('JOB_SOURCE_NOT_FOUND');
    if (!source.enabled) throw new Error('JOB_SOURCE_DISABLED');

    const run = await db.jobIngestionRun.create({ data: { sourceId, status: 'RUNNING' } });
    let fetchedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    try {
      const rawJobs = await this.adapters.resolve(source.type).fetchJobs();
      fetchedCount = rawJobs.length;
      for (const rawJob of rawJobs) {
        let normalized: ReturnType<typeof normalizeJob>;
        try {
          normalized = normalizeJob(rawJob);
        } catch (error) {
          if (error instanceof ZodError || (error instanceof Error && error.message === 'salary_min_greater_than_max')) skippedCount += 1;
          else failedCount += 1;
          continue;
        }
        try {
          const result = await this.repository.upsert(sourceId, normalized);
          if (result.created) createdCount += 1;
          else updatedCount += 1;
        } catch {
          failedCount += 1;
        }
      }
      await db.jobIngestionRun.update({ where: { id: run.id }, data: { status: 'COMPLETED', completedAt: new Date(), fetchedCount, createdCount, updatedCount, skippedCount, failedCount } });
      return { runId: run.id, fetchedCount, createdCount, updatedCount, skippedCount, failedCount };
    } catch (error) {
      await db.jobIngestionRun.update({ where: { id: run.id }, data: { status: 'FAILED', completedAt: new Date(), fetchedCount, createdCount, updatedCount, skippedCount, failedCount, errorCode: 'SOURCE_FETCH_FAILED', errorMessage: error instanceof Error ? error.message.slice(0, 500) : 'Unknown source failure' } });
      throw error;
    }
  }
}
