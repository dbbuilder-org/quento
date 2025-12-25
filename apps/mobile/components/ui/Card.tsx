/**
 * Card Component
 *
 * A container component for content sections.
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { StyleSheet, View, Pressable, ViewStyle } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card visual variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  /** Padding size */
  padding?: 'none' | 'small' | 'default' | 'large';
  /** Make card pressable */
  onPress?: () => void;
  /** Additional styles */
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'default',
  onPress,
  style,
}: CardProps) {
  const cardStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles] as ViewStyle,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [...cardStyles, pressed && styles.pressed]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },

  // Variants
  default: {
    backgroundColor: COLORS.pure,
    ...SHADOWS.sm,
  },
  elevated: {
    backgroundColor: COLORS.pure,
    ...SHADOWS.md,
  },
  outlined: {
    backgroundColor: COLORS.pure,
    borderWidth: 1,
    borderColor: COLORS.parchment,
  },
  filled: {
    backgroundColor: COLORS.cream,
  },

  // Padding
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: SPACING.md,
  },
  paddingDefault: {
    padding: SPACING.lg,
  },
  paddingLarge: {
    padding: SPACING['2xl'],
  },

  // States
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});

/**
 * Design Token References:
 *
 * Colors:
 * - Default BG: color.primary.pure (#FFFFFF)
 * - Filled BG: color.secondary.cream (#F5F3EF)
 * - Border: color.secondary.parchment (#E8E4DD)
 *
 * Spacing:
 * - Small: spacing.md (12px)
 * - Default: spacing.lg (16px)
 * - Large: spacing.2xl (24px)
 *
 * Radius:
 * - Border Radius: radius.lg (16px)
 *
 * Shadows:
 * - Default: shadow.sm
 * - Elevated: shadow.md
 */
