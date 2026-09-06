# PRD — Position detail: candidate Kanban board

| | |
| --- | --- |
| **Status** | Draft |
| **Author** | Ivan Ribakov |
| **Created** | 2026-09-06 |
| **Deadline** | 2026-09-07, end of day |
| **Source brief** | *"Creating the LTI application management interface"* (AI4Devs 2026/06 Seniors II, Lia Carrizo) |
| **Repo** | `AI4Devs-frontend-202606-senior-2`, branch `frontend-ir` |
| **Scope** | `frontend/` only |
| **Implemented by** | OpenSpec change [`add-position-pipeline-board`](../../openspec/changes/add-position-pipeline-board/) |

---

> **Where this document stops and the specs begin.** This PRD is the scope argument: what the
> brief asks for, what it does not, and why. The executable requirements derived from it live in the
> OpenSpec change [`add-position-pipeline-board`](../../openspec/changes/add-position-pipeline-board/)
> — `proposal.md` for the capability split, `specs/` for the WHEN/THEN scenarios that the tests
> assert against, `design.md` for the technical decisions, and `tasks.md` for implementation
> progress. Where the two disagree about a detail of behaviour, `specs/` wins; this document is the
> record of *why* that behaviour is in scope at all.

## 1. Context

LTI already lists the company's open positions on a **Positions** page — a grid of cards with
filters for text, deadline, status and responsible manager. Each card has a **"Ver proceso"**
("View process") button, which today does nothing.

The brief: *"We want that when we click on the 'View process' button of any of the positions, it
takes us to the detailed view of each position, called 'position'."* That page shows the
position's candidates as a Kanban board and lets a recruiter advance a candidate by dragging
their card.

### Current state of the repo

- `frontend/src/components/Positions.tsx` renders **hardcoded mock data**; its filters have no
  state and its "Ver proceso" buttons have no handler.
- No route exists for a position detail page. `frontend/src/App.js` has three routes: `/`,
  `/add-candidate`, `/positions`.
- No drag-and-drop library is installed.

---

## 2. Scope discipline

This PRD is deliberately bounded to **what the brief actually asks for**. The brief states its
requirements in two places, and nothing outside them is in scope:

1. **The design team requirements** — a five-bullet list, quoted verbatim in §3.
2. **The mission statement** — *"displaying candidates as cards in different columns that
   represent the stages of the hiring process, and allowing you to update the stage a candidate
   is in simply by dragging their card."*

Everything else that a production version of this page would want — accessibility conformance,
loading/error/empty states, optimistic updates with rollback, tests, environment-driven config —
is **not requested by the brief**. Those items are recorded in §9 so they are not lost, but they
are out of scope for this deliverable and must not be built unless the scope is explicitly
widened.

The brief also fixes two assumptions, which this PRD adopts:

- *"Assume you can find the positions page"* — the Positions page stays as it is, mock data and
  all. Only its "Ver proceso" button gets a destination.
- *"It assumes the overall page structure exists, which includes common elements like the top menu
  and footer. What you're creating is the page's internal content."* — no app-shell work.

---

## 3. Requirements

### 3.1 Design team requirements (verbatim from the brief)

> - The position title should be displayed at the top to provide context.
> - Add an arrow to the left of the title that allows you to return to the list of positions.
> - As many columns as there are phases in the process should be displayed.
> - Each candidate's card must be placed in the corresponding phase, and must show their full name
>   and average score.
> - If possible, it should be displayed properly on mobile (the phases vertically occupying the
>   full width)

| # | Requirement | Source |
| --- | --- | --- |
| **DTR-1** | The position title is displayed at the top of the page content. | bullet 1 |
| **DTR-2** | An arrow to the **left of the title** returns to the positions list. | bullet 2 |
| **DTR-3** | The board renders **as many columns as there are phases** in the position's process. | bullet 3 |
| **DTR-4** | Each candidate's card sits in the column for their current phase, and shows their **full name** and **average score**. | bullet 4 |
| **DTR-5** | *(Best effort)* On mobile the phases stack **vertically at full width**. | bullet 5 — the brief says *"if possible"*, so this is the one requirement that may be dropped if time runs short. |

