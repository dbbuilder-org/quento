# Technical Architecture Document
## Quento Mobile Platform

**Version:** 1.0
**Last Updated:** December 2025
**AI Development Partner:** ServiceVision (https://www.servicevision.net)

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                     React Native (Expo) Mobile App                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │Onboarding│  │   Chat   │  │ Analysis │  │ Strategy │  │Dashboard │  │    │
│  │  │  Flows   │  │Interface │  │  Views   │  │  Views   │  │  Views   │  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │    │
│  │                              │                                           │    │
│  │  ┌───────────────────────────┴───────────────────────────────────────┐  │    │
│  │  │                      State Management (Zustand)                    │  │    │
│  │  └───────────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS/WSS
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         FastAPI Application                              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │   Auth   │  │   Chat   │  │ Analysis │  │ Strategy │  │  Users   │  │    │
│  │  │ Routes   │  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│    AI SERVICES        │ │    DATA SERVICES      │ │   EXTERNAL SERVICES   │
│  ┌─────────────────┐  │ │  ┌─────────────────┐  │ │  ┌─────────────────┐  │
│  │   LangChain     │  │ │  │   PostgreSQL    │  │ │  │  Web Scraping   │  │
│  │   Orchestrator  │  │ │  │   (Primary DB)  │  │ │  │   (Playwright)  │  │
│  ├─────────────────┤  │ │  ├─────────────────┤  │ │  ├─────────────────┤  │
│  │    LiteLLM      │  │ │  │     Redis       │  │ │  │   SEO APIs      │  │
│  │   (Model Hub)   │  │ │  │   (Cache/Queue) │  │ │  │   (Moz, etc.)   │  │
│  ├─────────────────┤  │ │  ├─────────────────┤  │ │  ├─────────────────┤  │
│  │   Embeddings    │  │ │  │   S3/Minio      │  │ │  │  Social APIs    │  │
│  │   (Vector DB)   │  │ │  │   (File Store)  │  │ │  │                 │  │
│  └─────────────────┘  │ │  └─────────────────┘  │ │  └─────────────────┘  │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

### 1.2 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Mobile | React Native + Expo | Cross-platform iOS/Android |
| State | Zustand | Lightweight state management |
| Navigation | React Navigation v6 | Screen routing |
| API | FastAPI (Python) | REST + WebSocket backend |
| AI Orchestration | LangChain | Agent workflows |
| Model Gateway | LiteLLM | Multi-model support |
| Database | PostgreSQL | Primary data store |
| Cache | Redis | Sessions, caching, queues |
| Vector Store | Pinecone/Chroma | Embeddings storage |
| Scraping | Playwright + BeautifulSoup | Web analysis |
| Monorepo | Nx | Build orchestration |

---

## 2. Mobile Application Architecture

### 2.1 Project Structure

```
apps/mobile/
├── app/                          # Expo Router app directory
│   ├── (auth)/                   # Authentication flows
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx
│   │   ├── home.tsx              # Ring 1: Core story
│   │   ├── discover.tsx          # Ring 2: Analysis
│   │   ├── plan.tsx              # Ring 3: Strategy
│   │   ├── execute.tsx           # Ring 4: Actions
│   │   └── optimize.tsx          # Ring 5: Dashboard
│   ├── (modals)/                 # Modal screens
│   │   ├── chat.tsx
│   │   ├── analysis-detail.tsx
│   │   └── settings.tsx
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry redirect
├── components/
│   ├── chat/
│   │   ├── ChatBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── index.ts
│   ├── rings/
│   │   ├── RingVisualization.tsx
│   │   ├── RingProgress.tsx
│   │   └── index.ts
│   ├── analysis/
│   │   ├── WebsiteCard.tsx
│   │   ├── MetricGauge.tsx
│   │   ├── CompetitorList.tsx
│   │   └── index.ts
│   ├── strategy/
│   │   ├── RecommendationCard.tsx
│   │   ├── PriorityMatrix.tsx
│   │   └── index.ts
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Typography.tsx
│       └── index.ts
├── stores/
│   ├── authStore.ts
│   ├── chatStore.ts
│   ├── analysisStore.ts
│   ├── strategyStore.ts
│   └── index.ts
├── services/
│   ├── api.ts                    # API client
│   ├── websocket.ts              # Real-time connection
│   ├── storage.ts                # Local persistence
│   └── index.ts
├── hooks/
│   ├── useChat.ts
│   ├── useAnalysis.ts
│   ├── useAuth.ts
│   └── index.ts
├── utils/
│   ├── formatting.ts
│   ├── validation.ts
│   └── index.ts
├── constants/
│   ├── theme.ts
│   ├── config.ts
│   └── index.ts
├── types/
│   └── index.ts
├── app.json
├── package.json
└── tsconfig.json
```

### 2.2 State Management Architecture

```typescript
// stores/chatStore.ts - Example Zustand store
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
    analysisId?: string;
  };
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  currentRing: number;
  sessionId: string | null;

  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setTyping: (typing: boolean) => void;
  advanceRing: () => void;
  clearSession: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isTyping: false,
      currentRing: 1,
      sessionId: null,

      addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }]
      })),

      setTyping: (typing) => set({ isTyping: typing }),

      advanceRing: () => set((state) => ({
        currentRing: Math.min(state.currentRing + 1, 5)
      })),

      clearSession: () => set({
        messages: [],
        currentRing: 1,
        sessionId: null
      }),
    }),
    {
      name: 'quento-chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 2.3 Navigation Structure

```
App Root
├── (auth) - Authentication Stack
│   ├── Login
│   ├── Register
│   └── Forgot Password
│
└── (main) - Authenticated Stack
    ├── Onboarding Flow (first launch)
    │   ├── Welcome
    │   ├── Ring Introduction
    │   └── Initial Chat
    │
    └── (tabs) - Main Tab Navigator
        ├── Home (Ring 1: Core)
        │   └── Chat Modal
        ├── Discover (Ring 2)
        │   ├── URL Input
        │   ├── Analysis Progress
        │   └── Analysis Results
        ├── Plan (Ring 3)
        │   ├── Strategy Overview
        │   └── Recommendation Details
        ├── Execute (Ring 4)
        │   ├── Action List
        │   └── Task Details
        └── Optimize (Ring 5)
            ├── Dashboard
            └── Re-Analysis Trigger
```

---

## 3. Backend Architecture

### 3.1 Project Structure

```
apps/api/
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI application entry
│   ├── config.py                 # Configuration management
│   ├── dependencies.py           # Dependency injection
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py         # API v1 router
│   │   │   ├── auth.py           # Authentication endpoints
│   │   │   ├── chat.py           # Chat/conversation endpoints
│   │   │   ├── analysis.py       # Web analysis endpoints
│   │   │   ├── strategy.py       # Strategy generation endpoints
│   │   │   └── users.py          # User management endpoints
│   │   └── websocket.py          # WebSocket handlers
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py           # JWT, encryption
│   │   ├── exceptions.py         # Custom exceptions
│   │   └── middleware.py         # Custom middleware
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── conversation.py
│   │   ├── analysis.py
│   │   └── strategy.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── chat.py
│   │   ├── analysis.py
│   │   └── strategy.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── chat_service.py
│   │   ├── analysis_service.py
│   │   └── strategy_service.py
│   │
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── chains/
│   │   │   ├── __init__.py
│   │   │   ├── conversation_chain.py
│   │   │   ├── analysis_chain.py
│   │   │   └── strategy_chain.py
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── business_analyst.py
│   │   │   └── strategy_advisor.py
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── web_scraper.py
│   │   │   ├── seo_analyzer.py
│   │   │   └── competitor_finder.py
│   │   ├── prompts/
│   │   │   ├── __init__.py
│   │   │   ├── system_prompts.py
│   │   │   └── templates.py
│   │   └── llm.py                # LiteLLM configuration
│   │
│   ├── scrapers/
│   │   ├── __init__.py
│   │   ├── website_scraper.py
│   │   ├── social_scraper.py
│   │   └── seo_scraper.py
│   │
│   └── db/
│       ├── __init__.py
│       ├── database.py           # Database connection
│       ├── repositories/
│       │   ├── __init__.py
│       │   ├── user_repo.py
│       │   ├── conversation_repo.py
│       │   └── analysis_repo.py
│       └── migrations/
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_chat.py
│   ├── test_analysis.py
│   └── test_ai/
│
├── alembic/                      # Database migrations
├── alembic.ini
├── pyproject.toml
├── poetry.lock
└── Dockerfile
```

### 3.2 API Endpoint Design

```python
# Core API Routes

# Authentication
POST   /api/v1/auth/register          # Create account
POST   /api/v1/auth/login             # Get tokens
POST   /api/v1/auth/refresh           # Refresh token
POST   /api/v1/auth/logout            # Invalidate session
POST   /api/v1/auth/forgot-password   # Password reset request
POST   /api/v1/auth/reset-password    # Complete reset

# Chat/Conversation
POST   /api/v1/chat/sessions          # Start new conversation
GET    /api/v1/chat/sessions          # List user sessions
GET    /api/v1/chat/sessions/{id}     # Get session details
POST   /api/v1/chat/sessions/{id}/messages  # Send message
DELETE /api/v1/chat/sessions/{id}     # End session

# Analysis
POST   /api/v1/analysis               # Start new analysis
GET    /api/v1/analysis               # List user analyses
GET    /api/v1/analysis/{id}          # Get analysis details
GET    /api/v1/analysis/{id}/status   # Check analysis progress
DELETE /api/v1/analysis/{id}          # Delete analysis

# Strategy
POST   /api/v1/strategy/generate      # Generate strategy from analysis
GET    /api/v1/strategy               # List strategies
GET    /api/v1/strategy/{id}          # Get strategy details
PUT    /api/v1/strategy/{id}/actions  # Update action statuses
POST   /api/v1/strategy/{id}/export   # Export strategy

# User
GET    /api/v1/users/me               # Get current user
PUT    /api/v1/users/me               # Update profile
DELETE /api/v1/users/me               # Delete account
GET    /api/v1/users/me/progress      # Get ring progress

# WebSocket
WS     /ws/chat/{session_id}          # Real-time chat
WS     /ws/analysis/{analysis_id}     # Analysis progress updates
```

### 3.3 Database Schema

```sql
-- Core Tables

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    current_ring INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'
);

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    ring_phase VARCHAR(50) DEFAULT 'core',
    status VARCHAR(50) DEFAULT 'active',
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id),
    website_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    results JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES analyses(id),
    title VARCHAR(255),
    summary TEXT,
    recommendations JSONB,
    action_items JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50),
    effort VARCHAR(50),
    impact VARCHAR(50),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_analyses_user ON analyses(user_id);
