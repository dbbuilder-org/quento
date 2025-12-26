/**
 * Skeleton Component - Loading placeholder with shimmer animation
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, ViewStyle, StyleProp } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  variant?: 'text' | 'circle' | 'rect';
}

export default function Skeleton({
  width = '100%',
  height = 16,
  borderRadius,
  style,
  variant = 'rect',
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'circle':
        return {
          width: typeof height === 'number' ? height : 40,
          height: height,
          borderRadius: typeof height === 'number' ? height / 2 : 20,
        };
      case 'text':
        return {
          width,
          height,
          borderRadius: RADIUS.xs,
        };
      case 'rect':
      default:
        return {
          width,
          height,
          borderRadius: borderRadius ?? RADIUS.sm,
        };
    }
  };

  const animatedOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        getVariantStyle(),
        { opacity: animatedOpacity },
        style,
      ]}
    />
  );
}

// Preset skeleton layouts for common UI patterns
export function SkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      <View style={skeletonStyles.cardHeader}>
        <Skeleton variant="circle" height={40} />
        <View style={skeletonStyles.cardHeaderText}>
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={12} style={{ marginTop: 6 }} />
        </View>
      </View>
      <Skeleton variant="text" width="100%" height={14} style={{ marginTop: 12 }} />
      <Skeleton variant="text" width="85%" height={14} style={{ marginTop: 8 }} />
      <Skeleton variant="text" width="70%" height={14} style={{ marginTop: 8 }} />
    </View>
  );
}

export function SkeletonListItem() {
  return (
    <View style={skeletonStyles.listItem}>
      <Skeleton variant="circle" height={48} />
      <View style={skeletonStyles.listItemContent}>
        <Skeleton variant="text" width="70%" height={16} />
        <Skeleton variant="text" width="50%" height={12} style={{ marginTop: 6 }} />
      </View>
      <Skeleton variant="rect" width={24} height={24} />
    </View>
  );
}

export function SkeletonChat() {
  return (
    <View style={skeletonStyles.chat}>
      {/* Assistant message skeleton */}
      <View style={skeletonStyles.chatBubbleLeft}>
        <Skeleton
          variant="rect"
          width="75%"
          height={60}
          borderRadius={RADIUS.xl}
        />
      </View>
      {/* User message skeleton */}
      <View style={skeletonStyles.chatBubbleRight}>
        <Skeleton
          variant="rect"
          width="60%"
          height={40}
          borderRadius={RADIUS.xl}
        />
      </View>
      {/* Assistant message skeleton */}
      <View style={skeletonStyles.chatBubbleLeft}>
        <Skeleton
          variant="rect"
          width="80%"
          height={80}
          borderRadius={RADIUS.xl}
        />
      </View>
    </View>
  );
}

export function SkeletonScoreCard() {
  return (
    <View style={skeletonStyles.scoreCard}>
      <Skeleton variant="circle" height={80} />
      <View style={skeletonStyles.scoreCardInfo}>
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="40%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function SkeletonMetrics() {
  return (
    <View style={skeletonStyles.metricsRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={skeletonStyles.metricCard}>
          <Skeleton variant="text" width={40} height={28} />
          <Skeleton variant="text" width={50} height={12} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonActionItem() {
  return (
    <View style={skeletonStyles.actionItem}>
      <Skeleton variant="rect" width={24} height={24} borderRadius={6} />
      <View style={skeletonStyles.actionItemContent}>
        <Skeleton variant="text" width="80%" height={16} />
        <Skeleton variant="text" width="50%" height={12} style={{ marginTop: 6 }} />
      </View>
      <Skeleton variant="rect" width={60} height={24} borderRadius={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.parchment,
  },
});

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.sm,
    marginBottom: 8,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  chat: {
    padding: 16,
    gap: 12,
  },
  chatBubbleLeft: {
    alignSelf: 'flex-start',
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
  },
  scoreCard: {
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.lg,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCardInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 8,
  },
  actionItemContent: {
    flex: 1,
    marginLeft: 12,
  },
});