### 3.2 From the mission statement

| # | Requirement | Source |
| --- | --- | --- |
| **M-1** | Clicking **"Ver proceso"** on a position card opens that position's detail page. | intro paragraph |
| **M-2** | A candidate's card can be **dragged** from one column to another. | *"simply by dragging their card"* |
| **M-3** | A completed drag **updates the candidate's stage** via the API, so the change persists. | *"allowing you to update the stage a candidate is in"* |

**That is the whole requirement set: eight items.** No other behaviour is in scope.

### 3.3 Implementation consequences (not extra scope)

These are things the requirements above cannot be satisfied without. They are consequences, not
additions:

- **Column order must be deterministic.** The brief's own sample `interviewSteps` has steps 2 and 3
  both at `orderIndex: 2`, so sorting by `orderIndex` alone gives an arbitrary order. Sort by
  `orderIndex` ascending with `id` ascending as the tiebreaker. Needed for DTR-3.
- **Candidates match columns by stage *name*.** The candidates endpoint returns
  `currentInterviewStep` as the step's name string, not its id, so placing a card (DTR-4) means
  matching that string against `interviewSteps[].name`.
- **The update needs the step *id*, not the name.** So the page must hold a name → id map built
  from the interview flow. Needed for M-3.
- **The update needs `applicationId`.** It comes from the candidates endpoint (see §4.2). Needed
  for M-3.

---

## 4. API contract

### 4.1 The brief's endpoints do not match the running backend

Every endpoint was verified against the backend in this repo on 2026-09-06. **Three of the four
paths in the brief return HTTP 404**, and one response shape differs. Since the brief scopes the
deliverable to *"Page changes, logic, etc. in the /frontend folder"*, the frontend adapts to the
as-built API and **no backend change is made**.

| Brief | As-built | Result of using the brief's version |
| --- | --- | --- |
| `GET /positions/:id/interviewFlow` | `GET /position/:id/interviewflow` | **404** — singular `position`, lowercase `interviewflow` |
| `GET /positions/:id/candidates` | `GET /position/:id/candidates` | **404** — singular `position` |
| `PUT /candidates/:id/stage` | `PUT /candidates/:id` | **404** — no `/stage` suffix |
| Interview-flow response `{ positionName, interviewFlow }` | `{ interviewFlow: { positionName, interviewFlow } }` | Wrong shape — the real payload is wrapped one level deeper |
| Candidate objects have 3 fields | They have 5 | `applicationId` is missing from the brief but is **required** to save a move |

### 4.2 As-built contract (verified 2026-09-06)

#### `GET /position/:id/interviewflow`

```jsonc
{
  "interviewFlow": {                        // note the outer wrapper
    "positionName": "Senior Full-Stack Engineer",
    "interviewFlow": {
      "id": 1,
      "description": "Standard development interview process",
      "interviewSteps": [
        { "id": 1, "interviewFlowId": 1, "interviewTypeId": 1, "name": "Initial Screening",   "orderIndex": 1 },
        { "id": 2, "interviewFlowId": 1, "interviewTypeId": 2, "name": "Technical Interview", "orderIndex": 2 },
        { "id": 3, "interviewFlowId": 1, "interviewTypeId": 3, "name": "Manager Interview",   "orderIndex": 2 }
      ]
    }
  }
}
```

#### `GET /position/:id/candidates`

```jsonc
[
  { "fullName": "John Doe",      "currentInterviewStep": "Technical Interview", "averageScore": 5, "id": 1, "applicationId": 1 },
  { "fullName": "Jane Smith",    "currentInterviewStep": "Technical Interview", "averageScore": 4, "id": 2, "applicationId": 3 },
  { "fullName": "Carlos García", "currentInterviewStep": "Initial Screening",   "averageScore": 0, "id": 3, "applicationId": 4 }
]
```

