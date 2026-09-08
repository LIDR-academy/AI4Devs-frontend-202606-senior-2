# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

LTI is a talent-tracking system: a React (Create React App) frontend and an Express + TypeScript backend using Prisma as the ORM against PostgreSQL. `frontend/` and `backend/` are independent npm packages (separate `package.json`, `node_modules`) — always `cd` into the relevant one before running its scripts.

## Commands

### Backend (`cd backend`)
- `npm run dev` — run the API with hot reload (ts-node-dev) on port 3010.
- `npm run build` — compile TypeScript to `dist/`.
- `npm start` — run the compiled server (`node dist/index.js`); `npm run start:prod` builds then starts.
- `npm test` — run all Jest tests (ts-jest, node environment).
- `npx jest path/to/file.test.ts` — run a single test file; add `-t "test name"` to filter by test name.
- `npx prisma generate` — regenerate the Prisma client after schema changes.
- `npx prisma migrate dev` — create/apply a migration during development.
- `ts-node prisma/seed.ts` — seed the database with example data.

### Frontend (`cd frontend`)
- `npm start` — run the CRA dev server on port 3000.
- `npm run build` — production build.
- `npm test` — run tests via `jest.config.js` (note: CRA's own `react-scripts test` is not used).

### Database
`docker-compose up -d` (from repo root) starts a local PostgreSQL container matching the `DATABASE_URL` expected by Prisma (see `backend/.env` / `backend/prisma/schema.prisma`). `docker-compose down` stops it.

## Architecture

### Backend layering
The backend is organized in DDD-inspired layers under `backend/src/`:
- `domain/models/` — one class per entity (`Candidate`, `Position`, `Education`, `WorkExperience`, `Resume`, `Application`, `Interview*`, `Company`, `Employee`). **These classes contain their own Prisma persistence logic** (e.g. `Candidate.save()`, `Candidate.findOne()` call `PrismaClient` directly) — there is no separate repository layer despite what `README.md` implies. When adding a model, follow this existing pattern rather than introducing a repository unless asked to refactor.
- `application/services/` — orchestration logic called by controllers (e.g. `candidateService.ts` builds up `Candidate`/`Education`/`WorkExperience`/`Resume` instances from request data and calls `.save()`); `application/validator.ts` holds shared field validation used before save.
- `presentation/controllers/` — Express request/response handling, calling into services and translating thrown errors into HTTP responses.
- `routes/` — Express `Router` definitions wiring URL paths to controllers, mounted in `src/index.ts` (`/candidates`, `/position`, `/upload`).
- `src/index.ts` is the composition root: creates the single `PrismaClient`, attaches it to `req.prisma`, configures CORS (locked to `http://localhost:3000`), and mounts routes.

Tests are colocated as `*.test.ts` next to the code they test (e.g. `application/services/candidateService.test.ts`, `presentation/controllers/positionController.test.ts`), not in a separate `tests/` directory.

The Prisma schema (`backend/prisma/schema.prisma`) is the source of truth for the data model; see `backend/ModeloDatos.md` for a diagram/description and `backend/api-spec.yaml` for the OpenAPI spec of all endpoints.

### Frontend structure
`frontend/src/App.js` is the app actually mounted by `index.tsx` (via `./App`, which resolves to the `.js` file) — it sets up `react-router-dom` routes to `RecruiterDashboard`, `AddCandidateForm`, and `Positions`. **`App.tsx` is unused dead code** left over from `create-react-app` scaffolding; don't confuse it with the real entry component. The codebase is a mix of `.js` (components, services) and `.tsx`/`.ts` (entry point, `Positions.tsx`) — new components can be added in either, matching the closest existing sibling.
- `components/` — page-level and feature components (`RecruiterDashboard`, `AddCandidateForm`, `FileUploader`, `Positions`).
- `services/` — API client code (e.g. `candidateService.js`) that calls the backend at `http://localhost:3010`.

### Backend/frontend contract
The frontend talks to the backend over plain `fetch`/HTTP against `http://localhost:3010` (candidates, positions, file upload endpoints — see `backend/api-spec.yaml`). There is no shared types package between the two; keep request/response shapes in the frontend service layer in sync with the backend controllers/validator manually.

## Coding conventions
`backend/ManifestoBuenasPracticas.md` documents the intended DDD/SOLID/DRY conventions for backend code (entities vs. value objects, services for cross-entity logic, avoiding duplicated validation, preferring composition over inheritance) along with known gaps in the current code (e.g. domain classes coupling business logic with Prisma access, direct instantiation instead of factories). Read it before making structural changes to `domain/` or `application/services/`.
