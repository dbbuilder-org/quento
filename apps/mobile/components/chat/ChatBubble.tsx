/**
 * ChatBubble Component
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

interface ChatBubbleProps {
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

export default function ChatBubble({ content, role, timestamp }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <View style={[styles.container, isUser && styles.containerUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.content, isUser && styles.contentUser]}>{content}</Text>
      </View>
      <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  containerUser: {
    alignSelf: 'flex-end',
  },
  bubble: {
    padding: SPACING.md,
    borderRadius: 20,
  },
  bubbleUser: {
    backgroundColor: COLORS.forest,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: COLORS.cream,
    borderBottomLeftRadius: 4,
  },
  content: {
    fontSize: TYPOGRAPHY.body.fontSize,
    lineHeight: TYPOGRAPHY.body.lineHeight,
    color: COLORS.carbon,
  },
  contentUser: {
    color: COLORS.pure,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: COLORS.bark,
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  timestampUser: {
    marginLeft: 0,
    marginRight: SPACING.sm,
    textAlign: 'right',
  },
});
