// Column tint per interview step, cycled by position (decision D14). Figma tints columns by task status
// (secondary / info / critical / success); interview steps are dynamic, so the meaning is positional only.
// `dot` is the Status-chip bullet: Figma uses <hue>.secondary, mapped to the closest semantic border token (D11).
export type ColumnTint = { bg: string; dot: string };

export const columnTints: ColumnTint[] = [
  { bg: 'bg.secondary', dot: 'border.regular' },
  { bg: 'bg.info', dot: 'border.brand' },
  { bg: 'bg.attention', dot: 'border.attention' },
  { bg: 'bg.success', dot: 'border.success' },
];

export const tintFor = (index: number): ColumnTint => columnTints[index % columnTints.length];
