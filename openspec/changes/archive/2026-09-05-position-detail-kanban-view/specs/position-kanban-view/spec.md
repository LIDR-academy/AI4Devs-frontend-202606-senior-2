## Purpose

Lets a recruiter see, at a glance, which candidates are in a position's hiring pipeline and which phase each one is currently in.

## ADDED Requirements

### Requirement: Position title and back navigation
The position detail view SHALL display the position's title near the top of the page, and SHALL provide a control near the title that navigates back to `/positions`.

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
Each candidate SHALL appear as a card under the column whose step matches that candidate's current interview step, showing the candidate's full name and average score.

#### Scenario: Candidate placed in the matching column
- **WHEN** a candidate's current interview step is "Technical Interview"
- **THEN** that candidate's card appears in the "Technical Interview" column, not in any other column

#### Scenario: Card content
- **WHEN** a candidate's card is rendered
- **THEN** it shows the candidate's full name and a visual representation of their average score

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
