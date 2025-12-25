/**
 * Storybook Preview Configuration
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import type { Preview } from '@storybook/react';
import { View } from 'react-native';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
        { name: 'cream', value: '#F5F3EF' },
        { name: 'dark', value: '#1A1A1A' },
        { name: 'forest', value: '#2D5A3D' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default preview;
