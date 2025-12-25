/**
 * Shared Constants - Quento Platform
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

// Ring configuration
export const RINGS = {
  CORE: 1,
  DISCOVER: 2,
  PLAN: 3,
  EXECUTE: 4,
  OPTIMIZE: 5,
} as const;

export const RING_NAMES = {
  1: 'Core',
  2: 'Discover',
  3: 'Plan',
  4: 'Execute',
  5: 'Optimize',
} as const;

export const RING_DESCRIPTIONS = {
  1: 'Understanding your story',
  2: 'Analyzing your presence',
  3: 'Creating your strategy',
  4: 'Taking action',
  5: 'Continuous growth',
} as const;

// Theme colors
export const COLORS = {
  // Primary
  carbon: '#1A1A1A',
  forest: '#2D5A3D',
  sage: '#4A7C5C',
  pure: '#FFFFFF',

  // Secondary
  bark: '#8B7355',
  sand: '#D4C4A8',
  cream: '#F5F3EF',
  parchment: '#E8E4DD',

  // Semantic
  success: '#2D7D46',
  warning: '#D4A84B',
  error: '#C75450',
  info: '#4A90A4',
} as const;

// API endpoints (relative to base URL)
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // Chat
  SESSIONS: '/chat/sessions',
  SESSION: (id: string) => `/chat/sessions/${id}`,
  MESSAGES: (id: string) => `/chat/sessions/${id}/messages`,

  // Analysis
  ANALYSES: '/analysis',
  ANALYSIS: (id: string) => `/analysis/${id}`,
  ANALYSIS_STATUS: (id: string) => `/analysis/${id}/status`,

  // Strategy
  STRATEGIES: '/strategy',
  STRATEGY: (id: string) => `/strategy/${id}`,
  STRATEGY_GENERATE: '/strategy/generate',
  STRATEGY_ACTIONS: (id: string) => `/strategy/${id}/actions`,
  STRATEGY_EXPORT: (id: string) => `/strategy/${id}/export`,

  // Users
  CURRENT_USER: '/users/me',
  USER_PROGRESS: '/users/me/progress',
} as const;

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL_REGEX: /^https?:\/\/.+/,
} as const;

// Credits
export const CREDITS = {
  COMPANY: 'ServiceVision',
  URL: 'https://www.servicevision.net',
  TEXT: 'AI App Development powered by ServiceVision',
} as const;
