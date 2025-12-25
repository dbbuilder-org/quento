/**
 * RingVisualization Component - Tree ring growth visualization
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { StyleSheet, View, Text } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

interface RingVisualizationProps {
  currentRing: number;
  size?: number;
  showLabels?: boolean;
}

const RING_LABELS = ['Core', 'Discover', 'Plan', 'Execute', 'Optimize'];

export default function RingVisualization({
  currentRing,
  size = 200,
  showLabels = false,
}: RingVisualizationProps) {
  const ringCount = 5;
  const ringWidth = size / (ringCount * 2 + 2);
  const centerSize = ringWidth * 1.5;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer rings (5 to 1) */}
      {[5, 4, 3, 2, 1].map((ring) => {
        const ringSize = size - (5 - ring) * ringWidth * 2;
        const isActive = ring <= currentRing;

        return (
          <View
            key={ring}
            style={[
              styles.ring,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderWidth: ringWidth * 0.8,
                borderColor: isActive
                  ? ring === currentRing
                    ? COLORS.forest
                    : COLORS.sage
                  : COLORS.parchment,
              },
            ]}
          />
        );
      })}

      {/* Center core */}
      <View
        style={[
          styles.center,
          {
            width: centerSize,
            height: centerSize,
            borderRadius: centerSize / 2,
            backgroundColor: currentRing >= 1 ? COLORS.forest : COLORS.parchment,
          },
        ]}
      >
        <Text style={styles.centerText}>🌱</Text>
      </View>

      {/* Labels */}
      {showLabels && (
        <View style={styles.labelsContainer}>
          {RING_LABELS.map((label, index) => (
            <Text
              key={label}
              style={[
                styles.label,
                index + 1 <= currentRing && styles.labelActive,
              ]}
            >
              {index + 1}. {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontSize: 24,
  },
  labelsContainer: {
    position: 'absolute',
    bottom: -80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.bark,
    marginVertical: 2,
  },
  labelActive: {
    color: COLORS.forest,
    fontWeight: '600',
  },
});
