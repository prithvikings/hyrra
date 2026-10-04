import { getConfig } from '../config/env';
import { logger } from '../core/logger';
import { getPrisma } from '../db/prisma';
import { startJobIngestionWorker } from '../modules/jobs/job-ingestion.worker';

getConfig();
getPrisma();
const worker = startJobIngestionWorker();
logger.info('Hyrra job ingestion worker started');

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Job ingestion worker shutting down');
  await worker.close();
  await getPrisma().$disconnect();
  process.exit(0);
}
process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
