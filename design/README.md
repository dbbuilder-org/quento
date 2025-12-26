# Quento Design System

This folder contains the complete design system documentation for the Quento mobile app, formatted for Figma integration.

## Files

### tokens.json
Design tokens in [DTCG (Design Tokens Community Group)](https://design-tokens.github.io/community-group/format/) format, compatible with Figma's Variables feature and tools like [Tokens Studio](https://tokens.studio/).

**Contains:**
- Colors (primary, secondary, semantic, transparency)
- Spacing scale (xs to 6xl)
- Typography styles (display, headline, title, body, label, caption)
- Border radius values
- Shadow definitions
- Animation durations

### components.json
Complete component library specifications detailing every UI component used in the app.

**Contains:**
- Component variants and states
- Sizing and spacing
- Color references (linked to tokens)
- Interaction states (pressed, disabled, loading)
- Animation behaviors

**Key Components:**
- Button (primary, secondary, tertiary)
- Input (with label, helper text, error states)
- Card (default, elevated, outlined, filled)
- ChatBubble (user, assistant)
- RingVisualization (growth progress)
- Badge, Checkbox, FilterTab
- Skeleton loaders
- And many more...

### pages.json
Page-by-page layout specifications for every screen in the app.

**Contains:**
- Screen layouts with sections
- Navigation structure (tab bar)
- State variations (empty, loading, ready)
- Content hierarchy
- Animation specifications
- Modal configurations

**Pages Documented:**
- Login / Register (auth flow)
- Discover (Ring 2: analysis)
- Home/Chat (Ring 1: conversation)
- Plan (Ring 3: strategy)
- Execute (Ring 4: action items)
- Optimize (Ring 5: dashboard)

## Usage with Figma

### Option 1: Tokens Studio Plugin
1. Install [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978)
2. Import `tokens.json` as your token source
3. Tokens will be available as Figma Variables

### Option 2: Manual Setup
1. Create a new Figma Variables collection
2. Use the token values from `tokens.json` to define:
   - Color variables
   - Number variables (spacing, radius)
   - Typography styles

### Option 3: Figma Dev Mode
Share these JSON files with developers for accurate implementation specs via Figma Dev Mode annotations.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `color.primary.carbon` | #1A1A1A | Primary text, headings |
| `color.primary.forest` | #2D5A3D | Brand color, CTAs |
| `color.primary.sage` | #4A7C5C | Secondary actions, links |
| `color.primary.pure` | #FFFFFF | Backgrounds, cards |
| `color.secondary.bark` | #8B7355 | Tertiary text, icons |
| `color.secondary.sand` | #D4C4A8 | Disabled states, borders |
| `color.secondary.cream` | #F5F3EF | Page backgrounds, inputs |
| `color.secondary.parchment` | #E8E4DD | Subtle backgrounds |
| `color.semantic.success` | #2D7D46 | Success states |
| `color.semantic.warning` | #D4A84B | Warning states |
| `color.semantic.error` | #C75450 | Error states |
| `color.semantic.info` | #4A90A4 | Informational |

## Typography Scale

| Style | Font | Size | Weight | Use |
|-------|------|------|--------|-----|
| displayLarge | Playfair Display | 48px | 300 | Hero headlines |
| displayMedium | Playfair Display | 36px | 400 | Page titles |
| headlineLarge | Inter | 32px | 600 | Section headings |
| headlineMedium | Inter | 28px | 600 | Card titles |
| titleLarge | Inter | 22px | 600 | Component titles |
| titleMedium | Inter | 18px | 500 | Button labels |
| bodyLarge | Inter | 17px | 400 | Primary body |
| body | Inter | 15px | 400 | Standard text |
| bodySmall | Inter | 13px | 400 | Secondary text |
| labelLarge | Inter | 14px | 500 | Form labels |
| labelMedium | Inter | 12px | 500 | Badges, chips |
| caption | Inter | 11px | 400 | Timestamps |

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight gaps |
| sm | 8px | List items |
| md | 12px | Standard padding |
| lg | 16px | Card padding |
| xl | 20px | Section breaks |
| 2xl | 24px | Component separation |
| 3xl | 32px | Major section gaps |
| 4xl | 40px | Page margins |
| 5xl | 48px | Hero spacing |
| 6xl | 64px | Maximum spacing |

## Ring System

Quento uses a "tree ring" metaphor for user progress:

1. **Core** - Your story (Chat)
2. **Discover** - Web presence analysis
3. **Plan** - Strategy development
4. **Execute** - Action items
5. **Optimize** - Growth dashboard

Each ring is represented visually in the RingVisualization component and tracked throughout the user journey.

## Storybook Integration

The codebase includes Storybook stories for key components:
- `apps/mobile/components/ui/Button.stories.tsx`

Use these alongside the design specs for accurate component documentation.

## Device Targets

- **Primary:** iPhone 15 Pro (393 x 852)
- **Safe Area Top:** 59px
- **Safe Area Bottom:** 34px
- **Tab Bar Height:** 83px

## Questions?

Contact the development team for clarification on any design specifications.
