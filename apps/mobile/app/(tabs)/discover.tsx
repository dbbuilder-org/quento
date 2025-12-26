/**
 * Discover Screen - Ring 2: Web Presence Analysis
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAnalysisStore } from '../../stores/analysisStore';
import { useChatStore } from '../../stores/chatStore';
import { SkeletonScoreCard, SkeletonMetrics } from '../../components/ui/Skeleton';
import AnimatedView from '../../components/ui/AnimatedView';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS, ANIMATION } from '../../constants/theme';

export default function DiscoverScreen() {
  const [url, setUrl] = useState('');
  const router = useRouter();
  const { analysis, isAnalyzing, progress, currentStep, startAnalysis, websiteUrl } = useAnalysisStore();
  const { setAnalysisContext } = useChatStore();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate progress bar
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  // Pulse animation for loading circle
  useEffect(() => {
    if (isAnalyzing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isAnalyzing, pulseAnim]);

  const handleAnalyze = () => {
    if (!url.trim()) return;

    // Add https if missing
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    startAnalysis(cleanUrl);
  };

  const getStepInfo = () => {
    if (currentStep) return currentStep;
    if (progress < 25) return 'Scanning website content...';
    if (progress < 50) return 'Analyzing SEO structure...';
    if (progress < 75) return 'Finding competitors...';
    return 'Generating insights...';
  };

  if (isAnalyzing) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.progressCircle,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.progressNumber}>{Math.round(progress)}%</Text>
          </Animated.View>
          <Text style={styles.loadingTitle}>Analyzing your presence</Text>
          <AnimatedView animation="fadeIn" delay={200}>
            <Text style={styles.loadingStep}>{getStepInfo()}</Text>
          </AnimatedView>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          {/* Skeleton preview of what's coming */}
          <View style={styles.skeletonPreview}>
            <SkeletonScoreCard />
            <SkeletonMetrics />
          </View>
        </View>
      </View>
    );
  }

  if (analysis) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultsContent}>
        <AnimatedView animation="scale" delay={0}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreNumber}>{analysis.overallScore}</Text>
            <Text style={styles.scoreLabel}>Overall Score</Text>
          </View>
        </AnimatedView>

        <View style={styles.metricsRow}>
          {[
            { score: analysis.scores.seo, label: 'SEO' },
            { score: analysis.scores.content, label: 'Content' },
            { score: analysis.scores.mobile, label: 'Mobile' },
          ].map((metric, index) => (
            <AnimatedView key={metric.label} animation="fadeInUp" delay={100 + index * 100}>
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>{metric.score}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            </AnimatedView>
          ))}
        </View>

        <AnimatedView animation="fadeInUp" delay={400}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Wins</Text>
            {analysis.quickWins.map((win: string, index: number) => (
              <AnimatedView key={index} animation="fadeInLeft" delay={500 + index * 80}>
                <View style={styles.quickWinItem}>
                  <Text style={styles.quickWinIcon}>⚡</Text>
                  <Text style={styles.quickWinText}>{win}</Text>
                </View>
              </AnimatedView>
            ))}
          </View>
        </AnimatedView>

        <AnimatedView animation="fadeInUp" delay={800}>
          <Pressable
            style={styles.continueButton}
            onPress={() => {
              // Pass analysis context to chat and navigate
              if (analysis && websiteUrl) {
                setAnalysisContext({
                  websiteUrl,
                  overallScore: analysis.overallScore,
                  scores: analysis.scores,
                  quickWins: analysis.quickWins,
                });
              }
              router.push('/home');
            }}
          >
            <Text style={styles.continueButtonText}>Continue to Conversation →</Text>
          </Pressable>
        </AnimatedView>
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
    backgroundColor: COLORS.forest,
    borderRadius: 3,
  },
  skeletonPreview: {
    width: '100%',
    marginTop: SPACING['3xl'],
    opacity: 0.5,
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
