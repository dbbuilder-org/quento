# Quento - Current Status

**Last Updated:** January 11, 2026

## Release Status

| Platform | Version | Build | Status |
|----------|---------|-------|--------|
| iOS | 1.0.0 | 3 | ✅ Submitted to TestFlight |
| Android | 1.0.0 | 1 | ⏸️ Not started |
| API | 0.1.0 | - | ✅ Live on Render |

## TestFlight

- **App Store Connect:** https://appstoreconnect.apple.com/apps/6757098148/testflight/ios
- **Latest Build:** 1.0.0 (3) - Submitted Dec 27, 2025
- **Processing:** Apple processing (~5-10 min), then available for testing

## Infrastructure

### API (Render)
- **URL:** https://quento-api.onrender.com
- **Status:** ✅ Running
- **Database:** PostgreSQL (Render managed)
- **Auto-deploy:** Enabled from main branch

### Authentication (Clerk)
- **Status:** ✅ Configured
- **Providers:** Email, Google, Apple, Facebook ready

### AI/LLM
- **Provider:** OpenAI via LiteLLM
- **Model:** Configurable via AI_MODEL env var
- **Status:** ✅ Working (requires OPENAI_API_KEY on Render)

## Features Completed

### Mobile App
- [x] Clerk authentication integration
- [x] Expo Router navigation
- [x] Design system (theme.ts)
- [x] UI components (Button, Input, Card, Text)
- [x] Chat interface with bubbles
- [x] Quick replies by ring phase
- [x] Ring visualization
- [x] Accessibility (font scaling with maxFontSizeMultiplier)
- [x] Storybook integration
- [x] Jest test suite
- [x] EAS Build configuration
- [x] Autonomous TestFlight submission
- [x] App Store metadata (store.config.json)

### API
- [x] FastAPI with async SQLAlchemy
- [x] User authentication (register, login, JWT)
- [x] Website analysis service
- [x] Chat/conversation endpoints
- [x] AI service with LiteLLM
- [x] RAG context injection (website content → AI prompts)
- [x] Strategy service
- [x] Pytest test suite

### AI Context Engineering (NEW)
- [x] Sophisticated system prompts for each Ring phase (Core, Discover, Plan, Execute, Optimize)
- [x] Brand voice consistency across all AI responses
- [x] Pre-processing: Intent detection, sentiment analysis, enrichment notes
- [x] Post-processing: Response cleaning, action item extraction, quality flags
- [x] Phase-optimized RAG context (different data per ring phase)
- [x] AI-driven ring phase advancement (replaces simple message count)

## Features In Progress

- [ ] Screenshots for App Store listing
- [ ] Android build and Play Store submission
- [ ] Push notifications
- [ ] Offline mode implementation

## Known Issues

1. **Sentry SDK disabled** - C++ compilation issues with Xcode 16/iOS 26. Commented out in app.config.js.

2. **App Store screenshots** - Need to generate device screenshots for App Store listing.

## Environment Setup

### Required for Development
```bash
# Mobile
cd apps/mobile
npm install
npm start

# API
cd apps/api
poetry install
poetry run uvicorn app.main:app --reload
```

### Required Environment Variables

**API (.env or Render):**
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `CLERK_SECRET_KEY` - Clerk backend key

**Mobile (configured in app.config.js):**
- API URL points to Render: https://quento-api.onrender.com

### EAS/Apple Credentials
- API Key: `~/.config/apple/AuthKey_J864TYBDLD.p8`
- Configured in `apps/mobile/eas.json`

## Recent Changes

### January 11, 2026
- Complete AI context engineering overhaul:
  - Rewrote system prompts with business coaching methodology (5 Whys, prioritization matrix)
  - Added Quento brand voice for consistent AI personality
  - Implemented pre-processing (intent detection, sentiment analysis, enrichment)
  - Implemented post-processing (response cleaning, action extraction, quality checks)
  - Phase-optimized RAG context injection (different context per ring phase)
  - AI-driven ring phase advancement with confidence scoring
- Added `business_context` field to Conversation model
- Updated chat schemas for new session_update fields

### December 27, 2025
- Fixed EAS build (removed ios/ from git, deleted conflicting app.json)
- Added font scaling fixes (maxFontSizeMultiplier on all text)
- Created API test suite (auth, analysis, chat, health)
- Created mobile component test suite
- Configured autonomous TestFlight submission
- Added App Store metadata via AppStorePrep
- Submitted build 3 to TestFlight

### December 26, 2025
- Implemented RAG for AI conversations
- Added website content extraction to analysis
- Enhanced AI system prompts with business context
- Set up Storybook for component development

## Next Steps

1. **TestFlight Testing** - Test the app via TestFlight once Apple processing completes
2. **Screenshots** - Generate App Store screenshots
3. **Android** - Configure Android build and Play Store submission
4. **App Store Review** - Submit for App Store review after TestFlight validation

## Commands Quick Reference

```bash
# Build iOS for TestFlight
cd apps/mobile && eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --latest --non-interactive

# Build + Submit
eas build --platform ios --profile production --auto-submit

# Run tests
cd apps/api && poetry run pytest
cd apps/mobile && npm test

# Check build status
eas build:list --platform ios --limit 3
```

## Links

- **GitHub:** https://github.com/dbbuilder-org/quento
- **API Docs:** https://quento-api.onrender.com/docs
- **EAS Dashboard:** https://expo.dev/accounts/servicevision/projects/quento
- **App Store Connect:** https://appstoreconnect.apple.com/apps/6757098148