CREATE INDEX idx_strategies_user ON strategies(user_id);
CREATE INDEX idx_action_items_strategy ON action_items(strategy_id);
```

---

## 4. AI System Architecture

### 4.1 LangChain + LiteLLM Integration

```python
# ai/llm.py - LiteLLM Configuration
from litellm import completion
from langchain_community.llms import LiteLLM
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

class QuentoLLM:
    """Unified LLM interface using LiteLLM for model flexibility."""

    def __init__(self, config):
        self.config = config
        self.callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])

    def get_chat_model(self, streaming: bool = False):
        """Get model for conversational interactions."""
        return LiteLLM(
            model=self.config.CHAT_MODEL,  # e.g., "gpt-4", "claude-3-opus"
            temperature=0.7,
            max_tokens=2000,
            streaming=streaming,
            callback_manager=self.callback_manager if streaming else None
        )

    def get_analysis_model(self):
        """Get model for analysis tasks (more deterministic)."""
        return LiteLLM(
            model=self.config.ANALYSIS_MODEL,
            temperature=0.2,
            max_tokens=4000
        )

    def get_embedding_model(self):
        """Get embedding model for vector operations."""
        return LiteLLM(
            model=self.config.EMBEDDING_MODEL
        )
```

### 4.2 Chain Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUENTO AI CHAIN SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  CONVERSATION CHAIN                        │  │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌────────┐ │  │
│  │  │ Memory  │───▶│ Prompt  │───▶│  LLM    │───▶│ Output │ │  │
│  │  │ Buffer  │    │Template │    │(LiteLLM)│    │ Parser │ │  │
│  │  └─────────┘    └─────────┘    └─────────┘    └────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   ANALYSIS CHAIN                          │  │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌────────┐ │  │
│  │  │Web Data │───▶│ Prompt  │───▶│  LLM    │───▶│Analysis│ │  │
│  │  │ Loader  │    │Template │    │(LiteLLM)│    │ Parser │ │  │
│  │  └─────────┘    └─────────┘    └─────────┘    └────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   STRATEGY CHAIN                          │  │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌────────┐ │  │
│  │  │Business │───▶│ Prompt  │───▶│  LLM    │───▶│Strategy│ │  │
│  │  │ Context │    │Template │    │(LiteLLM)│    │ Parser │ │  │
│  │  └─────────┘    └─────────┘    └─────────┘    └────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     AGENT TOOLS                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │   Web    │  │   SEO    │  │  Social  │  │Competitor│  │  │
│  │  │ Scraper  │  │ Analyzer │  │ Scanner  │  │  Finder  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Agent Implementation

```python
# ai/agents/business_analyst.py
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

