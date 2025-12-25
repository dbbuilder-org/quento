# Product Requirements Document (PRD)
## Quento Mobile Application

**Version:** 1.0
**Last Updated:** December 2025
**Author:** Chris Therriault
**AI Development Partner:** ServiceVision (https://www.servicevision.net)

---

## 1. Executive Summary

### 1.1 Product Vision
Quento Mobile transforms the renowned Quento design agency experience into an AI-powered mobile platform that helps businesses maximize their impact through optimized web presence and marketing strategy. Using the metaphor of "rings in a tree" representing cumulative growth, the app guides users through a journey from self-discovery to strategic optimization.

### 1.2 Problem Statement
Small to medium businesses struggle to:
- Articulate their brand story effectively
- Understand their current digital presence objectively
- Develop coherent web and marketing strategies
- Access affordable, expert-level strategic guidance

### 1.3 Solution
An AI-powered conversational platform that:
- Mirrors Quento's premium design aesthetic and storytelling philosophy
- Engages users in meaningful conversations about their business
- Automatically analyzes their existing web presence
- Generates actionable, personalized marketing and web optimization strategies

---

## 2. Target Users

### 2.1 Primary Personas

#### Persona 1: The Emerging Entrepreneur
- **Demographics:** Age 25-40, launching or running a business < 3 years
- **Goals:** Establish online presence, find their voice, attract first customers
- **Pain Points:** Limited budget, overwhelmed by options, unclear direction
- **Tech Comfort:** High - comfortable with mobile apps and digital tools

#### Persona 2: The Growth-Stage Business Owner
- **Demographics:** Age 35-55, established business seeking expansion
- **Goals:** Optimize existing presence, scale marketing efforts, increase ROI
- **Pain Points:** Stagnant growth, unclear what's working, need fresh perspective
- **Tech Comfort:** Moderate - uses business tools but not a power user

#### Persona 3: The Rebranding Professional
- **Demographics:** Age 30-50, business undergoing transition or pivot
- **Goals:** Reposition brand, update messaging, reach new markets
- **Pain Points:** Legacy brand confusion, unclear new direction, competitive pressure
- **Tech Comfort:** Moderate to High

### 2.2 User Journey Map

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY: THE FIVE RINGS                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  AWARENESS        ENGAGEMENT         ANALYSIS          STRATEGY       ACTION  │
│      │                │                  │                │             │     │
│      ▼                ▼                  ▼                ▼             ▼     │
│  ┌───────┐       ┌─────────┐       ┌──────────┐    ┌──────────┐   ┌────────┐ │
│  │Discover│──────▶│Tell Your│──────▶│AI Reads  │────▶│Strategic │───▶│Action  │ │
│  │  App   │       │  Story  │       │Your Site │    │  Plan    │   │ Items  │ │
│  └───────┘       └─────────┘       └──────────┘    └──────────┘   └────────┘ │
│      │                │                  │                │             │     │
│   Ring 1           Ring 2             Ring 3          Ring 4        Ring 5    │
│   CORE            DISCOVER            PLAN           EXECUTE       OPTIMIZE   │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Feature Requirements

### 3.1 Core Features (MVP)

#### F1: Onboarding Experience
- **Priority:** P0 (Critical)
- **Description:** Visually stunning onboarding that mirrors Quento's design aesthetic
- **Requirements:**
  - Animated tree ring visualization introducing the growth concept
  - "Story First" messaging aligned with Quento brand
  - Quick account creation (email, Google, Apple Sign-In)
  - Skip option for exploration mode

#### F2: Business Story Capture (Ring 1 - Core)
- **Priority:** P0 (Critical)
- **Description:** AI-powered conversational interface to understand the user's business
- **Requirements:**
  - Natural language chat interface
  - Guided prompts for business type, values, goals
  - Option to share existing website URL
  - Voice input support
  - Progress indicator showing journey through rings

#### F3: Web Presence Analysis (Ring 2 - Discover)
- **Priority:** P0 (Critical)
- **Description:** Automated analysis of user's existing website and online presence
- **Requirements:**
  - URL input with validation
  - Real-time scraping and analysis via backend
  - Competitive landscape discovery
  - Social media presence detection
  - SEO baseline assessment
  - Visual report generation

#### F4: AI Strategy Generation (Ring 3 - Plan)
- **Priority:** P0 (Critical)
- **Description:** LangChain-powered strategic recommendations
- **Requirements:**
  - Personalized recommendations based on conversation + analysis
  - Web presence optimization priorities
  - Content strategy suggestions
  - Marketing channel recommendations
  - Competitive differentiation opportunities
  - Budget-conscious options

#### F5: Action Planning (Ring 4 - Execute)
- **Priority:** P1 (High)
- **Description:** Actionable implementation checklist
- **Requirements:**
  - Prioritized task list
  - Effort/impact scoring
  - Resource requirement estimates
  - Export to common task managers
  - Progress tracking

#### F6: Growth Dashboard (Ring 5 - Optimize)
- **Priority:** P1 (High)
- **Description:** Ongoing optimization and tracking
- **Requirements:**
  - Key metrics visualization
  - Periodic re-analysis capability
  - Trend tracking over time
  - New recommendation generation
  - Goal setting and tracking

### 3.2 Secondary Features (Post-MVP)

#### F7: Quento Portfolio Showcase
- **Priority:** P2 (Medium)
- **Description:** Mirror of Quento.co portfolio within the app
- **Requirements:**
  - Project gallery with imagery
  - Case study deep dives
  - Inspiration categorization
  - Save favorites functionality

#### F8: Expert Connection
- **Priority:** P2 (Medium)
- **Description:** Bridge to Quento's professional services
- **Requirements:**
  - Contact form integration
  - Project inquiry submission
  - Calendar booking integration
  - Quote request functionality

#### F9: Community & Learning
- **Priority:** P3 (Low)
- **Description:** Educational content and peer connection
- **Requirements:**
  - Strategy tips and articles
  - Success stories
  - Community forums
  - Expert Q&A sessions

---

## 4. User Interface Requirements

### 4.1 Design Principles
1. **Story First** - Every screen tells a story
2. **Clean & Minimal** - High whitespace, focused content
3. **Visual Discovery** - Images over text where possible
4. **Progressive Disclosure** - Reveal complexity gradually
5. **Conversational** - Friendly, approachable tone

### 4.2 Brand Alignment
- Mirror Quento.co color palette (clean whites, subtle accents)
- Typography: Modern, readable sans-serif
- Imagery: High-quality, curated visuals
- Animations: Smooth, purposeful transitions

### 4.3 Accessibility
- WCAG 2.1 AA compliance minimum
- VoiceOver/TalkBack full support
- Dynamic type support
- High contrast mode
- Reduced motion option

---

## 5. Technical Requirements

### 5.1 Platform Support
- iOS 14.0+
- Android 10.0+ (API 29)
- Tablet-optimized layouts

### 5.2 Performance Targets
- App launch: < 2 seconds
- Screen transitions: < 300ms
- AI response initiation: < 1 second
- Full analysis completion: < 60 seconds

### 5.3 Offline Capabilities
- Cached previous analyses
- Offline conversation history
- Queued actions when reconnected

### 5.4 Security & Privacy
- End-to-end encryption for conversations
- GDPR/CCPA compliance
- Data retention controls
- Secure credential storage
- No third-party data sharing without consent

---

## 6. Success Metrics

### 6.1 Engagement Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| DAU/MAU Ratio | > 25% | Analytics |
| Session Duration | > 8 min | Analytics |
| Conversations Completed | > 60% | Funnel |
| Analysis Requested | > 75% of onboarded | Funnel |

### 6.2 Outcome Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Strategy Generation | > 80% satisfaction | Survey |
| Action Items Started | > 50% | Tracking |
| Return for Re-analysis | > 30% within 30 days | Analytics |
| Quento Inquiry Rate | > 5% | CRM |

### 6.3 Business Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| App Store Rating | > 4.5 stars | Store |
| Organic Growth | > 20% MoM | Analytics |
| CAC | < $15 | Marketing |
| LTV | > $50 | Revenue |

---

## 7. Constraints & Assumptions

### 7.1 Constraints
- Initial launch: English only
- AI costs must be managed per-user
- Backend must scale elastically
- Must work on 4G connections

### 7.2 Assumptions
- Users have an existing website or clear business concept
- Users are motivated to improve their digital presence
- AI analysis quality will improve over time
- Quento brand licensing is approved

### 7.3 Dependencies
- LiteLLM API availability
- Web scraping legal compliance per jurisdiction
- App store approval processes
- Backend hosting reliability

---

## 8. Appendices

### Appendix A: Competitive Analysis
| Competitor | Strengths | Weaknesses | Differentiation |
|------------|-----------|------------|-----------------|
| Wix ADI | Easy website creation | Generic results | Story-first approach |
| HubSpot | Comprehensive marketing | Complex, expensive | Conversational UX |
| Canva | Visual design | No strategy | Strategic focus |
| ChatGPT | Flexible AI | No specialization | Domain expertise |

### Appendix B: Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI hallucination | Medium | High | Validation layers, human review option |
| Scraping blocked | Medium | Medium | Multiple scraping strategies, manual input fallback |
| Cost overrun | Low | High | Usage caps, tiered access |
| Low adoption | Medium | High | Strong launch marketing, referral program |

---

*Document maintained by ServiceVision AI Development Team*
