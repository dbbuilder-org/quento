/**
 * Discover Screen - Ring 2: Web Presence Analysis
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAnalysisStore } from '../../stores/analysisStore';

export default function DiscoverScreen() {
  const [url, setUrl] = useState('');
  const { analysis, isAnalyzing, progress, startAnalysis } = useAnalysisStore();

  const handleAnalyze = () => {
    if (!url.trim()) return;

    // Add https if missing
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    startAnalysis(cleanUrl);
  };

  if (isAnalyzing) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressNumber}>{progress}%</Text>
          </View>
          <Text style={styles.loadingTitle}>Analyzing your presence</Text>
          <Text style={styles.loadingStep}>
            {progress < 25 && 'Scanning website content...'}
            {progress >= 25 && progress < 50 && 'Analyzing SEO structure...'}
            {progress >= 50 && progress < 75 && 'Finding competitors...'}
            {progress >= 75 && 'Generating insights...'}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    );
  }

  if (analysis) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultsContent}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreNumber}>{analysis.overallScore}</Text>
          <Text style={styles.scoreLabel}>Overall Score</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{analysis.scores.seo}</Text>
            <Text style={styles.metricLabel}>SEO</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{analysis.scores.content}</Text>
            <Text style={styles.metricLabel}>Content</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{analysis.scores.mobile}</Text>
            <Text style={styles.metricLabel}>Mobile</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Wins</Text>
          {analysis.quickWins.map((win: string, index: number) => (
            <View key={index} style={styles.quickWinItem}>
              <Text style={styles.quickWinIcon}>⚡</Text>
              <Text style={styles.quickWinText}>{win}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.continueButton}>
          <Text style={styles.continueButtonText}>Continue to Strategy →</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <Text style={styles.title}>Analyze Your Web Presence</Text>
        <Text style={styles.subtitle}>
          Enter your website URL and we'll analyze your digital footprint
        </Text>

        <View style={styles.urlInputContainer}>
          <Text style={styles.urlPrefix}>https://</Text>
          <TextInput
            style={styles.urlInput}
            placeholder="yourwebsite.com"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            value={url}
            onChangeText={setUrl}
          />
        </View>

        <Pressable
          style={[styles.analyzeButton, !url.trim() && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
          disabled={!url.trim()}
        >
          <Text style={styles.analyzeButtonText}>Start Analysis</Text>
        </Pressable>

        <Text style={styles.hint}>
          We'll check your SEO, content, competitors, and more
        </Text>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.featuresSectionTitle}>What we analyze:</Text>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔍</Text>
          <Text style={styles.featureText}>SEO & Search Visibility</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📱</Text>
          <Text style={styles.featureText}>Mobile Responsiveness</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={styles.featureText}>Competitor Comparison</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>💬</Text>
          <Text style={styles.featureText}>Social Media Presence</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inputSection: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3EF',
    borderRadius: 12,
    marginBottom: 16,
  },
  urlPrefix: {
    paddingLeft: 16,
    fontSize: 16,
    color: '#666',
  },
  urlInput: {
    flex: 1,
    padding: 16,
    paddingLeft: 4,
    fontSize: 16,
    color: '#1A1A1A',
  },
  analyzeButton: {
    backgroundColor: '#2D5A3D',
    paddingVertical: 16,
    borderRadius: 26,
    alignItems: 'center',
    marginBottom: 12,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#D4C4A8',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  featuresSection: {
    padding: 24,
    backgroundColor: '#F5F3EF',
    flex: 1,
  },
  featuresSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#2D5A3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: '600',
    color: '#2D5A3D',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  loadingStep: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: '#E8E4DD',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D5A3D',
    borderRadius: 3,
  },
  resultsContent: {
    padding: 24,
  },
  scoreCard: {
    backgroundColor: '#2D5A3D',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F5F3EF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  quickWinItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#F5F3EF',
    padding: 12,
    borderRadius: 8,
  },
  quickWinIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  quickWinText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#2D5A3D',
    paddingVertical: 16,
    borderRadius: 26,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
