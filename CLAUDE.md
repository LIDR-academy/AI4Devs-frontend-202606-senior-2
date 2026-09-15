# CLAUDE.md

## Registro de prompts (obligatorio)

Every prompt the user sends must be recorded in `prompts/prompts-iniciales.md`, written in Spanish. Add the entry in the same turn you handle the prompt, and update its "Resultado" section before you finish.

- Number the entries in order (`## Prompt N — <título corto>`) and never rewrite or delete earlier entries.
- Each entry has: **Fecha** (YYYY-MM-DD), **Rama**, the **Prompt** copied word for word as a blockquote (typos included), **Objetivo**, and **Resultado** (files created or changed, commands run, decisions taken, and anything left pending).
- If the user interrupts a task, note it in that entry's "Resultado".
- This log is separate from `backend/src/prompts/`, which holds the course prompts.

LTI Talent Tracking System (an ATS): a React (CRA) frontend and an Express + TypeScript + Prisma/PostgreSQL backend. It's a teaching repo (AI4Devs), and the UI text, many code comments and the docs are in Spanish.

## Commands

No `node_modules` are committed. Run `npm install` in `backend/` and `frontend/` separately. The root `package.json` only points Prisma at `backend/prisma/schema.prisma`.

```sh
# Database (reads DB_USER / DB_PASSWORD / DB_NAME / DB_PORT from root .env)
docker-compose up -d

# Backend (port 3010, hardcoded in src/index.ts)
cd backend
npm run dev                      # ts-node-dev, auto-reload
npm run build && npm start       # tsc -> dist/, then node dist/index.js
npx prisma generate
npx prisma migrate dev
npx ts-node prisma/seed.ts       # seed lives in prisma/ (the README's `ts-node seed.ts` path is wrong)

# Backend tests (Jest + ts-jest)
npm test
npx jest src/application/services/positionService.test.ts   # single file
npx jest -t "should return 200"                              # single test by name

# Frontend (port 3000)
cd frontend
npm start
npm run build
npx react-scripts test           # `npm test` is broken: it points to a jest.config.js that doesn't exist
```

Linting: there is no lint script. `backend/.eslintrc.js` is a legacy config, and ESLint 9 ignores it by default. Use Prettier directly (`npx prettier --write src`); the config is single quotes and trailing commas.

## Architecture

### Backend (`backend/src`): layered, loosely DDD

Requests flow **routes → presentation/controllers → application/services → domain/models → Prisma**.

- `index.ts` builds the Express app. It sets up JSON parsing, attaches `req.prisma` (nothing actually uses it), allows CORS only from `http://localhost:3000`, and mounts the routes. It also calls `app.listen`, so tests must not import it.
- `routes/`
  - `candidateRoutes.ts` is mounted at `/candidates`.
  - `positionRoutes.ts` is mounted at **`/position`** (singular).
  - `POST /upload` is registered directly in `index.ts`.
- `presentation/controllers/` parse params, call services and map errors to HTTP status codes.
- `application/services/` hold the use-case logic. `validator.ts` validates candidate payloads: names allow Spanish letters, the phone must be a 9-digit Spanish number starting with 6, 7 or 9, and dates must be `YYYY-MM-DD`. If the payload has an `id`, validation is skipped entirely.
- `domain/models/` has one class per Prisma model. It's an Active Record style: each class has a `constructor(data: any)`, a `save()` (create or update depending on `id`) and static `findOne*` methods. **Every model file creates its own `new PrismaClient()`.** `positionService.ts` also queries Prisma directly without going through the models.
- The README mentions `infrastructure/` and `tests/` directories, but they don't exist. Tests sit next to the files they test (`*.test.ts`).

Endpoints (`api-spec.yaml` documents all of them except `interviewflow`):

