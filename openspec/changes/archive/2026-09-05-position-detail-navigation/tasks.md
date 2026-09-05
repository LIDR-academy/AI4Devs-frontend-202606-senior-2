## 1. Position type & mock data

- [x] 1.1 Add `id: number` to the `Position` type in `frontend/src/components/Positions.tsx` and assign sequential ids (1, 2, 3) to `mockPositions`, and verify the file still compiles (`tsc`/CRA build has no new type errors)

## 2. Placeholder detail page & route

- [x] 2.1 Create `frontend/src/components/Position.tsx` with a minimal placeholder (e.g. renders the `:id` route param) — real content is built by the `position-detail-kanban-view` change
- [x] 2.2 Register `<Route path="/positions/:id" element={<Position />} />` in `frontend/src/App.js` and verify navigating the browser directly to `/positions/1` renders the placeholder instead of a blank page

## 3. Wire the button

- [x] 3.1 Change the "Ver proceso" `Button` in `Positions.tsx` to navigate to `/positions/:id` for its card's position, using a real link element (e.g. react-bootstrap `Button as={Link}` or wrapping in `Link`) rather than a JS-only `onClick`, so it keeps native link semantics and keyboard operability; verify clicking it in the browser updates the URL and renders the placeholder without a full page reload
- [x] 3.2 Verify keyboard accessibility: Tab to the control, confirm a visible focus indicator, and confirm Enter navigates to `/positions/:id` same as a click