#### `PUT /candidates/:id`

`:id` is the **candidate** id. Request body:

```jsonc
{ "applicationId": "1", "currentInterviewStep": "3" }   // interview step id, as string or number
```

Response `200`:

```jsonc
{
  "message": "Candidate stage updated successfully",
  "data": { "id": 1, "positionId": 1, "candidateId": 1, "applicationDate": "…", "currentInterviewStep": 3, "notes": null, "interviews": [] }
}
```

#### Two behaviours the endpoints do not advertise

Both were found while implementing, not while reading the code, and both bite the board directly:

- **`applicationId` and the candidate id must belong together.** `PUT /candidates/:candidateId`
  looks the application up by *both* ids, so sending a valid `applicationId` that belongs to a
  different candidate returns `404 {"message":"Application not found"}` rather than updating
  anything. The board must send each candidate's own `applicationId`.
- **Neither `GET` has an `ORDER BY`.** `GET /position/:id/candidates` returns a moved candidate
  **last** after a `PUT`, and `interviewSteps` arrives in whatever order Postgres supplies. Column
  order therefore comes from sorting client-side (see §6), and card order within a column must not
  be read from the array or cards will jump after every move.

### 4.3 Where board data comes from

**There is no runtime path that assigns a candidate to a position.** The link is the `Application`
row (`positionId` + `candidateId`), and nothing in the running product creates one:

- `prisma.application.create` appears only in `prisma/seed.ts` and in the `else` branch of
  `Application.save()` (`backend/src/domain/models/Application.ts:40`).
- That `else` branch is unreachable. Its only caller, `updateCandidateStage`
  (`backend/src/application/services/candidateService.ts:68-80`), loads the application first and
  throws `'Application not found'` when it is missing, so `this.id` is always set and `save()`
  always takes the `update` branch.
- `addCandidate` never instantiates `Application`; it writes `Candidate`, `Education`,
  `WorkExperience` and `Resume` only.
- Confirmed empirically: a candidate created through the "Añadir Candidato" form has no
  `Application` row, so they belong to no position and appear on no board.

**Decision: this gap is filled by expanding the seed data, not by building an assignment API.**
Board content is fixture data. Note this is *test-data preparation*, not a product deliverable —
it exists so the eight requirements in §3 can be demonstrated, and it touches
`backend/prisma/seed.ts` rather than `frontend/`.

Minimum fixtures needed to demonstrate §3:

| Case | Demonstrates |
| --- | --- |
| A column holding two or more candidates | Card stacking (DTR-4) |
| At least one empty column | DTR-3 — the column count follows the flow, not the candidates |
| A position whose flow has **four or more** steps | DTR-3 — proves the count is data-driven, not the 3 steps flow 1 happens to have |
| Candidates with scores of 0, a mid value, and the maximum | DTR-4 score rendering |
| Enough candidates for the board to stack on a 375px viewport | DTR-5 |

**Practical constraint:** `prisma/seed.ts` uses `create()` throughout, so it is not idempotent, and
the backend entrypoint only runs it when the `Company` table is empty. Picking up new fixtures
means either `docker compose down -v` (**discards the whole dev database**) or rewriting the seed
with `upsert()`.

---

## 5. Visual design

Reference: the mockup on page 2 of the brief. The brief introduces it as *"an example of a
possible interface"*, so it guides the look without adding requirements beyond the five bullets.

- **Header:** back arrow, then the position title, at the top of the content area (DTR-1, DTR-2).
- **Columns:** equal width, side by side, each a light panel with the phase name as its header.
- **Cards:** white, one per candidate, name on the first line, score beneath.
- **Score:** the mockup shows the score as a row of filled dots out of 5. DTR-4 requires only that
  the average score is *shown*; dots are the mockup's presentation of it. If dots are used,
  `averageScore` is a float (the backend divides total by count, so 4.5 is possible) so the dot
  count needs a defined rounding — round to nearest integer, clamp to 0–5 — and the numeric value
  should stay visible as text so no precision is lost.
