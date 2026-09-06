## Context

The board is a new page in an existing React app (CRA `react-scripts` 5.0.1, React 18, Bootstrap 5
/ react-bootstrap). The app shell — top menu and footer — already exists; this change adds page
content only.

Two findings from the running stack shape everything below. Both were verified against this repo on
2026-09-06.

### The brief's API endpoints do not match the running backend

Three of the four paths return **404**, and one response is wrapped a level deeper than documented:

| Brief | As-built | Using the brief's version |
| --- | --- | --- |
| `GET /positions/:id/interviewFlow` | `GET /position/:id/interviewflow` | **404** — singular `position`, lowercase `interviewflow` |
| `GET /positions/:id/candidates` | `GET /position/:id/candidates` | **404** — singular `position` |
| `PUT /candidates/:id/stage` | `PUT /candidates/:id` | **404** — no `/stage` suffix |
| `{ positionName, interviewFlow }` | `{ interviewFlow: { positionName, interviewFlow } }` | Wrong shape — payload is nested one level deeper |
| Candidate objects have 3 fields | They have 5 | `applicationId` is absent from the brief but is **required** to save a move |

As-built payloads:

```jsonc
// GET /position/:id/interviewflow
{
  "interviewFlow": {                        // note the outer wrapper
    "positionName": "Senior Full-Stack Engineer",
    "interviewFlow": {
      "id": 1,
      "interviewSteps": [
        { "id": 1, "name": "Initial Screening",   "orderIndex": 1 },
        { "id": 2, "name": "Technical Interview", "orderIndex": 2 },
        { "id": 3, "name": "Manager Interview",   "orderIndex": 2 }
      ]
    }
  }
}

// GET /position/:id/candidates
[
  { "fullName": "John Doe", "currentInterviewStep": "Technical Interview", "averageScore": 5, "id": 1, "applicationId": 1 }
]

// PUT /candidates/:id          (:id is the CANDIDATE id)
{ "applicationId": "1", "currentInterviewStep": "3" }   // interview step id
```

### Nothing in the product assigns a candidate to a position

The candidate↔position link is the `Application` row, and no runtime path creates one:

- `prisma.application.create` appears only in `prisma/seed.ts` and in the `else` branch of
  `Application.save()` (`backend/src/domain/models/Application.ts:40`).
- That `else` branch is unreachable: its only caller, `updateCandidateStage`
  (`backend/src/application/services/candidateService.ts:68-80`), loads the application first and
  throws `'Application not found'` when absent, so `this.id` is always set and `save()` always
  takes the `update` branch.
- `addCandidate` never instantiates `Application`; it writes `Candidate`, `Education`,
  `WorkExperience` and `Resume` only.
- Confirmed empirically: a candidate created through the "Añadir Candidato" form has no
  `Application` row, belongs to no position, and appears on no board.

## Goals / Non-Goals

**Goals:**

- Implement the requirements in `specs/`, and only those. Eight came from the brief; two more
  (D6, D9) were added during implementation where the brief's behaviour could not be delivered
  correctly without them.
- Keep the change inside `frontend/`, per the brief's *"Page changes, logic, etc. in the /frontend
  folder"*.
- Make the board demonstrable despite the assignment gap above.
- Cover the specs with automated tests to the extent the toolchain allows (D8).

**Non-Goals:**

- Backend changes of any kind, including correcting the endpoint paths to match the brief.
- Building candidate→position assignment (see D4).
- Everything listed in the proposal's scope section: accessibility conformance, env-driven API
  config, TypeScript conversion. Sound engineering, none of it asked for.
- *(No longer excluded)* Loading/error states and rollback of a failed move — see D6 and D9. Both
  were promoted from "not asked for" to "required for the feature to be correct".
- *(Not excluded)* Automated tests. The brief does not ask for them, but baseline quality control
  is expected regardless — see D8.
- Making the Positions page functional beyond wiring "Ver proceso".

## Decisions

### D1 — Drag-and-drop: `@hello-pangea/dnd`

`frontend/src/index.tsx` enables React 18 StrictMode, and `react-beautiful-dnd` is unmaintained and
does not work under it. `@hello-pangea/dnd` is its maintained fork with the same API, so it is the
lowest-risk option under a one-day deadline.

*Alternatives:* `dnd-kit` is lighter and more flexible but needs materially more wiring for the
same result. Hand-rolled HTML5 drag events are the smallest dependency but the largest amount of
code to get right.

