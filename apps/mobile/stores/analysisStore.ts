/**
 * Analysis Store - Web presence analysis state management
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  analysisApi,
  Analysis,
  AnalysisResults as ApiAnalysisResults,
  AnalysisWithResults,
  AnalysisStatus,
} from '../services/api';

interface AnalysisResults {
  overallScore: number;
  scores: {
    seo: number;
    content: number;
    mobile: number;
    speed: number;
    social: number;
  };
  quickWins: string[];
  competitors: Array<{
    name: string;
    url: string;
    strengths: string[];
    seoScore?: number;
  }>;
  contentAnalysis?: Record<string, unknown>;
  seoAnalysis?: Record<string, unknown>;
  socialPresence?: Record<string, unknown>;
}

interface AnalysisState {
  analysisId: string | null;
  analysis: AnalysisResults | null;
  isAnalyzing: boolean;
  progress: number;
  currentStep: string | null;
  websiteUrl: string | null;
  error: string | null;
  analyses: Analysis[];

  // Actions
  startAnalysis: (url: string, includeCompetitors?: boolean, includeSocial?: boolean) => Promise<void>;
  pollAnalysis: () => Promise<void>;
  loadAnalysis: (id: string) => Promise<void>;
  listAnalyses: () => Promise<void>;
  setProgress: (progress: number, step?: string) => void;
  setAnalysis: (analysis: AnalysisResults) => void;
  clearAnalysis: () => void;
}

// Convert API results to store format
function mapApiResults(apiResults: ApiAnalysisResults): AnalysisResults {
  return {
    overallScore: apiResults.overall_score,
    scores: {
      seo: apiResults.scores.seo,
      content: apiResults.scores.content,
      mobile: apiResults.scores.mobile,
      speed: apiResults.scores.speed,
      social: apiResults.scores.social,
    },
    quickWins: apiResults.quick_wins,
    competitors: apiResults.competitors.map((c) => ({
      name: c.name,
      url: c.url,
      strengths: c.strengths,
      seoScore: c.seo_score,
    })),
    contentAnalysis: apiResults.content_analysis,
    seoAnalysis: apiResults.seo_analysis,
    socialPresence: apiResults.social_presence,
  };
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      analysisId: null,
      analysis: null,
      isAnalyzing: false,
      progress: 0,
      currentStep: null,
      websiteUrl: null,
      error: null,
      analyses: [],

      startAnalysis: async (url: string, includeCompetitors = true, includeSocial = true) => {
        set({
          isAnalyzing: true,
          progress: 0,
          currentStep: 'Starting analysis...',
          websiteUrl: url,
          error: null,
        });

        try {
          const response = await analysisApi.createAnalysis(url, includeCompetitors, includeSocial);

          if (response.success && response.data) {
            set({
              analysisId: response.data.id,
              progress: response.data.progress,
            });

            // Start polling for completion
            await get().pollAnalysis();
          } else {
            throw new Error('Failed to start analysis');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Analysis failed';
          set({
            isAnalyzing: false,
            error: message,
          });
        }
      },

      pollAnalysis: async () => {
        const { analysisId } = get();
        if (!analysisId) return;

        try {
          const result = await analysisApi.pollUntilComplete(
            analysisId,
            (progress, step) => {
              set({ progress, currentStep: step || null });
            }
          );

          if (result.results) {
            set({
              analysis: mapApiResults(result.results),
              isAnalyzing: false,
              progress: 100,
              currentStep: 'Complete',
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Analysis failed';
          set({
            isAnalyzing: false,
            error: message,
          });
        }
      },

      loadAnalysis: async (id: string) => {
        try {
          const response = await analysisApi.getAnalysis(id);

          if (response.success && response.data) {
            const data = response.data;
            set({
              analysisId: data.id,
              websiteUrl: data.website_url,
              progress: data.progress,
              isAnalyzing: data.status === 'processing',
              analysis: data.results ? mapApiResults(data.results) : null,
              error: null,
            });

            // Continue polling if still processing
            if (data.status === 'processing') {
              await get().pollAnalysis();
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load analysis';
          set({ error: message });
        }
      },

      listAnalyses: async () => {
        try {
          const response = await analysisApi.listAnalyses();

          if (response.success) {
            set({ analyses: response.data, error: null });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to list analyses';
          set({ error: message });
        }
      },

      setProgress: (progress: number, step?: string) => {
        set({
          progress: Math.min(progress, 100),
          currentStep: step || null,
        });
      },

      setAnalysis: (analysis: AnalysisResults) => {
        set({
          analysis,
          isAnalyzing: false,
          progress: 100,
        });
      },

      clearAnalysis: () => {
        set({
          analysisId: null,
          analysis: null,
          isAnalyzing: false,
          progress: 0,
          currentStep: null,
          websiteUrl: null,
          error: null,
        });
      },
    }),
    {
      name: 'quento-analysis-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        analysisId: state.analysisId,
        websiteUrl: state.websiteUrl,
        analysis: state.analysis,
      }),
    }
  )
);
