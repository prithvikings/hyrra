# Hyrra Backend

## Stack
Node.js, TypeScript, Express, PostgreSQL, Prisma, Redis, BullMQ, Zod, Pino, Vitest, Argon2id, JWT. Resume extraction uses Multer, `pdf-parse`, and Mammoth.

## Architecture
Modular monolith. HTTP flow: route/controller -> validation -> service -> Prisma data access -> database. External job sources use source adapters -> raw records -> normalization -> canonical jobs -> deduplication -> persistence. Authentication identity remains in `User`; candidate data remains behind `CandidateProfile`; resumes remain source documents separate from canonical candidate data; canonical jobs are not user-owned.

## Setup
Use Node.js 20+. Copy `.env.example` to `.env`, start PostgreSQL and Redis, then run `npm install`, `npm run prisma:generate`, `npm run prisma:migrate`, and `npm run dev`.

Resume processing is asynchronous. Run `npm run worker` for resume processing. Job ingestion is asynchronous; run `npm run job:worker` for the dedicated ingestion worker when Redis/PostgreSQL are available.

## Environment
Required: `NODE_ENV`, `PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`.
Resume storage: `STORAGE_PROVIDER=local` and `STORAGE_ROOT=./storage/resumes` for development. Cloud storage is intentionally not implemented in this phase.

## Commands
`npm run dev`, `npm run worker`, `npm run job:worker`, `npm run build`, `npm run typecheck`, `npm test`, `npm run prisma:generate`, `npm run prisma:migrate`.

## Resume API
Authenticated endpoints:

- `POST /api/v1/resumes` — multipart upload with `file`, `name`, and optional `targetRole`
- `GET /api/v1/resumes`
- `GET /api/v1/resumes/:id`
- `PATCH /api/v1/resumes/:id`
- `DELETE /api/v1/resumes/:id`
- `GET /api/v1/resumes/:id/versions`
- `GET /api/v1/resumes/:id/versions/:versionId`
- `POST /api/v1/resumes/:id/versions` — multipart upload with `file`
- `DELETE /api/v1/resumes/:id/versions/:versionId`
- `GET /api/v1/resumes/:id/versions/:versionId/parsed`
- `POST /api/v1/resumes/:id/versions/:versionId/parsed/apply`

## Job API
Canonical job discovery is public and does not use user ownership:

- `GET /api/v1/jobs`
- `GET /api/v1/jobs/:id`

The list endpoint supports deterministic filters for `location`, `workMode`, `employmentType`, `experienceLevel`, `sourceId`, and `status`, plus `page` and `limit`. Responses expose canonical job data and source attribution, not raw source metadata.

## Job domain
Phase 4 models `Company`, `Job`, `JobSource`, `JobSourceRecord`, `JobSkill`, and `JobIngestionRun`. `Job` is canonical and provider-independent. `JobSourceRecord` preserves source identity (`sourceId + externalJobId`), external URL, source metadata, and freshness timestamps. Multiple source records can point at one canonical job.

## Ingestion architecture
`External source -> JobSourceAdapter -> RawJobRecord -> normalize/validate -> deterministic deduplication -> Prisma transaction -> canonical Job + source record + skills`.

The adapter interface is intentionally small. Adding a real source means implementing `JobSourceAdapter`, registering it for a `JobSourceType`, and leaving the ingestion service unchanged. Phase 4 ships only a deterministic fixture adapter; it does not scrape arbitrary sites or bypass anti-bot controls.

## Normalization
Titles preserve their display value while storing normalized values for deterministic matching/deduplication. Locations are normalized without geocoding. Work mode is restricted to `REMOTE`, `HYBRID`, and `ONSITE`. Employment and experience categories are normalized into canonical enums. Salary min/max/currency are preserved without currency conversion. Skills are normalized deterministically and stored relationally through `JobSkill`.

## Deduplication and freshness
Exact source identity is enforced by `JobSourceRecord(sourceId, externalJobId)`. Cross-source deduplication uses a conservative deterministic fingerprint of normalized company, title, location, employment type, and experience level; no semantic/AI duplicate detection is performed. `lastSeenAt` is updated on repeated ingestion. Explicit `expiresAt` values drive `ACTIVE` versus `EXPIRED`; expired records are retained rather than deleted.

## Queue/worker behavior
`job.ingestion` is the dedicated BullMQ queue. Payloads contain only `sourceId`. The worker resolves the source adapter, fetches records, normalizes and validates each record, persists valid records, and records ingestion counts. Malformed records are skipped without destroying the run; catastrophic source failures mark the run `FAILED`. Worker resources use the existing lifecycle/cleanup infrastructure.

## Testing and local ingestion
Code-level tests cover normalization, deterministic deduplication signals, fixture adapters, freshness, public response shape, and API validation behavior. PostgreSQL/Redis-backed ingestion requires local infrastructure. To exercise a real source locally, add a `JobSource` row and register a legitimate adapter; no live provider credentials or undocumented APIs are included in Phase 4.

## API conventions
`GET /health` checks process health. `GET /health/ready` checks PostgreSQL and Redis. `/api/v1` is the versioned API root. Errors use `{success:false,error:{code,message,details?}}`; timestamps are ISO 8601; public IDs are UUIDs.

## Boundaries
Feature modules live under `src/modules/<module>`. Infrastructure is under `src/core`, `src/db`, `src/integrations`, and `src/workers`. Matching, semantic search, embeddings, recommendations, saved jobs, applications, Gmail, AI generation, ATS analysis, analytics, browser extension APIs, and V3 functionality remain intentionally out of scope.

## Migrations
Use Prisma migrations for committed schema changes. Do not use `prisma db push` as the persistent migration strategy.
