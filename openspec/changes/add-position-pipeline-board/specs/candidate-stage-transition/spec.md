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

#### Scenario: An abandoned drag changes nothing

- **WHEN** a recruiter begins dragging a candidate's card and releases it outside any column, or
  cancels the drag
- **THEN** the card stays in the column it started in
- **AND** no update is sent to the backend

#### Scenario: Dropping a card back on its own phase changes nothing

- **WHEN** a recruiter drops a candidate's card on the column it was already in
- **THEN** the card stays where it was
- **AND** no update is sent to the backend

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

### Requirement: A rejected move is undone and reported

If the backend rejects a move, the board MUST NOT keep showing the candidate in a phase that was
never persisted. The system SHALL return the card to the phase and position it came from, and MUST
tell the recruiter that the move did not take effect.

#### Scenario: The card returns to its original phase when the update is rejected

- **WHEN** a recruiter drops a candidate's card on another column
- **AND** the update sent to the backend fails
- **THEN** the card is shown again in the phase it was dragged from
- **AND** a message naming the candidate reports that the move did not take effect

#### Scenario: An undone move does not discard a later move

- **WHEN** a recruiter moves a second candidate while the first move's update is still in flight
- **AND** the first update is then rejected
- **THEN** only the first candidate returns to their original phase
- **AND** the second candidate stays where they were moved to
