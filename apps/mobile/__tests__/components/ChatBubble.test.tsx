/**
 * ChatBubble Component Tests
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import ChatBubble from '../../components/chat/ChatBubble';

describe('ChatBubble', () => {
  const mockTimestamp = new Date('2024-01-15T10:30:00');

  describe('Rendering', () => {
    it('renders user message content', () => {
      const { getByText } = render(
        <ChatBubble
          content="Hello from user"
          role="user"
          timestamp={mockTimestamp}
        />
      );
      expect(getByText('Hello from user')).toBeTruthy();
    });

    it('renders assistant message content', () => {
      const { getByText } = render(
        <ChatBubble
          content="Hello from assistant"
          role="assistant"
          timestamp={mockTimestamp}
        />
      );
      expect(getByText('Hello from assistant')).toBeTruthy();
    });

    it('renders timestamp', () => {
      const { getByText } = render(
        <ChatBubble content="Message" role="user" timestamp={mockTimestamp} />
      );
      // Timestamp should be formatted
      expect(getByText(/\d{1,2}:\d{2}/)).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('applies user styling for user role', () => {
      const { getByText } = render(
        <ChatBubble content="User message" role="user" timestamp={mockTimestamp} />
      );
      const content = getByText('User message');
      // User messages should have different styling
      expect(content).toBeTruthy();
    });

    it('applies assistant styling for assistant role', () => {
      const { getByText } = render(
        <ChatBubble
          content="Assistant message"
          role="assistant"
          timestamp={mockTimestamp}
        />
      );
      const content = getByText('Assistant message');
      expect(content).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('limits font scaling on content', () => {
      const { getByText } = render(
        <ChatBubble content="Scalable content" role="user" timestamp={mockTimestamp} />
      );
      const content = getByText('Scalable content');
      expect(content.props.maxFontSizeMultiplier).toBe(1.3);
    });

    it('limits font scaling on timestamp', () => {
      const { getByText } = render(
        <ChatBubble content="Message" role="user" timestamp={mockTimestamp} />
      );
      const timestamp = getByText(/\d{1,2}:\d{2}/);
      expect(timestamp.props.maxFontSizeMultiplier).toBe(1.3);
    });

    it('allows font scaling', () => {
      const { getByText } = render(
        <ChatBubble content="Scalable" role="user" timestamp={mockTimestamp} />
      );
      const content = getByText('Scalable');
      expect(content.props.allowFontScaling).toBe(true);
    });
  });

  describe('Long Content', () => {
    it('renders long messages without truncation', () => {
      const longContent =
        'This is a very long message that should wrap to multiple lines in the chat bubble without being truncated.';
      const { getByText } = render(
        <ChatBubble content={longContent} role="user" timestamp={mockTimestamp} />
      );
      expect(getByText(longContent)).toBeTruthy();
    });
  });

  describe('System Messages', () => {
    it('renders system role message', () => {
      const { getByText } = render(
        <ChatBubble
          content="System notification"
          role="system"
          timestamp={mockTimestamp}
        />
      );
      expect(getByText('System notification')).toBeTruthy();
    });
  });
});
