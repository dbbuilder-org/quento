/**
 * Optimize Screen - Ring 5: Growth Dashboard
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useAnalysisStore } from '../../stores/analysisStore';
import RingVisualization from '../../components/rings/RingVisualization';

export default function OptimizeScreen() {
  const { user } = useAuthStore();
  const { analysis } = useAnalysisStore();

  const currentRing = user?.currentRing || 1;
  const daysActive = 45; // Would come from user data

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Ring Visualization */}
      <View style={styles.ringSection}>
        <RingVisualization currentRing={currentRing} />
        <Text style={styles.ringMessage}>
          Your tree has grown {currentRing} ring{currentRing !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.daysActive}>
          {daysActive} days on your growth journey
        </Text>
      </View>

      {/* Key Metrics */}
      {analysis && (
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Your Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{analysis.overallScore}</Text>
              <Text style={styles.metricLabel}>Overall Score</Text>
              <Text style={styles.metricChange}>+15 from start</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{analysis.scores.seo}</Text>
              <Text style={styles.metricLabel}>SEO Score</Text>
              <Text style={styles.metricChange}>+8 from start</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>+340%</Text>
              <Text style={styles.metricLabel}>Social Growth</Text>
              <Text style={styles.metricChange}>This month</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>12</Text>
              <Text style={styles.metricLabel}>Reviews</Text>
              <Text style={styles.metricChange}>+8 new</Text>
            </View>
          </View>
        </View>
      )}

      {/* Re-analysis Prompt */}
      <View style={styles.reanalysisCard}>
        <View style={styles.reanalysisIcon}>
          <Text style={styles.reanalysisEmoji}>🔄</Text>
        </View>
        <Text style={styles.reanalysisTitle}>Time for a check-up?</Text>
        <Text style={styles.reanalysisText}>
          It's been 30 days since your last analysis. See what's changed and get
          fresh recommendations.
        </Text>
        <Pressable style={styles.reanalysisButton}>
          <Text style={styles.reanalysisButtonText}>Run New Analysis</Text>
        </Pressable>
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
    marginBottom: 32,
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
  reanalysisButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
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
