## Why

The Positions list ("Ver proceso" button on each card) currently does nothing — clicking it has no `onClick`/`href`. Recruiters need a way to get from a position card into that position's hiring pipeline, which will be built as a separate kanban view (`position-detail-kanban-view` change). This change only wires the navigation; it does not build the destination page's content.

## What Changes

- Add a route `/positions/:id` to `App.js`, rendering a placeholder `Position` page component (to be filled in by the `position-detail-kanban-view` change).
- Make each position card's "Ver proceso" button a link to `/positions/:id` for that card's position.
- Add an `id: number` field to the `Position` type and to `mockPositions` in `Positions.tsx`, since neither currently carries an identifier. `mockPositions` is already disconnected from the real `/position` API (hardcoded titles that don't match seeded data) — assigning it sequential local ids (1, 2, 3) is a local, presentational id only, not a claim that it matches a real backend position. Wiring `Positions.tsx` to the real API is out of scope for this change and for the exercise this branch implements.

## Capabilities

### New Capabilities
- `position-detail-navigation`: Clicking "Ver proceso" on a position card navigates to that position's detail route (`/positions/:id`).

### Modified Capabilities
(none — no existing capability specs exist yet in this project)

## Impact

- `frontend/src/App.js`: new `Route` for `/positions/:id`.
- `frontend/src/components/Positions.tsx`: `Position` type gains `id`; `mockPositions` gains ids; "Ver proceso" button becomes a `Link`/navigate call.
- New (minimal placeholder) `frontend/src/components/Position.tsx`, replaced with real content by the `position-detail-kanban-view` change.
- No backend changes.
