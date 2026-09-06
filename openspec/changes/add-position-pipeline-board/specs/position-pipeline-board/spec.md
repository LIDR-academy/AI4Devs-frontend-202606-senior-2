## ADDED Requirements

### Requirement: Open a position's pipeline from the positions list

The positions list SHALL provide a route into each position's pipeline. Activating the
**"Ver proceso"** control on a position card MUST navigate to that position's detail page.

#### Scenario: Recruiter opens a position's pipeline

- **WHEN** a recruiter activates "Ver proceso" on a position card in the positions list
- **THEN** the application navigates to the pipeline page for that position
- **AND** the page shows the pipeline for the position whose card was activated, not another

#### Scenario: Each card leads to its own position

- **WHEN** the positions list shows more than one position
- **THEN** each card's "Ver proceso" control targets its own position's identifier

### Requirement: Position title provides context

The pipeline page SHALL display the position's title at the top of the page content, so a recruiter
can tell which hiring process they are looking at.

#### Scenario: Title reflects the position

- **WHEN** the pipeline page for a position has loaded
- **THEN** the position's name is displayed at the top of the page content

### Requirement: Return to the positions list

The pipeline page SHALL display a back arrow to the **left of the position title** that returns the
recruiter to the positions list.

#### Scenario: Recruiter returns to the list

- **WHEN** a recruiter activates the back arrow beside the position title
- **THEN** the application navigates to the positions list

#### Scenario: Back arrow is positioned beside the title

- **WHEN** the pipeline page has loaded
- **THEN** the back arrow is rendered to the left of the position title

### Requirement: One column per phase of the hiring process

The board SHALL render exactly as many columns as there are phases in the position's interview
flow, labelled with each phase's name. The column count and names MUST come from the position's
interview flow and MUST NOT be hardcoded. Columns MUST appear in a deterministic order.

#### Scenario: Column count follows the position's flow

- **WHEN** a position's interview flow contains four phases
- **THEN** the board renders four columns
- **AND** each column is headed by the name of its phase

#### Scenario: Column order is deterministic when phases share an order index

- **WHEN** two phases in the flow carry the same `orderIndex` (as phases 2 and 3 do in the seeded
  flow)
- **THEN** the columns still appear in a stable, repeatable order across reloads

#### Scenario: A phase with no candidates still appears

- **WHEN** a phase of the flow has no candidates in it
- **THEN** its column is still rendered, headed by the phase name, as an empty column

### Requirement: Candidate cards show name and score in their current phase

Each candidate in the position's pipeline SHALL be rendered as a card in the column corresponding
to their current phase. Each card MUST show the candidate's **full name** and their **average
score**.

#### Scenario: A candidate appears in their current phase

- **WHEN** a candidate's current phase is "Technical Interview"
- **THEN** their card appears in the "Technical Interview" column
- **AND** it appears in no other column

#### Scenario: Card content

- **WHEN** a candidate's card is rendered
- **THEN** it shows the candidate's full name
- **AND** it shows the candidate's average score

#### Scenario: Several candidates in one phase

- **WHEN** three candidates share the same current phase
- **THEN** all three cards are rendered in that phase's column

#### Scenario: A position with no candidates

- **WHEN** a position has no candidates in its pipeline
- **THEN** the board still renders one column per phase, all of them empty

### Requirement: The page reports loading and failure

The board depends on two requests. Until both resolve the page SHALL show that it is loading, and
if either fails it MUST say so rather than presenting an empty or partial board as if it were the
real state. The back arrow MUST remain usable in every state, so a recruiter is never stranded.

#### Scenario: The pipeline is still loading

- **WHEN** a recruiter opens a position's pipeline
- **AND** the interview flow and candidate requests have not both resolved
- **THEN** the page shows that it is loading

#### Scenario: The pipeline cannot be loaded

- **WHEN** either request fails
- **THEN** the page shows a message saying the pipeline could not be loaded
- **AND** the back arrow to the positions list is still available

### Requirement: Phases stack vertically on mobile

On a narrow viewport the board SHALL stack the phases vertically, each occupying the full width, in
the same order as on a wide viewport.

> The brief qualifies this requirement with *"if possible"*. It is therefore the lowest-priority
> item in this change and the first to drop if the deadline tightens.

#### Scenario: Narrow viewport

- **WHEN** the pipeline page is viewed on a 375px-wide viewport
- **THEN** the phase columns are stacked vertically
- **AND** each occupies the full width of the content area
- **AND** the page does not scroll horizontally
