/**
 * App Entry Point - Conditionally loads Storybook or Main App
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import Constants from 'expo-constants';

// Check if we should load Storybook
const STORYBOOK_ENABLED = Constants.expoConfig?.extra?.storybookEnabled === true;

// Conditionally load Storybook or normal app entry
if (STORYBOOK_ENABLED) {
  // Storybook mode - render component library
  module.exports = require('./.storybook/Storybook');
} else {
  // Normal mode - use expo-router
  module.exports = require('expo-router/entry');
}
