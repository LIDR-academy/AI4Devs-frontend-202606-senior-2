# Prompts iniciales — Position pipeline board

Exercise: *"Creating the LTI application management interface"* (AI4Devs 2026/06 Seniors II).
Tool: Claude Code (Opus 5). Branch: `frontend-ir`.

This file records how the work was actually driven, in order. It is a log of intent, not a
transcript — each heading is a prompt I gave, followed by what it produced and, where it matters,
what I had to correct.

---

## The shape of the process

I did not prompt for the feature directly. The exercise brief is a page of prose containing five
bulleted "design team requirements" mixed in with a mission statement, API documentation and
submission instructions. Asking for "a kanban board" in one shot would have meant the model
inventing a scope, so the work went through three deliberate stages:

1. **A PRD** that argues about scope — what the brief asks for, what it does not, and why.
2. **An OpenSpec change** that turns the PRD into executable requirements: WHEN/THEN scenarios,
   technical decisions, and an ordered task list.
3. **Implementation**, one task group at a time, each verified against the running stack.

The value of the split is that stage 2 catches gaps stage 1 cannot express, and stage 3 catches
facts that invalidate stage 2. All three happened here — see *What the process caught* below.

---

## 1. Scope discipline

> Review PRD goals against "design team requirements" from the original requirements PDF. Make sure
> only work strictly requested in the PDF "design team requirements" is in PRD's scope

The first PRD draft had drifted: five goals, twenty functional requirements, a block of
accessibility criteria and five NFRs, most of it defensible engineering that nobody had asked for.
This prompt cut it to **eight requirements**, each traceable to a specific line of the brief —
`DTR-1..5` from the five design-team bullets quoted verbatim, `M-1..3` derived from the mission
statement. Everything removed went into a *"Not requested by the brief"* table with a reason, so
the cuts are reviewable rather than invisible.

The explicit *"only"* in the prompt is what made this work. Without it the instruction reads as
"tidy up" and the model negotiates rather than cuts.

## 2. Spec-driven setup

> Init repo for SDD with OpenSpec

> how should I proceed with PRD in SDD manner? Is PRD too big for a single spec/change? Should it be
> broken down into further stories before applying SDD?

Deliberately a question, not an instruction. The answer came from reading OpenSpec's own schema
rather than from opinion: a single change's `proposal.md` declares multiple **capabilities**, and
each one gets its own spec file. So the PRD did not need a story layer — it became one change with
two capabilities, `position-pipeline-board` (the board) and `candidate-stage-transition` (the move).

## 3. Generating the artifacts

> Yes, run propose flow with the PRD as input

The three words that matter are **with the PRD as input**. `/opsx:propose "kanban board"` would
have re-derived requirements from a one-line description and thrown away the scope work from stage
1. Feeding the PRD in kept the traceability: the generated specs contain exactly `DTR-1..5` plus
`M-1..3`, no more.

Result: `proposal.md`, two spec files (17 WHEN/THEN scenarios, later 23 — see §7),
`design.md` (nine decisions), and `tasks.md` (43 tasks in 7 groups, ordered so a working
read-only board exists by the end of group 4).

## 4. Resolving an open question

> Open question 1: adapt frontend

The brief documents four API endpoints. Three of them 404 against the backend in this repo, and one
response is wrapped a level deeper than documented. Q1 was whether to fix the backend or adapt the
frontend. Adapting won: the brief scopes the deliverable to `/frontend`, and papering over the
mismatch would hide something worth reporting. It is called out in the PR instead.

## 5. Tests as a deliverable — a correction I had to make

> Can you work on apply flow autonomously? Do you have enough validation criteria to self-check the
> result against the ACs?

> **Tests as deliverable. Requirements don't always go down to testing level as some baseline
> software engineering quality control is always expected**

The model had scoped automated tests *out*, reasoning that the brief does not ask for them. That
conflates "not requested" with "out of scope". A brief specifies behaviour; it does not enumerate
the engineering practices expected of anyone delivering it.

