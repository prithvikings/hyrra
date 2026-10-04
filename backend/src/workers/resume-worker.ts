import { loadEnv } from '../config/env';
import { getPrisma } from '../db/prisma';
import { startResumeWorker } from '../modules/resumes/resume.processor';
import { logger } from '../core/logger';

loadEnv();
const worker = startResumeWorker();
getPrisma();
logger.info('Hyrra resume worker started');

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Resume worker shutting down');
  await worker.close();
  await getPrisma().$disconnect();
  process.exit(0);
};
process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
