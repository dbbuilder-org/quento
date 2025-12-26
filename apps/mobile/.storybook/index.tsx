/**
 * Storybook Entry Point
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { view } from './storybook.requires';

const StorybookUIRoot = view.getStorybookUI({
  // Allows URL protocol to work with expo-linking
  enableWebsockets: true,
});

export default StorybookUIRoot;
