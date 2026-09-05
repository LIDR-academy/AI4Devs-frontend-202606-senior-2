# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

LTI (Talent Tracking System) — a candidate/interview tracking app. Full-stack: React (Create React App, `frontend/`) + Express/TypeScript backend (`backend/`) backed by PostgreSQL via Prisma. Backend and frontend are separate npm projects with independent `package.json`/`package-lock.json`; there is no root install step beyond `docker-compose`.

## Commands

Run these from within `backend/` or `frontend/` respectively — there are no root-level scripts except Prisma passthrough.

### Backend (`backend/`)
- `npm run dev` — start with ts-node-dev (auto-restart), the usual way to run locally
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run compiled `dist/index.js` (run `build` first)
- `npm test` — run Jest test suite (ts-jest, `testEnvironment: node`)
- `npx jest path/to/file.test.ts` — run a single test file
- `npx jest -t "test name"` — run tests matching a name
- `npm run prisma:generate` — regenerate Prisma client after editing `prisma/schema.prisma`
- `npx prisma migrate dev` — apply/create migrations
- `npx ts-node prisma/seed.ts` — seed the database

Backend listens on port 3010 (hardcoded in `src/index.ts`), CORS-restricted to `http://localhost:3000`.

### Frontend (`frontend/`)
- `npm start` — CRA dev server on port 3000
- `npm run build` — production build
- `npm test` — Jest (`jest.config.js`) — note this is Jest directly, not `react-scripts test`

### Database (root)
- `docker-compose up -d` — start Postgres in Docker (reads `DB_USER`/`DB_PASSWORD`/`DB_NAME`/`DB_PORT` from `.env`)
- `docker-compose down` — stop it

`DATABASE_URL` lives in both root `.env` and `backend/.env` and is also hardcoded as a fallback directly in `backend/prisma/schema.prisma`'s `datasource db` block — if changing DB credentials, update all three places or Prisma will silently use the stale hardcoded URL.

## Architecture

The backend follows a layered/DDD-ish structure under `backend/src/`:
- `routes/` — Express route definitions, wire HTTP verbs to controllers (`candidateRoutes.ts`, `positionRoutes.ts`)
- `presentation/controllers/` — parse `req`/`res`, delegate to application services, map errors to status codes
- `application/services/` — orchestration logic (`candidateService.ts`, `positionService.ts`, `fileUploadService.ts`) and `validator.ts` for input validation
- `domain/models/` — one class per Prisma entity (`Candidate`, `Education`, `WorkExperience`, `Resume`, `Application`, `Position`, `Company`, `Employee`, `Interview`, `InterviewFlow`, `InterviewStep`, `InterviewType`)

Domain models are **active-record style**, not plain data classes: e.g. `Candidate` has `.save()` and static `.findOne(id)` methods that call Prisma directly inside the model itself. There is no separate repository layer despite `ManifestoBuenasPracticas.md` recommending one — when working in `domain/models/`, follow the existing active-record pattern for consistency unless explicitly asked to refactor toward repositories.

`index.ts` is the Express app entry point: attaches a shared `PrismaClient` to `req.prisma`, mounts `/candidates` and `/position` routers, and a raw `/upload` route for file uploads.

Data model (see `backend/ModeloDatos.md` for full ERD): `Candidate` is the aggregate root for `Education`, `WorkExperience`, `Resume`, and `Application`. Recruiting side: `Company` → `Employee`/`Position`; `Position` references an `InterviewFlow`, which is an ordered sequence of `InterviewStep`s (each tied to an `InterviewType`); `Application` links a `Candidate` to a `Position` and tracks `currentInterviewStep`; `Interview` records a single interview event within an `Application`.

API surface is documented in `backend/api-spec.yaml` (OpenAPI, served via `swagger-ui-express`/`swagger-jsdoc`).

Frontend (`frontend/src/`) is a flat CRA structure: `App.tsx` for routing (react-router-dom), `components/` for feature components (`AddCandidateForm.js`, `FileUploader.js`, `Positions.tsx`, `RecruiterDashboard.js`), `services/candidateService.js` for API calls to the backend. Uses react-bootstrap for UI.

## Conventions

- Backend formatting: Prettier with `singleQuote: true`, `trailingComma: "all"` (`backend/.prettierrc`); ESLint extends `plugin:prettier/recommended`.
- `backend/ManifestoBuenasPracticas.md` (Spanish) documents intended DDD/SOLID/DRY conventions for this project, including known gaps (e.g. missing repository layer, `any`-typed data passed into constructors) — treat it as a design-intent reference, not a description of current state.
