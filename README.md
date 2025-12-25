# Quento - AI-Powered Business Growth Platform

> **Story First. Growth Always.**

A React Native mobile application that mirrors the Quento brand experience while empowering businesses to maximize their impact through AI-driven web presence and marketing strategy optimization.

## Vision

Like the rings of a tree that tell the story of growth, resilience, and accumulated wisdom, Quento guides businesses through their growth journey. Each ring represents a phase of development - from initial awareness to full optimization - building upon the previous to create a stronger, more impactful whole.

## Core Concept: The Rings of Growth

```
                    ┌─────────────────────────────┐
                    │      RING 5: OPTIMIZE       │
                    │   Continuous Improvement    │
                    │  ┌───────────────────────┐  │
                    │  │    RING 4: EXECUTE    │  │
                    │  │  Action & Analytics   │  │
                    │  │  ┌─────────────────┐  │  │
                    │  │  │  RING 3: PLAN   │  │  │
                    │  │  │ Strategy Design │  │  │
                    │  │  │  ┌───────────┐  │  │  │
                    │  │  │  │ RING 2:   │  │  │  │
                    │  │  │  │ DISCOVER  │  │  │  │
                    │  │  │  │  ┌─────┐  │  │  │  │
                    │  │  │  │  │ R1: │  │  │  │  │
                    │  │  │  │  │CORE │  │  │  │  │
                    │  │  │  │  └─────┘  │  │  │  │
                    │  │  │  └───────────┘  │  │  │
                    │  │  └─────────────────┘  │  │
                    │  └───────────────────────┘  │
                    └─────────────────────────────┘
```

### The Five Rings

1. **Core (Center)** - Your Business Story
   - Who you are and what you stand for
   - Initial AI conversation to understand your business

2. **Discover** - Understanding Your Landscape
   - AI reads and analyzes your existing web presence
   - Competitive landscape assessment
   - Market positioning analysis

3. **Plan** - Strategic Roadmap
   - AI-generated recommendations via LangChain
   - Web presence optimization strategies
   - Marketing channel recommendations

4. **Execute** - Action Items
   - Prioritized implementation checklist
   - Resource allocation guidance
   - Timeline suggestions

5. **Optimize** - Continuous Growth
   - Performance tracking integration
   - Iterative improvement recommendations
   - Long-term growth planning

## Technology Stack

### Mobile Application
- **Framework**: React Native (Expo)
- **State Management**: Zustand
- **Navigation**: React Navigation v6
- **UI Components**: Custom design system mirroring Quento brand

### Backend Services
- **Runtime**: Python 3.11+
- **AI Framework**: LangChain + LiteLLM
- **API**: FastAPI
- **Web Scraping**: BeautifulSoup4 + Playwright

### Infrastructure
- **Monorepo**: Nx Workspace
- **Mobile Builds**: EAS Build
- **Backend Hosting**: Railway / Render
- **Database**: PostgreSQL + Redis

## Project Structure

```
quento/
├── apps/
│   ├── mobile/          # React Native Expo app
│   └── api/             # Python FastAPI backend
├── libs/
│   ├── shared/          # Shared types and utilities
│   ├── ui/              # Reusable UI components
│   └── ai-core/         # LangChain/LiteLLM integration
├── docs/                # Project documentation
│   ├── PRD.md           # Product Requirements
│   ├── ARCHITECTURE.md  # Technical Architecture
│   ├── UI_SPEC.md       # UI/UX Specification
│   ├── AI_INTEGRATION.md # AI System Design
│   ├── API_SPEC.md      # API Documentation
│   └── ROADMAP.md       # Development Roadmap
├── tools/               # Build and development tools
├── nx.json              # Nx configuration
└── package.json         # Root package configuration
```

## Getting Started

```bash
# Install dependencies
npm install

# Start mobile development
nx serve mobile

# Start API server
nx serve api

# Run all tests
nx run-many --target=test --all
```

## Documentation

- [Product Requirements Document](./docs/PRD.md)
- [Technical Architecture](./docs/ARCHITECTURE.md)
- [UI/UX Specification](./docs/UI_SPEC.md)
- [AI Integration Guide](./docs/AI_INTEGRATION.md)
- [API Specification](./docs/API_SPEC.md)
- [Development Roadmap](./docs/ROADMAP.md)

## Credits

**AI Application Development powered by [ServiceVision](https://www.servicevision.net)**

Built with advanced AI capabilities leveraging:
- Anthropic Claude for intelligent conversation design
- LangChain for orchestrated AI workflows
- LiteLLM for flexible model integration

---

*Inspired by Quento's philosophy: Every business has a story worth telling. Let's help you tell yours.*

## License

Proprietary - All Rights Reserved

Copyright 2025 Quento / ServiceVision
