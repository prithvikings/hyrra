import { createQueue, enqueue } from '../../integrations/queues';

export interface JobIngestionJob { sourceId: string }

export function jobIngestionQueue() { return createQueue<JobIngestionJob>('job.ingestion'); }
export function enqueueJobIngestion(sourceId: string) { return enqueue(jobIngestionQueue(), 'ingest-source', { sourceId }); }
