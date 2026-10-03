import { Router } from 'express';
import { health, readiness } from './health.controller';
export const healthRouter = Router();
healthRouter.get('/health', health);
healthRouter.get('/health/ready', readiness);