| Method | Path | Notes |
|---|---|---|
| POST | `/candidates` | Creates a candidate with `educations[]`, `workExperiences[]` and `cv {filePath, fileType}`. The route handler calls the service directly; `addCandidateController` is unused. |
| GET | `/candidates/:id` | Returns the candidate with educations, experiences, resumes, and applications (including position and interviews). |
| PUT | `/candidates/:id` | **Moves an application to another stage**, not a general candidate update. The body is `{ applicationId, currentInterviewStep }`, where the step is an `InterviewStep.id`. |
| GET | `/position/:id/candidates` | Returns `[{ fullName, currentInterviewStep (step name), averageScore, id (candidateId), applicationId }]`. |
| GET | `/position/:id/interviewflow` | Returns `{ interviewFlow: { positionName, interviewFlow: { id, description, interviewSteps[] } } }`. Note the double nesting. |
| POST | `/upload` | Multipart field `file`, PDF or DOCX only, 10 MB max. Returns `{ filePath, fileType }`. |

### Data model (`backend/prisma/schema.prisma`; full description in `backend/ModeloDatos.md`)

- A `Candidate` has many `Education`, `WorkExperience`, `Resume` and `Application` records.
- A `Company` has many `Employee` and `Position` records.
- A `Position` belongs to one `InterviewFlow`. An `InterviewFlow` has many `InterviewStep`s (each with an `orderIndex` and an `InterviewType`).
- An `Application` links a Candidate to a Position. `currentInterviewStep` is a foreign key to `InterviewStep`.
- An `Interview` records one Application at one InterviewStep with one Employee, plus a `score` and `result`.

`Position.status` is a free-form string. The seed uses `Open`, and the Prisma default is `Draft`.

### Frontend (`frontend/src`)

- Create React App with a mix of JS and TS (`allowJs`), react-bootstrap, react-router v6 and react-datepicker.
- **`App.js` is the real app.** `index.tsx` imports `./App`, and CRA resolves `.js` before `.tsx`. `App.tsx` and `logo.svg` are unused CRA boilerplate.
- Routes:
  - `/` → `RecruiterDashboard`
  - `/add-candidate` → `AddCandidateForm` (uses `FileUploader`, which uploads the CV first, then POSTs the candidate)
  - `/positions` → `Positions.tsx`, which is **mock data only**. Its "Ver proceso" and "Editar" buttons do nothing.
- API calls use `fetch` with the hardcoded base URL `http://localhost:3010`. `services/candidateService.js` imports `axios`, but axios isn't a dependency and nothing imports that file.
- Nothing in the frontend calls the position, interview-flow or stage-update endpoints yet.

## Gotchas

- **The DB URL is hardcoded in `schema.prisma`** (`datasource.url`), so the `DATABASE_URL` in `.env` is ignored. It must match the Docker credentials in `.env`. Both `.env` and `backend/.env` are committed.
- `candidateService` wraps caught errors as `new Error(error)`, which adds an `"Error: "` prefix to messages. `updateCandidateStageController` depends on this and matches the exact string `'Error: Application not found'`.
- Creating a candidate probably **inserts educations and work experiences twice**. `new Candidate(data)` receives them and `Candidate.save()` creates them as nested records, then `addCandidate` loops and saves each one again. Check this before relying on the counts.
- Multer saves to `'../uploads/'` relative to the process's working directory, so running from `backend/` writes to `<repo>/uploads/`. Multer doesn't create that directory, so uploads fail until it exists.
- In `index.ts`, the request-logging middleware is registered after the routes, so it never logs API calls.
- Service tests mock `@prisma/client` with `jest.mock` because the models create clients at import time. Controller tests mock the service module.

## Conventions

- `backend/ManifestoBuenasPracticas.md` is the project's best-practices guide (DDD, SOLID, DRY). It recommends moving toward repositories, factories and injecting `PrismaClient`. Follow it for new backend code.
- New endpoints follow the same layering: route file → controller (validates params, maps errors to status codes) → service → model or Prisma. Update `api-spec.yaml` when adding one.
- `backend/src/prompts/` stores the prompts used during the course.
