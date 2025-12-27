/**
 * Button Component
 *
 * A customizable button component that follows the Quento design system.
 *
 * @example
 * <Button variant="primary" onPress={handlePress}>
 *   Get Started
 * </Button>
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { StyleSheet, Text as RNText, Pressable, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, ANIMATION } from '../../constants/theme';

/** Maximum font scale to prevent button overflow */
const MAX_FONT_SIZE_MULTIPLIER = 1.3;

export interface ButtonProps {
  /** Button text content */
  children: string;
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Button size */
  size?: 'default' | 'small';
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Press handler */
  onPress?: () => void;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  onPress,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        ...buttonStyles,
        pressed && !isDisabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? COLORS.pure : COLORS.forest}
          size="small"
        />
      ) : (
        <>
          {icon}
          <RNText
            style={textStyles}
            allowFontScaling={true}
            maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
          >
            {children}
          </RNText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.full,
  },

  // Variants
  primary: {
    backgroundColor: COLORS.forest,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.forest,
  },
  tertiary: {
    backgroundColor: 'transparent',
  },

  // Sizes - use minHeight + padding for font scaling support
  default: {
    minHeight: 52,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING['2xl'],
  },
  small: {
    minHeight: 44,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },

  // Text styles
  text: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.pure,
  },
  secondaryText: {
    color: COLORS.forest,
  },
  tertiaryText: {
    color: COLORS.sage,
  },
  defaultText: {
    fontSize: 17,
  },
  smallText: {
    fontSize: 15,
  },

  // States
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});

/**
 * Design Token References:
 *
 * Colors:
 * - Primary BG: color.primary.forest (#2D5A3D)
 * - Primary Text: color.primary.pure (#FFFFFF)
 * - Secondary Border: color.primary.forest (#2D5A3D)
 * - Tertiary Text: color.primary.sage (#4A7C5C)
 *
 * Spacing:
 * - Default Padding: spacing.2xl (24px)
 * - Small Padding: spacing.lg (16px)
 * - Icon Gap: spacing.sm (8px)
 *
 * Typography:
 * - Text: typography.bodyLarge (17px/24px, 600)
 *
 * Radius:
 * - Border Radius: radius.full (9999px)
 */
