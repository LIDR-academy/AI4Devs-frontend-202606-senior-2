## Context

See `proposal.md` for motivation. `Position.tsx` currently exists only as a placeholder from `position-detail-navigation`. The two data endpoints (`GET /position/:id/interviewflow`, `GET /position/:id/candidates`) are separate calls with no single combined endpoint; the candidates response identifies a candidate's column by the step's **name** (`currentInterviewStep: "Technical Interview"`), not by step id.

## Goals / Non-Goals

**Goals:**
- Render the board (columns + cards) matching the design mockup described in `pedido`.
- Handle the two-request fetch cleanly, with loading/error feedback.

**Non-Goals:**
- Drag-and-drop / stage updates — separate change (`position-candidate-stage-drag-drop`).
- Wiring the *Positions list* to the real API — `Positions.tsx`'s `mockPositions` stays mocked, out of scope for this exercise.
- A generic reusable "Kanban" component — this is a single-purpose view, not a library (KISS).

## Decisions

- **Match candidates to columns by step name.** The candidates endpoint only gives `currentInterviewStep` as the step's name string, not its id, so grouping is a plain string match against each column's `name`. Alternative (matching by id) isn't possible with the data the endpoint returns.
- **Fetch both endpoints in parallel** (`Promise.all`-style) on mount, rather than sequentially — they're independent reads, no reason to serialize them and add latency.
- **Plain `fetch`, not `candidateService.js`/axios.** `candidateService.js` imports `axios`, which isn't in `package.json`/`node_modules` — it's dead code today. `AddCandidateForm.js`/`FileUploader.js` already use raw `fetch` against `http://localhost:3010` successfully; this change follows that (already-working) pattern instead of repairing the unrelated dead service.
- **Dot rating rendered with plain markup/CSS** (e.g. a fixed-size row of `span`s, filled up to the score), not a new npm dependency — matches `frontend/CLAUDE.md`'s KISS guidance and the mockup's simple filled-circle look.

## Risks / Trade-offs

- [A candidate's `currentInterviewStep` name doesn't exactly match any column name] → In practice both come from the same `InterviewStep.name` column in the backend (see `positionService.ts`), so a mismatch would indicate a backend data bug, not a frontend case to design around. Not handling it specially (no fallback "unassigned" column) — keeps the view simple per the Non-Goals above.
- [Two separate requests can resolve out of order, or one can fail while the other succeeds] → Track both loading and error state independently is unnecessary complexity for this view; treat the pair as one combined loading/error state (per the `spec.md` "Loading and error feedback" requirement) — simpler, and the view is unusable with only one of the two datasets anyway.
