/**
 * Input Component
 *
 * Text input field following the Quento design system.
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text as RNText,
  TextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

/** Maximum font scale to prevent input overflow */
const MAX_FONT_SIZE_MULTIPLIER = 1.3;

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Input label */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Left icon/prefix */
  prefix?: React.ReactNode;
  /** Right icon/suffix */
  suffix?: React.ReactNode;
  /** Container style */
  containerStyle?: ViewStyle;
}

export default function Input({
  label,
  helperText,
  error,
  prefix,
  suffix,
  containerStyle,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const inputContainerStyles: ViewStyle[] = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <RNText
          style={styles.label}
          allowFontScaling={true}
          maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
        >
          {label}
        </RNText>
      )}

      <View style={inputContainerStyles}>
        {prefix && <View style={styles.prefix}>{prefix}</View>}

        <TextInput
          style={[
            styles.input,
            prefix && styles.inputWithPrefix,
            suffix && styles.inputWithSuffix,
          ]}
          placeholderTextColor={COLORS.bark}
          allowFontScaling={true}
          maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          {...textInputProps}
        />

        {suffix && <View style={styles.suffix}>{suffix}</View>}
      </View>

      {(helperText || error) && (
        <RNText
          style={[styles.helperText, error && styles.errorText]}
          allowFontScaling={true}
          maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
        >
          {error || helperText}
        </RNText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },

  label: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.carbon,
    marginBottom: SPACING.sm,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  inputContainerFocused: {
    borderColor: COLORS.forest,
    backgroundColor: COLORS.pure,
  },

  inputContainerError: {
    borderColor: COLORS.error,
  },

  input: {
    flex: 1,
    minHeight: 52,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    ...TYPOGRAPHY.body,
    color: COLORS.carbon,
  },

  inputWithPrefix: {
    paddingLeft: SPACING.xs,
  },

  inputWithSuffix: {
    paddingRight: SPACING.xs,
  },

  prefix: {
    paddingLeft: SPACING.lg,
  },

  suffix: {
    paddingRight: SPACING.lg,
  },

  helperText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.bark,
    marginTop: SPACING.sm,
  },

  errorText: {
    color: COLORS.error,
  },
});

/**
 * Design Token References:
 *
 * Colors:
 * - Background: color.secondary.cream (#F5F3EF)
 * - Focused BG: color.primary.pure (#FFFFFF)
 * - Border Focus: color.primary.forest (#2D5A3D)
 * - Border Error: color.semantic.error (#C75450)
 * - Text: color.primary.carbon (#1A1A1A)
 * - Placeholder: color.secondary.bark (#8B7355)
 *
 * Spacing:
 * - Padding X: spacing.lg (16px)
 * - Label margin: spacing.sm (8px)
 *
 * Typography:
 * - Input: typography.body (15px/22px)
 * - Label: typography.labelLarge (14px/20px, 500)
 * - Helper: typography.bodySmall (13px/18px)
 *
 * Radius:
 * - Border Radius: radius.md (12px)
 */
