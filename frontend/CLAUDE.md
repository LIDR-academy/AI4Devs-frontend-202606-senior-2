# CLAUDE.md — Frontend

Guidance for Claude Code when working in `frontend/` (CRA, React 18, JS + TS mixed, react-bootstrap). Extracted and adapted from `reglas` (project root) — full source there for context/rationale.

## Structure & maintainability

- Organize by feature/layer: `components/`, `services/`, hooks, types. Keep this consistent with the existing flat CRA layout in `frontend/src/`.
- Single-responsibility components. Rule of thumb: if a component exceeds ~150 lines or handles more than one concept, split it.
- Prefer TypeScript for new files (`.tsx`/`.ts`) over `.js` — this repo already mixes both (`Positions.tsx` vs `AddCandidateForm.js`); write new components in TS and type props/state explicitly.
- Custom hooks for reusable/testable logic; avoid over-abstracting (YAGNI) — don't introduce compound components, render props, or provider patterns unless there's an actual shared-state need.

## Code quality

- Match existing formatting/lint config in `frontend/` (CRA's `eslintConfig` extends `react-app`/`react-app/jest`) — don't introduce Biome/Oxlint here without discussion, this repo hasn't adopted them.
- Comment the *why*, not the *what*. Keep this minimal per root CLAUDE.md conventions — don't add JSDoc blocks by default.

## Performance

- Lazy-load heavy components/routes with `React.lazy` + `Suspense` where it clearly matters (large dashboards, rarely-visited routes) — don't apply blindly to small components.
- Images: prefer WebP/AVIF where feasible, `loading="lazy"` for below-the-fold images, `srcset` for responsive sizing.
- Core Web Vitals targets if/when this app is measured: LCP < 2.5s, INP < 200ms, CLS < 0.1.

## Security

- Never use `dangerouslySetInnerHTML` without sanitizing (DOMPurify) — check `FileUploader.js`/`AddCandidateForm.js` and any future form work for this.
- Validate on both client (UX) and server (actual security, already enforced in `backend/src/application/validator.ts`) — client-side checks in forms are a convenience, not a security boundary.
- No secrets/API keys in frontend code or `.env` values prefixed for client exposure (CRA: only `REACT_APP_*` vars reach the bundle — treat that prefix as public).
- Escape/validate anything rendered from candidate-submitted data (names, notes, resume metadata) — this is user input flowing through `candidateService.js` into the DOM.

## UX & accessibility

- Mobile-first responsive layout.
- WCAG 2.2 AA minimum: semantic HTML before ARIA, 4.5:1 contrast, full keyboard navigation with visible focus, labels on all form inputs (`AddCandidateForm.js`), `alt` on images.
- Respect `prefers-reduced-motion` for any animation/transition work.
- Loading states, hover/focus states, and non-intrusive feedback (toasts/inline messages) for async actions (candidate submission, file upload).

## Keep it simple (KISS)

- Don't over-build: avoid unnecessary animation, extra component layers, or global state for what a local `useState` handles. This app is a CRUD-ish recruiting tool, not a design showcase.
- When generating new UI, default to the plainest layout that satisfies the requirement — react-bootstrap components over custom-styled elaborate ones unless asked.

## Working with Claude Code on this frontend

- For a refactor of a component >150 lines: propose a plan first (what gets extracted, which hooks, prop/type changes) before applying it, and preserve existing behavior.
- For accessibility work: audit against WCAG 2.2 AA (ARIA/landmarks, keyboard nav, form labels, contrast) and report findings with severity before fixing, rather than silently changing markup.
- Treat AI-generated frontend code as needing explicit security review before considering a task done — check what's trusted from `req`/API responses vs. user input, and whether validation exists server-side (it should, in `backend/`) not just client-side.
