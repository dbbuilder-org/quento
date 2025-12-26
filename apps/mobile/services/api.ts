/**
 * API Service - Central API client for Quento mobile app
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import Constants from 'expo-constants';

// API Configuration
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';
const API_VERSION = 'v1';

// Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    request_id?: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  meta?: {
    timestamp: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

// Token storage
let accessToken: string | null = null;
let refreshToken: string | null = null;

/**
 * Set authentication tokens
 */
export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
}

/**
 * Clear authentication tokens
 */
export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Base fetch wrapper with authentication and error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle token refresh if needed
  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry original request
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
      const retryResponse = await fetch(url, { ...options, headers });
      if (!retryResponse.ok) {
        throw new ApiRequestError(retryResponse);
      }
      return retryResponse.json();
    }
  }

  if (!response.ok) {
    throw new ApiRequestError(response);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/${API_VERSION}/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    if (data.success && data.data) {
      accessToken = data.data.access_token;
      refreshToken = data.data.refresh_token;
      return true;
    }

    return false;
  } catch {
    clearTokens();
    return false;
  }
}

/**
 * Custom API error class
 */
export class ApiRequestError extends Error {
  status: number;
  statusText: string;
  response: Response;

  constructor(response: Response) {
    super(`API Error: ${response.status} ${response.statusText}`);
    this.name = 'ApiRequestError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.response = response;
  }
}

// ============================================================================
// Authentication API
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  current_ring: number;
  created_at: string;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: TokenData;
}

export const authApi = {
  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    fullName?: string,
    companyName?: string
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await apiFetch<ApiResponse<AuthResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        company_name: companyName,
      }),
    });

    if (response.success && response.data) {
      setTokens(response.data.tokens.access_token, response.data.tokens.refresh_token);
    }

    return response;
  },

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiFetch<ApiResponse<AuthResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      setTokens(response.data.tokens.access_token, response.data.tokens.refresh_token);
    }

    return response;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<ApiResponse<User>> {
    return apiFetch<ApiResponse<User>>('/auth/me');
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiFetch('/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(
    token: string,
    password: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiFetch('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

// ============================================================================
// Chat API
// ============================================================================

export type RingPhase = 'core' | 'discover' | 'plan' | 'execute' | 'optimize';
export type ConversationStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  title: string | null;
  ring_phase: RingPhase;
  status: ConversationStatus;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends Omit<Conversation, 'message_count'> {
  business_context?: Record<string, unknown>;
  messages: Message[];
}

export interface SendMessageResponse {
  user_message: Message;
  assistant_message: Message;
  session_update: {
    ring_phase: RingPhase;
    should_advance: boolean;
  };
}

export const chatApi = {
  /**
   * Create a new conversation
   */
  async createConversation(
    initialContext?: Record<string, unknown>
  ): Promise<ApiResponse<Conversation>> {
    return apiFetch('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ initial_context: initialContext }),
    });
  },

  /**
   * List conversations
   */
  async listConversations(
    limit = 20,
    offset = 0
  ): Promise<PaginatedResponse<Conversation>> {
    return apiFetch(`/chat/conversations?limit=${limit}&offset=${offset}`);
  },

  /**
   * Get conversation with messages
   */
  async getConversation(id: string): Promise<ApiResponse<ConversationDetail>> {
    return apiFetch(`/chat/conversations/${id}`);
  },

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    content: string,
    attachments?: string[]
  ): Promise<ApiResponse<SendMessageResponse>> {
    return apiFetch(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, attachments }),
    });
  },

  /**
   * Update ring phase
   */
  async updateRingPhase(
    conversationId: string,
    ringPhase: RingPhase
  ): Promise<ApiResponse<Conversation>> {
    return apiFetch(`/chat/conversations/${conversationId}/ring?ring_phase=${ringPhase}`, {
      method: 'PATCH',
    });
  },

  /**
   * Delete conversation
   */
  async deleteConversation(id: string): Promise<void> {
    await apiFetch(`/chat/conversations/${id}`, { method: 'DELETE' });
  },

  /**
   * Create WebSocket connection for real-time chat
   */
  createWebSocket(conversationId: string): WebSocket {
    const wsUrl = API_BASE_URL.replace('http', 'ws');
    return new WebSocket(
      `${wsUrl}/api/${API_VERSION}/chat/ws/${conversationId}?token=${accessToken}`
    );
  },
};

// ============================================================================
// Analysis API
// ============================================================================

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Analysis {
  id: string;
  website_url: string;
  status: AnalysisStatus;
  progress: number;
  estimated_time_seconds?: number;
  created_at: string;
}

export interface AnalysisScores {
  seo: number;
  content: number;
  mobile: number;
  speed: number;
  social: number;
}

export interface AnalysisResults {
  overall_score: number;
  scores: AnalysisScores;
  content_analysis: Record<string, unknown>;
  seo_analysis: Record<string, unknown>;
  competitors: Array<{
    name: string;
    url: string;
    strengths: string[];
    seo_score: number;
  }>;
  social_presence?: Record<string, unknown>;
  quick_wins: string[];
}

export interface AnalysisWithResults extends Analysis {
  results?: AnalysisResults;
  completed_at?: string;
}

