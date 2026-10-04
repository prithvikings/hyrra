import type { Prisma, PrismaClient } from '@prisma/client';
import { getPrisma } from '../../db/prisma';
import { resolveFreshness } from './job-freshness';
import type { CanonicalJobInput } from './job-normalizer';

export class JobRepository {
  constructor(private readonly db: PrismaClient = getPrisma()) {}

  async upsert(sourceId: string, input: CanonicalJobInput) {
    return this.db.$transaction(async (tx) => {
      const company = await tx.company.upsert({
        where: { normalizedName: input.company.normalizedName },
        create: { name: input.company.name, normalizedName: input.company.normalizedName, website: input.company.website, logoUrl: input.company.logoUrl, description: input.company.description },
        update: { website: input.company.website, logoUrl: input.company.logoUrl, description: input.company.description }
      });

      const existingSource = await tx.jobSourceRecord.findUnique({ where: { sourceId_externalJobId: { sourceId, externalJobId: input.externalJobId } } });
      const existingByDedupe = await tx.job.findUnique({ where: { dedupeKey: input.dedupeKey } });
      const jobId = existingSource?.jobId ?? existingByDedupe?.id;
      const now = new Date();
      const jobData: Prisma.JobUncheckedCreateInput = {
        companyId: company.id,
        title: input.title,
        normalizedTitle: input.normalizedTitle,
        description: input.description,
        location: input.location,
        normalizedLocation: input.normalizedLocation,
        workMode: input.workMode,
        employmentType: input.employmentType,
        experienceLevel: input.experienceLevel,
        salaryMin: input.salaryMin,
        salaryMax: input.salaryMax,
        salaryCurrency: input.salaryCurrency,
        salaryText: input.salaryText,
        postedAt: input.postedAt,
        expiresAt: input.expiresAt,
        lastSeenAt: now,
        status: resolveFreshness(input.expiresAt, now),
        dedupeKey: input.dedupeKey
      };

      const job = jobId ? await tx.job.update({ where: { id: jobId }, data: jobData }) : await tx.job.create({ data: jobData });

      await tx.jobSourceRecord.upsert({
        where: { sourceId_externalJobId: { sourceId, externalJobId: input.externalJobId } },
        create: { jobId: job.id, sourceId, externalJobId: input.externalJobId, externalUrl: input.sourceUrl, rawMetadata: input.rawMetadata, lastSeenAt: now },
        update: { jobId: job.id, externalUrl: input.sourceUrl, rawMetadata: input.rawMetadata, lastSeenAt: now }
      });

      for (const skill of input.skills) {
        const skillRecord = await tx.skill.upsert({ where: { name: skill }, create: { name: skill }, update: {} });
        await tx.jobSkill.upsert({ where: { jobId_skillId: { jobId: job.id, skillId: skillRecord.id } }, create: { jobId: job.id, skillId: skillRecord.id }, update: {} });
      }

      return { jobId: job.id, created: !existingSource && !existingByDedupe };
    });
  }

  async findById(id: string) {
    return this.db.job.findUnique({ where: { id }, include: { company: true, skills: { include: { skill: true } }, sourceRecords: { include: { source: true } } } });
  }

  async list(filters: { location?: string; workMode?: string; employmentType?: string; experienceLevel?: string; sourceId?: string; status?: string; page: number; limit: number }) {
    const where: Prisma.JobWhereInput = {};
    if (filters.location) where.normalizedLocation = { contains: filters.location.toLowerCase().trim() };
    if (filters.workMode) where.workMode = filters.workMode as never;
    if (filters.employmentType) where.employmentType = filters.employmentType as never;
    if (filters.experienceLevel) where.experienceLevel = filters.experienceLevel as never;
    if (filters.status) where.status = filters.status as never;
    if (filters.sourceId) where.sourceRecords = { some: { sourceId: filters.sourceId } };
    const skip = (filters.page - 1) * filters.limit;
    const [items, total] = await this.db.$transaction([
      this.db.job.findMany({ where, skip, take: filters.limit, orderBy: { lastSeenAt: 'desc' }, include: { company: true, skills: { include: { skill: true } }, sourceRecords: { include: { source: true } } } }),
      this.db.job.count({ where })
    ]);
    return { items, total };
  }
}
