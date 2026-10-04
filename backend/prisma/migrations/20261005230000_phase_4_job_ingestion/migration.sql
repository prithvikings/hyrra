-- CreateEnum
CREATE TYPE "JobSourceType" AS ENUM ('FIXTURE', 'API', 'CAREER_PAGE');
CREATE TYPE "JobEmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY', 'FREELANCE');
CREATE TYPE "JobExperienceLevel" AS ENUM ('INTERN', 'ENTRY', 'MID', 'SENIOR', 'LEAD', 'MANAGER', 'EXECUTIVE');
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'ARCHIVED');
CREATE TYPE "IngestionRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

CREATE TABLE "companies" (
  "id" UUID NOT NULL, "name" VARCHAR(200) NOT NULL, "normalizedName" VARCHAR(200) NOT NULL,
  "website" TEXT, "logoUrl" TEXT, "description" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "companies_normalizedName_key" ON "companies"("normalizedName");
CREATE INDEX "companies_name_idx" ON "companies"("name");

CREATE TABLE "job_sources" (
  "id" UUID NOT NULL, "name" VARCHAR(120) NOT NULL, "type" "JobSourceType" NOT NULL, "baseUrl" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "job_sources_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "job_sources_name_type_key" ON "job_sources"("name", "type");

CREATE TABLE "jobs" (
  "id" UUID NOT NULL, "companyId" UUID NOT NULL, "title" VARCHAR(300) NOT NULL, "normalizedTitle" VARCHAR(300) NOT NULL,
  "description" TEXT NOT NULL, "location" TEXT, "normalizedLocation" VARCHAR(300), "workMode" "WorkMode", "employmentType" "JobEmploymentType",
  "experienceLevel" "JobExperienceLevel", "salaryMin" INTEGER, "salaryMax" INTEGER, "salaryCurrency" VARCHAR(3), "salaryText" TEXT,
  "postedAt" TIMESTAMP(3), "expiresAt" TIMESTAMP(3), "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE', "dedupeKey" VARCHAR(512) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "jobs_dedupeKey_key" ON "jobs"("dedupeKey");
CREATE INDEX "jobs_status_lastSeenAt_idx" ON "jobs"("status", "lastSeenAt");
CREATE INDEX "jobs_companyId_idx" ON "jobs"("companyId");
CREATE INDEX "jobs_normalizedTitle_idx" ON "jobs"("normalizedTitle");
CREATE INDEX "jobs_normalizedLocation_idx" ON "jobs"("normalizedLocation");
CREATE INDEX "jobs_workMode_idx" ON "jobs"("workMode");
CREATE INDEX "jobs_employmentType_idx" ON "jobs"("employmentType");
CREATE INDEX "jobs_experienceLevel_idx" ON "jobs"("experienceLevel");
CREATE INDEX "jobs_createdAt_idx" ON "jobs"("createdAt");

CREATE TABLE "job_skills" (
  "id" UUID NOT NULL, "jobId" UUID NOT NULL, "skillId" UUID NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "job_skills_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "job_skills_jobId_skillId_key" ON "job_skills"("jobId", "skillId");
CREATE INDEX "job_skills_skillId_idx" ON "job_skills"("skillId");

CREATE TABLE "job_source_records" (
  "id" UUID NOT NULL, "jobId" UUID NOT NULL, "sourceId" UUID NOT NULL, "externalJobId" VARCHAR(255) NOT NULL,
  "externalUrl" TEXT, "rawMetadata" JSONB, "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "job_source_records_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "job_source_records_sourceId_externalJobId_key" ON "job_source_records"("sourceId", "externalJobId");
CREATE INDEX "job_source_records_jobId_idx" ON "job_source_records"("jobId");
CREATE INDEX "job_source_records_sourceId_lastSeenAt_idx" ON "job_source_records"("sourceId", "lastSeenAt");

CREATE TABLE "job_ingestion_runs" (
  "id" UUID NOT NULL, "sourceId" UUID NOT NULL, "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3), "status" "IngestionRunStatus" NOT NULL DEFAULT 'RUNNING', "fetchedCount" INTEGER NOT NULL DEFAULT 0,
  "createdCount" INTEGER NOT NULL DEFAULT 0, "updatedCount" INTEGER NOT NULL DEFAULT 0, "skippedCount" INTEGER NOT NULL DEFAULT 0,
  "failedCount" INTEGER NOT NULL DEFAULT 0, "errorCode" VARCHAR(100), "errorMessage" VARCHAR(500), CONSTRAINT "job_ingestion_runs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "job_ingestion_runs_sourceId_startedAt_idx" ON "job_ingestion_runs"("sourceId", "startedAt");
CREATE INDEX "job_ingestion_runs_status_startedAt_idx" ON "job_ingestion_runs"("status", "startedAt");

ALTER TABLE "jobs" ADD CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_source_records" ADD CONSTRAINT "job_source_records_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_source_records" ADD CONSTRAINT "job_source_records_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "job_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_ingestion_runs" ADD CONSTRAINT "job_ingestion_runs_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "job_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