from ..tools import WebScraperTool, SEOAnalyzerTool, CompetitorFinderTool
from ..prompts import BUSINESS_ANALYST_SYSTEM_PROMPT
from ..llm import QuentoLLM

class BusinessAnalystAgent:
    """AI agent for analyzing business web presence."""

    def __init__(self, llm_config):
        self.llm = QuentoLLM(llm_config).get_analysis_model()
        self.tools = [
            WebScraperTool(),
            SEOAnalyzerTool(),
            CompetitorFinderTool(),
        ]
        self.memory = ConversationBufferWindowMemory(
            memory_key="chat_history",
            return_messages=True,
            k=10
        )
        self.agent = self._create_agent()

    def _create_agent(self):
        prompt = ChatPromptTemplate.from_messages([
            ("system", BUSINESS_ANALYST_SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])

        agent = create_openai_functions_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=prompt
        )

        return AgentExecutor(
            agent=agent,
            tools=self.tools,
            memory=self.memory,
            verbose=True,
            max_iterations=5,
            handle_parsing_errors=True
        )

    async def analyze(self, website_url: str, business_context: dict) -> dict:
        """Run comprehensive analysis on a business website."""
        input_text = f"""
        Analyze the following business website and provide insights:

        Website URL: {website_url}
        Business Context: {business_context}

        Please:
        1. Scrape and analyze the website content
        2. Perform SEO analysis
        3. Identify potential competitors
        4. Summarize strengths and areas for improvement
        """

        result = await self.agent.ainvoke({"input": input_text})
        return self._parse_analysis_result(result)
