import type { Preview } from '@storybook/react';
import 'bootstrap/dist/css/bootstrap.min.css';
const preview: Preview = {
  parameters: {
    layout: 'padded',
    chromatic: { viewports: [375, 1280] },
    controls: { expanded: true },
    backgrounds: { default: 'LIDR', values: [{ name: 'LIDR', value: '#0a0a0a' }] },
  },
};
export default preview;
