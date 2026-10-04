-- CreateEnum
CREATE TYPE "ResumeVersionStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED');

CREATE TABLE "resumes" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "targetRole" VARCHAR(160),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "resume_versions" (
    "id" UUID NOT NULL,
    "resumeId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "originalFilename" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(127) NOT NULL,
    "storageKey" VARCHAR(512) NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "status" "ResumeVersionStatus" NOT NULL DEFAULT 'UPLOADED',
    "extractedText" TEXT,
    "parsedData" JSONB,
    "parsingMetadata" JSONB,
    "failureCode" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "resumes_profileId_isDefault_idx" ON "resumes"("profileId", "isDefault");
CREATE INDEX "resumes_profileId_updatedAt_idx" ON "resumes"("profileId", "updatedAt");
CREATE UNIQUE INDEX "resume_versions_storageKey_key" ON "resume_versions"("storageKey");
CREATE UNIQUE INDEX "resume_versions_resumeId_version_key" ON "resume_versions"("resumeId", "version");
CREATE INDEX "resume_versions_resumeId_version_idx" ON "resume_versions"("resumeId", "version");
CREATE INDEX "resume_versions_resumeId_status_idx" ON "resume_versions"("resumeId", "status");
CREATE INDEX "resume_versions_createdAt_idx" ON "resume_versions"("createdAt");

ALTER TABLE "resumes" ADD CONSTRAINT "resumes_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
