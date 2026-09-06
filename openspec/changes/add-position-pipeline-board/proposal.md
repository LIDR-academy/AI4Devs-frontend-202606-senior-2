## Why

LTI lists the company's open positions, but each position card's **"Ver proceso"** button does
nothing. Recruiters have no way to see who is applying to a position, what stage each candidate has
reached, or to advance them — that tracking happens outside the product today.

## What Changes

- A **position detail page** becomes the destination of "Ver proceso", showing the position's
  candidates as a Kanban board: one column per phase of the hiring process, each candidate's card
  in the column for their current phase.
- A candidate is **moved between phases by dragging their card**, and the new phase is persisted
  through the existing API.
- The Positions page itself is otherwise **unchanged** — only its "Ver proceso" button gains a
  destination.

### Scope is bounded to the brief

The source brief states its requirements in exactly two places, and this change implements those
and nothing else:

- Five **design team requirements** — position title at top; back arrow to its left; as many
  columns as phases; each card in its phase showing full name and average score; and, *"if
  possible"*, phases stacked vertically at full width on mobile.
- The **mission statement** — *"displaying candidates as cards in different columns that represent
  the stages of the hiring process, and allowing you to update the stage a candidate is in simply
  by dragging their card."*

That yields **eight requirements**. Two more were added during implementation, where the
brief's own behaviour could not be delivered correctly without them: the page reporting its
loading and failure states, and a rejected move being undone rather than left on screen.
Both are recorded as decisions in `design.md` (D6, D9). Deliberately excluded: WCAG 2.2 AA conformance and a non-drag
path to every move, loading/error/empty states, optimistic updates with rollback, environment-driven
API config, and TypeScript conversion. Each is sound engineering; none is requested by the brief.
The mobile requirement is marked best-effort because the brief says *"if possible"*.

**Automated tests are in scope**, and are the one thing here the brief does not ask for that is
included anyway. Requirements do not always descend to the testing level — a baseline of
engineering quality control is expected regardless of whether a brief names it. Every scenario in
`specs/` that can be expressed in jsdom is covered by a test; see `design.md` D8 for the three that
cannot.

The brief also fixes two assumptions this change adopts: *"assume you can find the positions page"*
(so it stays mock-driven) and *"the overall page structure exists"* (so no app-shell work).

## Capabilities

### New Capabilities

- `position-pipeline-board`: Viewing one position's hiring pipeline — reaching the page from the
  positions list, its title and back navigation, deriving the columns from the position's interview
  flow, and placing each candidate's card in the right column with their name and average score.
- `candidate-stage-transition`: Moving a candidate from one phase to another by dragging their
  card, and persisting that move.

They are split because they are the read/write seam and will evolve on different timelines: board
presentation is stable, whereas transition rules (which moves are legal, who may make them,
auditing) are where this feature will grow.

### Modified Capabilities

None. `openspec/specs/` is empty — this is the first change in the repo.

## Impact

**Code** — `frontend/` only:

- New: a `/positions/:id` route and the page's components (board, column, card, score).
- Modified: `frontend/src/App.js` (route) and `frontend/src/components/Positions.tsx` (wire up
  "Ver proceso"; its mock data has no position ids, so ids must be added to it).

**Dependencies** — adds a drag-and-drop library. `@hello-pangea/dnd` is the working choice;
`react-beautiful-dnd` is unmaintained and breaks under the React 18 StrictMode that
`frontend/src/index.tsx` enables.

**APIs** — consumed, not changed. Three of the four endpoint paths in the brief return **404**
against the running backend and one response is wrapped a level deeper than documented; the
frontend adapts, since the brief scopes the deliverable to `frontend/`. See `design.md`.

**Test data** — `backend/prisma/seed.ts` needs expanded fixtures for the board to be demonstrable
at all: **nothing in the running product creates an `Application` row**, so no candidate can be
assigned to a position at runtime, and a candidate added through the UI appears on no board. This
is enabling work, not product code, and it is the one part of this change outside `frontend/`.

**Not affected** — the app shell, authentication, and the pre-existing issues cataloged in
`CODE_QUALITY.md`.
