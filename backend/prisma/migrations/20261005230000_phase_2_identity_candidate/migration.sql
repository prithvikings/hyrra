CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');
CREATE TYPE "ExperienceType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE');

ALTER TABLE "users" ADD COLUMN "email" VARCHAR(320) NOT NULL, ADD COLUMN "passwordHash" TEXT NOT NULL;
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "sessions" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "refreshTokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessions_refreshTokenHash_key" ON "sessions"("refreshTokenHash");
CREATE INDEX "sessions_userId_revokedAt_idx" ON "sessions"("userId", "revokedAt");
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

CREATE TABLE "candidate_profiles" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "fullName" TEXT, "headline" TEXT, "bio" TEXT, "location" TEXT, "websiteUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "candidate_profiles_userId_key" ON "candidate_profiles"("userId");
CREATE INDEX "candidate_profiles_location_idx" ON "candidate_profiles"("location");

CREATE TABLE "skills" ("id" UUID NOT NULL,"name" VARCHAR(100) NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "skills_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");
CREATE TABLE "candidate_skills" ("id" UUID NOT NULL,"profileId" UUID NOT NULL,"skillId" UUID NOT NULL,"proficiency" INTEGER,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "candidate_skills_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "candidate_skills_profileId_skillId_key" ON "candidate_skills"("profileId","skillId");
CREATE INDEX "candidate_skills_skillId_idx" ON "candidate_skills"("skillId");
CREATE TABLE "experiences" ("id" UUID NOT NULL,"profileId" UUID NOT NULL,"company" TEXT NOT NULL,"title" TEXT NOT NULL,"description" TEXT,"location" TEXT,"type" "ExperienceType" NOT NULL DEFAULT 'FULL_TIME',"startDate" TIMESTAMP(3) NOT NULL,"endDate" TIMESTAMP(3),"isCurrent" BOOLEAN NOT NULL DEFAULT false,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "experiences_pkey" PRIMARY KEY ("id"));
CREATE INDEX "experiences_profileId_startDate_idx" ON "experiences"("profileId","startDate");
CREATE TABLE "education" ("id" UUID NOT NULL,"profileId" UUID NOT NULL,"institution" TEXT NOT NULL,"degree" TEXT,"field" TEXT,"description" TEXT,"startDate" TIMESTAMP(3),"endDate" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "education_pkey" PRIMARY KEY ("id"));
CREATE INDEX "education_profileId_startDate_idx" ON "education"("profileId","startDate");
CREATE TABLE "candidate_preferences" ("id" UUID NOT NULL,"profileId" UUID NOT NULL,"desiredTitles" TEXT[] DEFAULT ARRAY[]::TEXT[],"locations" TEXT[] DEFAULT ARRAY[]::TEXT[],"workModes" "WorkMode"[] DEFAULT ARRAY[]::"WorkMode"[],"minSalary" INTEGER,"maxSalary" INTEGER,"salaryCurrency" VARCHAR(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "candidate_preferences_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "candidate_preferences_profileId_key" ON "candidate_preferences"("profileId");

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "education" ADD CONSTRAINT "education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "candidate_preferences" ADD CONSTRAINT "candidate_preferences_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
