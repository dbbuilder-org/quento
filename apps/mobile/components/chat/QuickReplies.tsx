/**
 * QuickReplies Component - Context-aware suggested responses
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, ANIMATION } from '../../constants/theme';
import { RingPhase } from '../../services/api';

/** Maximum font scale to prevent button overflow */
const MAX_FONT_SIZE_MULTIPLIER = 1.3;

interface QuickReply {
  id: string;
  text: string;
  icon?: string;
}

interface QuickRepliesProps {
  ringPhase: RingPhase;
  onSelect: (text: string) => void;
  visible: boolean;
}

// Context-aware quick replies based on current ring phase
const RING_QUICK_REPLIES: Record<RingPhase, QuickReply[]> = {
  core: [
    { id: 'core_1', text: "We're a B2B SaaS company", icon: '💼' },
    { id: 'core_2', text: 'We sell products online', icon: '🛒' },
    { id: 'core_3', text: 'We provide professional services', icon: '👔' },
    { id: 'core_4', text: 'Tell me more about the process', icon: '❓' },
  ],
  discover: [
    { id: 'discover_1', text: 'Analyze my website', icon: '🔍' },
    { id: 'discover_2', text: 'Check my SEO score', icon: '📊' },
    { id: 'discover_3', text: 'Find my competitors', icon: '🎯' },
    { id: 'discover_4', text: 'What should I focus on?', icon: '💡' },
  ],
  plan: [
    { id: 'plan_1', text: 'Generate my strategy', icon: '📋' },
    { id: 'plan_2', text: 'Show recommended actions', icon: '✅' },
    { id: 'plan_3', text: 'What are my quick wins?', icon: '⚡' },
    { id: 'plan_4', text: 'Set my 90-day priorities', icon: '📅' },
  ],
  execute: [
    { id: 'execute_1', text: 'Show my action items', icon: '📝' },
    { id: 'execute_2', text: "What's next on my list?", icon: '➡️' },
    { id: 'execute_3', text: 'Mark task as complete', icon: '✓' },
    { id: 'execute_4', text: 'I need help with a task', icon: '🆘' },
  ],
  optimize: [
    { id: 'optimize_1', text: 'Show my progress', icon: '📈' },
    { id: 'optimize_2', text: 'Re-analyze my website', icon: '🔄' },
    { id: 'optimize_3', text: 'Compare to baseline', icon: '📊' },
    { id: 'optimize_4', text: 'Suggest improvements', icon: '💡' },
  ],
};

export default function QuickReplies({ ringPhase, onSelect, visible }: QuickRepliesProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const quickReplies = RING_QUICK_REPLIES[ringPhase] || RING_QUICK_REPLIES.core;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: visible ? 1 : 0,
        duration: ANIMATION.normal,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: visible ? 0 : 20,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, fadeAnim, slideAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {quickReplies.map((reply, index) => (
          <QuickReplyButton
            key={reply.id}
            reply={reply}
            onSelect={onSelect}
            index={index}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

interface QuickReplyButtonProps {
  reply: QuickReply;
  onSelect: (text: string) => void;
  index: number;
}

function QuickReplyButton({ reply, onSelect, index }: QuickReplyButtonProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [index, scaleAnim]);

  const handlePress = () => {
    // Quick scale feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSelect(reply.text);
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={({ pressed }) => [
          styles.replyButton,
          pressed && styles.replyButtonPressed,
        ]}
        onPress={handlePress}
      >
        {reply.icon && (
          <Text style={styles.replyIcon} maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}>
            {reply.icon}
          </Text>
        )}
        <Text
          style={styles.replyText}
          allowFontScaling={true}
          maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
        >
          {reply.text}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.parchment,
    gap: SPACING.xs,
  },
  replyButtonPressed: {
    backgroundColor: COLORS.parchment,
    borderColor: COLORS.sage,
  },
  replyIcon: {
    fontSize: 14,
  },
  replyText: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    color: COLORS.carbon,
    fontWeight: '500',
  },
});
