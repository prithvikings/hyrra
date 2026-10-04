import { JobEmploymentType, JobExperienceLevel, JobStatus, WorkMode } from '@prisma/client';
import { z } from 'zod';

const uuid = z.string().uuid();
export const jobIdSchema = z.object({ params: z.object({ id: uuid }), query: z.record(z.string(), z.unknown()).optional(), body: z.record(z.string(), z.unknown()).optional() });
export const jobListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  location: z.string().trim().min(1).optional(),
  workMode: z.enum(WorkMode).optional(),
  employmentType: z.enum(JobEmploymentType).optional(),
  experienceLevel: z.enum(JobExperienceLevel).optional(),
  sourceId: uuid.optional(),
  status: z.enum(JobStatus).optional()
});
export type JobListQuery = z.output<typeof jobListQuerySchema>;

export const jobListSchema = z.object({
  body: z.record(z.string(), z.unknown()).optional(),
  params: z.record(z.string(), z.unknown()).optional(),
  query: jobListQuerySchema
});
