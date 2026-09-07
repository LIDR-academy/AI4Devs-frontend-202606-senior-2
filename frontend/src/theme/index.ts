import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { colors } from './foundations/colors';
import { fonts, fontWeights, textStyles } from './foundations/typography';
import { space } from './foundations/space';
import { sizes } from './foundations/sizes';
import { radii } from './foundations/radii';
import { shadows } from './foundations/shadows';
import { semanticTokens } from './semanticTokens';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  colors,
  fonts,
  fontWeights,
  textStyles,
  space,
  sizes,
  radii,
  shadows,
  semanticTokens,
  styles: {
    global: {
      body: {
        bg: 'bg.primary',
        color: 'text.primary',
        fontFamily: 'body',
      },
    },
  },
});
