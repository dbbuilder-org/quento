/**
 * Plan Screen - Ring 3: Strategy
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Animated } from 'react-native';
import { useStrategyStore } from '../../stores/strategyStore';
import { SkeletonCard, SkeletonListItem } from '../../components/ui/Skeleton';
import AnimatedView from '../../components/ui/AnimatedView';
import ExportMenu from '../../components/ui/ExportMenu';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

export default function PlanScreen() {
  const { strategy, isGenerating } = useStrategyStore();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const brainAnim = useRef(new Animated.Value(0)).current;

  // Animate the brain emoji when generating
  useEffect(() => {
    if (isGenerating) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(brainAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(brainAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isGenerating, brainAnim]);

  if (isGenerating) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.Text
            style={[
              styles.loadingEmoji,
              {
                transform: [
                  {
                    scale: brainAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.15],
                    }),
                  },
                  {
                    rotate: brainAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: ['0deg', '5deg', '-5deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            🧠
          </Animated.Text>
          <Text style={styles.loadingTitle}>Crafting your strategy</Text>
          <Text style={styles.loadingText}>
            Analyzing your data and generating personalized recommendations...
          </Text>

          {/* Skeleton preview */}
          <View style={styles.skeletonPreview}>
            <SkeletonCard />
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
          </View>
        </View>
      </View>
    );
  }

  if (!strategy) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No Strategy Yet</Text>
          <Text style={styles.emptyText}>
            Complete your analysis in the Discover tab to generate a personalized growth strategy.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Export Button Header */}
      <AnimatedView animation="fadeInDown" delay={0}>
        <View style={styles.exportHeader}>
          <Text style={styles.strategyTitle}>{strategy.title || 'Your Strategy'}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.exportButton,
              pressed && styles.exportButtonPressed,
            ]}
            onPress={() => setShowExportMenu(true)}
          >
            <Text style={styles.exportIcon}>📤</Text>
            <Text style={styles.exportText}>Export</Text>
          </Pressable>
        </View>
      </AnimatedView>

      <AnimatedView animation="scale" delay={100}>
        <View style={styles.visionCard}>
          <Text style={styles.visionLabel}>YOUR VISION</Text>
          <Text style={styles.visionText}>{strategy.visionStatement}</Text>
        </View>
      </AnimatedView>

      <AnimatedView animation="fadeInUp" delay={100}>
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.summaryText}>{strategy.executiveSummary}</Text>
        </View>
      </AnimatedView>

      <AnimatedView animation="fadeInUp" delay={200}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Strengths</Text>
          {strategy.keyStrengths.map((strength: string, index: number) => (
            <AnimatedView key={index} animation="fadeInLeft" delay={250 + index * 60}>
              <View style={styles.listItem}>
                <Text style={styles.listIcon}>✓</Text>
                <Text style={styles.listText}>{strength}</Text>
              </View>
            </AnimatedView>
          ))}
        </View>
      </AnimatedView>

      <AnimatedView animation="fadeInUp" delay={400}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Critical Gaps</Text>
          {strategy.criticalGaps.map((gap: string, index: number) => (
            <AnimatedView key={index} animation="fadeInLeft" delay={450 + index * 60}>
              <View style={styles.listItem}>
                <Text style={styles.listIconWarning}>!</Text>
                <Text style={styles.listText}>{gap}</Text>
              </View>
            </AnimatedView>
          ))}
        </View>
      </AnimatedView>

      <AnimatedView animation="fadeInUp" delay={600}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {strategy.recommendations.map((rec: any, index: number) => (
            <AnimatedView key={index} animation="fadeInUp" delay={650 + index * 100}>
              <Pressable style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationTitle}>{rec.title}</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      rec.priority === 'high' && styles.priorityHigh,
                      rec.priority === 'medium' && styles.priorityMedium,
                    ]}
                  >
                    <Text style={styles.priorityText}>{rec.priority.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.recommendationSummary}>{rec.summary}</Text>
                <Text style={styles.viewMore}>View details →</Text>
              </Pressable>
            </AnimatedView>
          ))}
        </View>
      </AnimatedView>

      <AnimatedView animation="fadeInUp" delay={900}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>90-Day Priorities</Text>
          {strategy.ninetyDayPriorities.map((priority: string, index: number) => (
            <AnimatedView key={index} animation="fadeInRight" delay={950 + index * 80}>
              <View style={styles.priorityItem}>
                <View style={styles.priorityNumber}>
                  <Text style={styles.priorityNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.priorityItemText}>{priority}</Text>
              </View>
            </AnimatedView>
          ))}
        </View>
      </AnimatedView>

      <AnimatedView animation="bounce" delay={1200}>
        <Pressable style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Create Action Plan →</Text>
        </Pressable>
      </AnimatedView>

      {/* Export Menu Modal */}
      <ExportMenu
        visible={showExportMenu}
        onClose={() => setShowExportMenu(false)}
        strategy={strategy}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pure,
  },
  content: {
    padding: SPACING['2xl'],
    paddingBottom: SPACING['4xl'],
  },
  exportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  strategyTitle: {
    fontSize: TYPOGRAPHY.titleLarge.fontSize,
    fontWeight: '600',
    color: COLORS.carbon,
    flex: 1,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  exportButtonPressed: {
    backgroundColor: COLORS.parchment,
  },
  exportIcon: {
    fontSize: 16,
  },
  exportText: {
    fontSize: TYPOGRAPHY.labelMedium.fontSize,
    fontWeight: '600',
    color: COLORS.forest,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  skeletonPreview: {
    width: '100%',
    marginTop: SPACING['3xl'],
    opacity: 0.5,
    paddingHorizontal: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  visionCard: {
    backgroundColor: '#2D5A3D',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  visionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  visionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listIcon: {
    fontSize: 16,
    color: '#2D7D46',
    marginRight: 8,
    fontWeight: '600',
  },
  listIconWarning: {
    fontSize: 16,
    color: '#D4A84B',
    marginRight: 8,
    fontWeight: '600',
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  recommendationCard: {
    backgroundColor: '#F5F3EF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#E8E4DD',
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityMedium: {
    backgroundColor: '#FEF3C7',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  recommendationSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  viewMore: {
    fontSize: 14,
    color: '#4A7C5C',
    fontWeight: '500',
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F5F3EF',
    padding: 12,
    borderRadius: 8,
  },
  priorityNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2D5A3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  priorityNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  priorityItemText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  actionButton: {
    backgroundColor: '#2D5A3D',
    paddingVertical: 16,
    borderRadius: 26,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
