# Hyrra Backend

## Stack
Node.js, TypeScript, Express, PostgreSQL, Prisma, Redis, BullMQ, Zod, Pino, Vitest, Argon2id, JWT. Resume extraction uses Multer, `pdf-parse`, and Mammoth.

## Architecture
Modular monolith. HTTP flow: route/controller -> validation -> service -> Prisma data access -> database. Authentication identity is kept in `User`; candidate data is separated behind `CandidateProfile`; resumes are source documents separated from canonical candidate data.

## Setup
Use Node.js 20+. Copy `.env.example` to `.env`, start PostgreSQL and Redis, then run `npm install`, `npm run prisma:generate`, `npm run prisma:migrate`, and `npm run dev`.

Resume processing is asynchronous. Run `npm run worker` in a second terminal when local Redis/PostgreSQL are available.

## Environment
Required: `NODE_ENV`, `PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`.
Resume storage: `STORAGE_PROVIDER=local` and `STORAGE_ROOT=./storage/resumes` for development. Cloud storage is intentionally not implemented in this phase.

## Commands
`npm run dev`, `npm run worker`, `npm run build`, `npm run typecheck`, `npm test`, `npm run prisma:generate`, `npm run prisma:migrate`.

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
- `POST /api/v1/resumes/:id/versions/:versionId/parsed/apply` — explicitly applies selected parsed profile/skill fields; parser output never silently overwrites canonical candidate data.

Only PDF and DOCX are accepted, with a 5 MB upload limit. Stored files use server-generated storage keys. API responses never expose storage paths or raw document text.

## Processing
`upload -> ResumeVersion(UPLOADED) -> BullMQ resume.process -> worker -> document parser -> deterministic section/entity extraction -> parsed snapshot -> COMPLETED/FAILED`.

The parsed snapshot is versioned JSON data attached to `ResumeVersion`. It is a source interpretation; `CandidateProfile`, `Skill`, `Experience`, and `Education` remain canonical editable data.

## API conventions
`GET /health` checks process health. `GET /health/ready` checks PostgreSQL and Redis. `/api/v1` is the versioned API root. Errors use `{success:false,error:{code,message,details?}}`; timestamps are ISO 8601; public IDs are UUIDs.

## Boundaries
Feature modules live under `src/modules/<module>`. Infrastructure is under `src/core`, `src/db`, `src/integrations`, and `src/workers`. Job ingestion, matching, recommendations, applications, Gmail, AI generation, ATS analysis, analytics, browser extension APIs, and V3 functionality remain intentionally out of scope.

## Migrations
Use Prisma migrations for committed schema changes. Do not use `prisma db push` as the persistent migration strategy.
