/**
 * Shared Types - Quento Platform
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

// Ring phases in the growth journey
export type RingPhase = 'core' | 'discover' | 'plan' | 'execute' | 'optimize';

// User model
export interface User {
  id: string;
  email: string;
  fullName?: string;
  companyName?: string;
  currentRing: number;
  createdAt: string;
  updatedAt: string;
}

// Message model
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  metadata?: {
    ringPhase?: RingPhase;
    tokensUsed?: number;
  };
}

// Conversation/Session model
export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  ringPhase: RingPhase;
  status: 'active' | 'archived';
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Analysis model
export interface Analysis {
  id: string;
  userId: string;
  websiteUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  overallScore?: number;
  results?: AnalysisResults;
  createdAt: string;
  completedAt?: string;
}

export interface AnalysisResults {
  overallScore: number;
  scores: {
    seo: number;
    content: number;
    mobile: number;
    speed: number;
    social: number;
  };
  contentAnalysis: {
    summary: string;
    keyMessages: string[];
    wordCount: number;
  };
  seoAnalysis: {
    title: string;
    metaDescription: string;
    issues: SEOIssue[];
  };
  competitors: Competitor[];
  quickWins: string[];
}

export interface SEOIssue {
  severity: 'high' | 'medium' | 'low';
  issue: string;
  recommendation: string;
}

export interface Competitor {
  name: string;
  url: string;
  strengths: string[];
  seoScore: number;
}

// Strategy model
export interface Strategy {
  id: string;
  userId: string;
  analysisId: string;
  title: string;
  executiveSummary: string;
  visionStatement: string;
  keyStrengths: string[];
  criticalGaps: string[];
  recommendations: Recommendation[];
  actionItems: ActionItem[];
  ninetyDayPriorities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  summary: string;
  impact: string;
  currentState: string;
  targetState: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  recommendationId?: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  category: 'website' | 'social_media' | 'seo' | 'content' | 'marketing';
  status: 'pending' | 'in_progress' | 'completed';
  expectedImpact: string;
  completedAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