```

---

## 5. Infrastructure & Deployment

### 5.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION ENVIRONMENT                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────┐     ┌────────────────────────┐         │
│  │      App Stores        │     │        CDN            │         │
│  │  ┌──────┐  ┌──────┐   │     │    (CloudFlare)       │         │
│  │  │ iOS  │  │Android│   │     │   Static Assets       │         │
│  │  │Store │  │ Play  │   │     └──────────┬───────────┘         │
│  │  └──────┘  └──────┘   │                 │                      │
│  └────────────────────────┘                 │                      │
│                                             ▼                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    LOAD BALANCER (Railway/Render)            │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                    │                               │
│              ┌─────────────────────┼─────────────────────┐        │
│              ▼                     ▼                     ▼        │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐│
│  │   API Instance 1  │ │   API Instance 2  │ │   API Instance N  ││
│  │    (FastAPI)      │ │    (FastAPI)      │ │    (FastAPI)      ││
│  └───────────────────┘ └───────────────────┘ └───────────────────┘│
│              │                     │                     │        │
│              └─────────────────────┼─────────────────────┘        │
│                                    ▼                               │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    MANAGED SERVICES                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │  │
│  │  │ PostgreSQL  │  │    Redis    │  │   Object Storage    │  │  │
│  │  │ (Supabase/  │  │  (Upstash)  │  │    (S3/Minio)       │  │  │
│  │  │  Neon)      │  │             │  │                     │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    EXTERNAL SERVICES                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │  │
│  │  │  LiteLLM    │  │   Pinecone  │  │    Monitoring       │  │  │
│  │  │  (Models)   │  │  (Vectors)  │  │   (Sentry/DD)       │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 5.2 Environment Configuration

```yaml
# docker-compose.yml (Development)
version: '3.8'

