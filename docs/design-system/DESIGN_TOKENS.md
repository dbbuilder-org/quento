# Quento Design Tokens
## Figma-Synced Design System

**Version:** 1.0
**Last Updated:** December 2025
**AI Development Partner:** ServiceVision (https://www.servicevision.net)

---

## Overview

This document defines the design tokens used across the Quento platform. These tokens are the single source of truth for all design values and are synced between:

- **Figma** (Design tool)
- **Storybook** (Component documentation)
- **React Native** (Mobile app)
- **Web** (Future dashboard)

### Token Naming Convention

```
{category}.{property}.{variant}

Examples:
- color.primary.forest
- spacing.lg
- typography.body.fontSize
- radius.md
```

---

## 1. Color Tokens

### 1.1 Primary Colors

| Token ID | Name | Hex Value | RGB | Usage |
|----------|------|-----------|-----|-------|
| `color.primary.carbon` | Carbon | #1A1A1A | rgb(26, 26, 26) | Primary text, headings |
| `color.primary.forest` | Forest | #2D5A3D | rgb(45, 90, 61) | Primary brand, CTAs, active states |
| `color.primary.sage` | Sage | #4A7C5C | rgb(74, 124, 92) | Secondary accent, links |
| `color.primary.pure` | Pure | #FFFFFF | rgb(255, 255, 255) | Backgrounds, text on dark |

### 1.2 Secondary Colors

| Token ID | Name | Hex Value | RGB | Usage |
|----------|------|-----------|-----|-------|
| `color.secondary.bark` | Bark | #8B7355 | rgb(139, 115, 85) | Warm accents, inactive states |
| `color.secondary.sand` | Sand | #D4C4A8 | rgb(212, 196, 168) | Subtle backgrounds |
| `color.secondary.cream` | Cream | #F5F3EF | rgb(245, 243, 239) | Card surfaces, AI bubbles |
| `color.secondary.parchment` | Parchment | #E8E4DD | rgb(232, 228, 221) | Dividers, borders |

### 1.3 Semantic Colors

| Token ID | Name | Hex Value | Usage |
|----------|------|-----------|-------|
| `color.semantic.success` | Success | #2D7D46 | Completed states, positive feedback |
| `color.semantic.warning` | Warning | #D4A84B | Caution states, medium priority |
| `color.semantic.error` | Error | #C75450 | Error states, high priority, destructive |
| `color.semantic.info` | Info | #4A90A4 | Informational, neutral highlights |

### 1.4 Color Usage in Figma

```
Figma Style Naming:
├── Primary/
│   ├── Carbon
│   ├── Forest
│   ├── Sage
│   └── Pure
├── Secondary/
│   ├── Bark
│   ├── Sand
│   ├── Cream
│   └── Parchment
└── Semantic/
    ├── Success
    ├── Warning
    ├── Error
    └── Info
```

---

## 2. Typography Tokens

### 2.1 Font Families

| Token ID | Font Family | Fallback | Usage |
|----------|-------------|----------|-------|
| `font.family.display` | Playfair Display | Georgia, serif | Display headlines, hero text |
| `font.family.body` | Inter | SF Pro, system-ui | Body text, UI elements |
| `font.family.mono` | JetBrains Mono | Menlo, monospace | Code, technical data |

### 2.2 Type Scale

| Token ID | Size | Line Height | Weight | Letter Spacing | Usage |
|----------|------|-------------|--------|----------------|-------|
| `typography.displayLarge` | 48px | 56px | 300 | -0.5% | Hero headlines |
| `typography.displayMedium` | 36px | 44px | 400 | -0.5% | Section headlines |
| `typography.headlineLarge` | 32px | 40px | 600 | -0.5% | Page titles |
| `typography.headlineMedium` | 28px | 36px | 600 | -0.25% | Section titles |
| `typography.titleLarge` | 22px | 28px | 600 | 0% | Card titles |
| `typography.titleMedium` | 18px | 24px | 500 | 0% | Subsection titles |
| `typography.bodyLarge` | 17px | 24px | 400 | 0% | Primary body text |
| `typography.body` | 15px | 22px | 400 | 0% | Standard body text |
| `typography.bodySmall` | 13px | 18px | 400 | 0.1% | Secondary text |
| `typography.labelLarge` | 14px | 20px | 500 | 0.1% | Form labels |
| `typography.labelMedium` | 12px | 16px | 500 | 0.5% | Small labels |
| `typography.caption` | 11px | 14px | 400 | 0.5% | Captions, timestamps |

### 2.3 Typography in Figma

```
Figma Text Styles:
├── Display/
│   ├── Display Large
│   └── Display Medium
├── Headline/
│   ├── Headline Large
│   └── Headline Medium
├── Title/
│   ├── Title Large
│   └── Title Medium
├── Body/
│   ├── Body Large
│   ├── Body
│   └── Body Small
├── Label/
│   ├── Label Large
│   └── Label Medium
└── Caption
```

---

## 3. Spacing Tokens

### 3.1 Spacing Scale (4px base)

| Token ID | Value | Pixels | Usage |
|----------|-------|--------|-------|
| `spacing.xs` | 1 unit | 4px | Tight element spacing |
| `spacing.sm` | 2 units | 8px | Related element groups |
| `spacing.md` | 3 units | 12px | Standard padding |
| `spacing.lg` | 4 units | 16px | Card internal padding |
| `spacing.xl` | 5 units | 20px | Section breaks |
| `spacing.2xl` | 6 units | 24px | Component separation |
| `spacing.3xl` | 8 units | 32px | Major section gaps |
| `spacing.4xl` | 10 units | 40px | Page margins |
| `spacing.5xl` | 12 units | 48px | Large separations |
| `spacing.6xl` | 16 units | 64px | Hero spacing |

### 3.2 Spacing Usage

```
Layout Example:
┌─────────────────────────────────────────┐
│              spacing.4xl (40px)          │ ← Page top margin
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │        spacing.lg (16px)        │   │ ← Card padding
│  │  ┌───────────────────────────┐  │   │
│  │  │    spacing.md (12px)      │  │   │ ← Element spacing
│  │  └───────────────────────────┘  │   │
│  └─────────────────────────────────┘   │
│              spacing.2xl (24px)         │ ← Between cards
│  ┌─────────────────────────────────┐   │
│  │          Next Card              │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 4. Border Radius Tokens

| Token ID | Value | Usage |
|----------|-------|-------|
| `radius.xs` | 4px | Small elements (badges, tags) |
| `radius.sm` | 8px | Inputs, small buttons |
| `radius.md` | 12px | Cards, panels |
| `radius.lg` | 16px | Large cards, modals |
| `radius.xl` | 20px | Chat bubbles |
| `radius.full` | 9999px | Pills, circular buttons, avatars |

---

## 5. Shadow Tokens

### 5.1 Elevation Scale

| Token ID | Values | Usage |
|----------|--------|-------|
| `shadow.sm` | 0 1px 4px rgba(0,0,0,0.04) | Subtle elevation (cards) |
| `shadow.md` | 0 2px 8px rgba(0,0,0,0.08) | Standard elevation (dropdowns) |
| `shadow.lg` | 0 4px 16px rgba(0,0,0,0.12) | High elevation (modals) |

### 5.2 Shadow in CSS/RN

```css
/* CSS */
.shadow-sm { box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.shadow-md { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.shadow-lg { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
```

```typescript
// React Native
shadow.sm = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 2,
  elevation: 1,
}
```

---

## 6. Animation Tokens

| Token ID | Duration | Easing | Usage |
|----------|----------|--------|-------|
| `animation.fast` | 150ms | ease-out | Micro-interactions (hover, active) |
| `animation.normal` | 200ms | ease-in-out | Standard transitions |
| `animation.slow` | 300ms | ease-in-out | Page transitions, modals |
| `animation.ring` | 800ms | ease-out | Ring progress animation |

---

## 7. Component Tokens

### 7.1 Button Tokens

| Token ID | Value | Notes |
|----------|-------|-------|
| `button.height.default` | 52px | Primary buttons |
| `button.height.small` | 44px | Secondary buttons |
| `button.radius` | 26px | Full rounded |
| `button.paddingX` | 24px | Horizontal padding |

### 7.2 Input Tokens

| Token ID | Value | Notes |
|----------|-------|-------|
| `input.height` | 52px | Standard height |
| `input.radius` | 12px | Border radius |
| `input.paddingX` | 16px | Horizontal padding |
| `input.background` | #F5F3EF | Cream background |

### 7.3 Card Tokens

| Token ID | Value | Notes |
|----------|-------|-------|
| `card.radius` | 16px | Corner radius |
| `card.padding` | 16px | Internal padding |
| `card.shadow` | shadow.sm | Default elevation |

---

## 8. Figma Setup Instructions

### 8.1 Creating the Token Library

1. **Create a new Figma file** named "Quento Design Tokens"
2. **Set up color styles** following the naming convention above
3. **Create text styles** for each typography token
4. **Create effect styles** for shadows
5. **Use variables** for spacing and radius tokens

### 8.2 Syncing with Tokens Studio

1. Install the **Tokens Studio for Figma** plugin
2. Import the `design-tokens.json` file
3. Apply tokens to your designs
4. Export updates back to JSON

### 8.3 Token JSON Format

```json
{
  "color": {
    "primary": {
      "carbon": { "value": "#1A1A1A", "type": "color" },
      "forest": { "value": "#2D5A3D", "type": "color" },
      "sage": { "value": "#4A7C5C", "type": "color" },
      "pure": { "value": "#FFFFFF", "type": "color" }
    }
  },
  "spacing": {
    "xs": { "value": "4", "type": "spacing" },
    "sm": { "value": "8", "type": "spacing" },
    "md": { "value": "12", "type": "spacing" },
    "lg": { "value": "16", "type": "spacing" }
  }
}
```

---

## 9. Storybook Integration

See `apps/mobile/.storybook/` for Storybook configuration.

Components are documented with:
- All token variants
- Interactive controls
- Usage examples
- Accessibility notes

---

*Design System maintained by ServiceVision AI Development Team*
