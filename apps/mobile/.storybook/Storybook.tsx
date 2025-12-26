/**
 * Storybook UI Root Component
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { view } from './storybook.requires';

const StorybookUIRoot = view.getStorybookUI({
  // Enable websockets for live updates
  enableWebsockets: true,
});

export default StorybookUIRoot;
