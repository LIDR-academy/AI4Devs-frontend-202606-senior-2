// Typography from Figma text styles (figma-export.json > textStyles).
// Figma uses Proxima Nova for headings (proprietary, not on Google Fonts) → substituted by Montserrat.
export const fonts = {
  body: "'IBM Plex Sans', system-ui, sans-serif",
  heading: "'Montserrat', system-ui, sans-serif", // Proxima Nova substitute
};

export const fontWeights = {
  regular: 400,
  semibold: 600,
  bold: 700,
};

const body = (fontSize: string, lineHeight: string, fontWeight: number) => ({
  fontFamily: 'body',
  fontSize,
  lineHeight,
  fontWeight,
});
const heading = (fontSize: string, lineHeight: string, fontWeight: number) => ({
  fontFamily: 'heading',
  fontSize,
  lineHeight,
  fontWeight,
});

// Keys are flat camelCase versions of the Figma style names.
export const textStyles = {
  bodyXs: body('10px', '14px', fontWeights.regular), // Body extra small
  bodySm: body('12px', '16px', fontWeights.regular), // Body small
  bodySmEmphasis: body('12px', '16px', fontWeights.semibold), // Body small emphasis
  bodyMd: body('14px', '20px', fontWeights.regular), // Body medium
  bodyMdEmphasis: body('14px', '20px', fontWeights.semibold), // Body medium emphasis
  bodyLg: body('16px', '24px', fontWeights.regular), // Body large
  bodyLgEmphasis: body('16px', '24px', fontWeights.semibold), // Body large emphasis
  subtitleDeEmphasis: heading('18px', '28px', fontWeights.semibold), // Subtitle de-emphasis
  subtitle: heading('18px', '28px', fontWeights.bold), // Subtitle
  titleDeEmphasis: heading('24px', '32px', fontWeights.semibold), // Title de-emphasis
  title: heading('24px', '32px', fontWeights.bold), // Title
  headlineDeEmphasis: heading('32px', '40px', fontWeights.semibold), // Headline de-emphasis
  headline: heading('32px', '40px', fontWeights.bold), // Headline
  display: heading('50px', '56px', fontWeights.bold), // Display
};
