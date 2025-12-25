/**
 * Design System Theme Constants
 *
 * These values are synced with the Figma design system and Storybook.
 * Modify with caution - changes will affect the entire application.
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

/**
 * COLOR PALETTE
 * Design Token IDs for Figma sync
 */
export const COLORS = {
  // Primary Colors
  carbon: '#1A1A1A',      // Token: color.primary.carbon
  forest: '#2D5A3D',      // Token: color.primary.forest
  sage: '#4A7C5C',        // Token: color.primary.sage
  pure: '#FFFFFF',        // Token: color.primary.pure

  // Secondary Colors
  bark: '#8B7355',        // Token: color.secondary.bark
  sand: '#D4C4A8',        // Token: color.secondary.sand
  cream: '#F5F3EF',       // Token: color.secondary.cream
  parchment: '#E8E4DD',   // Token: color.secondary.parchment

  // Semantic Colors
  success: '#2D7D46',     // Token: color.semantic.success
  warning: '#D4A84B',     // Token: color.semantic.warning
  error: '#C75450',       // Token: color.semantic.error
  info: '#4A90A4',        // Token: color.semantic.info

  // Transparency variants
  carbonLight: 'rgba(26, 26, 26, 0.6)',
  forestLight: 'rgba(45, 90, 61, 0.1)',
  pureOverlay: 'rgba(255, 255, 255, 0.94)',
} as const;

/**
 * SPACING SCALE
 * Based on 4px grid system
 * Design Token IDs for Figma sync
 */
export const SPACING = {
  xs: 4,      // Token: spacing.xs - Tight element spacing
  sm: 8,      // Token: spacing.sm - Related element groups
  md: 12,     // Token: spacing.md - Standard padding
  lg: 16,     // Token: spacing.lg - Card internal padding
  xl: 20,     // Token: spacing.xl - Section breaks
  '2xl': 24,  // Token: spacing.2xl - Component separation
  '3xl': 32,  // Token: spacing.3xl - Major section gaps
  '4xl': 40,  // Token: spacing.4xl - Page margins
  '5xl': 48,  // Token: spacing.5xl - Large separations
  '6xl': 64,  // Token: spacing.6xl - Hero spacing
} as const;

/**
 * TYPOGRAPHY
 * Font sizes and line heights
 * Design Token IDs for Figma sync
 */
export const TYPOGRAPHY = {
  // Display styles (Playfair Display in Figma)
  displayLarge: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '300' as const,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '400' as const,
    letterSpacing: -0.5,
  },

  // Headline styles (Inter in Figma)
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600' as const,
    letterSpacing: -0.25,
  },

  // Title styles
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  titleMedium: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500' as const,
  },

  // Body styles
  bodyLarge: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
  },

  // Label styles
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },

  // Caption
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
  },
} as const;

/**
 * BORDER RADIUS
 * Design Token IDs for Figma sync
 */
export const RADIUS = {
  xs: 4,      // Token: radius.xs - Small elements like badges
  sm: 8,      // Token: radius.sm - Buttons, inputs
  md: 12,     // Token: radius.md - Cards, panels
  lg: 16,     // Token: radius.lg - Large cards
  xl: 20,     // Token: radius.xl - Chat bubbles
  full: 9999, // Token: radius.full - Pills, circular buttons
} as const;

/**
 * SHADOWS
 * Design Token IDs for Figma sync
 */
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;

/**
 * ANIMATION TIMINGS
 * Design Token IDs for Figma sync
 */
export const ANIMATION = {
  fast: 150,      // Token: animation.fast - Micro-interactions
  normal: 200,    // Token: animation.normal - Standard transitions
  slow: 300,      // Token: animation.slow - Page transitions
  ring: 800,      // Token: animation.ring - Ring progress fill
} as const;

/**
 * Z-INDEX SCALE
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  modal: 200,
  popover: 300,
  tooltip: 400,
  toast: 500,
} as const;

/**
 * BREAKPOINTS (for responsive design)
 */
export const BREAKPOINTS = {
  sm: 320,   // Small phones
  md: 375,   // Standard phones
  lg: 414,   // Large phones
  xl: 768,   // Tablets
  '2xl': 1024, // Large tablets
} as const;
