import { alertAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

// Alert (and therefore useToast, which renders an Alert) restyled with semantic tokens.
// Chakra maps status → colorScheme: error→red, success→green, warning→orange, info→blue.
const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(alertAnatomy.keys);

const tokensByScheme: Record<string, { bg: string; fg: string }> = {
  red: { bg: 'bg.critical', fg: 'text.critical' },
  green: { bg: 'bg.success', fg: 'text.success' },
  orange: { bg: 'bg.attention', fg: 'text.attention' },
  blue: { bg: 'bg.info', fg: 'text.link' },
};
const pick = (scheme: string) => tokensByScheme[scheme] ?? tokensByScheme.blue;

const subtle = definePartsStyle((props) => {
  const t = pick(props.colorScheme);
  return {
    container: { bg: t.bg, color: t.fg, borderRadius: 'card' },
    icon: { color: t.fg },
    title: { textStyle: 'bodyMdEmphasis' },
    description: { textStyle: 'bodyMd' },
  };
});

const solid = definePartsStyle((props) => {
  const t = pick(props.colorScheme);
  return {
    container: { bg: t.fg, color: 'text.primaryInverse', borderRadius: 'card' },
    icon: { color: 'text.primaryInverse' },
    title: { textStyle: 'bodyMdEmphasis' },
    description: { textStyle: 'bodyMd' },
  };
});

export const Alert = defineMultiStyleConfig({
  variants: { subtle, solid },
  defaultProps: { variant: 'subtle' },
});
