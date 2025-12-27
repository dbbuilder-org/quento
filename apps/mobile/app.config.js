/**
 * Expo App Configuration
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

const IS_PROD = process.env.APP_ENV === 'production';
const STORYBOOK_ENABLED = process.env.STORYBOOK_ENABLED === 'true';

export default {
  expo: {
    name: "Quento",
    slug: "quento",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#2D5A3D"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.quento.app",
      buildNumber: "1"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#2D5A3D"
      },
      package: "com.quento.app",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-web-browser",
      "@react-native-community/datetimepicker",
      // Temporarily disabled - Sentry SDK has C++ issues with Xcode 16/iOS 26
      // [
      //   "sentry-expo",
      //   {
      //     organization: process.env.SENTRY_ORG || "your-sentry-org",
      //     project: "quento-mobile",
      //     url: "https://sentry.io/"
      //   }
      // ]
    ],
    scheme: "quento",
    extra: {
      eas: {
        projectId: "3d5c1519-86c7-4265-b6ed-b5617752662c"
      },
      // Always use Render URL (local API not running)
      apiUrl: "https://quento-api.onrender.com",
      sentryDsn: process.env.SENTRY_DSN || "",
      environment: IS_PROD ? "production" : "development",
      credits: "AI App Development powered by ServiceVision (https://www.servicevision.net)",
      storybookEnabled: STORYBOOK_ENABLED
    },
    // hooks: {
    //   postPublish: [
    //     {
    //       file: "sentry-expo/upload-sourcemaps",
    //       config: {
    //         organization: process.env.SENTRY_ORG || "your-sentry-org",
    //         project: "quento-mobile"
    //       }
    //     }
    //   ]
    // }
  }
};