### D2 — Adapt the frontend to the as-built API

**Confirmed 2026-09-06** (resolves the former Q1).

The brief scopes the deliverable to `frontend/`, so the page targets the real paths and unwraps the
real response shape rather than the documented ones. The backend is left untouched; the deliverable
stays frontend-only apart from the seed fixtures in D4.

*Alternative rejected:* correcting the backend routes to match the brief. It puts the change
outside the folder the brief scopes it to, and it would hide a discrepancy that is worth reporting.
The mismatch is therefore called out in the PR description rather than silently papered over.

### D3 — Match candidates to columns by phase name

`GET /position/:id/candidates` returns `currentInterviewStep` as the phase's **name string**, not
its id, so placing a card means matching that string against `interviewSteps[].name`. The update,
however, needs the phase **id**. The page therefore builds a `name → id` map from the interview
flow when it loads.

This is inherently fragile — two phases sharing a name would collide — but the API offers no
alternative without a backend change (D2).

### D4 — Board data comes from expanded seed fixtures

Given the assignment gap above, the board is populated by authoring fixtures in
`backend/prisma/seed.ts` rather than by building an assignment API. This keeps the deliverable
frontend-only.

To exercise the specs, the fixtures need: a phase holding several candidates; at least one empty
phase; a position whose flow has **four or more** phases (proving the column count is data-driven,
not the three that flow 1 happens to have); candidates scoring 0, a mid value, and the maximum; and
enough candidates for the board to stack on a 375px viewport.

**Constraint:** `prisma/seed.ts` uses `create()` throughout, so it is not idempotent, and the
backend entrypoint only runs it when the `Company` table is empty. Picking up new fixtures means
either `docker compose down -v` — which **discards the whole dev database** — or converting the
seed to `upsert()`. The latter is the better investment if the fixtures will be iterated on.

### D5 — Deterministic column order via a tiebreaker

The seeded flow has phases 2 and 3 both at `orderIndex: 2`, so sorting on `orderIndex` alone leaves
their order to `Array.prototype.sort` stability and the API's row order. Sort by `orderIndex`
ascending with `id` ascending as the tiebreaker.

*Alternative considered:* treating the duplicate as a data bug and fixing the seed. Rejected —
the same collision is present in the brief's own sample payload, so it must be handled as normal
input.

### D6 — Component structure

A page container owning the two fetches and the board state, then presentational board / column /
card / score components. The container issues both GETs on mount; the interview flow supplies the
columns and the `name → id` map, the candidates supply the cards.

### D7 — Score presentation

The mockup renders the average score as filled dots out of 5. The spec requires only that the
average score is *shown*, so dots are presentation. `averageScore` is a float — the backend divides
total by count, so 4.5 occurs — therefore the dot count is the score rounded to nearest and clamped
to 0–5, with the numeric value kept visible as text so no precision is lost.

### D8 — Test strategy

Automated tests are a deliverable, not just a private harness. Coverage is driven directly by the
scenarios in `specs/` — each scenario is a test case.

**Runner.** `frontend`'s `npm test` currently invokes `jest --config jest.config.js` and that file
does not exist, so the script has never run. Switch it to `react-scripts test`, which needs no
config. Jest 27.5.1 and `@testing-library/react` 13.4.0 are already installed via `react-scripts`,
so this costs one line plus a `setupTests` file — no new dependency.

**Layers.**

- *Unit* — the pure logic: phase ordering with the duplicate `orderIndex`, unwrapping the
  doubly-nested interview-flow response, the `name → id` map, and grouping candidates by phase name.
- *Component (React Testing Library)* — the rendering requirements: title, back control, column
  count derived from the flow, empty columns, card placement, name and score, and navigation from
  the positions list.

**What the jest suite cannot reach — 3 of the 23 scenarios.** jsdom has no pointer input and no
layout engine, so it cannot verify the two drag scenarios or the 375px stacking. Simulating a drag
against `@hello-pangea/dnd` in jsdom is unreliable enough that a passing test would be misleading,
which is worse than no test. **These three are therefore deliberately absent from `npm test`.**

**Amended 2026-09-06 — all three are verified, out of band.** "Needs a real browser" turned out not
to imply "needs Q3's Playwright dependency". A throwaway harness driving the system Chrome over the
DevTools Protocol — Node builtins only, `fetch` plus the global `WebSocket`, nothing added to
`package.json` — covers all three:

