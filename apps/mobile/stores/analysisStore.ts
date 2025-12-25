/**
 * Analysis Store - Web presence analysis state management
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  }>;
}

interface AnalysisState {
  analysis: AnalysisResults | null;
  isAnalyzing: boolean;
  progress: number;
  websiteUrl: string | null;
  error: string | null;

  // Actions
  startAnalysis: (url: string) => void;
  setProgress: (progress: number) => void;
  setAnalysis: (analysis: AnalysisResults) => void;
  clearAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      analysis: null,
      isAnalyzing: false,
      progress: 0,
      websiteUrl: null,
      error: null,

      startAnalysis: (url: string) => {
        set({
          isAnalyzing: true,
          progress: 0,
          websiteUrl: url,
          error: null,
        });

        // Simulate analysis progress
        const progressInterval = setInterval(() => {
          const currentProgress = get().progress;
          if (currentProgress >= 100) {
            clearInterval(progressInterval);

            // Mock analysis results
            const mockResults: AnalysisResults = {
              overallScore: 73,
              scores: {
                seo: 68,
                content: 82,
                mobile: 90,
                speed: 65,
                social: 45,
              },
              quickWins: [
                'Add meta descriptions to all pages',
                'Optimize images with alt text',
                'Set up Google Business profile',
                'Add structured data markup',
                'Improve page load speed',
              ],
              competitors: [
                {
                  name: 'Competitor A',
                  url: 'https://competitor-a.com',
                  strengths: ['Strong SEO', 'Active social media'],
                },
                {
                  name: 'Competitor B',
                  url: 'https://competitor-b.com',
                  strengths: ['Great content', 'Fast load times'],
                },
              ],
            };

            set({
              analysis: mockResults,
              isAnalyzing: false,
            });
          } else {
            set({ progress: currentProgress + Math.random() * 15 });
          }
        }, 500);
      },

      setProgress: (progress: number) => {
        set({ progress: Math.min(progress, 100) });
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
          analysis: null,
          isAnalyzing: false,
          progress: 0,
          websiteUrl: null,
          error: null,
        });
      },
    }),
    {
      name: 'quento-analysis-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
