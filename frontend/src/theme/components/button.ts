import { defineStyleConfig } from '@chakra-ui/react';

// CTA variants (Figma CTA/Primary and CTA/Secondary). Call sites use `variant="primary" | "secondary" | "danger"`
// instead of repeating bg/hover/active props; focus and disabled states are tokenized here too.
export const Button = defineStyleConfig({
  baseStyle: {
    borderRadius: 'card',
    textStyle: 'bodyMdEmphasis',
    _focusVisible: { boxShadow: 'focus' },
    _disabled: { opacity: 1, bg: 'bg.disabled', color: 'text.disabled', borderColor: 'border.disabled' },
  },
  variants: {
    primary: {
      bg: 'cta.primary.base',
      color: 'text.primaryInverse',
      _hover: { bg: 'cta.primary.hover', _disabled: { bg: 'bg.disabled' } },
      _active: { bg: 'cta.primary.pressed' },
    },
    secondary: {
      bg: 'cta.secondary.base',
      color: 'text.brand',
      border: '1px', // Chakra `borders` token, resolves to 1px solid
      borderColor: 'border.brand',
      _hover: { bg: 'cta.secondary.hover', _disabled: { bg: 'bg.disabled' } },
      _active: { bg: 'cta.secondary.pressed' },
    },
    danger: {
      bg: 'bg.critical',
      color: 'text.critical',
      _hover: { bg: 'bg.critical', _disabled: { bg: 'bg.disabled' } },
      _active: { bg: 'bg.critical' },
    },
  },
});
