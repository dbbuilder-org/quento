/**
 * Strategy Store - Business strategy state management
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  strategyApi,
  Strategy as ApiStrategy,
  Recommendation as ApiRecommendation,
  ActionItem as ApiActionItem,
  Priority,
  Effort,
  ActionStatus,
} from '../services/api';

interface Recommendation {
  id: string;
  title: string;
  priority: Priority;
  summary: string;
  impact: string;
  currentState?: string;
  targetState?: string;
}

interface ActionItem {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  effort: Effort;
  category?: string;
  status: ActionStatus;
  expectedImpact?: string;
  dueDate?: string;
  completedAt?: string;
}

interface Strategy {
  id: string;
  title?: string;
  status: string;
  executiveSummary?: string;
  visionStatement?: string;
  keyStrengths: string[];
  criticalGaps: string[];
  recommendations: Recommendation[];
  actionItems: ActionItem[];
  ninetyDayPriorities: string[];
  createdAt: string;
  updatedAt: string;
}

interface StrategyState {
  strategyId: string | null;
  strategy: Strategy | null;
  strategies: ApiStrategy[];
  isGenerating: boolean;
  error: string | null;

  // Actions
  generateStrategy: (analysisId: string, sessionId?: string) => Promise<void>;
  loadStrategy: (id: string) => Promise<void>;
  listStrategies: () => Promise<void>;
  updateActionStatus: (actionId: string, status: ActionStatus, notes?: string) => Promise<void>;
  clearStrategy: () => void;
}

// Convert API strategy to store format
function mapApiStrategy(api: ApiStrategy): Strategy {
  return {
    id: api.id,
    title: api.title,
    status: api.status,
    executiveSummary: api.executive_summary,
    visionStatement: api.vision_statement,
    keyStrengths: api.key_strengths,
    criticalGaps: api.critical_gaps,
    recommendations: api.recommendations.map((r) => ({
      id: r.id,
      title: r.title,
      priority: r.priority,
      summary: r.summary,
      impact: r.impact,
      currentState: r.current_state,
      targetState: r.target_state,
    })),
    actionItems: api.action_items.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      priority: a.priority,
      effort: a.effort,
      category: a.category,
      status: a.status,
      expectedImpact: a.expected_impact,
      dueDate: a.due_date,
      completedAt: a.completed_at,
    })),
    ninetyDayPriorities: api.ninety_day_priorities,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

export const useStrategyStore = create<StrategyState>()(
  persist(
    (set, get) => ({
      strategyId: null,
      strategy: null,
      strategies: [],
      isGenerating: false,
      error: null,

      generateStrategy: async (analysisId: string, sessionId?: string) => {
        set({ isGenerating: true, error: null });

        try {
          const response = await strategyApi.generateStrategy(analysisId, sessionId);

          if (response.success && response.data) {
            set({
              strategyId: response.data.id,
              strategy: mapApiStrategy(response.data),
              isGenerating: false,
            });
          } else {
            throw new Error('Failed to generate strategy');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Strategy generation failed';
          set({
            isGenerating: false,
            error: message,
          });
        }
      },

      loadStrategy: async (id: string) => {
        try {
          const response = await strategyApi.getStrategy(id);

          if (response.success && response.data) {
            set({
              strategyId: response.data.id,
              strategy: mapApiStrategy(response.data),
              error: null,
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load strategy';
          set({ error: message });
        }
      },

      listStrategies: async () => {
        try {
          const response = await strategyApi.listStrategies();

          if (response.success) {
            set({ strategies: response.data, error: null });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to list strategies';
          set({ error: message });
        }
      },

      updateActionStatus: async (actionId: string, status: ActionStatus, notes?: string) => {
        const { strategy } = get();
        if (!strategy) return;

        try {
          const response = await strategyApi.updateActionItem(actionId, status, notes);

          if (response.success && response.data) {
            const updatedAction = response.data;

            // Update local state
            const updatedActionItems = strategy.actionItems.map((item) =>
              item.id === actionId
                ? {
                    ...item,
                    status: updatedAction.status,
                    completedAt: updatedAction.completed_at,
                  }
                : item
            );

            set({
              strategy: {
                ...strategy,
                actionItems: updatedActionItems,
              },
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update action';
          set({ error: message });
        }
      },

      clearStrategy: () => {
        set({
          strategyId: null,
          strategy: null,
          isGenerating: false,
          error: null,
        });
      },
    }),
    {
      name: 'quento-strategy-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        strategyId: state.strategyId,
        strategy: state.strategy,
      }),
    }
  )
);