export interface AnalysisStatusResponse {
  status: AnalysisStatus;
  progress: number;
  current_step?: string;
  steps_completed: string[];
  steps_remaining: string[];
}

export const analysisApi = {
  /**
   * Start a new analysis
   */
  async createAnalysis(
    websiteUrl: string,
    includeCompetitors = true,
    includeSocial = true
  ): Promise<ApiResponse<Analysis>> {
    return apiFetch('/analysis', {
      method: 'POST',
      body: JSON.stringify({
        website_url: websiteUrl,
        include_competitors: includeCompetitors,
        include_social: includeSocial,
      }),
    });
  },

  /**
   * List analyses
   */
  async listAnalyses(limit = 20, offset = 0): Promise<PaginatedResponse<Analysis>> {
    return apiFetch(`/analysis?limit=${limit}&offset=${offset}`);
  },

  /**
   * Get analysis with results
   */
  async getAnalysis(id: string): Promise<ApiResponse<AnalysisWithResults>> {
    return apiFetch(`/analysis/${id}`);
  },

  /**
   * Get analysis status
   */
  async getAnalysisStatus(id: string): Promise<ApiResponse<AnalysisStatusResponse>> {
    return apiFetch(`/analysis/${id}/status`);
  },

  /**
   * Poll for analysis completion
   */
  async pollUntilComplete(
    id: string,
    onProgress?: (progress: number, step?: string) => void,
    intervalMs = 2000,
    timeoutMs = 120000
  ): Promise<AnalysisWithResults> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const statusResponse = await this.getAnalysisStatus(id);
          const status = statusResponse.data;

          if (onProgress) {
            onProgress(status.progress, status.current_step);
          }

          if (status.status === 'completed') {
            const result = await this.getAnalysis(id);
            resolve(result.data);
            return;
          }

          if (status.status === 'failed') {
            reject(new Error('Analysis failed'));
            return;
          }

          if (Date.now() - startTime > timeoutMs) {
            reject(new Error('Analysis timed out'));
            return;
          }

          setTimeout(checkStatus, intervalMs);
        } catch (error) {
          reject(error);
        }
      };

      checkStatus();
    });
  },
};

// ============================================================================
// Strategy API
// ============================================================================

export type StrategyStatus = 'generating' | 'ready' | 'in_progress' | 'completed' | 'failed';
export type Priority = 'high' | 'medium' | 'low';
export type Effort = 'small' | 'medium' | 'large';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface Recommendation {
  id: string;
  title: string;
  priority: Priority;
  summary: string;
  impact: string;
  current_state?: string;
  target_state?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  effort: Effort;
  category?: string;
  status: ActionStatus;
  expected_impact?: string;
  due_date?: string;
  completed_at?: string;
}

export interface Strategy {
  id: string;
  title?: string;
  status: StrategyStatus;
  executive_summary?: string;
  vision_statement?: string;
  key_strengths: string[];
  critical_gaps: string[];
  recommendations: Recommendation[];
  action_items: ActionItem[];
  ninety_day_priorities: string[];
  created_at: string;
  updated_at: string;
}

export const strategyApi = {
  /**
   * Generate a strategy from analysis
   */
  async generateStrategy(
    analysisId: string,
    sessionId?: string,
    preferences?: Record<string, unknown>
  ): Promise<ApiResponse<Strategy>> {
    return apiFetch('/strategy/generate', {
      method: 'POST',
      body: JSON.stringify({
        analysis_id: analysisId,
        session_id: sessionId,
        preferences,
      }),
    });
  },

  /**
   * List strategies
   */
  async listStrategies(limit = 20, offset = 0): Promise<PaginatedResponse<Strategy>> {
    return apiFetch(`/strategy?limit=${limit}&offset=${offset}`);
  },

  /**
   * Get strategy details
   */
  async getStrategy(id: string): Promise<ApiResponse<Strategy>> {
    return apiFetch(`/strategy/${id}`);
  },

  /**
   * Update action item status
   */
  async updateActionItem(
    actionId: string,
    status: ActionStatus,
    notes?: string
  ): Promise<ApiResponse<ActionItem>> {
    return apiFetch(`/strategy/actions/${actionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action_id: actionId, status, notes }),
    });
  },

  /**
   * Batch update action items
   */
  async batchUpdateActions(
    updates: Array<{ action_id: string; status: ActionStatus; notes?: string }>
  ): Promise<ApiResponse<ActionItem[]>> {
    return apiFetch('/strategy/actions', {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    });
  },

  /**
   * Export strategy
   */
  async exportStrategy(
    id: string,
    format: 'pdf' | 'markdown' | 'notion' | 'trello',
    includeSections?: string[],
    branding?: Record<string, unknown>
  ): Promise<ApiResponse<{ format: string; status: string; download_url: string }>> {
    return apiFetch(`/strategy/${id}/export`, {
      method: 'POST',
      body: JSON.stringify({
        format,
        include_sections: includeSections,
        branding,
      }),
    });
  },
};

// Default export with all APIs
export default {
  auth: authApi,
  chat: chatApi,
  analysis: analysisApi,
  strategy: strategyApi,
  setTokens,
  clearTokens,
  getAccessToken,
};
