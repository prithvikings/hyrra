import { logger } from '../../core/logger';
import { createWorker } from '../../workers/worker-factory';
import { JobIngestionService } from './job-ingestion.service';
import { FixtureJobSourceAdapter } from './fixture-source.adapter';
import { JobSourceAdapterRegistry } from './job-source-adapter';
import { type JobIngestionJob } from './job-ingestion.queue';

export function createJobIngestionService() {
  const registry = new JobSourceAdapterRegistry().register(new FixtureJobSourceAdapter([]));
  return new JobIngestionService(undefined, registry);
}

export function startJobIngestionWorker() {
  const service = createJobIngestionService();
  return createWorker<JobIngestionJob>('job.ingestion', async (job) => {
    const result = await service.ingestSource(job.data.sourceId);
    logger.info({ sourceId: job.data.sourceId, runId: result.runId, fetchedCount: result.fetchedCount, createdCount: result.createdCount, updatedCount: result.updatedCount, skippedCount: result.skippedCount, failedCount: result.failedCount }, 'Job ingestion completed');
  });
}
