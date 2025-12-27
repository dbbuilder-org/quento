/**
 * Accessible Text Component
 *
 * A wrapper around React Native's Text that handles font scaling properly
 * to prevent text overlap when users increase system font size.
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

/**
 * Maximum font size multiplier to prevent layout breaking
 * 1.3 = 130% of base size, balances accessibility with layout stability
 */
const MAX_FONT_SIZE_MULTIPLIER = 1.3;

export type TextVariant = keyof typeof TYPOGRAPHY;

export interface TextProps extends RNTextProps {
  /** Typography variant from design system */
  variant?: TextVariant;
  /** Text color - defaults to carbon */
  color?: keyof typeof COLORS | string;
  /** Override max font scale (default 1.3) */
  maxFontSizeMultiplier?: number;
  /** Center text */
  center?: boolean;
}

/**
 * Accessible Text component with controlled font scaling
 *
 * @example
 * <Text variant="bodyLarge">Hello World</Text>
 * <Text variant="headlineMedium" color="forest">Title</Text>
 */
export default function Text({
  variant = 'body',
  color = 'carbon',
  maxFontSizeMultiplier = MAX_FONT_SIZE_MULTIPLIER,
  center = false,
  style,
  children,
  ...props
}: TextProps) {
  const typography = TYPOGRAPHY[variant];
  const textColor = color in COLORS ? COLORS[color as keyof typeof COLORS] : color;

  return (
    <RNText
      allowFontScaling={true}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        {
          fontSize: typography.fontSize,
          lineHeight: typography.lineHeight,
          fontWeight: typography.fontWeight,
          letterSpacing: 'letterSpacing' in typography ? typography.letterSpacing : undefined,
          color: textColor,
        },
        center && styles.center,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
});

/**
 * Design Token References:
 *
 * Typography variants map to tokens:
 * - displayLarge: typography.display.large (48/56)
 * - displayMedium: typography.display.medium (36/44)
 * - headlineLarge: typography.headline.large (32/40)
 * - headlineMedium: typography.headline.medium (28/36)
 * - titleLarge: typography.title.large (22/28)
 * - titleMedium: typography.title.medium (18/24)
 * - bodyLarge: typography.body.large (17/24)
 * - body: typography.body.default (15/22)
 * - bodySmall: typography.body.small (13/18)
 * - labelLarge: typography.label.large (14/20)
 * - labelMedium: typography.label.medium (12/16)
 * - caption: typography.caption (11/14)
 */