services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://quento:quento@db:5432/quento
      - REDIS_URL=redis://redis:6379
      - LITELLM_API_KEY=${LITELLM_API_KEY}
    depends_on:
      - db
      - redis
    volumes:
      - ./apps/api:/app

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: quento
      POSTGRES_PASSWORD: quento
      POSTGRES_DB: quento
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  playwright:
    image: mcr.microsoft.com/playwright:v1.40.0
    environment:
      - PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

volumes:
  postgres_data:
  redis_data:
```

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  Mobile  │                    │   API    │                    │ Database │
│   App    │                    │  Server  │                    │          │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │
     │  1. Register/Login            │                               │
     │  (email, password)            │                               │
     │──────────────────────────────▶│                               │
     │                               │                               │
     │                               │  2. Validate & Hash           │
     │                               │─────────────────────────────▶│
     │                               │                               │
     │                               │  3. Store/Verify              │
     │                               │◀─────────────────────────────│
     │                               │                               │
     │  4. JWT Access + Refresh      │                               │
     │◀──────────────────────────────│                               │
     │                               │                               │
     │  5. API Request + Bearer      │                               │
     │──────────────────────────────▶│                               │
     │                               │                               │
     │                               │  6. Verify JWT                │
     │                               │  (in-memory validation)       │
     │                               │                               │
     │  7. Response                  │                               │
     │◀──────────────────────────────│                               │
     │                               │                               │
```

### 6.2 Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| Transport | TLS 1.3 | Enforced on all connections |
| Authentication | JWT + Refresh | Short-lived access, rotating refresh |
| Password | Argon2id | Industry-standard hashing |
| API | Rate Limiting | Redis-based per-user limits |
| Data | Encryption at Rest | PostgreSQL native encryption |
| Secrets | Environment Variables | Injected at deployment |
| Input | Validation | Pydantic schemas on all endpoints |
| Output | Sanitization | No sensitive data in responses |

---

## 7. Monitoring & Observability

### 7.1 Monitoring Stack

```yaml
# Observability Configuration
monitoring:
  apm:
    provider: Sentry
    dsn: ${SENTRY_DSN}
    traces_sample_rate: 0.1

  logging:
    provider: Datadog
    level: INFO
    format: json

  metrics:
    provider: Prometheus
    endpoints:
      - /metrics

  alerting:
    provider: PagerDuty
    thresholds:
      error_rate: 1%
      latency_p99: 2000ms
      availability: 99.5%
```

### 7.2 Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time (p50) | < 200ms | > 500ms |
| API Response Time (p99) | < 1000ms | > 2000ms |
| Error Rate | < 0.1% | > 1% |
| AI Latency (chat) | < 2s | > 5s |
| AI Latency (analysis) | < 30s | > 60s |
| Uptime | 99.9% | < 99.5% |

---

*Architecture document maintained by ServiceVision AI Development Team*
