/**
 * ExportMenu Component - Strategy export options
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  Animated,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import {
  exportAsPDF,
  exportAsMarkdown,
  generatePlainText,
} from '../../services/exportService';

interface ExportMenuProps {
  visible: boolean;
  onClose: () => void;
  strategy: any;
  businessName?: string;
}

type ExportFormat = 'pdf' | 'markdown' | 'clipboard';

interface ExportOption {
  id: ExportFormat;
  icon: string;
  label: string;
  description: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'pdf',
    icon: '📄',
    label: 'Export as PDF',
    description: 'Professional formatted document',
  },
  {
    id: 'markdown',
    icon: '📝',
    label: 'Export as Markdown',
    description: 'Plain text with formatting',
  },
  {
    id: 'clipboard',
    icon: '📋',
    label: 'Copy to Clipboard',
    description: 'Quick copy as plain text',
  },
];

export default function ExportMenu({
  visible,
  onClose,
  strategy,
  businessName,
}: ExportMenuProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      // Reset state when closing
      setExporting(null);
      setSuccess(null);
      setError(null);
    }
  }, [visible, slideAnim]);

  const handleExport = async (format: ExportFormat) => {
    if (!strategy) return;

    setExporting(format);
    setSuccess(null);
    setError(null);

    try {
      let result: { success: boolean; error?: string };

      switch (format) {
        case 'pdf':
          result = await exportAsPDF(strategy, businessName);
          if (result.success) {
            setSuccess('PDF exported successfully!');
          }
          break;

        case 'markdown':
          result = await exportAsMarkdown(strategy, businessName);
          if (result.success) {
            setSuccess('Markdown exported successfully!');
          }
          break;

        case 'clipboard':
          const text = generatePlainText(strategy, businessName);
          Clipboard.setString(text);
          result = { success: true };
          setSuccess('Copied to clipboard!');
          break;

        default:
          result = { success: false, error: 'Unknown format' };
      }

      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Export Strategy</Text>
              <Text style={styles.subtitle}>
                Choose a format to share your strategy
              </Text>
            </View>

            {/* Status Messages */}
            {success && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>✓ {success}</Text>
              </View>
            )}
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>✕ {error}</Text>
              </View>
            )}

            {/* Export Options */}
            <View style={styles.options}>
              {EXPORT_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    styles.optionButton,
                    pressed && styles.optionButtonPressed,
                  ]}
                  onPress={() => handleExport(option.id)}
                  disabled={exporting !== null}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>
                  {exporting === option.id ? (
                    <ActivityIndicator size="small" color={COLORS.forest} />
                  ) : (
                    <Text style={styles.optionArrow}>→</Text>
                  )}
                </Pressable>
              ))}
            </View>

            {/* Cancel Button */}
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.pure,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingBottom: 40,
    ...SHADOWS.lg,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.parchment,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  header: {
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.parchment,
  },
  title: {
    fontSize: TYPOGRAPHY.titleLarge.fontSize,
    fontWeight: '600',
    color: COLORS.carbon,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.bark,
  },
  successBanner: {
    backgroundColor: '#DCFCE7',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING['2xl'],
    marginTop: SPACING.sm,
  },
  successText: {
    color: '#15803D',
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: '500',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING['2xl'],
    marginTop: SPACING.sm,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: '500',
  },
  options: {
    padding: SPACING['2xl'],
    gap: SPACING.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
  },
  optionButtonPressed: {
    backgroundColor: COLORS.parchment,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.bodyLarge.fontSize,
    fontWeight: '600',
    color: COLORS.carbon,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    color: COLORS.bark,
  },
  optionArrow: {
    fontSize: 20,
    color: COLORS.sage,
    fontWeight: '600',
  },
  cancelButton: {
    marginHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.parchment,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.bark,
    fontWeight: '500',
  },
});
