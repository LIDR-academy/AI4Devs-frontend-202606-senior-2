## Purpose

Lets a recruiter move from the positions list into a specific position's hiring pipeline by clicking that position's card.

## ADDED Requirements

### Requirement: Navigate from a position card to its detail view
The system SHALL navigate the user to `/positions/:id` when they click the "Ver proceso" button on a position card, where `:id` identifies that specific position's card.

#### Scenario: Click "Ver proceso" on a position card
- **WHEN** the user clicks the "Ver proceso" button on a position card in the positions list
- **THEN** the browser navigates to `/positions/:id` for that position, without a full page reload

### Requirement: Position detail route exists
The system SHALL register a client-side route at `/positions/:id` that renders the position detail view for the given id.

#### Scenario: Route resolves
- **WHEN** the browser location is `/positions/:id` for any id
- **THEN** the router renders the position detail view component (content defined by a separate change) instead of a 404 or blank page

### Requirement: "Ver proceso" is keyboard accessible
The "Ver proceso" control SHALL be operable via keyboard alone and SHALL show a visible focus indicator, per this project's WCAG 2.2 AA baseline (semantic HTML before ARIA, full keyboard navigation with visible focus).

#### Scenario: Activate via keyboard
- **WHEN** the user tabs to the "Ver proceso" control on a position card and presses Enter (or Space)
- **THEN** the browser navigates to `/positions/:id` for that position, same as a mouse click

#### Scenario: Focus is visible
- **WHEN** the "Ver proceso" control receives keyboard focus
- **THEN** a visible focus indicator is shown around it
