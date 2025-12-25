/**
 * Home Screen - Ring 1: Core (Your Story)
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useChatStore } from '../../stores/chatStore';
import ChatBubble from '../../components/chat/ChatBubble';
import TypingIndicator from '../../components/chat/TypingIndicator';

export default function HomeScreen() {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { messages, isTyping, sendMessage, currentRing } = useChatStore();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    sendMessage(inputText.trim());
    setInputText('');
  };

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
        <Text style={styles.progressText}>Ring {currentRing} of 5</Text>
        <View style={styles.progressDots}>
          {[1, 2, 3, 4, 5].map((ring) => (
            <View
              key={ring}
              style={[
                styles.progressDot,
                ring <= currentRing && styles.progressDotActive,
              ]}
            />
          ))}
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

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tell me about your business..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />
        <Pressable
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendIcon}>→</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4DD',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8E4DD',
  },
  progressDotActive: {
    backgroundColor: '#2D5A3D',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
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
    paddingHorizontal: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8E4DD',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F3EF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    fontSize: 16,
    maxHeight: 120,
    color: '#1A1A1A',
  },
  sendButton: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2D5A3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D4C4A8',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
