/**
 * Metro configuration for Quento Mobile
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

const { getDefaultConfig } = require('expo/metro-config');
const { generate } = require('@storybook/react-native/scripts/generate');

// Generate storybook.requires.ts on Metro start
generate({
  configPath: './.storybook',
});

const config = getDefaultConfig(__dirname);

// Enable require.context for Storybook
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Watch for changes in .storybook folder
config.watchFolders = [...(config.watchFolders || [])];

module.exports = config;
