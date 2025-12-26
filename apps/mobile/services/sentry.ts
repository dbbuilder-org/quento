/**
 * Sentry Error Tracking Configuration (Stubbed)
 *
 * Sentry temporarily disabled due to Xcode 16 compatibility issues.
 * Re-enable by installing @sentry/react-native@6.x when available.
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import React from 'react';

// Stub implementations - no-ops when Sentry is disabled

export function initSentry(): void {
  console.log('[Sentry] Disabled - error tracking not active');
}

export function setUser(_user: { id: string; email?: string; name?: string } | null): void {
  // No-op
}

export function addBreadcrumb(
  _message: string,
  _category: 'navigation' | 'user' | 'ui' | 'http' | 'error' = 'user',
  _data?: Record<string, unknown>
): void {
  // No-op
}

export function captureException(
  error: Error,
  _context?: Record<string, unknown>
): string {
  console.error('[Sentry Stub] Exception:', error.message);
  return 'stub-event-id';
}

export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): string {
  console.log(`[Sentry Stub] ${level}: ${message}`);
  return 'stub-event-id';
}

export function setContext(_name: string, _context: Record<string, unknown>): void {
  // No-op
}

export function setTag(_key: string, _value: string): void {
  // No-op
}

export function wrap<T extends (...args: any[]) => any>(fn: T): T {
  return fn;
}

export function startTransaction(_name: string, _op: string): { finish: () => void } {
  return { finish: () => {} };
}

// Stub ErrorBoundary - just renders children
export const ErrorBoundary = ({ children }: { children: React.ReactNode; fallback?: React.ReactNode }) => children;

export const withSentry = <T extends (...args: any[]) => any>(fn: T): T => fn;
