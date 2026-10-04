import type { Request, Response } from 'express';
import { AppError } from '../../errors/app-error';
import * as service from './job.service';
import type { JobListQuery } from './job.schemas';

const paramId = (req: Request) => {
  const { id } = req.params;
  if (Array.isArray(id) || !id) throw new AppError('INVALID_RESOURCE_ID', 400, 'Invalid resource id');
  return id;
};

export async function listJobs(req: Request, res: Response) {
  const result = await service.listJobs(req.query as JobListQuery);
  res.json({ success: true, data: result.items.map(service.toPublicJob), pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
}

export async function getJob(req: Request, res: Response) {
  const job = await service.getJob(paramId(req));
  res.json({ success: true, data: service.toPublicJob(job) });
}
