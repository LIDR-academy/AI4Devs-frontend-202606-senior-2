## ADDED Requirements

### Requirement: Move a candidate to another phase by dragging their card

A recruiter SHALL be able to advance or move back a candidate by dragging their card from one
column to another. On completing the drag, the card MUST be shown in the target column.

#### Scenario: Recruiter drags a candidate to the next phase

- **WHEN** a recruiter drags a candidate's card from the "Initial Screening" column and drops it on
  the "Technical Interview" column
- **THEN** the card is shown in the "Technical Interview" column
- **AND** it is no longer shown in the "Initial Screening" column

#### Scenario: Recruiter moves a candidate back to an earlier phase

- **WHEN** a recruiter drags a candidate's card onto a column earlier in the process
- **THEN** the card is shown in that earlier column

### Requirement: A completed move is persisted

Completing a move SHALL persist the candidate's new phase, so the change survives leaving and
returning to the page. The system MUST send the move to the backend identifying the target phase by
its interview step id.

#### Scenario: The new phase survives a reload

- **WHEN** a recruiter has moved a candidate's card to a different column
- **AND** the recruiter reloads the pipeline page
- **THEN** the candidate's card appears in the column they were moved to

#### Scenario: The move identifies the target phase by id

- **WHEN** a candidate's card is dropped on a column
- **THEN** the update sent to the backend carries that candidate's application identifier and the
  interview step **id** of the target column