- **Mobile (DTR-5):** below the `md` breakpoint, columns stack vertically at full width, in the
  same order.
- The page renders inside the existing app shell; this PRD covers page content only, per the brief.

The app is styled with Bootstrap 5 / react-bootstrap. The board uses that existing design language
rather than introducing a second styling approach.

---

## 6. Technical decisions

**D1 — Drag-and-drop library: `@hello-pangea/dnd`.**
`react-beautiful-dnd` is unmaintained and does not work under React 18 StrictMode, which
`frontend/src/index.tsx` enables. `@hello-pangea/dnd` is its maintained fork with the same API.
`dnd-kit` is lighter but needs more wiring. Either satisfies M-2.

**D2 — The frontend adapts to the as-built API** (§4.1), since the brief scopes changes to
`frontend/`.

**D3 — Stage matching by name**, because the API gives no step id per candidate (§3.3).

**D4 — Board data comes from expanded seed fixtures**, not from a new candidate-to-position
assignment feature (§4.3).

---

## 7. Open questions

| # | Question | Why it matters | Default if unanswered |
| --- | --- | --- | --- |
| **Q1** | Adapt the frontend to the as-built API, or fix the backend routes to match the brief? | Changes which files are touched and whether the deliverable stays frontend-only | Adapt the frontend (D2) |
| **Q2** | `Positions.tsx` is mock data with no position ids — where does the `:id` in the link come from? | Without ids the link cannot be built; the alternative is wiring `Positions.tsx` to the API, which the brief excludes with *"assume you can find the positions page"* | Add ids to the mock data and keep the page mock-driven |

---

## 8. Acceptance criteria

The feature is done when, against the running stack:

1. Clicking "Ver proceso" on a position opens that position's detail page (M-1).
2. The position title is shown at the top, with a back arrow to its left that returns to the
   positions list (DTR-1, DTR-2).
3. The board shows one column per phase in the position's flow, in a deterministic order (DTR-3).
4. Every candidate returned by the API appears in the column matching their phase, showing their
   full name and average score (DTR-4).
5. Dragging a card to another column moves it, and the new stage survives a page reload (M-2, M-3).
6. *(Best effort)* On a 375px-wide viewport the phases stack vertically at full width (DTR-5).

---

## 9. Out of scope

### 9.1 Not requested by the brief

Each of these would be right in a production build. **None is asked for by the brief**, and none
is part of this deliverable. Listed so the decision is on the record and can be revisited if the
scope is widened.

> **Superseded 2026-09-06 — automated tests.** This table originally excluded unit tests on the
> grounds that the brief does not ask for them. That reasoning was wrong: requirements do not
> always descend to the testing level, and a baseline of engineering quality control is expected
> regardless. Tests are **in scope**, covered by D8 and the task list of the OpenSpec change
> `add-position-pipeline-board`. Repairing `frontend`'s broken `npm test` script
> (`jest --config jest.config.js` points at a file that does not exist) is a prerequisite.

> **Superseded 2026-09-07 — three of these shipped.** Loading and error states, rollback of a
> rejected move, and the no-op on dropping a card back in its own column were all listed here as
> "not requested". Implementation showed the first two are not refinements but correctness: a board
> that fetches twice and shows nothing on failure looks broken, and an optimistically-moved card the
> database rejected is indistinguishable from success until the next reload. They are now
> requirements in `specs/` (decisions **D6** and **D9**), each covered by tests. The same reasoning
> as the automated-tests note above: "the brief does not ask for it" is not the same as "out of
> scope".

