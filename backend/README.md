# Hyrra Backend

## Stack
Node.js, TypeScript, Express, PostgreSQL, Prisma, Redis, BullMQ, Zod, Pino, Vitest, Argon2id, JWT.

## Architecture
Modular monolith. HTTP flow: route/controller -> validation -> service -> Prisma data access -> database. Authentication identity is kept in `User`; candidate data is separated behind a one-to-one `CandidateProfile`.

## Setup
Use Node.js 20+. Copy `.env.example` to `.env`, start PostgreSQL and Redis, then run `npm install`, `npm run prisma:generate`, `npm run prisma:migrate`, and `npm run dev`.

## Required environment
`NODE_ENV`, `PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`. AI/storage variables remain placeholders for later phases.

## Commands
`npm run dev`, `npm run build`, `npm run typecheck`, `npm test`, `npm run prisma:generate`, `npm run prisma:migrate`.

## API
`GET /health` checks process health. `GET /health/ready` checks PostgreSQL and Redis. `/api/v1` is the versioned API root. Phase 2 exposes `/api/v1/auth/*` and candidate profile resources under `/api/v1/profile/*`. Errors use `{success:false,error:{code,message,details?}}`; timestamps are ISO 8601; public IDs are UUIDs.

Authentication uses short-lived access JWTs plus server-side revocable refresh-token session records. Raw refresh tokens are never persisted. Candidate-owned resources are always resolved through the authenticated user's candidate profile.

## Boundaries
Feature modules live under `src/modules/<module>`. Infrastructure is under `src/core`, `src/db`, `src/integrations`, and `src/workers`. Later-phase features such as resumes, jobs, matching, recommendations, AI, Gmail, applications, and analytics are intentionally not implemented.

## Migrations
Use Prisma migrations for committed schema changes. Do not use `prisma db push` as the persistent migration strategy.
