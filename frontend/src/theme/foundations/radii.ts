// Figma has no radius tokens; values read from the board nodes via get_design_context
// (Card 1:25 → 4px, Swimlane → 8px, Simple Kanban container → 24px).
export const radii = {
  card: '4px',
  column: '8px',
  board: '24px',
};
