# Quento - AI-Powered Business Growth Platform

## Project Overview

Quento is a mobile-first AI-powered business growth platform that helps small to medium-sized businesses develop and execute marketing strategies through conversational AI guidance.

**Monorepo Structure:**
- `apps/mobile` - React Native (Expo) mobile app
- `apps/api` - Python FastAPI backend

## Mobile App (apps/mobile)

### Tech Stack
- **Framework:** Expo SDK 54 with expo-router
- **Language:** TypeScript
- **State:** Zustand
- **Auth:** Clerk (@clerk/clerk-expo)
- **UI:** Custom components following design system in `constants/theme.ts`
- **Testing:** Jest with @testing-library/react-native

### Key Configurations

**Bundle ID:** `com.quento.app`

**EAS Project ID:** `3d5c1519-86c7-4265-b6ed-b5617752662c`

**App Store Connect App ID:** `6757098148`

### Build & Deploy Commands

```bash
# Development
npm start                    # Start Expo dev server
npm run ios                  # Run on iOS simulator

# Storybook
npm run storybook            # Start with Storybook UI

# Testing
npm test                     # Run Jest tests
npm run test:coverage        # With coverage

# Production Build
eas build --platform ios --profile production

# Submit to TestFlight (autonomous)
eas submit --platform ios --latest --non-interactive

# Build + Submit in one step
eas build --platform ios --profile production --auto-submit

# App Store metadata
npm run appstore:prepare     # Generate assets
npm run appstore:push        # Push to App Store Connect
```

### EAS Configuration (eas.json)

The project is configured for autonomous TestFlight submissions:
- **API Key ID:** J864TYBDLD
- **API Key Path:** ~/.config/apple/AuthKey_J864TYBDLD.p8
- **Apple Team ID:** J745X8LR59

### Design System

Theme constants in `constants/theme.ts`:
- **Colors:** forest (#2D5A3D), carbon (#1A1A1A), sage (#4A7C5C), etc.
- **Typography:** displayLarge through caption with lineHeight
- **Spacing:** 4px grid system (xs=4, sm=8, md=12, lg=16, etc.)
- **Radius:** xs=4 through full=9999

**Accessibility:** All text components use `maxFontSizeMultiplier={1.3}` to prevent layout breaking with large system fonts.

### Component Library

Located in `components/`:
- `ui/Button.tsx` - Primary/secondary/tertiary variants
- `ui/Input.tsx` - Text input with label, helper, error states
- `ui/Card.tsx` - Container with variants (default, elevated, outlined, filled)
- `ui/Text.tsx` - Accessible text with typography variants
- `chat/ChatBubble.tsx` - User/assistant message bubbles
- `chat/QuickReplies.tsx` - Context-aware suggested responses
- `rings/RingVisualization.tsx` - Growth rings UI

## API (apps/api)

### Tech Stack
- **Framework:** FastAPI (Python 3.11)
- **Database:** PostgreSQL with SQLAlchemy async
- **AI:** LiteLLM for model abstraction
- **Auth:** JWT tokens with Clerk integration

### Key Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Current user
- `POST /api/v1/analysis` - Start website analysis
- `GET /api/v1/analysis/{id}` - Get analysis results
- `POST /api/v1/chat/conversations` - Create conversation
- `POST /api/v1/chat/conversations/{id}/messages` - Send message

### Environment Variables

```
DATABASE_URL=postgresql+asyncpg://...
OPENAI_API_KEY=sk-...
CLERK_SECRET_KEY=sk_...
```

### RAG Implementation

The AI service (`services/ai_service.py`) includes simple RAG:
1. Website analysis extracts raw content and key paragraphs
2. Content is stored in analysis results
3. AI system prompt includes website content for context-aware responses

## Deployment

### Mobile (TestFlight)
- Builds run on EAS cloud servers
- Autonomous submission configured with App Store Connect API key
- Current version: 1.0.0

### API (Render)
- Auto-deploys from main branch
- URL: https://quento-api.onrender.com
- Configured in `render.yaml`

## Testing

### API Tests (apps/api/tests/)
- `test_health.py` - Health check endpoints
- `test_auth.py` - Authentication flow
- `test_analysis.py` - Website analysis
- `test_chat.py` - Conversation/messaging

Run with: `cd apps/api && poetry run pytest`

### Mobile Tests (apps/mobile/__tests__/)
- Component tests for Button, Input, Card, Text, ChatBubble
- Theme constant validation tests

Run with: `cd apps/mobile && npm test`

## App Store Listing

**Title:** Quento
**Subtitle:** Grow Your Business Smartly
**Category:** Social Networking

**Key Features:**
- Offline Support
- Social Login (Google, Apple, Facebook via Clerk)
- AI-Driven Insights with Rings of Growth framework
- Personalized Recommendations
- Actionable Checklists
- Performance Tracking

**Keywords:** business, marketing, AI, optimization, analytics, strategy, offline, social, login, insights, branding, web

## Git Information

**Repository:** https://github.com/dbbuilder-org/quento.git
**Main Branch:** main

## Contact

**Developer:** Chris Therriault <chris@servicevision.net>
**Credits:** AI App Development powered by ServiceVision (https://www.servicevision.net)
