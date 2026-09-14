1. Analyze the @frontend/src/components/Positions.tsx. I want to add a new page when user clicks on button "Ver Posicion". This new page must fetch data from @backend/src/presentation/controllers/positionController.ts "getInterviewFlowByPosition". We want to represent a kanban page where each "interviewSteps" will be a visible column.
2. Instead of fetch backend mock the data on @src/components/PositionKanban.tsx like we do on  @src/components/Positions.tsx . This are the values: [Pasted text #2 +30 lines]
3. Now let's visuale improve it. We need:
- Position title must be shown at top for user having context about the position name
- We need a back arrow to return to positions page
- Responsive: we need to adapt to mobile displaying a row per step postition.
4. Each column candidate must be visually display as a card. This card must be able to be moved from one column to another