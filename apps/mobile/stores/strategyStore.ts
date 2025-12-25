/**
 * Strategy Store - Business strategy state management
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Recommendation {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  summary: string;
  impact: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  category: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface Strategy {
  id: string;
  executiveSummary: string;
  visionStatement: string;
  keyStrengths: string[];
  criticalGaps: string[];
  recommendations: Recommendation[];
  actionItems: ActionItem[];
  ninetyDayPriorities: string[];
}

interface StrategyState {
  strategy: Strategy | null;
  isGenerating: boolean;
  error: string | null;

  // Actions
  generateStrategy: () => void;
  updateActionStatus: (actionId: string, status: string) => void;
  clearStrategy: () => void;
}

export const useStrategyStore = create<StrategyState>()(
  persist(
    (set, get) => ({
      strategy: null,
      isGenerating: false,
      error: null,

      generateStrategy: () => {
        set({ isGenerating: true, error: null });

        // Simulate strategy generation
        setTimeout(() => {
          const mockStrategy: Strategy = {
            id: 'str_' + Date.now(),
            executiveSummary:
              'Your business has a strong foundation with authentic brand values. By focusing on digital presence optimization and strategic content marketing, you can significantly expand your reach and customer base.',
            visionStatement:
              "To become the most trusted and beloved brand in your market, known for quality, authenticity, and exceptional customer experience.",
            keyStrengths: [
              'Authentic brand story with local focus',
              'Quality product with loyal customer base',
              'Good foundation for online ordering',
              'Strong word-of-mouth reputation',
            ],
            criticalGaps: [
              'Limited social media presence',
              'SEO optimization needed',
              'No email marketing strategy',
              'Inconsistent online reviews management',
            ],
            recommendations: [
              {
                id: 'rec_1',
                title: 'Social Media Presence',
                priority: 'high',
                summary:
                  'Build an engaging Instagram presence showcasing your process and products',
                impact: 'Increase brand awareness and customer engagement',
              },
              {
                id: 'rec_2',
                title: 'Local SEO Optimization',
                priority: 'high',
                summary:
                  'Optimize Google Business profile and local search presence',
                impact: 'Improve visibility for local customers searching online',
              },
              {
                id: 'rec_3',
                title: 'Email Marketing',
                priority: 'medium',
                summary: 'Set up email capture and regular newsletter',
                impact: 'Build direct customer relationships and drive repeat business',
              },
            ],
            actionItems: [
              {
                id: 'act_1',
                title: 'Create Instagram content calendar',
                description:
                  'Plan 4 weeks of Instagram content focusing on behind-the-scenes and product highlights',
                priority: 'high',
                effort: 'medium',
                category: 'social_media',
                status: 'pending',
              },
              {
                id: 'act_2',
                title: 'Optimize Google Business profile',
                description:
                  'Add photos, update hours, respond to reviews, and add posts regularly',
                priority: 'high',
                effort: 'low',
                category: 'seo',
                status: 'pending',
              },
              {
                id: 'act_3',
                title: 'Add email signup to website',
                description:
                  'Implement email capture form with incentive offer for new subscribers',
                priority: 'medium',
                effort: 'low',
                category: 'marketing',
                status: 'pending',
              },
              {
                id: 'act_4',
                title: 'Write meta descriptions for all pages',
                description:
                  'Create compelling meta descriptions for homepage and key pages',
                priority: 'high',
                effort: 'low',
                category: 'seo',
                status: 'pending',
              },
              {
                id: 'act_5',
                title: 'Set up review response workflow',
                description:
                  'Create templates and schedule for responding to all reviews within 24 hours',
                priority: 'medium',
                effort: 'low',
                category: 'marketing',
                status: 'pending',
              },
            ],
            ninetyDayPriorities: [
              'Launch consistent Instagram presence with 3-4 posts per week',
              'Optimize Google Business profile and achieve 10+ new reviews',
              'Set up basic email capture and send first newsletter',
              'Complete all high-priority SEO quick wins',
            ],
          };

          set({
            strategy: mockStrategy,
            isGenerating: false,
          });
        }, 2000);
      },

      updateActionStatus: (actionId: string, status: string) => {
        const { strategy } = get();
        if (!strategy) return;

        const updatedActionItems = strategy.actionItems.map((item) =>
          item.id === actionId
            ? { ...item, status: status as ActionItem['status'] }
            : item
        );

        set({
          strategy: {
            ...strategy,
            actionItems: updatedActionItems,
          },
        });
      },

      clearStrategy: () => {
        set({
          strategy: null,
          isGenerating: false,
          error: null,
        });
      },
    }),
    {
      name: 'quento-strategy-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
