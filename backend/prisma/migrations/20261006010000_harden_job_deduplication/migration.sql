-- The original Phase 4 dedupe key was an unsafe global identity.
-- Keep the fingerprint for indexed candidate lookup, but remove uniqueness.
ALTER TABLE "jobs" RENAME COLUMN "dedupeKey" TO "dedupeFingerprint";
DROP INDEX "jobs_dedupeKey_key";
CREATE INDEX "jobs_dedupeFingerprint_idx" ON "jobs"("dedupeFingerprint");

ALTER TABLE "job_source_records"
  ADD COLUMN "normalizedExternalUrl" VARCHAR(2048),
  ADD COLUMN "descriptionSignature" VARCHAR(64);

CREATE INDEX "job_source_records_normalizedExternalUrl_idx" ON "job_source_records"("normalizedExternalUrl");
CREATE INDEX "job_source_records_descriptionSignature_idx" ON "job_source_records"("descriptionSignature");
