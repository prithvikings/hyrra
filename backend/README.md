# Hyrra Backend

## Stack
Node.js, TypeScript, Express, PostgreSQL, Prisma, Redis, BullMQ, Zod, Pino, Vitest.

## Architecture
Modular monolith. HTTP flow: route/controller -> validation -> service -> repository/data access -> database. Current phase contains only cross-cutting infrastructure and health checks.

## Setup
Use Node.js 20+. Copy `.env.example` to `.env`, start PostgreSQL and Redis, then run `npm install`, `npm run prisma:generate`, `npm run prisma:migrate`, and `npm run dev`.

## Required environment
`NODE_ENV`, `PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`. AI/storage variables are placeholders only.

## Commands
`npm run dev`, `npm run build`, `npm run typecheck`, `npm test`, `npm run prisma:generate`, `npm run prisma:migrate`.

## API
`GET /health` checks process health. `GET /health/ready` checks PostgreSQL and Redis. `/api/v1` is the versioned API root. Errors use `{success:false,error:{code,message,details?}}`; timestamps are ISO 8601; public IDs are UUIDs.

## Boundaries
Feature modules live under `src/modules/<module>`. Infrastructure is under `src/core`, `src/db`, `src/integrations`, and `src/workers`. Product features such as auth, resumes, jobs, matching, AI, and Gmail are intentionally not implemented.

## Migrations
Use Prisma migrations for committed schema changes. Do not use `prisma db push` as the persistent migration strategy.
