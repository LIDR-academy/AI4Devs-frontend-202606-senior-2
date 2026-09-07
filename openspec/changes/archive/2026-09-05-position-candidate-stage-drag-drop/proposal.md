## Why

The kanban board built in `position-detail-kanban-view` is read-only. The exercise's core interaction is still missing: a recruiter must be able to move a candidate to a different phase **by dragging their card**, which persists the change via the backend.

## What Changes

- Make candidate cards in `Position.tsx` draggable, and each column a drop target.
- On dropping a card into a different column, call `PUT http://localhost:3010/candidates/:id` (`:id` = `candidate.id`) with body `{ applicationId: candidate.applicationId, currentInterviewStep: <target column's interviewStep id> }` — this is the real contract (verified against `backend/src/presentation/controllers/candidateController.ts` / `candidateService.ts`), not the `/candidates/:id/stage` path shown in the exercise brief.
- On a successful response, move the card to the target column in local state (set its `currentInterviewStep` to the target column's `name`, matching how columns already group candidates — not the numeric id the PUT response returns, avoiding a string/number mismatch).
- On failure, leave the card in its original column and show an inline error, without losing the card or any other board state.
- While a move's request is in flight, show a lightweight in-progress indication on the card being moved (e.g. reduced opacity) — the board's existing loading/error pattern is per-request (full board), this is per-card.
- **BREAKING (of a plain assumption, not of built code)**: moving a card only via drag has a real accessibility gap — no keyboard-operable alternative is built, matching the exercise's explicit requirement ("...pudiendo actualizar la fase ... **solo** arrastrando su tarjeta"), which conflicts with `frontend/CLAUDE.md`'s general "full keyboard navigation" guideline. This is a deliberate, documented deviation for this exercise, not a silent gap — flagged here rather than fixed, since the brief explicitly restricts the interaction to dragging.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `position-kanban-view`: adds the requirement that a candidate's card can be moved between columns by dragging it, persisting the new stage via the backend.

## Impact

- `frontend/src/components/Position.tsx`: cards become draggable, columns become drop targets, add the `PUT` call and per-card in-flight/error handling.
- No backend changes — endpoint already exists.
- No new npm dependency — native HTML5 drag-and-drop (`draggable`, `onDragStart`/`onDragOver`/`onDrop`), consistent with this project's no-new-dependency/KISS pattern from the previous change.
