import express, { type Request, type Response } from 'express';
import pinoHttp from 'pino-http';
import { logger } from './core/logger';
import { errorHandler } from './errors/error-handler';
import { notFoundHandler } from './middleware/not-found';
import { healthRouter } from './modules/health/health.routes';
import { authRouter } from './modules/auth/auth.routes';
import { candidateRouter } from './modules/candidates/candidate.routes';
import { resumeRouter } from './modules/resumes/resume.routes';
import { jobRouter } from './modules/jobs/job.routes';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp({ logger }));
  app.use(healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.get('/api/v1', (_req: Request, res: Response) => res.json({ success: true, data: { service: 'hyrra-backend' } }));
  app.use('/api/v1', jobRouter);
  app.use('/api/v1', candidateRouter);
  app.use('/api/v1/resumes', resumeRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
