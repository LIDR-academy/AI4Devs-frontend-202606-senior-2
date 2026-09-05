## Why

`/positions/:id` currently renders a bare placeholder (`Position.tsx`, from the `position-detail-navigation` change). Recruiters need the actual position detail view described in the exercise: a kanban board of that position's candidates, one column per hiring-process phase, so they can see at a glance who is where. This change builds that view's content (read-only for now — moving a card is a separate change).

## What Changes

- Replace the placeholder body of `Position.tsx` with the real kanban view: page title (position name) with a back arrow/link to `/positions`, and one column per interview step.
- Fetch `GET /position/:id/interviewflow` — response is `{ interviewFlow: { positionName, interviewFlow: { interviewSteps } } }` (the controller wraps the service's own `{ positionName, interviewFlow }` shape a second time under `interviewFlow`; verified directly against the running backend, not just the exercise brief) — for `positionName` and `interviewSteps` (columns, ordered by `orderIndex`). Fetch `GET /position/:id/candidates` for the candidates (a flat array) to place under the column whose name matches each candidate's `currentInterviewStep`.
- Follow the design mockup: light-gray column background with a bold step-name header; white candidate cards with a soft shadow; candidate `fullName` bold at the top of the card, `averageScore` shown as a row of filled dot/circle indicators (not a plain number).
- Responsive: columns stack vertically, full width, on mobile/narrow viewports; side-by-side on wider viewports.
- Use `fetch` against `http://localhost:3010`, matching the pattern already used by `AddCandidateForm.js`/`FileUploader.js` — not `candidateService.js`/axios, which isn't installed (`axios` is imported there but absent from `package.json`/`node_modules`; that service is already dead code, unrelated to this change, not being fixed here).
- Candidate state keeps `id` and `applicationId` from the candidates response (needed by the drag-and-drop stage-update change that follows this one), even though the card only displays `fullName` and `averageScore`.
- No drag-and-drop and no stage-update calls in this change — the board is read-only display; moving a candidate is `position-candidate-stage-drag-drop` (planned next).

## Capabilities

### New Capabilities
- `position-kanban-view`: Displays a position's title, back navigation, and its candidates grouped into columns by interview step, per the design mockup.

### Modified Capabilities
(none — `position-detail-navigation`'s "route exists / renders a detail view" requirement is unchanged; only what that view renders is new)

## Impact

- `frontend/src/components/Position.tsx`: placeholder body replaced with the kanban view (header, columns, cards, data fetching, loading/error state).
- No backend changes — endpoints already exist and were verified against `backend/src/routes/positionRoutes.ts` and `backend/src/application/services/positionService.ts` (real paths are `/position/:id/interviewflow` and `/position/:id/candidates`, not the `/positions/...` casing shown in the exercise brief).
- No new npm dependency (dot-rating rendered with plain markup/CSS, consistent with the KISS/no-new-dependency guidance in `frontend/CLAUDE.md`).
