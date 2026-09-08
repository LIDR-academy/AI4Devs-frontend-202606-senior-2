import { inputAnatomy, selectAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

// Form fields restyled with semantic tokens (Chakra's default `outline` variant falls back to gray/blue).
// Shared by Input and Select so pages do not repeat the field props.
const field = {
  bg: 'bg.primary',
  color: 'text.primary',
  border: '1px', // Chakra `borders` token, resolves to 1px solid
  borderColor: 'border.subdue',
  borderRadius: 'card',
  textStyle: 'bodyMd',
  _placeholder: { color: 'text.subdue' },
  _hover: { borderColor: 'border.regular' },
  _focusVisible: { borderColor: 'border.brand', boxShadow: 'focus' },
  _invalid: { borderColor: 'border.critical' },
  _disabled: { bg: 'bg.disabled', color: 'text.disabled', opacity: 1 },
};

const input = createMultiStyleConfigHelpers(inputAnatomy.keys);
export const Input = input.defineMultiStyleConfig({
  variants: { outline: input.definePartsStyle({ field }) },
  defaultProps: { variant: 'outline' },
});

const select = createMultiStyleConfigHelpers(selectAnatomy.keys);
export const Select = select.defineMultiStyleConfig({
  variants: { outline: select.definePartsStyle({ field, icon: { color: 'text.subdue' } }) },
  defaultProps: { variant: 'outline' },
});
