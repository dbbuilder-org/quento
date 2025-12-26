/**
 * Home Screen - Ring 1: Core (Your Story)
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useChatStore } from '../../stores/chatStore';
import ChatBubble from '../../components/chat/ChatBubble';
import TypingIndicator from '../../components/chat/TypingIndicator';
import QuickReplies from '../../components/chat/QuickReplies';
import MessageSearch from '../../components/chat/MessageSearch';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

export default function HomeScreen() {
  const [inputText, setInputText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const ringScaleAnim = useRef(new Animated.Value(1)).current;
  const { messages, isTyping, sendMessage, currentRing, ringPhase } = useChatStore();

  // Ring phase names for display
  const RING_NAMES = ['Core', 'Discover', 'Plan', 'Execute', 'Optimize'];

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  // Animate ring indicator when ring changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(ringScaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(ringScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentRing, ringScaleAnim]);

  const handleSend = useCallback((text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    sendMessage(messageText);
    setInputText('');
    setShowQuickReplies(false);

    // Show quick replies again after a delay
    setTimeout(() => setShowQuickReplies(true), 2000);
  }, [inputText, sendMessage]);

  const handleQuickReply = useCallback((text: string) => {
    handleSend(text);
  }, [handleSend]);

  const handleSearchSelect = useCallback((messageId: string) => {
    // Find message index and scroll to it
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: typeof messages[0] }) => (
    <ChatBubble
      content={item.content}
      role={item.role}
      timestamp={item.timestamp}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Ring Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressLeft}>
          <Animated.View
            style={[
              styles.ringBadge,
              { transform: [{ scale: ringScaleAnim }] },
            ]}
          >
            <Text style={styles.ringNumber}>{currentRing}</Text>
          </Animated.View>
          <View style={styles.ringInfo}>
            <Text style={styles.ringName}>{RING_NAMES[currentRing - 1]}</Text>
            <Text style={styles.progressText}>Ring {currentRing} of 5</Text>
          </View>
        </View>
        <View style={styles.progressRight}>
          <Pressable
            style={styles.searchButton}
            onPress={() => setShowSearch(true)}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </Pressable>
          <View style={styles.progressDots}>
            {[1, 2, 3, 4, 5].map((ring) => (
              <View
                key={ring}
                style={[
                  styles.progressDot,
                  ring <= currentRing && styles.progressDotActive,
                  ring === currentRing && styles.progressDotCurrent,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={(info) => {
          // Handle scroll to index failure
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 100);
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>Let's grow together</Text>
            <Text style={styles.emptyText}>
              Tell me about your business and what makes it special.
            </Text>
          </View>
        }
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      {/* Quick Replies */}
      <QuickReplies
        ringPhase={ringPhase}
        onSelect={handleQuickReply}
        visible={showQuickReplies && !isTyping && messages.length > 0}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={getPlaceholder(ringPhase)}
          placeholderTextColor={COLORS.bark}
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
            if (text.length > 0) setShowQuickReplies(false);
            else setShowQuickReplies(true);
          }}
          multiline
          maxLength={1000}
          onFocus={() => setShowQuickReplies(false)}
          onBlur={() => inputText.length === 0 && setShowQuickReplies(true)}
        />
        <Pressable
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>→</Text>
        </Pressable>
      </View>

      {/* Message Search Modal */}
      <MessageSearch
        messages={messages}
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectMessage={handleSearchSelect}
      />
    </KeyboardAvoidingView>
  );
}

// Get context-aware placeholder text
function getPlaceholder(ringPhase: string): string {
  switch (ringPhase) {
    case 'core':
      return 'Tell me about your business...';
    case 'discover':
      return 'Enter a website to analyze...';
    case 'plan':
      return 'Ask about your strategy...';
    case 'execute':
      return 'Update on your progress...';
    case 'optimize':
      return 'How can we improve...';
    default:
      return 'Type a message...';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pure,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.parchment,
    backgroundColor: COLORS.pure,
  },
  progressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  ringBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.forest,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  ringNumber: {
    fontSize: TYPOGRAPHY.titleMedium.fontSize,
    fontWeight: '700',
    color: COLORS.pure,
  },
  ringInfo: {
    gap: 2,
  },
  ringName: {
    fontSize: TYPOGRAPHY.labelLarge.fontSize,
    fontWeight: '600',
    color: COLORS.carbon,
  },
  progressText: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: COLORS.bark,
  },
  progressRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 16,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.parchment,
  },
  progressDotActive: {
    backgroundColor: COLORS.sage,
  },
  progressDotCurrent: {
    backgroundColor: COLORS.forest,
    transform: [{ scale: 1.2 }],
  },
  messagesList: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['6xl'],
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.titleLarge.fontSize,
    fontWeight: '600',
    color: COLORS.carbon,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.bark,
    textAlign: 'center',
    paddingHorizontal: SPACING['3xl'],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.parchment,
    backgroundColor: COLORS.pure,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingRight: 48,
    fontSize: TYPOGRAPHY.body.fontSize,
    maxHeight: 120,
    color: COLORS.carbon,
  },
  sendButton: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.forest,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.sand,
  },
  sendButtonText: {
    color: COLORS.pure,
    fontSize: 18,
    fontWeight: '600',
  },
});
