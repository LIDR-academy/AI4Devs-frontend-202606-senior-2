## Context

See `proposal.md`. `Position.tsx` (from `position-detail-kanban-view`) already fetches `interviewSteps` (each with `id`, `name`, `orderIndex`) and `candidates` (each with `id`, `applicationId`, `currentInterviewStep` as a step **name** string, `averageScore`), and groups cards into columns by matching `currentInterviewStep` to a column's `name`.

## Goals / Non-Goals

**Goals:**
- Drag a card between columns, persist via `PUT /candidates/:id`, reflect the result in the board.

**Non-Goals:**
- A keyboard-operable alternative to dragging — the exercise explicitly restricts moving a candidate to drag-only ("solo arrastrando su tarjeta"). Documented in `proposal.md` as a deliberate accessibility gap, not addressed here.
- Reordering candidates *within* a column — the exercise only asks for moving between phases, not ranking within one.
- Touch-screen drag support — HTML5 native drag-and-drop doesn't support touch out of the box, and the exercise's design mockup targets desktop-style kanban interaction; not building a touch fallback.

## Decisions

- **Native HTML5 drag-and-drop, no library.** `draggable` on the card, `onDragStart` stores the dragged candidate's id (e.g. via `event.dataTransfer.setData` or component state), each column's wrapper gets `onDragOver` (must call `preventDefault` to become a valid drop target) and `onDrop`. Zero new dependency, consistent with the KISS pattern already used for the score dots in the previous change.
- **Track in-flight moves by candidate id**, e.g. `movingCandidateId: number | null` (one at a time is enough — a user drags one card at a time). Used to dim/disable the card mid-request.
- **Update local state only after the PUT resolves** (not optimistic): on success, set that candidate's `currentInterviewStep` to the target column's `name` (a string) — matching the field's existing type/shape from the `GET /position/:id/candidates` response, rather than the numeric step id the `PUT` response returns under its own `currentInterviewStep` field (different shape, would break the by-name column grouping if used directly). On failure, state is untouched (the card was never moved), so "reverting" is simply not moving it.
- **Drop on the originating column is a no-op** — don't fire a request that would set a candidate's stage to the stage it's already in.

## Risks / Trade-offs

- [No keyboard alternative for moving a card] → Accepted: exercise explicitly asks for drag-only. Called out as a known deviation from this project's general a11y guidance, not silently dropped.
- [Two quick drags in a row before the first request resolves] → `movingCandidateId` only needs to track one at a time per the Goals above (dragging a second, different card while the first is still in flight is not blocked, since they're independent candidates); dragging the *same* card again while its own move is in flight is prevented by not making an in-flight card `draggable`.
