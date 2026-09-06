# Code quality report — frontend

Review of this repository against **Módulo 10 — "Buenas prácticas para el Desarrollo Frontend"**
(AI4Devs, 2026). Section references below (§1–§9, Bloque 4) point at that document.

- **Date:** 2026-09-06
- **Scope:** `frontend/` primarily, plus repo-level items covered by the doc's security section.
- **Baseline:** all frontend code reviewed here comes from the initial commit (`8025b6f`), i.e. the
  course scaffold.
- **Method:** findings were verified by reading, computing, or executing — contrast ratios were
  calculated, `npm audit` and `npm test` were run, DB state was queried. Items that turned out to be
  non-issues are listed under "Checked and clean" so they are not re-investigated.

## Summary

| Severity | Count | Types affected |
| --- | --- | --- |
| 🔴 Critical | 1 | Security |
| 🟠 High | 7 | Security, Accessibility, Correctness, Code quality |
| 🟡 Medium | 20 | All types |
| 🟢 Low | 12 | Accessibility, Correctness, Performance, Maintainability, UX, AI-readiness |
| **Total** | **40** | |

### Already addressed

One critical finding — **live database credentials committed to git** — was fixed separately:
`.env` / `backend/.env` are now untracked and gitignored, `.env.example` templates were added, and
the database password was rotated. Note that the original password remains in git history
(`8025b6f` and `a025c3f`) and must be treated as permanently compromised; it was only ever used by
the local development database.

---

## 1. Security — §4

### 🔴 Critical — 68 npm vulnerabilities (3 critical, 35 high, 14 moderate, 16 low)

Verified with `npm audit`. Nearly all trace to `react-scripts@5.0.1`
(`frontend/package.json:21`), which is unmaintained — Create React App was formally deprecated in
February 2025. §4 lists `npm audit` as a baseline control; §3 and §7 name **Vite** as the
replacement standard.

**Fix:** migrate CRA → Vite. This is the single change that clears most of the advisories, and it
also unblocks several performance findings below (modern bundler, real code splitting).

### 🟠 High — No security headers anywhere

No CSP, `Strict-Transport-Security`, `X-Frame-Options`, or `Referrer-Policy` — not in
`frontend/public/index.html`, not in any server configuration. §4 lists all four as the minimum
above HTTPS.

### 🟡 Medium — No client-side validation library; schemas not shared

`frontend/src/components/AddCandidateForm.js` relies solely on HTML `required` / `type="email"`.
The backend does validate (`backend/src/application/validator.ts`, hand-rolled regex), so the
security half exists — but the two are independent and will drift.
§4: *"Zod o Valibot permiten compartir schemas entre front y back, eliminando divergencias."*

### 🟡 Medium — `dotenv` shipped as a browser runtime dependency

`frontend/package.json:14`. Unused today, but it is a loaded gun in a client bundle.
§4: *"Nunca secretos en el cliente."*

---

## 2. Accessibility (WCAG 2.2 AA) — §5

§5 flags this as **legally binding** under the European Accessibility Act since 28 June 2025.

### 🟠 High — `lang="en"` on a Spanish UI

`frontend/public/index.html:2`. The entire interface is Spanish ("Dashboard del Reclutador",
"Añadir Candidato"). Screen readers apply English phonemes to Spanish text.
**WCAG 3.1.1 (Language of Page), Level A.**

### 🟠 High — Contrast failure: 1.63:1

`frontend/src/components/Positions.tsx:56` — `bg-warning` (`#ffc107`) with `text-white`.
Measured **1.63:1 against a required 4.5:1**. **WCAG 1.4.3, Level AA.** Applied to both the
"Abierto" and "Cerrado" badges.

The other Bootstrap colors in use pass, if narrowly: `bg-success` 4.53:1, `bg-secondary` 4.69:1,
`bg-primary` 4.50:1, `bg-danger` 4.53:1.

### 🟠 High — Four form controls with no accessible name

