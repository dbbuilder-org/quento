/**
 * Optimize Screen - Ring 5: Growth Dashboard
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useAnalysisStore } from '../../stores/analysisStore';
import { useStrategyStore } from '../../stores/strategyStore';
import { useChatStore } from '../../stores/chatStore';
import RingVisualization from '../../components/rings/RingVisualization';

const { width } = Dimensions.get('window');

// Simple bar chart component
function ScoreChart({
  scores,
  previousScores,
}: {
  scores: { seo: number; content: number; mobile: number; speed: number; social: number };
  previousScores?: { seo: number; content: number; mobile: number; speed: number; social: number };
}) {
  const categories = [
    { key: 'seo', label: 'SEO', color: '#2D5A3D' },
    { key: 'content', label: 'Content', color: '#4A7C5C' },
    { key: 'mobile', label: 'Mobile', color: '#6B9B7A' },
    { key: 'speed', label: 'Speed', color: '#8BB49B' },
    { key: 'social', label: 'Social', color: '#ABC9BC' },
  ] as const;

  return (
    <View style={chartStyles.container}>
      {categories.map(({ key, label, color }) => {
        const current = scores[key];
        const previous = previousScores?.[key] || current;
        const change = current - previous;

        return (
          <View key={key} style={chartStyles.row}>
            <Text style={chartStyles.label}>{label}</Text>
            <View style={chartStyles.barContainer}>
              <View style={[chartStyles.bar, { width: `${current}%`, backgroundColor: color }]} />
              {previousScores && (
                <View
                  style={[
                    chartStyles.previousMarker,
                    { left: `${previous}%` },
                  ]}
                />
              )}
            </View>
            <View style={chartStyles.scoreContainer}>
              <Text style={chartStyles.score}>{current}</Text>
              {change !== 0 && (
                <Text style={[chartStyles.change, change > 0 ? chartStyles.positive : chartStyles.negative]}>
                  {change > 0 ? '+' : ''}{change}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { width: 60, fontSize: 12, color: '#666' },
  barContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#E8E4DD',
    borderRadius: 6,
    marginHorizontal: 8,
    position: 'relative',
  },
  bar: { height: '100%', borderRadius: 6 },
  previousMarker: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 16,
    backgroundColor: '#333',
    borderRadius: 1,
  },
  scoreContainer: { width: 50, flexDirection: 'row', justifyContent: 'flex-end', gap: 4 },
  score: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  change: { fontSize: 11 },
  positive: { color: '#2D7D46' },
  negative: { color: '#C75450' },
});

export default function OptimizeScreen() {
  const { user } = useUser();
  const { analysis, websiteUrl, startAnalysis, isAnalyzing, progress } = useAnalysisStore();
  const { strategy } = useStrategyStore();
  const { currentRing } = useChatStore();
  const [refreshing, setRefreshing] = useState(false);

  const ring = currentRing || 1;
  const daysActive = useMemo(() => {
    // Calculate days since account creation
    if (!user) return 0;
    const created = new Date(user.createdAt || Date.now());
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  }, [user]);

  // Calculate action completion stats
  const actionStats = useMemo(() => {
    if (!strategy?.actionItems?.length) return null;
    const items = strategy.actionItems;
    const completed = items.filter((a) => a.status === 'completed').length;
    const inProgress = items.filter((a) => a.status === 'in_progress').length;
    return {
      total: items.length,
      completed,
      inProgress,
      pending: items.length - completed - inProgress,
      percentage: Math.round((completed / items.length) * 100),
    };
  }, [strategy]);

  // Generate insights based on data
  const insights = useMemo(() => {
    const result: { icon: string; text: string; type: 'success' | 'warning' | 'info' }[] = [];

    if (analysis?.overallScore) {
      if (analysis.overallScore >= 80) {
        result.push({ icon: '🌟', text: 'Excellent! Your website is performing above average.', type: 'success' });
      } else if (analysis.overallScore >= 60) {
        result.push({ icon: '📈', text: 'Good progress! A few optimizations could boost your score significantly.', type: 'info' });
      } else {
        result.push({ icon: '🎯', text: 'Focus on the quick wins to see immediate improvements.', type: 'warning' });
      }
    }

    if (actionStats) {
      if (actionStats.percentage === 100) {
        result.push({ icon: '🎉', text: 'All action items completed! Time for a re-analysis.', type: 'success' });
      } else if (actionStats.inProgress > 0) {
        result.push({ icon: '⚡', text: `${actionStats.inProgress} action${actionStats.inProgress > 1 ? 's' : ''} in progress. Keep the momentum!`, type: 'info' });
      }
    }

    if (ring >= 4) {
      result.push({ icon: '🌳', text: 'You\'ve reached the Optimization phase. Your tree is growing strong!', type: 'success' });
    }

    return result;
  }, [analysis, actionStats, ring]);

  const handleReanalysis = async () => {
    if (websiteUrl && !isAnalyzing) {
      await startAnalysis(websiteUrl);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // In production, would refresh data from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D5A3D" />
      }
    >
      {/* Ring Visualization */}
      <View style={styles.ringSection}>
        <RingVisualization currentRing={ring} />
        <Text style={styles.ringMessage}>
          Your tree has grown {ring} ring{ring !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.daysActive}>
          {daysActive} day{daysActive !== 1 ? 's' : ''} on your growth journey
        </Text>
      </View>

      {/* Insights Feed */}
      {insights.length > 0 && (
        <View style={styles.insightsSection}>
          {insights.map((insight, index) => (
            <View
              key={index}
              style={[
                styles.insightCard,
                insight.type === 'success' && styles.insightSuccess,
                insight.type === 'warning' && styles.insightWarning,
              ]}
            >
              <Text style={styles.insightIcon}>{insight.icon}</Text>
              <Text style={styles.insightText}>{insight.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Progress */}
      {actionStats && (
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Action Progress</Text>
            <Text style={styles.progressPercent}>{actionStats.percentage}%</Text>
          </View>
          <View style={styles.progressBarLarge}>
            <View style={[styles.progressFillLarge, { width: `${actionStats.percentage}%` }]} />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{actionStats.completed}</Text>
              <Text style={styles.progressStatLabel}>Completed</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{actionStats.inProgress}</Text>
              <Text style={styles.progressStatLabel}>In Progress</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{actionStats.pending}</Text>
              <Text style={styles.progressStatLabel}>To Do</Text>
            </View>
          </View>
        </View>
      )}

      {/* Score Comparison Chart */}
      {analysis && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          <View style={styles.chartCard}>
            <View style={styles.overallScoreRow}>
              <Text style={styles.overallScoreLabel}>Overall Score</Text>
              <Text style={styles.overallScoreValue}>{analysis.overallScore}/100</Text>
            </View>
            <ScoreChart scores={analysis.scores} />
          </View>
        </View>
      )}

      {/* Key Metrics Grid */}
      {analysis && (
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.metricCardPrimary]}>
              <Text style={styles.metricValue}>{analysis.overallScore}</Text>
              <Text style={styles.metricLabel}>Overall Score</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{analysis.quickWins?.length || 0}</Text>
              <Text style={styles.metricLabel}>Quick Wins</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{analysis.competitors?.length || 0}</Text>
              <Text style={styles.metricLabel}>Competitors</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{strategy?.recommendations?.length || 0}</Text>
              <Text style={styles.metricLabel}>Recommendations</Text>
            </View>
          </View>
        </View>
      )}

      {/* Re-analysis Prompt */}
      <View style={styles.reanalysisCard}>
        <View style={styles.reanalysisIcon}>
          <Text style={styles.reanalysisEmoji}>{isAnalyzing ? '⏳' : '🔄'}</Text>
        </View>
        <Text style={styles.reanalysisTitle}>
          {isAnalyzing ? 'Analyzing...' : 'Time for a check-up?'}
        </Text>
        <Text style={styles.reanalysisText}>
          {isAnalyzing
            ? `${progress}% complete`
            : websiteUrl
            ? 'Re-analyze your website to see what\'s changed and get fresh recommendations.'
            : 'Go to Discover to analyze your website first.'}
        </Text>
        {websiteUrl && (
          <Pressable
            style={[styles.reanalysisButton, isAnalyzing && styles.reanalysisButtonDisabled]}
            onPress={handleReanalysis}
            disabled={isAnalyzing}
          >
            <Text style={styles.reanalysisButtonText}>
              {isAnalyzing ? 'Analyzing...' : 'Run New Analysis'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Milestones */}
      <View style={styles.milestonesSection}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        <View style={styles.milestone}>
          <View style={styles.milestoneIcon}>
            <Text style={styles.milestoneEmoji}>🌱</Text>
          </View>
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneTitle}>Journey Started</Text>
            <Text style={styles.milestoneDate}>Dec 1, 2025</Text>
          </View>
        </View>
        <View style={styles.milestone}>
          <View style={styles.milestoneIcon}>
            <Text style={styles.milestoneEmoji}>🔍</Text>
          </View>
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneTitle}>First Analysis Complete</Text>
            <Text style={styles.milestoneDate}>Dec 5, 2025</Text>
          </View>
        </View>
        <View style={styles.milestone}>
          <View style={styles.milestoneIcon}>
            <Text style={styles.milestoneEmoji}>📋</Text>
          </View>
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneTitle}>Strategy Generated</Text>
            <Text style={styles.milestoneDate}>Dec 8, 2025</Text>
          </View>
        </View>
        <View style={styles.milestone}>
          <View style={styles.milestoneIcon}>
            <Text style={styles.milestoneEmoji}>✅</Text>
          </View>
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneTitle}>First Actions Complete</Text>
            <Text style={styles.milestoneDate}>Dec 15, 2025</Text>
          </View>
        </View>
      </View>

      {/* Credits */}
      <View style={styles.creditsSection}>
        <Text style={styles.creditsText}>
          AI App Development powered by ServiceVision
        </Text>
        <Text style={styles.creditsUrl}>www.servicevision.net</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  ringSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ringMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
  },
  daysActive: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  // Insights
  insightsSection: {
    marginBottom: 24,
    gap: 8,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3EF',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  insightSuccess: {
    backgroundColor: '#E8F5E9',
  },
  insightWarning: {
    backgroundColor: '#FFF8E1',
  },
  insightIcon: {
    fontSize: 24,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  // Action Progress
  progressCard: {
    backgroundColor: '#F5F3EF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D5A3D',
  },
  progressBarLarge: {
    height: 10,
    backgroundColor: '#E8E4DD',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: '#2D5A3D',
    borderRadius: 5,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // Chart
  chartSection: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: '#F5F3EF',
    borderRadius: 16,
    padding: 20,
  },
  overallScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4DD',
  },
  overallScoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  overallScoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D5A3D',
  },
  // Metrics
  metricsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#F5F3EF',
    borderRadius: 12,
    padding: 16,
  },
  metricCardPrimary: {
    backgroundColor: '#2D5A3D',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  metricLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  metricChange: {
    fontSize: 12,
    color: '#2D7D46',
    marginTop: 8,
  },
  // Re-analysis
  reanalysisCard: {
    backgroundColor: '#F5F3EF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  reanalysisIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reanalysisEmoji: {
    fontSize: 32,
  },
  reanalysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  reanalysisText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  reanalysisButton: {
    backgroundColor: '#2D5A3D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  reanalysisButtonDisabled: {
    opacity: 0.6,
  },
  reanalysisButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Milestones
  milestonesSection: {
    marginBottom: 24,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  milestoneEmoji: {
    fontSize: 20,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  milestoneDate: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  // Credits
  creditsSection: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8E4DD',
  },
  creditsText: {
    fontSize: 12,
    color: '#999',
  },
  creditsUrl: {
    fontSize: 12,
    color: '#4A7C5C',
    marginTop: 4,
  },
});