- *the two drag scenarios* — `Input.dispatchMouseEvent` produces browser-level trusted events,
  which is exactly what `@hello-pangea/dnd`'s mouse sensor listens for. Drag forward, reload, drag
  back, reload, with the outgoing `PUT` bodies captured off the network to confirm the target phase
  travels as a step **id**.
- *the 375px stacking* — `Emulation.setDeviceMetricsOverride`, then assertions over real
  `getBoundingClientRect()` values and `scrollWidth` vs `clientWidth`.

The harness lives outside the repo, and that is the honest limit of this claim: **it is evidence,
not a committed regression test.** It needs the docker stack up, a browser on the host and live seed
data, so it cannot run under `react-scripts test`. Promoting it to a deliverable would mean choosing
a home and a runner for it — deferred, not done. Q3's recorded default of *no Playwright* stands and
does not need revisiting.

### D9 — A failed move rolls back, and says so

**Decided 2026-09-06, during implementation.** The drop handler updates the board optimistically and
then issues the `PUT`. If the request fails, the candidate is returned to their original phase *and
index*, and a dismissible alert names the candidate and the error.

The rollback is applied functionally against the **current** board rather than a snapshot captured
at drop time, so a second move made while the first request is still in flight is not silently
reverted along with it.

*Why this overrides the original non-goal:* without it, a rejected move leaves the board showing a
phase the database never accepted, and nothing tells the user. It looks exactly like success until
the next reload. That is a correctness defect rather than a missing refinement, and the failure is
reachable in practice — a `PUT` whose `applicationId` does not belong to the candidate in the path
returns `404 {"message":"Application not found"}` and changes nothing server-side.

*Cost:* one extra state field and an alert. No new dependency, no change to the data layer.

## Risks / Trade-offs

- **Matching phases by name (D3) breaks if a phase is renamed backend-side or two phases share a
  name** → Accepted for this change; it cannot occur with the current data, since
  `Application.currentInterviewStep` is a foreign key into `InterviewStep`. A fallback for
  unmatched phases was considered and left out of scope.
- ~~**No rollback if the move request fails**~~ → **Resolved 2026-09-06, see D9.** This was called
  the most defensible item to pull back into scope, and it was: a silently diverging board is a
  correctness bug, not a missing nicety.
- **Stacking breaks cross-column *keyboard* drag on mobile** → `@hello-pangea/dnd` binds
  cross-droppable keyboard movement for a vertical list to Left/Right and searches along the
  horizontal axis; once the columns are stacked there is no horizontal neighbour to find, so the
  arrow keys no-op. Confirmed by comparing the same key sequence at 1400px (announces the move) and
  375px (silent). Mouse drag is unaffected at both widths. Fixing it needs a custom sensor or a
  different droppable structure; accessibility conformance is already a non-goal, so this is
  recorded rather than fixed — but it is a behaviour difference *this change introduces*, not a
  pre-existing one, so it belongs in the PR description.
- **`Positions.tsx` mock data has no position ids** → The link cannot be built without them. Add
  ids to the mock data; wiring the page to the API is excluded by the brief's *"assume you can find
  the positions page"*.
- **Re-seeding to pick up new fixtures wipes the dev database** (D4) → Convert the seed to
  `upsert()` before iterating on fixtures.
- **Deadline is one day out** → Build in spec order: the board read-only first, then the move, then
  the mobile layout last since the brief marks it *"if possible"*. A read-only board is a coherent
  partial deliverable; a half-built drag interaction is not.
- **Known product gap left open by D4** → A candidate created through the UI belongs to no position
  and appears on no board, so the feature cannot be demoed with self-created data. A follow-up
  needs an endpoint that creates an `Application` plus a rule for the initial phase —
  `currentInterviewStep` is non-nullable, so creation must choose one.

## Open Questions

- **Q2** — Where does the `:id` in the link come from, given `Positions.tsx` is mock data with no
  ids? *Proceeding by adding ids to the mock data and keeping the page mock-driven.*
- **Q3** — Add Playwright to cover the three scenarios jsdom cannot reach (D8)? It would drive the
  system Chrome at `/usr/bin/google-chrome` rather than downloading its own, but it is a new
  dependency against a one-day deadline. *Proceeding without it: those three scenarios are verified
  manually in a browser and flagged as such.*

### Resolved

- **Q1** — Adapt the frontend to the as-built API, or correct the backend routes to match the
  brief? **Resolved 2026-09-06: adapt the frontend.** See D2.
