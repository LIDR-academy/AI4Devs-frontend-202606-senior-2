// Figma has no spacing tokens; scale read from the board nodes (chip py 2, card p/gap 8, column gap 12,
// swimlane/board gap 24, board p 40, page p 50→48). Keys follow Chakra's numeric convention (value / 4)
// so `p={4}` reads as 16px.
export const space = {
  '2xs': '2px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '6': '24px',
  '10': '40px',
  '12': '48px',
};
