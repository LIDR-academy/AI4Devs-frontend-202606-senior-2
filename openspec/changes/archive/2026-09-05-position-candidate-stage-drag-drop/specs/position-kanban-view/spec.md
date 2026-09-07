## ADDED Requirements

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
