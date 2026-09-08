# Prompts Iniciales

## Generate instructions and clarification

### Prompt

Consider the good practices at @ManifestoBuenasPracticas.md.

Give me the detailed instructions to create the frontend of a basic page for candidates state view:

- a list, kanban-style
- show candidates as cards
- columns are each hiring process state
- UI allows update of process state by moving a card
- card can be moved by sliding it into another column
- when card is drag and dropped, candidate data in DB should be updated to show new hiring process state
- the process state should be shown as title over the columns
- have a arrow on the left to allow page move to positions listing
- all process states should be shown as columns, no state should be hidden
- make the page responsive as it works well on mobile as well
- when on mobile, the stets should stay on vertical
- assume that the page’s overall structure exists, we only need internal page content

Ask before inferring any solution.

Project context:
@frontend

### Answer

Before I provide the detailed instructions, I need to clarify a few key aspects that will affect the implementation:

#### Clarification Questions

1. **Drag-and-drop library preference**: Which library should I use for drag-and-drop functionality? Options include:
   - `@dnd-kit/core` (modern, lightweight, TypeScript-first)
   - `react-beautiful-dnd` (battle-tested, but larger bundle size)
   - `react-dnd` (flexible but more complex setup)

2. **Kanban scope**: Should this kanban board show:
   - All candidates across all positions?
   - Candidates filtered by a specific position?
   - Candidates filtered by company?

3. **Data to display on cards**: What information should each candidate card show? For example:
   - Name, email, phone
   - Current position applied for
   - Application date
   - Photo/avatar

4. **Integration point**: Should this be:
   - A new standalone page (e.g., `/kanban`)?
   - Integrated into the existing `RecruiterDashboard.js`?
   - A separate feature accessible from the dashboard?

5. **Authentication**: Is there an authentication system in place, or should I assume the API endpoints are publicly accessible for this implementation?

6. **Styling approach**: Should I use:
   - The existing `react-bootstrap` components?
   - Custom CSS/Styled Components?
   - A combination?

---

Based on the codebase analysis, I can see:

- **Backend**: Node.js/Express with Prisma ORM, already has `PUT /candidates/:id` endpoint for updating `currentInterviewStep`
- **Frontend**: React 18 with TypeScript, react-bootstrap, react-router-dom
- **Data model**: `Application` has `currentInterviewStep` (FK to InterviewStep), which represents the hiring process state
- **Current state**: Basic frontend with candidate creation and position listing

**Please answer the questions above, and I'll provide the detailed step-by-step instructions tailored to your preferences.**

Alternatively, if you want me to proceed with sensible defaults, I can use:
- `@dnd-kit/core` for drag-and-drop
- New `/kanban` page
- Show name, email, position on cards
- React-bootstrap styling
- Assume no auth for now

## Updated prompt

Consider the good practices at @ManifestoBuenasPracticas.md.

Create the frontend of a basic page for candidates state view:

Product decisions:

- a list, kanban-style
- show candidates as cards
- columns are each hiring process state
- UI allows update of process state by moving a card
- card can be moved by sliding it into another column
- when card is drag and dropped, candidate data in DB should be updated to show new hiring process state
- the process state should be shown as title over the columns
- have a arrow on the left to allow page move to positions listing
- all process states should be shown as columns, no state should be hidden
- candidates should have their full name and average score showing at their cards
- only one card per candidate
- make the page responsive as it works well on mobile as well
- when on mobile, the stets should stay on vertical
- assume that the page’s overall structure exists, we only need internal page content

Tech decisions:

- Use @dnd-kit/core for drag and drop cards
- no authentication is needed
- use existing components whenever possible
- new components can be created of needed
- follow UI known patterns
- should be a standalone page
- add a basic coverage of unit tests

Project context:
@frontend
