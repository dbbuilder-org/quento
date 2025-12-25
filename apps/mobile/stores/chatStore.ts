/**
 * Chat Store - Conversation state management
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    ringPhase?: 'core' | 'discover' | 'plan' | 'execute' | 'optimize';
  };
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  currentRing: number;
  sessionId: string | null;

  // Actions
  sendMessage: (content: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setTyping: (typing: boolean) => void;
  advanceRing: () => void;
  clearSession: () => void;
}

// Initial welcome message
const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Welcome! I'm here to help you maximize your business impact. Let's start with the most important thing: your story.\n\nWhat does your business do, and what makes it special?",
  timestamp: new Date(),
  metadata: { ringPhase: 'core' },
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [WELCOME_MESSAGE],
      isTyping: false,
      currentRing: 1,
      sessionId: null,

      sendMessage: (content: string) => {
        const userMessage: Message = {
          id: 'msg_' + Date.now(),
          role: 'user',
          content,
          timestamp: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, userMessage],
          isTyping: true,
        }));

        // Simulate AI response (would be API call in production)
        setTimeout(() => {
          const responses = [
            "That's wonderful! Tell me more about your customers. Who are the people you love serving?",
            "I can see the passion in your story. What's your biggest challenge right now when it comes to growing online?",
            "Great insight! Do you have a website I could look at, or would you like to describe your current online presence?",
            "Your story is compelling. Let's discover how we can share it with more people. Share your website URL and I'll analyze your digital presence.",
          ];

          const aiMessage: Message = {
            id: 'msg_' + Date.now(),
            role: 'assistant',
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
            metadata: { ringPhase: 'core' },
          };

          set((state) => ({
            messages: [...state.messages, aiMessage],
            isTyping: false,
          }));
        }, 1500);
      },

      addMessage: (message) => {
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: 'msg_' + Date.now(),
              timestamp: new Date(),
            },
          ],
        }));
      },

      setTyping: (typing: boolean) => {
        set({ isTyping: typing });
      },

      advanceRing: () => {
        set((state) => ({
          currentRing: Math.min(state.currentRing + 1, 5),
        }));
      },

      clearSession: () => {
        set({
          messages: [WELCOME_MESSAGE],
          currentRing: 1,
          sessionId: null,
        });
      },
    }),
    {
      name: 'quento-chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