`frontend/src/components/Positions.tsx:23, 26, 29, 38`. Two use placeholder-only ("Buscar por
título", "Buscar por fecha"); two use a first `<option>` as a pseudo-label ("Estado", "Manager").
A placeholder is not an accessible name and disappears on input.
**WCAG 1.3.1 / 3.3.2 / 4.1.2.**

### 🟡 Medium — Nested interactive elements

`frontend/src/components/RecruiterDashboard.js:17-19` and `25-27` render
`<a><button>…</button></a>`. Invalid HTML; ambiguous focus and activation semantics for assistive
tech.
**Fix:** `<Button as={Link} to="…">`.

### 🟡 Medium — No landmarks

No `<main>`, `<nav>`, or `<aside>` in any rendered component. The only `<header>` is in
`frontend/src/App.tsx:8`, which is dead code (see §5 below). §5 lists landmarks explicitly.

### 🟡 Medium — No skip links

§5: *"skip-links para teclado."*

### 🟡 Medium — One static page title for all routes

`frontend/public/index.html:27` — `<title>React App</title>`, never updated per route.
**WCAG 2.4.2 (Page Titled), Level A.**

### 🟢 Low — No automated accessibility testing

No axe-core, no `eslint-plugin-jsx-a11y` beyond the react-app defaults, no CI.
§5 and §9.3: *"Combínalo con axe-core en CI para que no se regrese."*

---

## 3. Correctness — React bugs

### 🟠 High — CV is silently submitted empty

`frontend/src/components/AddCandidateForm.js:160-164` passes the *same* handler to both `onChange`
and `onUpload`. `frontend/src/components/FileUploader.js:13` fires `onChange(File)` the moment a
file is picked, so `candidate.cv` holds a raw `File`. If the user never clicks "Subir Archivo",
that `File` is truthy, so `handleSubmit` (`:58-61`) reads `.filePath` / `.fileType` off it and
POSTs `{filePath: undefined, fileType: undefined}` — no error, no warning, CV lost.

### 🟠 High — Direct state mutation

`frontend/src/components/AddCandidateForm.js:23-25` and `:32-33`. `[...candidate[section]]` is a
*shallow* copy, so `updatedSection[index][e.target.name] = e.target.value` mutates the very object
still held in current state. It happens to re-render because the array reference changes, but it
defeats `React.memo`, breaks StrictMode double-render assumptions, and makes any future
state-diffing unreliable.

### 🟡 Medium — Crash on cancelled file dialog

`frontend/src/components/FileUploader.js:11-13` reads `event.target.files[0].name` unguarded.
Open the picker, press Escape → `files` is empty → `TypeError`.

### 🟡 Medium — `key={index}` on removable rows

`frontend/src/components/AddCandidateForm.js:170` and `:222`, with `handleRemoveSection` splicing
at `:43-47`. React reconciles by position, so deleting a middle education/experience row leaves the
following rows showing stale input values.

### 🟡 Medium — Broken error handling in `candidateService.js`

`frontend/src/services/candidateService.js:15` and `:24` — `new Error(msg, error.response.data)`:
`Error`'s second argument is an `options` object, so the payload is silently discarded. Worse,
`error.response` is `undefined` on any network failure, so the error handler itself throws a
`TypeError` that masks the original error. Currently unreachable — see the dead-code finding in §5.

### 🟢 Low — Two statuses render an identical badge

`frontend/src/components/Positions.tsx:56` — the ternary chain's fallback is `bg-warning`, the same
value as `'Abierto'`, so `'Cerrado'` is visually indistinguishable from `'Abierto'`.

---

## 4. Performance / Core Web Vitals — §3

### 🟡 Medium — Core Web Vitals are never measured

`frontend/src/index.tsx:19` calls `reportWebVitals()` with no argument;
`frontend/src/reportWebVitals.ts:4` returns immediately without one. The whole measurement path is
a no-op. This blocks the §9.2 loop entirely — *"medir real, priorizar con IA, aplicar, re-medir."*

### 🟡 Medium — Cannot measure INP even if wired up

`web-vitals@2.1.4` (`frontend/package.json:23`) predates INP.
`frontend/src/reportWebVitals.ts:5-10` uses `getFID` — the metric INP **replaced in March 2024**,
and one of the three §3 says actually matter. Needs web-vitals v4+ and `onINP`.

### 🟡 Medium — Zero code splitting

No `React.lazy` or `Suspense` anywhere. All three routes plus the full Bootstrap CSS and
react-datepicker CSS land in one bundle. §3: *"Carga perezosa."*

### 🟢 Low — Unoptimized LCP image

`frontend/src/assets/lti-logo.png` is a 21 KB PNG — no WebP/AVIF (§3: 30–50% smaller), no
`width`/`height` attributes, no `fetchpriority="high"`.
`frontend/src/components/RecruiterDashboard.js:10` sizes it via inline style only, so it reserves
no space before styles apply → CLS risk on the dashboard's largest element.

### 🟢 Low — `"target": "es5"`

`frontend/tsconfig.json:3`. Inflates output with transpilation for browsers the project's own
`browserslist` (`frontend/package.json:37-47`) does not support anyway.

---

## 5. Structure & maintainability — §1

### 🟡 Medium — `AddCandidateForm.js` is 280 lines, five concerns

Form state, date coercion, HTTP, the education list, and the experience list. §1's explicit rule:
*"si un componente pasa de ~150 líneas o maneja más de un concepto, divide."*

### 🟡 Medium — API base URL hardcoded in three places

`frontend/src/components/AddCandidateForm.js:76`,
`frontend/src/components/FileUploader.js:23`,
`frontend/src/services/candidateService.js:8` and `:21` — all `http://localhost:3010`.
No `process.env.REACT_APP_*` usage anywhere in `src/`. The app cannot be deployed anywhere without
editing source.

### 🟡 Medium — TypeScript is not the default

5 TS files vs 5 JS files, but the split is backwards: only `Positions.tsx` is typed, while every
component that holds state or talks to the API is `.js`. §1 calls TypeScript *the* standard for new
work in 2026, and notes the AI-specific payoff: *"los LLMs generan código mucho más preciso cuando
leen tipos."*

### 🟡 Medium — Dead code, one piece of it broken

`frontend/src/services/candidateService.js` is imported by nothing — and it imports `axios`, which
is **not in `frontend/package.json`**. The build only survives because the module is unreachable;
wiring it up would break `npm run build`.

Separately, `frontend/src/App.tsx` and `frontend/src/logo.svg` are CRA boilerplate shadowed by
`frontend/src/App.js` (CRA's module resolution puts `.js` before `.tsx`), which is a genuine trap
for anyone editing "the App component".

### 🟢 Low — No `hooks/` or `types/`, no custom hooks

The two list-editing blocks in `AddCandidateForm` are near-identical and are the obvious
extraction. §1.

### 🟢 Low — Unused import

`InputGroup`, `frontend/src/components/AddCandidateForm.js:2`.

---

## 6. Code quality & tooling — §2

### 🟠 High — No frontend tests, and the test command is broken

Zero test files in `frontend/src`. `frontend/package.json:28` runs `jest --config jest.config.js`
against a file that does not exist — running it fails immediately. Meanwhile
`@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event` are all
installed and unused.

For reference, the backend does have 4 test suites, one of which fails on a stale expectation:
`backend/src/application/services/positionService.test.ts:34` does not expect the `id` and
`applicationId` fields the service now returns.

### 🟡 Medium — No linter or formatter configured for the frontend

Only the inline `eslintConfig` at `frontend/package.json:31-36`. No Prettier, no Biome, no ESLint 9
flat config. The backend has both `.eslintrc.js` and `.prettierrc` — the frontend has neither, so
the two halves of the repo are held to different standards. §2 names ESLint 9 + Prettier or Biome
as the two serious 2026 options.

### 🟢 Low — No JSDoc/TSDoc

Not one documented function. The handful of comments that exist explain *what* rather than *why*
(`FileUploader.js:38`, `RecruiterDashboard.js:4`, `App.js:13`), and `App.js:13`'s
"Agrega esta línea" is stale scaffolding chatter.
§2: *"Tus docstrings son además el principal prompt que Claude Code o Cursor leen."*

---

## 7. Internationalisation — §8

### 🟡 Medium — No i18n layer, and languages are already mixed

Every string is inline. `frontend/src/components/FileUploader.js:60` renders "Selected file:"
directly above a "Subir Archivo" button (`:57`), and `lang="en"` contradicts the Spanish UI.
§8's point is precisely that separating content from structure pays off *even with a single
language* — and this codebase does not have a single language.

---

## 8. UX — §5, §6

### 🟡 Medium — `Positions.tsx` is a non-functional mock

`frontend/src/components/Positions.tsx:11-15` hardcodes `mockPositions`; the four filters at
`:23-43` have no state and no `onChange`. The backend already serves real data at
`/position/:id/candidates`. This is presumably the module exercise itself — recorded as the gap,
not as an oversight.

### 🟢 Low — No loading skeletons, optimistic UI, or toasts

§5: *"Feedback visual."* `FileUploader` has a spinner; nothing else has any loading state.

### 🟢 Low — PWA manifest references a missing file

`frontend/public/manifest.json:15-18` points at `logo512.png`, which is not in `frontend/public/`
→ 404 on install. Names are also boilerplate ("React App" / "Create React App Sample"), as is the
meta description (`frontend/public/index.html:10`, *"Web site created using create-react-app"*).

### 🟢 Low — No 404 route

`frontend/src/App.js:11-15` has three routes and no catch-all; unknown paths render blank.

### 🟢 Low — No container queries

Bootstrap's viewport grid only. §5 notes container queries have been baseline since 2023 and are
*"la clave para design systems realmente reutilizables."*

---

## 9. AI-workflow readiness — §9, Bloque 4

### 🟡 Medium — No `CLAUDE.md` or `AGENTS.md`

Neither exists. Bloque 4 reports 60,000+ repos using AGENTS.md by March 2026. The evidence it cites
is worth heeding: human-curated files improve agent success ~4 percentage points, while
**LLM-generated ones make it worse** (−0.5% to −2%) and raise inference cost ~20%.

**Fix:** write it by hand, keep it short, and specify exact build/test commands with flags,
dependency versions, and files not to touch.

### 🟢 Low — Stack is off the 2026 convergence point

Bloque 4 observes that v0, Lovable, Bolt, Cursor, and Claude Code all converge on
React 19 + Next.js 15/16 + Tailwind v4 + shadcn/ui + TypeScript. This repo is
React 18 + CRA + Bootstrap 5 + mostly JS. That mismatch means AI-generated components will
consistently need hand-translation. Context rather than a defect — it is a fixed course scaffold.

---

## Checked and clean

Verified as non-issues; recorded so they are not re-investigated:

- No `dangerouslySetInnerHTML`, `eval`, or `innerHTML` anywhere in `frontend/src`.
- No API keys, tokens, or secrets in `frontend/src`.
- react-bootstrap's `<Alert>` already emits `role="alert"`, so the success/error messages in
  `AddCandidateForm` are announced to screen readers.
- All `<img>` elements have an `alt` attribute.
- Bootstrap's grid is min-width based, so the layout is mobile-first by default (§5).
- Bootstrap theme colors other than `bg-warning` meet the 4.5:1 contrast threshold.

---

## Suggested order of work

1. **`lang="es"`, the 1.63:1 contrast, and the four unlabelled inputs** — three small diffs that
   clear the Level A/AA violations, which the European Accessibility Act makes a legal exposure
   rather than a style preference.
2. **The CV-loss bug and the state mutation** — silent data loss in the app's primary workflow.
3. **Extract the API base URL to `REACT_APP_API_URL`** — one line per call site, and it unblocks
   deploying anywhere.
4. **Fix or remove the broken `npm test` script**, then add coverage for `AddCandidateForm`.
5. **Migrate CRA → Vite** — clears most of the 68 advisories, replaces an unmaintained toolchain,
   and is what §3/§7 recommend. Larger job; worth planning separately.
