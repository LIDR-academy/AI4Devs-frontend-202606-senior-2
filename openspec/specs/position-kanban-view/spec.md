# position-kanban-view Specification

## Purpose

Lets a recruiter see, at a glance, which candidates are in a position's hiring pipeline and which phase each one is currently in.

## Requirements

### Requirement: Position title and back navigation
The position detail view SHALL display the position's title, in bold, near the top of the page, and SHALL provide a control near the title that navigates back to `/positions`.

#### Scenario: Title shown
- **WHEN** the position detail view loads for a given position id
- **THEN** the position's name is displayed near the top of the page

#### Scenario: Back control returns to the list
- **WHEN** the user activates the back control near the title
- **THEN** the browser navigates to `/positions`

### Requirement: One column per interview step
The position detail view SHALL render one column per interview step of that position's interview flow, labeled with the step's name, in `orderIndex` order.

#### Scenario: Columns match the interview flow
- **WHEN** the position's interview flow has N steps
- **THEN** the view renders N columns, each labeled with its step's name, ordered left-to-right (or top-to-bottom on mobile) by `orderIndex`

### Requirement: Candidates shown under their current step
Each candidate SHALL appear as a card under the column whose step matches that candidate's current interview step, showing the candidate's full name and average score. Per the design mockup, the card SHALL have no visible border, only a soft shadow, and SHALL NOT show a fixed-size rating bar.

#### Scenario: Candidate placed in the matching column
- **WHEN** a candidate's current interview step is "Technical Interview"
- **THEN** that candidate's card appears in the "Technical Interview" column, not in any other column

#### Scenario: Card content
- **WHEN** a candidate's card is rendered
- **THEN** it shows the candidate's full name in bold, and their average score as exactly as many filled dots as the (rounded) score — e.g. a score of 3 renders exactly 3 dots, never padded or capped to a fixed number of slots with empty/placeholder dots

#### Scenario: Step with no candidates
- **WHEN** an interview step currently has no candidates in it
- **THEN** its column is still rendered (empty), not hidden

### Requirement: Responsive layout
On a narrow (mobile-width) viewport, the columns SHALL stack vertically, each spanning the full available width.

#### Scenario: Narrow viewport
- **WHEN** the position detail view is displayed on a mobile-width viewport
- **THEN** the interview-step columns are stacked vertically, each full-width, instead of side-by-side

### Requirement: Loading and error feedback
The position detail view SHALL show a loading indicator while its data is being fetched, and an inline error message if either fetch fails, instead of an empty or broken-looking page.

#### Scenario: Data still loading
- **WHEN** the position detail view has just navigated to and the interview flow / candidates requests haven't resolved yet
- **THEN** a loading indicator is shown instead of an empty board

#### Scenario: Fetch fails
- **WHEN** the interview flow or candidates request fails (network error or non-2xx response)
- **THEN** an inline error message is shown instead of a silently empty or partially-rendered board

### Requirement: Move a candidate's stage by dragging their card
A recruiter SHALL be able to move a candidate to a different interview step by dragging that candidate's card from its current column and dropping it on a different column. On a successful drop, the candidate's card SHALL appear in the target column and the change SHALL be persisted via the backend. On a failed request, the card SHALL remain in its original column and an inline error SHALL be shown; no other candidate or column state is affected.

#### Scenario: Successful move persists the new stage
- **WHEN** the user drags a candidate's card from column A and drops it on column B
- **THEN** the backend is called to update that candidate's interview step to B, and once that call succeeds the card is shown under column B (no longer under column A)

#### Scenario: Failed move keeps the card in place
- **WHEN** the user drags a candidate's card and drops it on a different column, and the backend call fails
- **THEN** the card remains under its original column, and an inline error is shown, without losing the card or affecting other candidates' cards

#### Scenario: Dropping on the same column is a no-op
- **WHEN** the user drags a candidate's card and drops it back on the column it already belongs to
- **THEN** no backend call is made and the card stays where it was

#### Scenario: In-progress move is indicated
- **WHEN** a move's backend request is in flight
- **THEN** the card being moved shows a visible in-progress indication until the request resolves
