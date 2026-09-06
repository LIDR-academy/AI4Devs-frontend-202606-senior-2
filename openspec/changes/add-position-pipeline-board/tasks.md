Ordered so that a read-only board — a coherent partial deliverable — exists by the end of group 4.
The move (group 5) comes next, and the mobile layout (group 6) is last because the brief qualifies
it with *"if possible"*.

## 1. Test data

- [ ] 1.1 Convert `backend/prisma/seed.ts` from `create()` to `upsert()` so it can be re-run in
      place without `docker compose down -v` destroying the dev database
- [ ] 1.2 Add an interview flow with **four or more** phases, so the board proves its column count
      is data-driven rather than the three that flow 1 happens to have
- [ ] 1.3 Seed a position against that flow with: one phase holding several candidates, at least
      one empty phase, and candidates scoring 0, a fractional mid value, and the maximum
- [ ] 1.4 Seed a second position with no candidates
- [ ] 1.5 Re-run the seed and confirm via `GET /position/:id/candidates` that the fixtures are
      present and each candidate has an `applicationId`

## 2. Dependencies and routing

- [ ] 2.1 Install `@hello-pangea/dnd` in `frontend/` (D1)
- [ ] 2.2 Add a `/positions/:id` route to `frontend/src/App.js` pointing at the new page container
- [ ] 2.3 Add position ids to the mock data in `frontend/src/components/Positions.tsx` (Q2)
- [ ] 2.4 Wire each card's "Ver proceso" control to navigate to `/positions/:id` for its own
      position — satisfies *Open a position's pipeline from the positions list*

## 3. Data layer

- [ ] 3.1 Add an API module for the pipeline calls targeting the **as-built** paths (D2):
      `GET /position/:id/interviewflow`, `GET /position/:id/candidates`, `PUT /candidates/:id`
- [ ] 3.2 Unwrap the doubly-nested interview-flow response (`interviewFlow.interviewFlow`) into a
      flat shape for the page
- [ ] 3.3 Sort phases by `orderIndex` ascending with `id` ascending as the tiebreaker (D5) —
      satisfies *Column order is deterministic when phases share an order index*
- [ ] 3.4 Build the phase `name → id` map from the interview flow (D3)
- [ ] 3.5 Group candidates into phases by matching `currentInterviewStep` against the phase name

## 4. Read-only board

- [ ] 4.1 Page container: fetch the interview flow and the candidates on mount, hold the resulting
      board state (D6)
- [ ] 4.2 Render the position name at the top of the page content — satisfies *Position title
      provides context*
- [ ] 4.3 Render a back control to the left of the title that returns to `/positions` — satisfies
      *Return to the positions list*
- [ ] 4.4 Board and column components: one column per phase, headed by the phase name, with empty
      phases still rendered — satisfies *One column per phase of the hiring process*
- [ ] 4.5 Card component showing the candidate's full name and average score, placed in the column
      for their current phase — satisfies *Candidate cards show name and score in their current
      phase*
- [ ] 4.6 Score component: dots as the rounded, 0–5-clamped `averageScore`, with the numeric value
      kept visible as text (D7)
- [ ] 4.7 Verify against the running stack: a position with several phases renders correctly, and
      the position seeded with no candidates renders all its columns empty

## 5. Moving a candidate

- [ ] 5.1 Wrap the board in `@hello-pangea/dnd` so cards are draggable and columns are drop targets
- [ ] 5.2 On drop, move the card into the target column — satisfies *Move a candidate to another
      phase by dragging their card*
- [ ] 5.3 On drop, `PUT /candidates/:candidateId` with the candidate's `applicationId` and the
      target phase's interview step **id** — satisfies *The move identifies the target phase by id*
- [ ] 5.4 Verify persistence: move a card, reload the page, confirm the candidate is in the new
      column — satisfies *The new phase survives a reload*
- [ ] 5.5 Verify a move to an earlier phase works the same way

## 6. Mobile layout (best effort)

- [ ] 6.1 Below the `md` breakpoint, stack the phase columns vertically at full width in the same
      order — satisfies *Phases stack vertically on mobile*
- [ ] 6.2 Verify at 375px: columns stacked, full width, no horizontal scroll

## 7. Wrap-up

- [ ] 7.1 Run the full stack via `docker compose up` and walk every scenario in `specs/`
- [ ] 7.2 Confirm no change outside `frontend/` other than the seed fixtures from group 1
- [ ] 7.3 Add `prompts/prompts-iniciales.md` (brief's submission checklist)
- [ ] 7.4 Cross-link `docs/prds/position-kanban-board.md` to this change so there is one obvious
      source of truth
- [ ] 7.5 Call out the endpoint mismatch in the PR description — three of the brief's four paths
      404 and one response is nested a level deeper (D2)
