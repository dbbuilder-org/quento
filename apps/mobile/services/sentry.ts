/**
 * Sentry Error Tracking Configuration
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';

// Sentry DSN - Get from https://sentry.io
const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn || '';

// Environment detection
const getEnvironment = (): string => {
  if (__DEV__) return 'development';
  if (Constants.expoConfig?.extra?.environment) {
    return Constants.expoConfig.extra.environment;
  }
  return 'production';
};

/**
 * Initialize Sentry error tracking
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.log('Sentry DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: getEnvironment(),
    enableInExpoDevelopment: false, // Disable in dev by default
    debug: __DEV__, // Show debug logs in development

    // Performance monitoring
    enableAutoPerformanceTracing: true,
    tracesSampleRate: getEnvironment() === 'production' ? 0.2 : 1.0,

    // Release and dist for source map uploads
    release: Constants.expoConfig?.version || '1.0.0',
    dist: Constants.expoConfig?.android?.versionCode?.toString() ||
          Constants.expoConfig?.ios?.buildNumber || '1',

    // Session tracking
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,

    // Attachment settings
    attachStacktrace: true,
    attachScreenshot: true,
    attachViewHierarchy: true,

    // Before send hook for filtering
    beforeSend(event) {
      // Filter out development errors if needed
      if (__DEV__ && event.exception) {
        console.log('[Sentry] Error captured (dev mode):', event.exception);
      }

      // Don't send network errors for internal API during dev
      if (__DEV__ && event.exception?.values) {
        const isNetworkError = event.exception.values.some(
          (e) => e.type === 'NetworkError' || e.value?.includes('localhost')
        );
        if (isNetworkError) return null;
      }

      return event;
    },
  });
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; name?: string } | null): void {
  if (user) {
    Sentry.Native.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.Native.setUser(null);
  }
}

/**
 * Add breadcrumb for user actions
 */
export function addBreadcrumb(
  message: string,
  category: 'navigation' | 'user' | 'ui' | 'http' | 'error' = 'user',
  data?: Record<string, unknown>
): void {
  Sentry.Native.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Capture an exception manually
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>
): string {
  return Sentry.Native.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message (for non-error events)
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): string {
  return Sentry.Native.captureMessage(message, level);
}

/**
 * Set extra context for all subsequent errors
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  Sentry.Native.setContext(name, context);
}

/**
 * Set a tag for filtering in Sentry dashboard
 */
export function setTag(key: string, value: string): void {
  Sentry.Native.setTag(key, value);
}

/**
 * Wrap a function with error boundary
 */
export function wrap<T extends (...args: any[]) => any>(fn: T): T {
  return Sentry.Native.wrap(fn);
}

/**
 * Start a performance transaction
 */
export function startTransaction(
  name: string,
  op: string
): ReturnType<typeof Sentry.Native.startTransaction> {
  return Sentry.Native.startTransaction({ name, op });
}

/**
 * Error boundary wrapper for React components
 * Use: <Sentry.ErrorBoundary fallback={<ErrorScreen />}>...</Sentry.ErrorBoundary>
 */
export const ErrorBoundary = Sentry.Native.ErrorBoundary;

/**
 * Higher-order component for wrapping screens with Sentry
 */
export const withSentry = Sentry.Native.wrap;

// Export native Sentry for advanced usage
export { Sentry };