| Item | Why it was considered | Why it is out |
| --- | --- | --- |
| **WCAG 2.2 AA conformance** — keyboard-operable cards, live-region announcements, labelled columns, accessible name on the back arrow, per-route document title, non-text contrast on the score dots | The course's Módulo 10 material sets WCAG 2.2 AA as the legal minimum under the European Accessibility Act | The brief never mentions accessibility. Worth raising separately — the back arrow's accessible name and the score's text equivalent are near-free and would be sensible to include anyway |
| **A non-drag path to every move** (WCAG 2.5.7 Dragging Movements) | Drag-only interaction is the feature's biggest accessibility gap | Directly contrary to the brief, which specifies the interaction as *"simply by dragging their card"* |
| **Fallback for a candidate whose stage matches no column** | Guards the name-matching in D3 | Not requested; cannot occur with the current data, since `Application.currentInterviewStep` is a foreign key into `InterviewStep` |
| **API base URL from `REACT_APP_API_URL`** | It is hardcoded in three files today (`CODE_QUALITY.md`) | Pre-existing issue, not caused by this feature |
| **TypeScript for the new components** | The existing components are mostly untyped `.js` | A code-quality preference, not a requirement. Cheap to do since `.tsx` already works in this project |
| **Component size / single-responsibility limits** | Keeps the page maintainable | A code-quality preference, not a requirement |
| **Issuing the two GETs in parallel** | Halves the wait | A performance preference, not a requirement |

### 9.2 Excluded by the brief itself

- Editing candidate details, scores, or interview records.
- Adding or removing candidates from a position, or **assigning a candidate to a position** — no
  such path exists in the product today (§4.3).
- Editing the interview flow (adding, renaming, reordering phases).
- Making the Positions page functional — *"assume you can find the positions page"*. It stays
  mock-driven; only its "Ver proceso" button gets wired up.
- The app shell — top menu and footer are *"assumed to exist"*.
- Authentication or per-recruiter permissions.
- Any backend change (§4.1). The seed fixtures in §4.3 are test data, not product code.
- The pre-existing issues catalogued in `CODE_QUALITY.md`: the CRA → Vite migration, the 68 npm
  advisories, `lang="en"` on a Spanish UI, the `Positions.tsx` contrast failure and unlabelled
  filters, and the CV upload data-loss bug.

---

## 10. Submission checklist (from the brief)

- [ ] Page changes and logic live in `frontend/`
- [ ] `prompts/prompts-iniciales.md` added
  *(the brief names `prompts-iniciales.md` in the deliverables list and `prompts.md` in the closing
  line, both in the `prompts` folder — provide `prompts-iniciales.md` as the primary)*
- [x] Deliverable on a branch named `frontend-<initials>` → **`frontend-ir`**
- [ ] Committed and pushed
- [ ] Pull request opened against the base repository
- [ ] Submitted by **2026-09-07, end of day**

---

## 11. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Stage matching by name breaks if two phases share a name | Cards land in the wrong column | Accepted for this deliverable — cannot occur with the current seed data. The guard is listed in §9.1 |
| Q2 forces `Positions.tsx` into scope | Scope creep close to the deadline | Default answer keeps it mock-driven; decide before starting |
| Re-seeding to pick up new fixtures wipes the dev database (§4.3) | Loss of any data added through the UI while developing | Make the seed idempotent with `upsert()` before iterating on fixtures |
| Deadline is one day out | Incomplete submission | Build in requirement order: DTR-1 → DTR-4 (a read-only board) first, then M-2/M-3, then DTR-5 last since the brief marks it *"if possible"*. A read-only board is a coherent partial deliverable; a half-built drag interaction is not |
| **Known product gap left open by D4:** a candidate created through the UI belongs to no position and appears on no board | The feature cannot be demoed with self-created data | Accepted; seed fixtures cover it. A follow-up would need an endpoint that creates an `Application`, plus a rule for the initial phase — `currentInterviewStep` is non-nullable, so creation must pick one |
