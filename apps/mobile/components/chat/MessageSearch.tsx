/**
 * MessageSearch Component - Search through conversation history
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
  Modal,
  Animated,
  Keyboard,
} from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS, Z_INDEX } from '../../constants/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface MessageSearchProps {
  messages: Message[];
  visible: boolean;
  onClose: () => void;
  onSelectMessage: (messageId: string) => void;
}

interface SearchResult {
  message: Message;
  matchIndices: number[];
  contextPreview: string;
}

export default function MessageSearch({
  messages,
  visible,
  onClose,
  onSelectMessage,
}: MessageSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filter, setFilter] = useState<'all' | 'user' | 'assistant'>('all');
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setQuery('');
      setResults([]);
    }
  }, [visible, slideAnim]);

  const searchMessages = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      const lowerQuery = searchQuery.toLowerCase();
      const searchResults: SearchResult[] = [];

      messages.forEach((message) => {
        // Apply filter
        if (filter !== 'all' && message.role !== filter) return;

        const content = message.content.toLowerCase();
        const index = content.indexOf(lowerQuery);

        if (index !== -1) {
          // Create context preview with highlighted term
          const start = Math.max(0, index - 30);
          const end = Math.min(content.length, index + searchQuery.length + 30);
          let preview = message.content.substring(start, end);

          if (start > 0) preview = '...' + preview;
          if (end < message.content.length) preview = preview + '...';

          searchResults.push({
            message,
            matchIndices: [index],
            contextPreview: preview,
          });
        }
      });

      // Sort by most recent first
      searchResults.sort((a, b) =>
        new Date(b.message.timestamp).getTime() - new Date(a.message.timestamp).getTime()
      );

      setResults(searchResults);
    },
    [messages, filter]
  );

  useEffect(() => {
    searchMessages(query);
  }, [query, filter, searchMessages]);

  const handleSelectResult = (result: SearchResult) => {
    Keyboard.dismiss();
    onSelectMessage(result.message.id);
    onClose();
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <Pressable
      style={({ pressed }) => [
        styles.resultItem,
        pressed && styles.resultItemPressed,
      ]}
      onPress={() => handleSelectResult(item)}
    >
      <View style={styles.resultHeader}>
        <View style={[
          styles.roleIndicator,
          item.message.role === 'user' ? styles.roleUser : styles.roleAssistant,
        ]}>
          <Text style={styles.roleText}>
            {item.message.role === 'user' ? 'You' : 'AI'}
          </Text>
        </View>
        <Text style={styles.resultTime}>
          {formatDate(item.message.timestamp)}
        </Text>
      </View>
      <Text style={styles.resultPreview} numberOfLines={2}>
        {highlightMatch(item.contextPreview, query)}
      </Text>
    </Pressable>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: slideAnim,
          },
        ]}
      >
        <Pressable style={styles.overlayBackground} onPress={onClose} />
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Search Header */}
          <View style={styles.header}>
            <View style={styles.searchInputContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder="Search messages..."
                placeholderTextColor={COLORS.bark}
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} style={styles.clearButton}>
                  <Text style={styles.clearIcon}>✕</Text>
                </Pressable>
              )}
            </View>
            <Pressable onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            {(['all', 'user', 'assistant'] as const).map((filterOption) => (
              <Pressable
                key={filterOption}
                style={[
                  styles.filterTab,
                  filter === filterOption && styles.filterTabActive,
                ]}
                onPress={() => setFilter(filterOption)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filter === filterOption && styles.filterTabTextActive,
                  ]}
                >
                  {filterOption === 'all' ? 'All' : filterOption === 'user' ? 'You' : 'AI'}
                </Text>
              </Pressable>
            ))}
            {query.length > 0 && (
              <Text style={styles.resultCount}>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {/* Results List */}
          <FlatList
            data={results}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.message.id}
            contentContainerStyle={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              query.length > 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyText}>No messages found</Text>
                  <Text style={styles.emptyHint}>
                    Try different keywords or filters
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>💬</Text>
                  <Text style={styles.emptyText}>Search your conversation</Text>
                  <Text style={styles.emptyHint}>
                    Type to find specific messages
                  </Text>
                </View>
              )
            }
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// Helper function to format date
function formatDate(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return messageDate.toLocaleDateString([], { weekday: 'short' });
  } else {
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

// Helper function to highlight matching text (returns styled string)
function highlightMatch(text: string, query: string): string {
  // For now, return plain text - React Native doesn't support inline styling easily
  // In a real app, you'd use a Text component with nested Text elements
  return text;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.pure,
    marginTop: 60,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.parchment,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.carbon,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.bark,
  },
  cancelButton: {
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.forest,
    fontWeight: '500',
  },
  filterTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.parchment,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cream,
  },
  filterTabActive: {
    backgroundColor: COLORS.forest,
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    color: COLORS.bark,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.pure,
  },
  resultCount: {
    marginLeft: 'auto',
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: COLORS.bark,
  },
  resultsList: {
    padding: SPACING.md,
  },
  resultItem: {
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  resultItemPressed: {
    backgroundColor: COLORS.parchment,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  roleIndicator: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  roleUser: {
    backgroundColor: COLORS.forest,
  },
  roleAssistant: {
    backgroundColor: COLORS.sage,
  },
  roleText: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: COLORS.pure,
    fontWeight: '600',
  },
  resultTime: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: COLORS.bark,
  },
  resultPreview: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    color: COLORS.carbon,
    lineHeight: TYPOGRAPHY.bodySmall.lineHeight,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.titleMedium.fontSize,
    fontWeight: '600',
    color: COLORS.carbon,
    marginBottom: SPACING.xs,
  },
  emptyHint: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.bark,
  },
});
