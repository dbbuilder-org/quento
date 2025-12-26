/**
 * Chat Store - Conversation state management
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  chatApi,
  RingPhase,
  Message as ApiMessage,
  Conversation,
  ConversationDetail,
} from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    ringPhase?: RingPhase;
  };
}

interface AnalysisContext {
  websiteUrl: string;
  overallScore: number;
  scores: {
    seo: number;
    content: number;
    mobile: number;
    speed: number;
    social: number;
  };
  quickWins: string[];
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  currentRing: number;
  conversationId: string | null;
  ringPhase: RingPhase;
  conversations: Conversation[];
  error: string | null;
  analysisContext: AnalysisContext | null;

  // Actions
  createConversation: (context?: string) => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  listConversations: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setTyping: (typing: boolean) => void;
  advanceRing: () => Promise<void>;
  clearSession: () => void;
  deleteConversation: (id: string) => Promise<void>;
  setAnalysisContext: (context: AnalysisContext) => void;
}

// Map ring phase to ring number
const ringPhaseToNumber: Record<RingPhase, number> = {
  core: 1,
  discover: 2,
  plan: 3,
  execute: 4,
  optimize: 5,
};

// Map ring number to phase
const numberToRingPhase: RingPhase[] = ['core', 'discover', 'plan', 'execute', 'optimize'];

// Convert API message to store message
function mapApiMessage(msg: ApiMessage): Message {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.created_at),
    metadata: msg.metadata as Message['metadata'],
  };
}

// Initial welcome message for offline mode
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
      conversationId: null,
      ringPhase: 'core',
      conversations: [],
      error: null,
      analysisContext: null,

      setAnalysisContext: (context: AnalysisContext) => {
        set({ analysisContext: context });
      },

      createConversation: async (context?: string) => {
        const { analysisContext } = get();

        try {
          // Pass analysis context to the conversation if available
          const initialContext = analysisContext
            ? {
                website_analysis: {
                  url: analysisContext.websiteUrl,
                  overall_score: analysisContext.overallScore,
                  scores: analysisContext.scores,
                  quick_wins: analysisContext.quickWins,
                },
                ...(context ? { user_context: context } : {}),
              }
            : context
            ? { user_context: context }
            : undefined;

          const response = await chatApi.createConversation(initialContext);

          if (response.success && response.data) {
            const conversation = response.data;

            set({
              conversationId: conversation.id,
              ringPhase: conversation.ring_phase,
              currentRing: ringPhaseToNumber[conversation.ring_phase],
              messages: [],
              error: null,
            });

            // Load full conversation with welcome message
            await get().loadConversation(conversation.id);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create conversation';
          set({ error: message });
        }
      },

      loadConversation: async (id: string) => {
        try {
          const response = await chatApi.getConversation(id);

          if (response.success && response.data) {
            const detail = response.data;

            set({
              conversationId: detail.id,
              ringPhase: detail.ring_phase,
              currentRing: ringPhaseToNumber[detail.ring_phase],
              messages: detail.messages.map(mapApiMessage),
              error: null,
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load conversation';
          set({ error: message });
        }
      },

      listConversations: async () => {
        try {
          const response = await chatApi.listConversations();

          if (response.success) {
            set({ conversations: response.data, error: null });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to list conversations';
          set({ error: message });
        }
      },

      sendMessage: async (content: string) => {
        const { conversationId } = get();

        // Add user message immediately for responsiveness
        const tempUserMessage: Message = {
          id: 'temp_' + Date.now(),
          role: 'user',
          content,
          timestamp: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, tempUserMessage],
          isTyping: true,
          error: null,
        }));

        // If no conversation, create one first
        if (!conversationId) {
          try {
            const createResponse = await chatApi.createConversation();
            if (createResponse.success && createResponse.data) {
              set({ conversationId: createResponse.data.id });
            } else {
              throw new Error('Failed to create conversation');
            }
          } catch (error) {
            set({ isTyping: false, error: 'Failed to start conversation' });
            return;
          }
        }

        const activeConversationId = get().conversationId;
        if (!activeConversationId) return;

        try {
          const response = await chatApi.sendMessage(activeConversationId, content);

          if (response.success && response.data) {
            const { user_message, assistant_message, session_update } = response.data;

            // Replace temp message and add AI response
            set((state) => ({
              messages: [
                ...state.messages.filter((m) => m.id !== tempUserMessage.id),
                mapApiMessage(user_message),
                mapApiMessage(assistant_message),
              ],
              isTyping: false,
              ringPhase: session_update.ring_phase,
              currentRing: ringPhaseToNumber[session_update.ring_phase],
            }));

            // Check if should advance ring
            if (session_update.should_advance) {
              await get().advanceRing();
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to send message';
          set({ isTyping: false, error: message });
        }
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

      advanceRing: async () => {
        const { conversationId, currentRing } = get();
        const nextRing = Math.min(currentRing + 1, 5);
        const nextPhase = numberToRingPhase[nextRing - 1];

        if (conversationId && nextRing !== currentRing) {
          try {
            await chatApi.updateRingPhase(conversationId, nextPhase);
            set({
              currentRing: nextRing,
              ringPhase: nextPhase,
            });
          } catch {
            // Still update locally even if API fails
            set({
              currentRing: nextRing,
              ringPhase: nextPhase,
            });
          }
        }
      },

      clearSession: () => {
        set({
          messages: [WELCOME_MESSAGE],
          currentRing: 1,
          conversationId: null,
          ringPhase: 'core',
          error: null,
        });
      },

      deleteConversation: async (id: string) => {
        try {
          await chatApi.deleteConversation(id);
          set((state) => ({
            conversations: state.conversations.filter((c) => c.id !== id),
            conversationId: state.conversationId === id ? null : state.conversationId,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete conversation';
          set({ error: message });
        }
      },
    }),
    {
      name: 'quento-chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversationId: state.conversationId,
        currentRing: state.currentRing,
        ringPhase: state.ringPhase,
      }),
    }
  )
);
