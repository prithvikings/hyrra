import { AppError } from '../../errors/app-error';
import { JobRepository } from './job.repository';

function getRepository() {
  return new JobRepository();
}

export async function listJobs(filters: { page?: number; limit?: number; location?: string; workMode?: string; employmentType?: string; experienceLevel?: string; sourceId?: string; status?: string }) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const result = await getRepository().list({ ...filters, page, limit });
  return { ...result, page, limit };
}

export async function getJob(id: string) {
  const job = await getRepository().findById(id);
  if (!job) throw new AppError('JOB_NOT_FOUND', 404, 'Job not found');
  return job;
}

export function toPublicJob(job: Awaited<ReturnType<JobRepository['findById']>>) {
  if (!job) throw new AppError('JOB_NOT_FOUND', 404, 'Job not found');
  return {
    id: job.id,
    title: job.title,
    company: { id: job.company.id, name: job.company.name, website: job.company.website, logoUrl: job.company.logoUrl },
    description: job.description,
    location: job.location,
    workMode: job.workMode,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    salary: { min: job.salaryMin, max: job.salaryMax, currency: job.salaryCurrency, text: job.salaryText },
    skills: job.skills.map(({ skill }) => ({ id: skill.id, name: skill.name })),
    postedAt: job.postedAt,
    expiresAt: job.expiresAt,
    status: job.status,
    sources: job.sourceRecords.map(({ source, externalJobId, externalUrl }) => ({ source: { id: source.id, name: source.name, type: source.type }, externalJobId, url: externalUrl }))
  };
}
