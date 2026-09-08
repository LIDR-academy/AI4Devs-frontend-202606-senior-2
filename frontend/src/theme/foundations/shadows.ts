export const shadows = {
  // Drop shadow actually applied to Card 1:25 on the board (read via get_design_context).
  card: '0px 1px 2px 0px rgba(0, 0, 0, 0.25)',
  // Figma effect style "Shadow" (figma-export.json > effectStyles). Defined in the file but not used on the board.
  elevated: '0px 9px 30px -6px rgba(0, 0, 0, 0.12), 0px 0px 1px 0px #5A616A',
  // Keyboard focus ring for buttons and fields: 2px ring in the brand border colour (CSS var emitted by Chakra
  // for the `border.brand` semantic token, so it follows light/dark mode).
  focus: '0 0 0 2px var(--chakra-colors-border-brand)',
};
