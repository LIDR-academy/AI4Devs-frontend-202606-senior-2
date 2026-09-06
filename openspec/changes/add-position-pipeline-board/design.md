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

- Implement the eight requirements in `specs/`, and only those.
- Keep the change inside `frontend/`, per the brief's *"Page changes, logic, etc. in the /frontend
  folder"*.
- Make the board demonstrable despite the assignment gap above.

**Non-Goals:**

- Backend changes of any kind, including correcting the endpoint paths to match the brief.
- Building candidate→position assignment (see D4).
- Everything listed in the proposal's scope section: accessibility conformance, loading/error/empty
  states, optimistic updates with rollback, unit tests, env-driven API config, TypeScript
  conversion. Sound engineering, none of it asked for.
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

## Risks / Trade-offs

- **Matching phases by name (D3) breaks if a phase is renamed backend-side or two phases share a
  name** → Accepted for this change; it cannot occur with the current data, since
  `Application.currentInterviewStep` is a foreign key into `InterviewStep`. A fallback for
  unmatched phases was considered and left out of scope.
- **No rollback if the move request fails** → The board would show a phase that was never
  persisted. Out of scope by the brief; the change is visible again on reload. This is the most
  defensible item to pull back into scope if the scope is widened.
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

### Resolved

- **Q1** — Adapt the frontend to the as-built API, or correct the backend routes to match the
  brief? **Resolved 2026-09-06: adapt the frontend.** See D2.
