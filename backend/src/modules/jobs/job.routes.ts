import { Router } from 'express';
import { validate } from '../../middleware/validate';
import * as controller from './job.controller';
import * as schemas from './job.schemas';

export const jobRouter = Router();
jobRouter.get('/jobs', validate(schemas.jobListSchema), controller.listJobs);
jobRouter.get('/jobs/:id', validate(schemas.jobIdSchema), controller.getJob);
