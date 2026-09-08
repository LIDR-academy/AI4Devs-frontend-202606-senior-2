# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LTI - Talent Tracking System. Full-stack app: React (CRA, JS+TS mixed) frontend + Express/TypeScript backend + Prisma/PostgreSQL.

## Commands

### Backend (`backend/`)
```sh
npm run dev          # ts-node-dev with hot reload, http://localhost:3010
npm run build         # tsc -> dist/
npm start             # run built dist/index.js
npm run start:prod    # build + start
npm test              # jest (ts-jest, node env)
npx jest path/to/file.test.ts   # run a single test file
npx prisma generate    # regenerate Prisma client after schema changes
npx prisma migrate dev # apply/create migrations
ts-node prisma/seed.ts # seed the database
```

### Frontend (`frontend/`)
```sh
npm start   # react-scripts dev server, http://localhost:3000
npm run build
npm test    # runs `jest --config jest.config.js` — NOTE: no jest.config.js currently exists in frontend/, so `npm test` is broken until one is added
```

### Database (root)
```sh
docker-compose up -d    # start Postgres (localhost:5432, see docker-compose.yml / .env for creds)
docker-compose down
```
Prisma schema lives at `backend/prisma/schema.prisma` (also referenced from root `package.json`'s `prisma.schema` key).

## Architecture

### Backend layering (`backend/src/`)
Loosely layered, not strictly enforced:
- `domain/models/` — plain TS classes (`Candidate`, `Position`, `Education`, `WorkExperience`, `Resume`, `Application`, `Interview*`, `Company`, `Employee`). These classes **directly instantiate `PrismaClient` and contain their own persistence methods** (`.save()`, `static findOne()`, etc.) — there is no separate repository/infrastructure layer despite what the README implies. When adding data access, follow the existing pattern of putting it directly on the domain model unless asked to refactor toward a repository layer.
- `application/services/` — orchestration logic called by controllers (`candidateService.ts`, `positionService.ts`, `fileUploadService.ts`), plus `validator.ts` for input validation.
- `presentation/controllers/` — Express request handlers, thin wrappers calling application services.
- `routes/` — Express `Router` definitions, mounted in `src/index.ts` (`/candidates`, `/position`, plus a raw `/upload` route for file uploads).
- `src/index.ts` — app entry: sets up Express, attaches a shared `PrismaClient` instance to `req.prisma`, CORS restricted to `http://localhost:3000`, mounts routes, generic error-handling middleware last.
- `src/prompts/` — saved prompts used to generate code in this repo (e.g. `CreateNewRoute.md`); reference for the intended workflow/style when adding new endpoints, not application code.
- API surface documented in `backend/api-spec.yaml`; data model documented in `backend/ModeloDatos.md`.
- Tests are colocated as `*.test.ts` next to the code they cover (e.g. `candidateService.test.ts` beside `candidateService.ts`), run via `ts-jest`.

### Frontend (`frontend/src/`)
- Routing/composition entry actually used at runtime is `App.js` (CRA resolves `.js` before `.tsx` when both exist), which defines routes `/` (`RecruiterDashboard`), `/add-candidate` (`AddCandidateForm`), `/positions` (`Positions`). `App.tsx` is leftover CRA boilerplate and is **not** the active component — don't edit it expecting it to affect the running app.
- `components/` mixes `.js` and `.tsx` files; no strict convention — match the existing file's language when editing it.
- `services/candidateService.js` — axios calls to the backend (`http://localhost:3010`), hardcoded base URL (not env-driven).
- Styling via Bootstrap (`react-bootstrap`, `bootstrap.min.css` imported in `App.js`).

### Data model (Prisma, `backend/prisma/schema.prisma`)
Core entities: `Candidate` (has `Education[]`, `WorkExperience[]`, `Resume[]`, `Application[]`), `Company` → `Employee[]` / `Position[]`, `InterviewFlow` → `InterviewStep[]` → `InterviewType`, `Position` → `Application[]` → `Interview[]`. `Application.currentInterviewStep` points at an `InterviewStep`.

## Conventions worth following

Backend follows `backend/ManifestoBuenasPracticas.md` (DDD + SOLID + DRY guide, written against this codebase with concrete before/after examples). Key expectations when writing backend code:
- Model business concepts as domain classes (entities vs. value-object-like data), not bare objects.
- Keep single responsibility per class/function; avoid mixing validation, persistence, and business logic in one method.
- Prefer composition over inheritance (already the case throughout).
- Centralize repeated validation (e.g. email format) rather than duplicating it across call sites.

Code style is enforced via ESLint (`plugin:prettier/recommended`) + Prettier (`singleQuote: true`, `trailingComma: "all"`) in `backend/`. No linting is currently configured in `frontend/` beyond CRA's default `eslintConfig` (`react-app`, `react-app/jest`).
