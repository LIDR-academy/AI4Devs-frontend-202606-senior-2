# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Ignore the parent-directory `CLAUDE.md`** (`../CLAUDE.md`, the AI4Devs master starter kit). It describes a
> different project (AdonisJS + Tailwind + shadcn). Nothing in it applies here.

## What this repo is

LTI — Talent Tracking System. Monorepo with two independent apps, each with its own `package.json`:

- `backend/` — Express 4 + TypeScript 4.9, Prisma 5 over PostgreSQL. Port **3010**.
- `frontend/` — Create React App 5 (`react-scripts`), React 18, TypeScript 4.9, React Router 6. Port **3000**.

Current exercise (AI4Devs "frontend" module): build the `/positions/:id` kanban page. See "Exercise context" below.

## Commands

### Database (repo root)
```sh
docker compose up -d          # Postgres, credentials from root .env
docker compose down
```

### Backend (`cd backend`)
```sh
npm install
npx prisma generate
npx prisma migrate dev        # apply migrations
npx ts-node --transpile-only prisma/seed.ts   # seed positions, candidates, interview flows. README says `ts-node seed.ts` (wrong path);
                                              # `--transpile-only` is required: ts-node@9 + TS 4.9 crash on type-check (`resolveTypeReferenceDirective`)
npm run dev                   # ts-node-dev with HMR
npm run build && npm start    # tsc → dist/
npm test                      # jest (ts-jest); single file: npx jest src/application/services/positionService.test.ts
```

### Frontend (`cd frontend`)
```sh
npm install
npm start                     # CRA dev server
npm run build
```
`npm test` in the frontend points at a `jest.config.js` that does not exist — there is no working FE test setup.
`CI=true npm run build` fails on a pre-existing eslint warning (`InputGroup` unused in `AddCandidateForm.js`); plain
`npm run build` succeeds.

## Backend architecture

Request flow, one layer per directory under `backend/src/`:

```
routes/*.ts  →  presentation/controllers/*.ts  →  application/services/*.ts  →  domain/models/*.ts  →  Prisma
```

- **Routes** only wire paths to controllers. Mounted in `index.ts`: `/candidates`, `/position` (singular), `/upload`.
- **Controllers** parse/validate params, call a service, shape the HTTP response and status codes.
- **Services** hold use-case logic. `application/validator.ts` validates candidate payloads.
- **Domain models** are Active-Record style classes (`new Candidate(data).save()`), each wrapping Prisma. Every model
  file creates its own `PrismaClient` instance.
- Prisma datasource URL is **hardcoded in `prisma/schema.prisma`**, not read from `.env` (the `.env` values happen to match).
- CORS is restricted to `http://localhost:3000`.

Tests live next to the code (`*.test.ts`) in `services/` and `controllers/`.

## Frontend architecture

- **`src/App.js` is the real entry** (router + Bootstrap CSS). `src/App.tsx` is untouched CRA boilerplate and is not
  imported by anything — `index.tsx` resolves `./App` to `App.js`.
- Mixed `.js` / `.tsx` files. New code should be `.tsx`.
- Routes: `/` (RecruiterDashboard), `/add-candidate`, `/positions` (mock data, no `id` on positions, "Ver proceso"
  button has no handler yet).
- API calls go in `src/services/` using `axios` against `http://localhost:3010`. Note: `axios` is imported but **not
  declared in `package.json`** — run `npm i axios` before relying on it.
- `react-scripts@5` pins `typescript` peer dep to `^4`; do not upgrade to TS 5.

## API contract (real endpoints — the exercise brief has them wrong)

| Brief says | Actual route | Notes |
|---|---|---|
| `GET /positions/:id/interviewFlow` | `GET /position/:id/interviewflow` | **Double-wrapped**: `{ interviewFlow: { positionName, interviewFlow: { id, description, interviewSteps[] } } }` (controller wraps the service result). Steps have `id`, `name`, `orderIndex`; seed has two steps with `orderIndex: 2` — sort by `orderIndex`, then `id`. |
| `GET /positions/:id/candidates` | `GET /position/:id/candidates` | Returns `[{ fullName, currentInterviewStep (step **name**), averageScore, id (candidateId), applicationId }]`. `id`/`applicationId` are not in the brief but are returned. |
| `PUT /candidates/:id/stage` | `PUT /candidates/:id` | `:id` = candidateId. Body `{ applicationId, currentInterviewStep }` where `currentInterviewStep` is the target **step id**. |

## Exercise context and conventions