The correction reversed the decision across four files and added ten tasks. The PRD records it as a
`Superseded` note rather than a silent edit, so the wrong reasoning stays visible next to the right
one.

## 6. Implementation

> Start /opsx:apply, use sub-tasks/separate agents where applicable to avoid polluting main context

Each task group ran as its own agent with a written brief: its tasks verbatim, the files to read
first, hard constraints (which directories it may touch, no commits, no new dependencies), how to
run the stack, and an explicit definition of done. Groups 1 and 2 ran in parallel because they touch
disjoint trees.

Two instructions did most of the work:

- **"Do not claim a verification you did not perform."** Reports came back with actual `curl`
  output and measured pixel values instead of assurances.
- **A named scope boundary per agent** ("do not implement drag-and-drop, group 5 owns it"). Without
  it, agents helpfully implement their neighbours' tasks and collide.

## 7. Before opening the PR

> What should I do about OpenSpec flow before opening the PR? Should archive be executed?

Another question rather than an instruction, and it turned up the last real defect. `openspec
archive` folds a change's delta specs into `openspec/specs/` as the project's canonical record, so
it is worth asking what would be enshrined.

Checking that produced two answers. **Don't archive before merge** — the change is not delivered
until the PR lands, `changes/` is where in-flight work belongs, and archiving would triple the same
spec text in the diff a reviewer needs for the code. But also: **six behaviours had been built and
tested with no scenario backing them** — the loading and error states, rollback of a rejected move,
a drag that is cancelled or dropped outside a column, and a card dropped back on its own phase.
Archiving as-is would have written a canonical spec describing a smaller feature than the one that
exists.

Adding them took the specs from 17 scenarios to 23. One of the six had no test either — the
guarantee that undoing a rejected move does not also discard a move made while the first request
was in flight — so that got a test as well, 70 to 71.

The lesson is that "is this ready to archive?" is a better question than it sounds. It forces a
comparison between what the specs claim and what the code does, and that is the only point in the
process where the two are checked against each other directly.

---

## What the process caught

Things that would have shipped broken without a stage that questioned the previous one:

| Found | By |
| --- | --- |
| Scope inflation: 20 FRs down to 8, each traceable to a line of the brief | Stage 1 |
| A phase with no candidates still renders a column; a backward move behaves like a forward one — implied by the PRD, never stated | Stage 2 (writing scenarios) |
| Three of the brief's four endpoint paths return 404 | Verification against the running stack |
| `applicationId` is absent from the brief's documented response but is **required** to save a move | Same |
| An agent "fixed" a duplicate `orderIndex` that the brief's own sample payload contains, and that a design decision depends on | Cross-checking agent reports against the brief |
| Re-seeding on boot silently reverted dragged cards | Reviewing a trade-off an agent flagged in passing |
| A failed `PUT` left the board showing a phase the database rejected | Asking each agent what happens on failure |
| The mobile breakpoint breaks cross-column *keyboard* drag | An agent comparing key sequences at two viewport widths |
| Six behaviours implemented and tested but never written into the specs | Asking what `openspec archive` would enshrine (§7) |

The last four came from agents reporting inconvenient facts rather than declaring success — which
is a property of how they were prompted, not luck.

## What the model got wrong

- **Scoped tests out** on flawed reasoning; corrected by the prompt in §5.
- **Miscounted the scenarios** as 19 when there were 17. Caught by counting `#### Scenario:`
  headings rather than trusting the summary.
- **Two agents disagreed about the seed** — one treated the duplicate `orderIndex` as a bug and
  fixed it, which would have left a scenario with no live data to exercise. Resolved by checking the
  brief, which has the collision in its own example.

## Verification

71 automated tests (jest + React Testing Library) covering 20 of the 23 scenarios. The other three —
two drag gestures and the 375px layout — are unreachable in jsdom, which has no pointer input and no
layout engine. Rather than write tests that would pass for the wrong reasons, they are verified
against real Chrome over the DevTools Protocol: trusted mouse events for the drags, measured
`getBoundingClientRect()` values for the layout. No test framework was added to do it.