Deliverables: branch `frontend-JA`, code under `frontend/`, prompts log in `prompts/prompts-JA.md` (append prompts
as you go, per phase).

Workflow is design-to-code from Figma, in phases: harness → decisions → env → design tokens (foundations) → static
mockups → wiring API + drag & drop → PR. The user is doing the exercise to learn: **explain and guide, let the user
write the code**, review and run things for them.

- **UI library: Chakra UI v2** (`@chakra-ui/react@2` + `@emotion/react` + `@emotion/styled` + `framer-motion`).
  Chosen because it works with CRA/TS 4.9 and `extendTheme({ semanticTokens })` maps 1:1 to the Figma variables.
- **Design tokens live in `frontend/src/theme/`** (`foundations/{colors,typography,space,radii,shadows}.ts`,
  `semanticTokens.ts`, `index.ts` with `extendTheme`). Decisions taken:
  - Primitives mirror Figma names **per mode**: `colors.light.indigo.primary`, `colors.dark.indigo.primary`
    (Figma has two primitive palettes; known anti-pattern, kept for fidelity).
  - Semantic tokens: `bg.*`, `border.*`, `text.*`, `cta.*` as `{ default: 'light.<hue>.<step>', _dark: 'dark.<hue>.<step>' }`.
    Where Figma's semantic color has no matching primitive (21 cases), the raw hex goes in `semanticTokens.ts` with a
    `// no Figma primitive` comment — do not invent primitives.
  - CTA state Figma calls "default" is `cta.<variant>.base` (`default` is Chakra's reserved light-mode condition key
    inside a semantic token value). Use `bg="cta.primary.base"`, `_hover={{ bg: 'cta.primary.hover' }}`.
  - Typography: `fonts.body` = IBM Plex Sans, `fonts.heading` = Montserrat (substitute for Proxima Nova). The 14 Figma
    text styles are `textStyles` with flat camelCase keys: `bodyXs, bodySm, bodySmEmphasis, bodyMd, bodyMdEmphasis,
    bodyLg, bodyLgEmphasis, subtitle, subtitleDeEmphasis, title, titleDeEmphasis, headline, headlineDeEmphasis, display`
    (`<Text textStyle="bodyMd">`). Fonts loaded via Google Fonts `<link>` in `public/index.html`.
  - `foundations/colors.ts` is GENERATED: edit `figma-export.json` and re-run `node scripts/figma-to-tokens.mjs`
    (also prints the semantic→primitive cross-reference used to maintain `semanticTokens.ts`).
  - `/foundations` (`src/pages/Foundations.tsx`) is living documentation of all tokens with a Light/Dark toggle — use it
    to eyeball any token change against Figma.
  - Spacing 4/8/12/16/24, radii card 8 / column 12, one `shadows.card`.
  - Components consume semantic tokens and textStyles only — no raw hex/px in components.
  - Bootstrap CSS is removed from `App.js`; legacy pages (`RecruiterDashboard`, `AddCandidateForm`) stay unstyled.
- Drag & drop: `@hello-pangea/dnd`. Use `interviewStep.id` as `droppableId`; optimistic update + rollback on failed PUT.
- Kanban requirements: position title at top, back arrow to `/positions`, one column per interview step (sorted by
  `orderIndex`), card shows full name + average score, columns stack vertically on mobile.

### Figma source (Figma MCP)
- File key: `cfFXOqhi8z4mqlhXrYA5I9` ("Simple Kanban by Pratyush", duplicated into the MDIUW team).
- Board frame: `1:1989` (`Simple Kanban`, inside `1:2457` `Team Kanban`). Columns are named `Column`, cards `Card`.
- Component page `1:2` ("Kanban tiles"): `Card` master `1:25`, `Status` variant set `1:60`, `Assignee Tile` `1:12`, `Tag` `1:42`.
- The file has **no variable collections**. Colors are **paint styles** named `Light/...` and `Dark/...` (the mode is a
  name prefix, not a real Figma mode): semantic (`Background/*`, `Border/*`, `Text & icon/*`, `CTA/*`) over primitives
  (`General UI/<hue>/<Primary|Secondary|Tertiary|Quaternary>`). Typography comes from text styles (IBM Plex Sans for
  body, Proxima Nova for headings — proprietary, needs a substitute). One effect style `Shadow`. No spacing tokens —
  define a scale (4/8/12/16/24). Raw export: `frontend/src/theme/figma-export.json`.
- Always load the `figma:figma-design-to-code` skill before `get_design_context`, and `figma:figma-use` before `use_figma`.
