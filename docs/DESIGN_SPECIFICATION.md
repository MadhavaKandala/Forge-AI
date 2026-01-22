# 🎨 100 Days Challenge — Design Specification v1.0

> **Vision**: A premium, Awwwards-caliber habit tracking experience that feels like a native app built by a top-tier design studio. Every pixel, every transition, every micro-interaction should communicate quality and delight.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing, Radius & Shadows](#spacing-radius--shadows)
5. [Core Screens](#core-screens)
   - [Main Dashboard](#1-main-dashboard)
   - [Challenge Detail Page](#2-challenge-detail-page)
   - [Code Hub](#3-code-hub)
   - [Code Check-In Flow](#4-code-check-in-flow)
6. [Motion Design System](#motion-design-system)
7. [Component Library](#component-library)
8. [Responsive Strategy](#responsive-strategy)
9. [Inspiration Sources](#inspiration-sources)

---

## Design Philosophy

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Depth Over Flatness** | Layered surfaces with subtle elevation, blur, and glow create dimension |
| **Celebration as Core UX** | Every milestone (streak, check-in, achievement) gets visual celebration |
| **Contextual Density** | Show what matters now; hide complexity behind progressive disclosure |
| **Dark-First Elegance** | Dark mode is the hero; light mode is a secondary, quieter experience |
| **Haptic Visual Feedback** | Micro-interactions that feel "tactile" — bounces, springs, glows |

### UI Inspiration Patterns We're Borrowing

| Pattern | Source | Usage in Our App |
|---------|--------|------------------|
| **Glass Cards** | Apple Music, Spotify | Challenge cards, stat containers |
| **Floating Bottom Bar** | Duolingo, Arc Browser | Primary CTA (Check In Now) |
| **Blurred Navigation** | Linear, Raycast | Top header with backdrop blur |
| **Glowing Accents** | Vercel, Stripe Dashboard | Active states, streaks, progress rings |
| **Sticky Summary Panels** | Notion, Figma | Challenge header that collapses on scroll |
| **Masonry Grids** | Pinterest, Unsplash | Evidence gallery in Challenge Detail |
| **Radial Progress** | Oura Ring, Apple Watch | Progress rings, completion indicators |
| **Timeline Rails** | GitHub, Linear | Journey milestones, check-in history |

---

## Color System

### Dark Mode (Primary Theme)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        COLOR HIERARCHY                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Background Layers (darkest → surface)                               │
│  ─────────────────────────────────────                               │
│  --background-deep:    hsl(225, 25%, 5%)     ← App background        │
│  --background:         hsl(225, 22%, 8%)     ← Primary background    │
│  --surface-1:          hsl(225, 20%, 11%)    ← Cards, containers     │
│  --surface-2:          hsl(225, 18%, 14%)    ← Elevated cards        │
│  --surface-3:          hsl(225, 16%, 18%)    ← Modals, popovers      │
│                                                                      │
│  Foreground (text hierarchy)                                         │
│  ────────────────────────────                                        │
│  --foreground:         hsl(220, 15%, 95%)    ← Primary text          │
│  --foreground-muted:   hsl(220, 12%, 65%)    ← Secondary text        │
│  --foreground-subtle:  hsl(220, 10%, 45%)    ← Tertiary/placeholder  │
│                                                                      │
│  Accent Colors (the soul of the app)                                 │
│  ────────────────────────────────────                                │
│  --accent-flame:       hsl(24, 100%, 55%)    ← Primary CTA, streaks  │
│  --accent-amber:       hsl(38, 95%, 55%)     ← Highlights, warnings  │
│  --accent-ember:       hsl(12, 90%, 50%)     ← Hot streaks, urgent   │
│  --accent-teal:        hsl(168, 80%, 45%)    ← Progress, success     │
│  --accent-violet:      hsl(280, 75%, 60%)    ← Legendary, special    │
│                                                                      │
│  Semantic Colors                                                     │
│  ───────────────                                                     │
│  --success:            hsl(145, 65%, 45%)    ← Check-in complete     │
│  --warning:            hsl(38, 95%, 55%)     ← Streak at risk        │
│  --error:              hsl(0, 75%, 55%)      ← Missed day, error     │
│  --info:               hsl(210, 80%, 55%)    ← Tips, info badges     │
│                                                                      │
│  Gradients                                                           │
│  ─────────                                                           │
│  --gradient-flame:     linear-gradient(135deg,                       │
│                          hsl(24, 100%, 55%) 0%,                      │
│                          hsl(38, 95%, 55%) 50%,                      │
│                          hsl(12, 90%, 50%) 100%)                     │
│                                                                      │
│  --gradient-teal:      linear-gradient(135deg,                       │
│                          hsl(168, 80%, 45%) 0%,                      │
│                          hsl(168, 90%, 35%) 100%)                    │
│                                                                      │
│  --gradient-legendary: linear-gradient(135deg,                       │
│                          hsl(280, 75%, 60%) 0%,                      │
│                          hsl(320, 70%, 55%) 100%)                    │
│                                                                      │
│  --gradient-glass:     linear-gradient(135deg,                       │
│                          hsla(0, 0%, 100%, 0.08) 0%,                 │
│                          hsla(0, 0%, 100%, 0.02) 100%)               │
│                                                                      │
│  Glass/Blur Effects                                                  │
│  ──────────────────                                                  │
│  --glass-bg:           hsla(225, 20%, 12%, 0.7)                      │
│  --glass-border:       hsla(0, 0%, 100%, 0.08)                       │
│  --glass-blur:         blur(20px)                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Category-Specific Accent Colors

Each challenge category has its own color universe:

| Category | Primary | Gradient Start | Gradient End | Glow Color |
|----------|---------|----------------|--------------|------------|
| **Code** | `hsl(215, 90%, 60%)` | `hsl(215, 90%, 60%)` | `hsl(260, 85%, 65%)` | `hsla(215, 90%, 60%, 0.4)` |
| **Fitness** | `hsl(340, 80%, 55%)` | `hsl(340, 80%, 55%)` | `hsl(10, 85%, 55%)` | `hsla(340, 80%, 55%, 0.4)` |
| **Reading** | `hsl(35, 85%, 55%)` | `hsl(35, 85%, 55%)` | `hsl(25, 90%, 50%)` | `hsla(35, 85%, 55%, 0.4)` |
| **Learning** | `hsl(280, 75%, 60%)` | `hsl(280, 75%, 60%)` | `hsl(310, 70%, 55%)` | `hsla(280, 75%, 60%, 0.4)` |
| **Creativity** | `hsl(320, 80%, 60%)` | `hsl(320, 80%, 60%)` | `hsl(280, 75%, 55%)` | `hsla(320, 80%, 60%, 0.4)` |
| **Health** | `hsl(145, 65%, 50%)` | `hsl(145, 65%, 50%)` | `hsl(168, 80%, 45%)` | `hsla(145, 65%, 50%, 0.4)` |

---

## Typography

### Font Stack

```
Display / Headlines:
  font-family: 'Satoshi', 'SF Pro Display', system-ui, sans-serif
  
  Alternative options:
  - 'Plus Jakarta Sans' (geometric, modern)
  - 'General Sans' (clean, professional)
  - 'Cabinet Grotesk' (bold, distinctive)

Body / UI Text:
  font-family: 'Inter', 'SF Pro Text', system-ui, sans-serif
  
  Features to enable:
  - font-feature-settings: 'cv01', 'cv02', 'ss01'
  - Tabular numbers for stats: font-variant-numeric: tabular-nums

Monospace (for code metrics):
  font-family: 'JetBrains Mono', 'Fira Code', monospace
```

### Type Scale (Mobile-First)

```
┌───────────────────────────────────────────────────────────────┐
│ Token              │ Mobile          │ Desktop         │ Use  │
├───────────────────────────────────────────────────────────────┤
│ --text-hero        │ 48px / 1.1      │ 72px / 1.05     │ Hero headlines │
│ --text-display     │ 32px / 1.15     │ 48px / 1.1      │ Page titles │
│ --text-heading-1   │ 24px / 1.2      │ 32px / 1.15     │ Section headers │
│ --text-heading-2   │ 20px / 1.25     │ 24px / 1.2      │ Card titles │
│ --text-heading-3   │ 16px / 1.3      │ 18px / 1.25     │ Subheadings │
│ --text-body        │ 14px / 1.5      │ 15px / 1.5      │ Body text │
│ --text-small       │ 12px / 1.4      │ 13px / 1.4      │ Captions, labels │
│ --text-micro       │ 10px / 1.3      │ 11px / 1.3      │ Badges, metadata │
├───────────────────────────────────────────────────────────────┤
│ Font Weights:                                                  │
│ --weight-regular:  400                                         │
│ --weight-medium:   500                                         │
│ --weight-semibold: 600                                         │
│ --weight-bold:     700                                         │
│ --weight-black:    900  (hero text only)                       │
└───────────────────────────────────────────────────────────────┘
```

### Typography Treatments

| Element | Style |
|---------|-------|
| **Stat Numbers** | `font-variant-numeric: tabular-nums; font-weight: 700;` |
| **Streak Count** | Display font, gradient text fill (`background-clip: text`) |
| **Labels** | Uppercase, letter-spacing: 0.05em, --text-micro |
| **Button Text** | Medium weight, slight letter-spacing for CTAs |

---

## Spacing, Radius & Shadows

### Spacing Scale (8px base)

```
--space-1:   4px     (tight)
--space-2:   8px     (compact)
--space-3:   12px    (default padding)
--space-4:   16px    (card padding)
--space-5:   20px    (section padding mobile)
--space-6:   24px    (section padding)
--space-8:   32px    (large gaps)
--space-10:  40px    (section dividers)
--space-12:  48px    (page sections)
--space-16:  64px    (hero sections)
--space-20:  80px    (desktop hero)
```

### Border Radius

```
--radius-sm:     6px     (buttons, badges)
--radius-md:     10px    (input fields, small cards)
--radius-lg:     16px    (cards, containers)
--radius-xl:     24px    (modals, large cards)
--radius-2xl:    32px    (hero sections)
--radius-full:   9999px  (pills, avatars)
```

### Shadows (Elevation System)

```
/* Subtle elevation for cards */
--shadow-sm:
  0 1px 2px hsla(0, 0%, 0%, 0.3),
  0 1px 3px hsla(0, 0%, 0%, 0.15);

/* Default card shadow */
--shadow-md:
  0 4px 6px hsla(0, 0%, 0%, 0.25),
  0 2px 4px hsla(0, 0%, 0%, 0.1);

/* Elevated modals, popovers */
--shadow-lg:
  0 10px 25px hsla(0, 0%, 0%, 0.35),
  0 6px 10px hsla(0, 0%, 0%, 0.15);

/* Floating elements */
--shadow-xl:
  0 20px 40px hsla(0, 0%, 0%, 0.4),
  0 15px 20px hsla(0, 0%, 0%, 0.2);

/* Glow shadows (accent-aware) */
--shadow-glow-flame:
  0 0 30px hsla(24, 100%, 55%, 0.3),
  0 0 60px hsla(24, 100%, 55%, 0.1);

--shadow-glow-teal:
  0 0 30px hsla(168, 80%, 45%, 0.3),
  0 0 60px hsla(168, 80%, 45%, 0.1);

--shadow-glow-category:
  0 0 30px var(--category-glow-color);
```

### Glass Effects

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

.glass-nav {
  background: hsla(225, 22%, 8%, 0.85);
  backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.06);
}
```

---

## Core Screens

---

### 1. Main Dashboard

> **Purpose**: The command center. Show what needs attention today, celebrate progress, guide users to the right challenge.

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  MOBILE (< 640px)                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 🔥 STICKY GLASS HEADER                            │              │
│  │    Today's Date • "Good morning, Alex"            │              │
│  │    [Streak Counter: 🔥 7]  [Total Days: 247]      │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  SCROLL AREA ▼                                                       │
│  ─────────────                                                       │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ ⚡ TODAY'S ACTION CARD (Hero)                      │              │
│  │                                                    │              │
│  │    "3 challenges need check-in"                   │              │
│  │                                                    │              │
│  │    ┌─────────┐ ┌─────────┐ ┌─────────┐           │              │
│  │    │ 🧑‍💻 Code │ │ 🏃 Run  │ │ 📚 Read │           │              │
│  │    │ Day 47  │ │ Day 12  │ │ Day 89  │           │              │
│  │    └─────────┘ └─────────┘ └─────────┘           │              │
│  │                                                    │              │
│  │    [ 🔥 CHECK IN NOW — Floating CTA ]            │              │
│  │                                                    │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 📊 WEEKLY STREAK GRAPH                            │              │
│  │    (Mini sparkline showing last 7 days)           │              │
│  │    ■ ■ ■ ■ □ ■ ■   <-- Today pending              │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 🎯 MY CHALLENGES (Scrollable Cards)               │              │
│  │                                                    │              │
│  │    ┌─────────────────────────────────┐            │              │
│  │    │ ◉ 100 Days of Code              │            │              │
│  │    │   Day 47/100  •  🔥 12 streak   │            │              │
│  │    │   [═══════════▒▒▒] 47%          │            │              │
│  │    │                                  │            │              │
│  │    │   Last: "Worked on React hooks" │            │              │
│  │    │   ───────────────────────────── │            │              │
│  │    │   [ View Details ]  [ Check In ]│            │              │
│  │    └─────────────────────────────────┘            │              │
│  │                                                    │              │
│  │    ┌─────────────────────────────────┐            │              │
│  │    │ ◉ 100 Days of Running           │            │              │
│  │    │   ...                            │            │              │
│  │    └─────────────────────────────────┘            │              │
│  │                                                    │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 🏆 RECENT ACHIEVEMENTS                            │              │
│  │    [ Week Warrior ] [ 30 Day Hero ] [ +2 more ]  │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ + CREATE NEW CHALLENGE                            │              │
│  │   (Subtle outline card)                           │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              │
│  ░ FIXED BOTTOM NAV                                  ░              │
│  ░ [Today] [Challenges] [Analytics] [Leaderboard] [Profile]        │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│  DESKTOP (≥ 1024px)                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ GLASS NAV BAR (fixed top)                                     │   │
│  │ [Logo]  [Today] [Challenges] [Analytics] [Hubs ▾]  [Profile]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐   │
│  │ MAIN CONTENT (60%)         │  │ STICKY SIDEBAR (40%)         │   │
│  │                             │  │                               │   │
│  │ ┌─────────────────────────┐│  │ ┌───────────────────────────┐│   │
│  │ │ HERO: Today's Summary   ││  │ │ 🔥 YOUR STATS             ││   │
│  │ │                         ││  │ │                            ││   │
│  │ │ "Wednesday, Jan 22"     ││  │ │  Combined Streak: 34 days ││   │
│  │ │ 3/5 challenges done     ││  │ │  Total Check-ins: 247     ││   │
│  │ │                         ││  │ │  Longest Streak: 56 days  ││   │
│  │ │ [═════════▒▒▒] 60%      ││  │ │  Completion Rate: 89%     ││   │
│  │ └─────────────────────────┘│  │ └───────────────────────────┘│   │
│  │                             │  │                               │   │
│  │ ┌─────────────────────────┐│  │ ┌───────────────────────────┐│   │
│  │ │ CHALLENGE GRID (2 cols) ││  │ │ 📅 WEEKLY HEATMAP         ││   │
│  │ │                         ││  │ │                            ││   │
│  │ │ ┌─────────┐ ┌─────────┐ ││  │ │  Mon ■ ■ ■ □              ││   │
│  │ │ │ Code    │ │ Fitness │ ││  │ │  Tue ■ ■ □ □              ││   │
│  │ │ │ Day 47  │ │ Day 12  │ ││  │ │  Wed ■ □ □ □              ││   │
│  │ │ └─────────┘ └─────────┘ ││  │ │  ...                       ││   │
│  │ │                         ││  │ └───────────────────────────┘│   │
│  │ │ ┌─────────┐ ┌─────────┐ ││  │                               │   │
│  │ │ │ Reading │ │ Learning│ ││  │ ┌───────────────────────────┐│   │
│  │ │ └─────────┘ └─────────┘ ││  │ │ 🏆 ACHIEVEMENTS           ││   │
│  │ └─────────────────────────┘│  │ │                            ││   │
│  │                             │  │ │  [Badge] [Badge] [Badge]  ││   │
│  │ ┌─────────────────────────┐│  │ └───────────────────────────┘│   │
│  │ │ QUICK INSIGHTS          ││  │                               │   │
│  │ │ "🔥 7-day streak on     ││  │ ┌───────────────────────────┐│   │
│  │ │  Code! Keep it going!"  ││  │ │ + NEW CHALLENGE           ││   │
│  │ └─────────────────────────┘│  │ │   (CTA Button)            ││   │
│  │                             │  │ └───────────────────────────┘│   │
│  └────────────────────────────┘  └──────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Visual Style

**Hero Card ("Today's Action")**
- Full-width on mobile, 60% on desktop
- Gradient background: subtle flame gradient at 10% opacity overlay
- Large, bold greeting text with time-aware message
- Challenge avatars as horizontal pills with category icons
- Floating CTA button with glow effect

**Challenge Cards**
- Glass morphism: `background: hsla(225, 20%, 12%, 0.7)` + backdrop blur
- Subtle border: 1px with low opacity white
- Category-colored left accent strip (3px)
- Progress bar with animated fill
- Hover state: lift + glow of category color
- Press state: scale down slightly (0.98)

**Weekly Sparkline**
- Compact bar chart showing last 7 days
- Filled bars for completed days (teal/success)
- Empty/outline bars for missed
- Pulsing glow on today's bar if incomplete

**Bottom Navigation (Mobile)**
- Fixed position, glass effect background
- 5 icons with labels
- Active state: icon filled + label bold + subtle glow under
- Inactive: outlined icon, muted text
- Safe area padding for notched devices

#### Motion Design

| Element | Animation | Timing |
|---------|-----------|--------|
| Page Load | Staggered fade-up of cards | 50ms stagger, 400ms duration |
| Challenge Cards | Scale + opacity on mount | spring(0.7, 0.8) |
| Progress Bar Fill | Width animation left-to-right | 600ms ease-out, 200ms delay |
| Streak Counter | Number count-up animation | 400ms, starts when visible |
| Hover (Card) | Scale(1.02) + glow | 200ms ease |
| Tap (Card) | Scale(0.98) | 100ms ease |
| Check-In Success | Card flash + checkmark bounce | 300ms |
| Scroll | Parallax on hero (subtle, 10%) | Tied to scroll position |

---

### 2. Challenge Detail Page

> **Purpose**: Deep dive into a single challenge. Five tabs provide different perspectives on progress.

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  MOBILE CHALLENGE DETAIL                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ STICKY HEADER (collapses on scroll)               │              │
│  │                                                    │              │
│  │  [← Back]                        [⋯ Options]      │              │
│  │                                                    │              │
│  │       ┌─────────┐                                 │              │
│  │       │  🧑‍💻     │  100 Days of Code              │              │
│  │       │ Day 47  │  "Building React skills"        │              │
│  │       │  /100   │                                 │              │
│  │       └─────────┘                                 │              │
│  │                                                    │              │
│  │  [═══════════════════▒▒▒▒▒▒▒▒▒▒▒▒▒▒] 47%         │              │
│  │                                                    │              │
│  │  🔥 12 day streak    🏆 Best: 28    📅 53 left    │              │
│  │                                                    │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ TAB BAR (horizontal scroll)                       │              │
│  │ [Today] [Progress] [Evidence] [Insights] [Community]             │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ─────────────────────────────────────────────────────              │
│                                                                      │
│  TAB CONTENT AREA (scrollable)                                       │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │                                                    │              │
│  │   (Content varies by tab - see below)             │              │
│  │                                                    │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              │
│  ░ FLOATING ACTION BUTTON                            ░              │
│  ░        [ 🔥 CHECK IN NOW ]                        ░              │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Tab Contents

##### TODAY TAB

```
┌──────────────────────────────────────┐
│ TODAY'S CHECK-IN                      │
├──────────────────────────────────────┤
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ QUICK STATS (4 cards grid)      │ │
│  │                                  │ │
│  │ ┌────────┐ ┌────────┐          │ │
│  │ │ 🔥 12  │ │ 🏆 28  │          │ │
│  │ │ Streak │ │ Best   │          │ │
│  │ └────────┘ └────────┘          │ │
│  │ ┌────────┐ ┌────────┐          │ │
│  │ │ 📅 47  │ │ 📊 85% │          │ │
│  │ │ Days   │ │ 7-day  │          │ │
│  │ └────────┘ └────────┘          │ │
│  └─────────────────────────────────┘ │
│                                       │
│  IF NOT CHECKED IN TODAY:            │
│  ┌─────────────────────────────────┐ │
│  │ CHECK-IN FORM                   │ │
│  │                                  │ │
│  │ What did you work on?           │ │
│  │ ┌───────────────────────────┐   │ │
│  │ │ [Text area with hint]    │   │ │
│  │ └───────────────────────────┘   │ │
│  │                                  │ │
│  │ Add evidence (optional)         │ │
│  │ [📷 Photo] [🔗 Link] [🎤 Voice] │ │
│  │                                  │ │
│  │ [ 🔥 COMPLETE CHECK-IN ]        │ │
│  └─────────────────────────────────┘ │
│                                       │
│  IF ALREADY CHECKED IN:              │
│  ┌─────────────────────────────────┐ │
│  │ ✅ YOU'RE ALL SET FOR TODAY!   │ │
│  │                                  │ │
│  │ "Worked on React hooks, built   │ │
│  │  custom useDebounce hook"       │ │
│  │                                  │ │
│  │ Checked in at 2:34 PM           │ │
│  │                                  │ │
│  │ [Edit] [Add More Evidence]      │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ 💡 DAILY TIP                    │ │
│  │ "Consistency beats intensity.   │ │
│  │  You've been coding for 12 days │ │
│  │  straight. That's momentum."    │ │
│  └─────────────────────────────────┘ │
│                                       │
└──────────────────────────────────────┘
```

##### PROGRESS TAB

```
┌──────────────────────────────────────┐
│ JOURNEY TIMELINE                      │
├──────────────────────────────────────┤
│                                       │
│  Day 47 of 100                        │
│  ▔▔▔▔▔▔▔▔▔▔▔▔                        │
│                                       │
│  MILESTONE TIMELINE:                  │
│  │                                    │
│  ●───── Day 100 ───── 🏆 Legend      │
│  │                     (53 days)      │
│  │                                    │
│  ○───── Day 75 ────── ⭐ Master      │
│  │                     (28 days)      │
│  │                                    │
│  ○───── Day 50 ────── 💪 Halfway     │
│  │                     (3 days!)      │
│  │                                    │
│  ●───── Day 30 ────── ✅ Committed   │
│  │      (Unlocked Jan 12)            │
│  │                                    │
│  ●───── Day 21 ────── ✅ Habit       │
│  │      (Unlocked Jan 3)             │
│  │                                    │
│  ●───── Day 7 ─────── ✅ Week One    │
│  │      (Unlocked Dec 20)            │
│  │                                    │
│  ●───── Day 1 ─────── ✅ Started!    │
│       (Dec 13, 2024)                 │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ 🏆 ACHIEVEMENTS UNLOCKED (4/8)  │ │
│  │                                  │ │
│  │ [🌟] [🔥] [💪] [🎯] [⬛] [⬛]... │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ 📊 ACTIVITY HEATMAP              │ │
│  │                                  │ │
│  │  (GitHub-style calendar)         │ │
│  │  ░░░▓▓▓▓░░▓▓▓▓▓░░▓▓▓▓░░░...    │ │
│  │                                  │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ 100-DAY GRID VIEW                │ │
│  │                                  │ │
│  │  ■■■■■■■ ■■■■■■■ ■■■■■■■        │ │
│  │  ■■■■■■■ ■■■■■■■ ■■■■■■■        │ │
│  │  ■■■■■■■ ■■■■■□□ □□□□□□□ ...    │ │
│  │                                  │ │
│  │  ■ = Done  □ = Remaining         │ │
│  └─────────────────────────────────┘ │
│                                       │
└──────────────────────────────────────┘
```

##### EVIDENCE TAB

```
┌──────────────────────────────────────┐
│ EVIDENCE GALLERY                      │
├──────────────────────────────────────┤
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ FILTER BAR                       │ │
│  │ [All] [Photos] [Links] [Notes]   │ │
│  │ Date range: [Last 30 days ▾]     │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ + ADD RETROACTIVE EVIDENCE       │ │
│  │   (For any past date)            │ │
│  └─────────────────────────────────┘ │
│                                       │
│  TIMELINE:                            │
│                                       │
│  Jan 22 (Today)                       │
│  ┌───────────────────────────────┐   │
│  │ 📝 "Worked on useDebounce..."│   │
│  │                               │   │
│  │ 🔗 github.com/alex/hooks     │   │
│  └───────────────────────────────┘   │
│                                       │
│  Jan 21                               │
│  ┌───────────────────────────────┐   │
│  │ 📷 [Screenshot of code]       │   │
│  │                               │   │
│  │ "Finally fixed that bug!"     │   │
│  └───────────────────────────────┘   │
│                                       │
│  Jan 20                               │
│  ┌───────────────────────────────┐   │
│  │ 📝 "Studied TypeScript       │   │
│  │     generics for 2 hours"     │   │
│  └───────────────────────────────┘   │
│                                       │
│  ... (infinite scroll)               │
│                                       │
└──────────────────────────────────────┘
```

##### INSIGHTS TAB

```
┌──────────────────────────────────────┐
│ DEEP ANALYTICS                        │
├──────────────────────────────────────┤
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ 📊 KEY METRICS (4 cards)         │ │
│  │                                  │ │
│  │ ┌────────┐ ┌────────┐          │ │
│  │ │ ⚡ 92  │ │ 🧠 Low │          │ │
│  │ │Produc- │ │Burnout │          │ │
│  │ │ tivity │ │ Risk   │          │ │
│  │ └────────┘ └────────┘          │ │
│  │ ┌────────┐ ┌────────┐          │ │
│  │ │ 📈 85% │ │ 🎯 Wed │          │ │
│  │ │Consist.│ │ Best   │          │ │
│  │ └────────┘ │ Day    │          │ │
│  │            └────────┘          │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ 📈 WEEKLY ACTIVITY TREND         │ │
│  │                                  │ │
│  │     ▲                            │ │
│  │   7 │    ■                      │ │
│  │   6 │  ■ ■                      │ │
│  │   5 │■ ■ ■ ■                    │ │
│  │   4 ├─────────────►             │ │
│  │     W1  W2  W3  W4              │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ 📊 BEST DAYS TO CODE             │ │
│  │                                  │ │
│  │  Mon  ████████░░ 80%            │ │
│  │  Tue  ██████░░░░ 60%            │ │
│  │  Wed  ██████████ 100%           │ │
│  │  Thu  ████████░░ 80%            │ │
│  │  Fri  ██████░░░░ 60%            │ │
│  │  Sat  ████░░░░░░ 40%            │ │
│  │  Sun  ██░░░░░░░░ 20%            │ │
│  └─────────────────────────────────┘ │
│                                       │
│  (Category-specific charts below)     │
│                                       │
│  FOR CODE CHALLENGES:                 │
│  ┌─────────────────────────────────┐ │
│  │ 🔤 LANGUAGES USED                │ │
│  │  [Pie chart: JS 45%, TS 30%...] │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ ⏱️ CODING HOURS HEATMAP          │ │
│  │  (Hour-of-day × Day-of-week)    │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ 🧠 AI INSIGHT                    │ │
│  │                                  │ │
│  │ "You're most productive on      │ │
│  │  Wednesday evenings. Your       │ │
│  │  12-day streak is your 2nd      │ │
│  │  longest ever. Keep going!"     │ │
│  └─────────────────────────────────┘ │
│                                       │
└──────────────────────────────────────┘
```

##### COMMUNITY TAB

```
┌──────────────────────────────────────┐
│ COMMUNITY                             │
├──────────────────────────────────────┤
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ 📤 SHARE YOUR PROGRESS           │ │
│  │                                  │ │
│  │  ┌─────────────────────────┐    │ │
│  │  │ [Preview Card Image]    │    │ │
│  │  │                         │    │ │
│  │  │  🧑‍💻 Day 47 of 100       │    │ │
│  │  │  100 Days of Code       │    │ │
│  │  │  🔥 12 day streak       │    │ │
│  │  │                         │    │ │
│  │  │  #100DaysOfCode         │    │ │
│  │  └─────────────────────────┘    │ │
│  │                                  │ │
│  │  [Twitter] [LinkedIn] [Copy] [↓] │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ 🏆 LEADERBOARD                   │ │
│  │                                  │ │
│  │  [By Streak] [By Days]          │ │
│  │                                  │ │
│  │  1. 🥇 CodeMaster    89 days    │ │
│  │  2. 🥈 DevNinja      76 days    │ │
│  │  3. 🥉 ReactPro      65 days    │ │
│  │  ...                            │ │
│  │  12. ⭐ You          47 days    │ │
│  │                                  │ │
│  │  [View Full Leaderboard]        │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ 👥 PEOPLE IN THIS CHALLENGE      │ │
│  │                                  │ │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │ │
│  │  │ 👤 │ │ 👤 │ │ 👤 │ │ +47│   │ │
│  │  │Alex│ │Sam │ │Jo  │ │more│   │ │
│  │  └────┘ └────┘ └────┘ └────┘   │ │
│  │                                  │ │
│  │  [View All Members]             │ │
│  └─────────────────────────────────┘ │
│                                       │
└──────────────────────────────────────┘
```

#### Visual Style (Challenge Detail)

**Sticky Header**
- Collapses to mini version on scroll (shows just icon + day count + streak)
- Category accent color in icon background
- Progress bar spans full width below
- Glass blur effect on background

**Tab Bar**
- Horizontally scrollable on mobile
- Underline indicator animated to active tab
- Icons + labels, category-colored active state
- Subtle shadow below indicating content scrolls underneath

**Floating CTA**
- Fixed at bottom, above tab bar
- Full-width pill button with gradient background
- Pulsing glow animation when incomplete
- Transforms to "✅ Done!" with success animation when complete

#### Motion Design (Challenge Detail)

| Element | Animation |
|---------|-----------|
| Header Collapse | Scale Y + fade of expanded content, smooth 200ms |
| Tab Switch | Content crossfade with subtle slide direction |
| Progress Bar | Spring animation on load, 600ms |
| Milestone Unlock | Scale bounce + glow + confetti burst |
| Stat Cards | Stagger fade-up on tab reveal |
| Evidence Cards | Masonry stagger animation |
| Leaderboard | Row cascade, 30ms stagger |
| Chart Lines | Draw-in animation (SVG stroke) |
| Check-In Success | Full-screen overlay with confetti + checkmark animation |

---

### 3. Code Hub

> **Purpose**: The dedicated universe for "100 Days of Code" participants. Show coding-specific metrics, integrations, and community.

#### Layout Structure (Mobile)

```
┌─────────────────────────────────────────────────────────────────────┐
│  CODE HUB                                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ HERO HEADER                                        │              │
│  │                                                    │              │
│  │  [← Back]                    [⚙️ Settings]         │              │
│  │                                                    │              │
│  │       🧑‍💻                                          │              │
│  │    100 DAYS OF CODE                               │              │
│  │    "Master programming through                    │              │
│  │     daily practice"                               │              │
│  │                                                    │              │
│  │    Gradient: Blue → Purple (category colors)      │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ QUICK STATS (3 cards horizontal scroll)           │              │
│  │                                                    │              │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐              │              │
│  │ │ 📊 12   │ │ 🔥 34   │ │ 💻 156  │              │              │
│  │ │ Active  │ │ Best    │ │ Total   │              │              │
│  │ │ Chall.  │ │ Streak  │ │ Hours   │              │              │
│  │ └─────────┘ └─────────┘ └─────────┘              │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 🎯 YOUR CODING PROFILE                            │              │
│  │                                                    │              │
│  │  Best Time to Code:  Evening (7-10 PM)            │              │
│  │  Avg Session:        1.5 hours                    │              │
│  │  Top Language:       TypeScript                   │              │
│  │                                                    │              │
│  │  Languages Used:                                  │              │
│  │  TypeScript  █████████░ 45%                       │              │
│  │  JavaScript  ██████░░░░ 30%                       │              │
│  │  Python      ████░░░░░░ 20%                       │              │
│  │  Other       █░░░░░░░░░ 5%                        │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ ⚡ DAILY CHALLENGES                                │              │
│  │                                                    │              │
│  │  ┌───────────────────────────────────────┐        │              │
│  │  │ 🟢 Easy: Reverse a String              │        │              │
│  │  │    Est. time: 15 min                   │        │              │
│  │  │    [Start Challenge]                   │        │              │
│  │  └───────────────────────────────────────┘        │              │
│  │                                                    │              │
│  │  ┌───────────────────────────────────────┐        │              │
│  │  │ 🟡 Medium: Two Sum                     │        │              │
│  │  │    Est. time: 30 min                   │        │              │
│  │  │    [Start Challenge]                   │        │              │
│  │  └───────────────────────────────────────┘        │              │
│  │                                                    │              │
│  │  ┌───────────────────────────────────────┐        │              │
│  │  │ 🔴 Hard: LRU Cache                     │        │              │
│  │  │    Est. time: 45 min                   │        │              │
│  │  │    [Start Challenge]                   │        │              │
│  │  └───────────────────────────────────────┘        │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 🔗 GITHUB ACTIVITY                                 │              │
│  │                                                    │              │
│  │  (GitHub contribution graph preview)              │              │
│  │  ░░▓▓▓░░▓▓▓▓░░▓▓▓▓▓░░▓▓░░░░...                  │              │
│  │                                                    │              │
│  │  This Week: 23 commits                            │              │
│  │  PRs Merged: 4                                    │              │
│  │                                                    │              │
│  │  [Connect GitHub] or [View Activity]              │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 📚 LEARNING PATH                                   │              │
│  │                                                    │              │
│  │  Your Progress:                                   │              │
│  │  [HTML/CSS ✓] → [JavaScript ✓] → [React ●] →     │              │
│  │  [TypeScript ○] → [Backend ○]                     │              │
│  │                                                    │              │
│  │  Current: React Fundamentals                      │              │
│  │  [═══════════▒▒▒] 65%                            │              │
│  │                                                    │              │
│  │  [Continue Learning]                              │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 🧑‍💻 YOUR CODE CHALLENGES                           │              │
│  │                                                    │              │
│  │  ┌───────────────────────────────────────┐        │              │
│  │  │ 100 Days of Code                       │        │              │
│  │  │ Day 47/100  🔥 12 streak              │        │              │
│  │  │ [═══════════▒▒▒] 47%                  │        │              │
│  │  └───────────────────────────────────────┘        │              │
│  │                                                    │              │
│  │  ┌───────────────────────────────────────┐        │              │
│  │  │ LeetCode Daily                         │        │              │
│  │  │ Day 12/100  🔥 5 streak               │        │              │
│  │  │ [═══▒▒▒▒▒▒▒▒▒▒▒] 12%                  │        │              │
│  │  └───────────────────────────────────────┘        │              │
│  │                                                    │              │
│  │  [+ Start New Code Challenge]                     │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Visual Style (Code Hub)

**Hero Header**
- Full-width gradient background (blue → purple)
- Large emoji icon with subtle glow
- Bold display text for hub name
- Tagline in lighter weight

**Quick Stats Cards**
- Horizontal scroll container
- Glass card with inner shadow
- Large number in display font
- Small label below
- Subtle category-colored border

**Coding Profile Section**
- List items with icons
- Progress bars for language distribution
- Animated on scroll reveal

**Daily Challenges**
- Stacked cards with difficulty color indicators
- Hover: slight lift + glow
- "Start Challenge" button with arrow icon

**GitHub Integration**
- Mini contribution graph (simplified)
- Commit count with week-over-week change indicator
- CTA to connect or view full activity

**Learning Path**
- Horizontal node timeline
- Completed = filled circle + checkmark
- Current = pulsing dot
- Upcoming = outline circle

---

### 4. Code Check-In Flow

> **Purpose**: Category-specific form that captures meaningful coding data.

#### Flow Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  CODE CHECK-IN FLOW                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STEP 1: DATE & TIME                                                 │
│  ─────────────────────                                               │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 📅 CHECK-IN FOR                                    │              │
│  │                                                    │              │
│  │    [Today - Jan 22 ▾]                             │              │
│  │                                                    │              │
│  │    (Dropdown allows past 7 days for retroactive) │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  STEP 2: HOURS CODED                                                 │
│  ───────────────────                                                 │
│  ┌───────────────────────────────────────────────────┐              │
│  │ ⏱️ HOW LONG DID YOU CODE?                          │              │
│  │                                                    │              │
│  │    ┌────────────────────────────────────────┐     │              │
│  │    │ ●───────────────────○                   │     │              │
│  │    │ 0          2.5h           12h          │     │              │
│  │    └────────────────────────────────────────┘     │              │
│  │                                                    │              │
│  │    Selected: 2.5 hours                            │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  STEP 3: LANGUAGES                                                   │
│  ─────────────────                                                   │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 💻 LANGUAGES USED (Select all that apply)         │              │
│  │                                                    │              │
│  │  [JavaScript ✓] [TypeScript ✓] [Python]          │              │
│  │  [Java] [C++] [Rust] [Go] [Ruby]                 │              │
│  │  [SQL] [HTML/CSS] [Other...]                      │              │
│  │                                                    │              │
│  │  (Pills that toggle on/off with animation)       │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  STEP 4: EVIDENCE (Optional)                                         │
│  ───────────────────────────                                         │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 🔗 ADD EVIDENCE                                    │              │
│  │                                                    │              │
│  │  GitHub Link:                                     │              │
│  │  ┌─────────────────────────────────────────┐      │              │
│  │  │ https://github.com/...                  │      │              │
│  │  └─────────────────────────────────────────┘      │              │
│  │                                                    │              │
│  │  [📷 Add Photo] [🎤 Voice Note]                   │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  STEP 5: DIFFICULTY & MOOD                                           │
│  ─────────────────────────                                           │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 🎯 HOW WAS TODAY'S CODING?                        │              │
│  │                                                    │              │
│  │  Difficulty:                                      │              │
│  │  [ Easy ] [ Medium ✓ ] [ Hard ]                  │              │
│  │                                                    │              │
│  │  Mood After:                                      │              │
│  │  [ 😤 ] [ 😐 ] [ 🙂 ] [ 😊 ✓ ] [ 🤩 ]            │              │
│  │                                                    │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  STEP 6: BLOCKERS (Optional)                                         │
│  ───────────────────────────                                         │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 🚧 ANY BLOCKERS TODAY?                            │              │
│  │                                                    │              │
│  │  [ No ] [ Yes ✓ ]                                 │              │
│  │                                                    │              │
│  │  If Yes:                                          │              │
│  │  ┌─────────────────────────────────────────┐      │              │
│  │  │ Got stuck on async/await in TypeScript.│      │              │
│  │  │ Need to review promises.               │      │              │
│  │  └─────────────────────────────────────────┘      │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  STEP 7: NOTES & GOALS                                               │
│  ─────────────────────                                               │
│  ┌───────────────────────────────────────────────────┐              │
│  │ 📝 WHAT DID YOU WORK ON?                          │              │
│  │                                                    │              │
│  │  ┌─────────────────────────────────────────┐      │              │
│  │  │ Built a custom useDebounce hook for    │      │              │
│  │  │ the search input. Also fixed a bug     │      │              │
│  │  │ in the auth flow...                    │      │              │
│  │  └─────────────────────────────────────────┘      │              │
│  │                                                    │              │
│  │  🎯 Tomorrow's Goal:                              │              │
│  │  ┌─────────────────────────────────────────┐      │              │
│  │  │ Start on the dashboard charts          │      │              │
│  │  └─────────────────────────────────────────┘      │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │                                                    │              │
│  │          [ 🔥 COMPLETE CHECK-IN ]                 │              │
│  │                                                    │              │
│  │      Gradient button with glow effect             │              │
│  │                                                    │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  SUCCESS STATE:                                                      │
│  ──────────────                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │                                                    │              │
│  │              🎉 CONFETTI BURST 🎉                 │              │
│  │                                                    │              │
│  │                    ✅                             │              │
│  │              (Large animated check)               │              │
│  │                                                    │              │
│  │            "Day 48 Complete!"                     │              │
│  │                                                    │              │
│  │            🔥 13 Day Streak!                      │              │
│  │                                                    │              │
│  │    [ 📤 Share Progress ]  [ Done ]               │              │
│  │                                                    │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
│  MILESTONE CELEBRATION (if Day 7, 21, 30, etc.):                    │
│  ───────────────────────────────────────────                        │
│  ┌───────────────────────────────────────────────────┐              │
│  │                                                    │              │
│  │              🏆 ACHIEVEMENT UNLOCKED! 🏆          │              │
│  │                                                    │              │
│  │                   [Badge Icon]                    │              │
│  │                 "WEEK WARRIOR"                    │              │
│  │                                                    │              │
│  │  "You've coded for 7 days straight. The habit    │              │
│  │   is forming. Keep building momentum!"           │              │
│  │                                                    │              │
│  │    [ 📤 Share Achievement ]  [ Continue ]        │              │
│  │                                                    │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Visual Style (Check-In Flow)

**Form Container**
- Full-screen modal or dedicated page
- Sections separated with subtle dividers
- Each section has icon + label header
- Inputs have focus states with category glow

**Slider (Hours)**
- Track with gradient fill to thumb position
- Thumb has glow + subtle shadow
- Number displays above thumb as it moves

**Language Pills**
- Default: outline with muted text
- Selected: filled with category gradient + white text
- Press: scale(0.95)
- Transition: 150ms ease

**Mood Selector**
- Large emoji buttons in row
- Selected: scale(1.2) + subtle glow ring
- Smooth spring animation on selection

**Submit Button**
- Full-width gradient button
- Disabled state: muted, no glow
- Loading state: spinner + "Saving..."
- Success: transforms to checkmark

**Success Screen**
- Full-screen overlay
- Confetti particles (50-100) burst from center
- Large checkmark scales in with bounce
- Stats fade up with stagger
- Auto-dismiss after 3s or on tap

---

## Motion Design System

### Animation Principles

| Principle | Implementation |
|-----------|----------------|
| **Purposeful** | Every animation communicates something (success, attention, transition) |
| **Fast** | 200-400ms for most transitions; never >600ms |
| **Interruptible** | Animations can be cancelled by user action |
| **Physics-based** | Use spring curves for natural feel |
| **Reduced Motion** | All animations respect `prefers-reduced-motion` |

### Animation Tokens

```javascript
// Easing curves
const EASING = {
  // Standard movements
  standard: [0.4, 0.0, 0.2, 1],      // Material Design standard
  decelerate: [0.0, 0.0, 0.2, 1],    // Enter
  accelerate: [0.4, 0.0, 1, 1],      // Exit
  
  // Expressive movements
  bounce: [0.68, -0.55, 0.265, 1.55], // Overshoot
  spring: { stiffness: 300, damping: 30 },
  
  // Subtle
  subtle: [0.25, 0.1, 0.25, 1],
};

// Duration tokens
const DURATION = {
  instant: 100,     // Button press
  fast: 200,        // Hovers, small transitions
  normal: 300,      // Card transitions, tabs
  slow: 500,        // Page transitions, modals
  celebration: 800, // Confetti, achievements
};

// Stagger delays
const STAGGER = {
  tight: 30,        // List items
  normal: 50,       // Cards
  relaxed: 80,      // Sections
};
```

### Specific Animations

#### Page Transitions
```
Entry: Fade in (opacity 0→1) + slide up (y: 20→0)
       Duration: 300ms, decelerate easing
       Stagger children at 50ms

Exit:  Fade out (opacity 1→0) + slide down (y: 0→10)
       Duration: 200ms, accelerate easing
```

#### Card Interactions
```
Hover:  Scale(1.02), shadow increase, 200ms ease
Press:  Scale(0.98), 100ms ease
Tap:    Scale(0.95) → Scale(1), 150ms with bounce
```

#### Check-In Success
```
1. Overlay fades in (200ms)
2. Confetti particles burst from center (800ms)
   - 80 particles, random colors from palette
   - Physics: gravity + random velocity
   - Fade out as they fall
3. Checkmark scales in (0→1.2→1), 400ms bounce
4. Text fades up with 50ms stagger
5. Optional: Achievement modal slides up if milestone
```

#### Streak Counter
```
When streak changes:
1. Number scales down slightly (0.8)
2. Number changes
3. Number scales up with bounce (1.2→1)
4. Brief glow pulse on container
Duration: 400ms total
```

#### Progress Bar Fill
```
On mount or update:
1. Bar starts at previous width
2. Animates to new width
3. Trailing glow effect follows fill
Duration: 600ms, decelerate easing
Delay: 200ms (after other elements)
```

#### Tab Switch
```
Underline indicator:
- Slides to new position, 200ms spring

Content:
- Old content fades out + slides opposite direction (100ms)
- New content fades in + slides from direction (200ms)
```

---

## Component Library

### Core Components

#### `<GlowingStatCard>`
**Purpose**: Display a single metric with optional glow and gradient

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number \| string | — | The stat to display |
| `label` | string | — | Description of the stat |
| `icon` | ReactNode | — | Icon component |
| `variant` | 'default' \| 'flame' \| 'teal' \| 'category' | 'default' | Color scheme |
| `glowing` | boolean | false | Whether to show glow effect |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Size variant |

**States**:
- `default`: Standard glass card with stat
- `loading`: Skeleton with shimmer
- `glowing`: Animated glow around edges
- `hover`: Slight lift + increased glow

---

#### `<StreakPill>`
**Purpose**: Compact inline streak indicator with fire icon

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | number | — | Streak count |
| `variant` | 'flame' \| 'ice' \| 'streak' | 'flame' | Color variant |
| `size` | 'sm' \| 'md' | 'sm' | Size |
| `animated` | boolean | true | Animate on change |

**States**:
- `default`: 🔥 12
- `zero`: Muted, no icon
- `milestone` (7, 21, 30, 50, 75, 100): Enhanced glow + badge

---

#### `<ProgressRing>`
**Purpose**: Circular progress indicator

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `progress` | number | — | 0-100 percentage |
| `size` | number | 120 | Diameter in pixels |
| `strokeWidth` | number | 10 | Ring thickness |
| `variant` | 'teal' \| 'flame' \| 'category' | 'teal' | Color |
| `showLabel` | boolean | true | Show % in center |
| `children` | ReactNode | — | Custom center content |

**States**:
- `animating`: Fill animates on mount
- `complete` (100%): Glow pulse + checkmark center

---

#### `<TimelineRail>`
**Purpose**: Vertical milestone timeline

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `milestones` | Milestone[] | — | Array of milestone objects |
| `currentDay` | number | — | User's current day |
| `variant` | 'default' \| 'compact' | 'default' | Display mode |

**Milestone object**:
```typescript
interface Milestone {
  day: number;
  label: string;
  icon: string;
  description: string;
  unlockedAt?: Date;
}
```

**States**:
- `completed`: Filled node, checkmark
- `current`: Pulsing node, highlighted
- `upcoming`: Outline node, muted text

---

#### `<FloatingCTA>`
**Purpose**: Bottom-fixed primary action button

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | — | Button text |
| `icon` | ReactNode | — | Leading icon |
| `variant` | 'flame' \| 'teal' \| 'category' | 'flame' | Color |
| `disabled` | boolean | false | Disabled state |
| `loading` | boolean | false | Loading state |
| `completed` | boolean | false | Show completed state |
| `onClick` | () => void | — | Click handler |

**States**:
- `default`: Gradient bg, glow, full width
- `hover`: Increased glow
- `press`: Scale down, darker
- `loading`: Spinner, "Saving..."
- `completed`: "✅ Done!" with success color
- `disabled`: Muted, no glow

---

#### `<GlassCard>`
**Purpose**: Reusable glass morphism container

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | — | Card content |
| `variant` | 'default' \| 'elevated' \| 'accent' | 'default' | Style variant |
| `padding` | 'none' \| 'sm' \| 'md' \| 'lg' | 'md' | Inner padding |
| `glow` | boolean | false | Outer glow |
| `glowColor` | string | — | Custom glow color |
| `onClick` | () => void | — | Make interactive |

---

#### `<EvidenceMasonryGrid>`
**Purpose**: Gallery layout for evidence items

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | Evidence[] | — | Array of evidence objects |
| `columns` | 2 \| 3 \| 4 | 2 | Column count |
| `gap` | number | 12 | Gap between items |
| `onItemClick` | (item) => void | — | Item click handler |

**Item types**: photo, link, note, voice

**States**:
- `loading`: Skeleton grid
- `empty`: Placeholder with upload CTA
- `loaded`: Staggered fade-in animation

---

#### `<CategoryTabs>`
**Purpose**: Tab navigation with category-aware styling

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | Tab[] | — | Tab definitions |
| `activeTab` | string | — | Current tab ID |
| `onChange` | (tabId) => void | — | Tab change handler |
| `category` | ChallengeCategory | — | For color theming |
| `variant` | 'underline' \| 'pills' | 'underline' | Style |

---

#### `<HeatmapGrid>`
**Purpose**: GitHub-style activity visualization

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | HeatmapData[] | — | Day activity data |
| `weeks` | number | 12 | Number of weeks to show |
| `variant` | 'teal' \| 'flame' \| 'mood' | 'teal' | Color scheme |
| `showLegend` | boolean | true | Show intensity legend |
| `onDayClick` | (date) => void | — | Day click handler |

---

#### `<MoodSelector>`
**Purpose**: Emoji-based mood input

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | Mood \| null | — | Selected mood |
| `onChange` | (mood) => void | — | Change handler |
| `moods` | Mood[] | DEFAULT_MOODS | Available moods |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Size |

**Moods**: 😤 frustrated, 😐 neutral, 🙂 okay, 😊 good, 🤩 great

---

#### `<ConfettiBurst>`
**Purpose**: Celebration animation overlay

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | boolean | — | When true, fires confetti |
| `particleCount` | number | 80 | Number of particles |
| `colors` | string[] | FLAME_COLORS | Particle colors |
| `origin` | { x, y } | center | Burst origin |
| `onComplete` | () => void | — | Callback when done |

---

#### `<AchievementModal>`
**Purpose**: Milestone celebration dialog

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | boolean | — | Visibility |
| `achievement` | Achievement | — | Achievement data |
| `onClose` | () => void | — | Close handler |
| `onShare` | () => void | — | Share handler |

---

## Responsive Strategy

### Breakpoints

```
--screen-sm: 640px   (Mobile landscape / Large phones)
--screen-md: 768px   (Tablets)
--screen-lg: 1024px  (Desktop)
--screen-xl: 1280px  (Large desktop)
--screen-2xl: 1536px (Ultra-wide)
```

### Mobile-First Patterns

| Pattern | Mobile (< 640px) | Tablet (640-1024px) | Desktop (≥ 1024px) |
|---------|------------------|---------------------|---------------------|
| **Navigation** | Bottom fixed bar | Bottom fixed bar | Top navbar |
| **Layout** | Single column | 2 columns | 3 columns / sidebar |
| **Cards** | Full width, stacked | 2-column grid | 3-4 column grid |
| **Challenge Detail** | Full screen | Full screen | Side panel or modal |
| **Stats** | Horizontal scroll | 2x2 grid | 4-column row |
| **Charts** | Full width, compact | Full width | Larger, more labels |
| **Tabs** | Horizontal scroll | Full visible | Full visible |
| **Forms** | Full screen | Card modal | Slide-over panel |

### Touch Targets

- Minimum tap target: 44×44px (iOS) / 48×48dp (Android)
- Spacing between targets: ≥8px
- Primary CTAs: Full width on mobile

### Safe Areas

```css
/* Bottom navigation safe area */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* Notch-aware header */
.header {
  padding-top: env(safe-area-inset-top, 0);
}
```

---

## Inspiration Sources

### Awwwards / SaaS Dashboards
- **Linear**: Clean, minimal, great use of keyboard shortcuts indicators
- **Vercel**: Dark mode done right, subtle gradients, excellent typography
- **Stripe Dashboard**: Information hierarchy, progressive disclosure
- **Raycast**: Glass effects, command palette, native feel

### Habit / Streak Apps (Dribbble)
- **Duolingo**: Streak celebration, character personality, daily engagement
- **Streaks app**: Minimal, circular progress, satisfying completion
- **Habitica**: Gamification, achievements, level progression
- **Forest**: Focus on single action, growth metaphor

### Patterns We're Borrowing

| Pattern | Source | Our Usage |
|---------|--------|-----------|
| Glass cards with blur | Apple Music | Challenge cards, stats |
| Floating pill navigation | Arc Browser | Mobile bottom nav |
| Glow on interactive elements | Vercel | Buttons, progress, streaks |
| Skeleton loading | Linear | All loading states |
| Command-K palette | Raycast | Quick actions (future) |
| Confetti celebrations | Duolingo | Check-ins, milestones |
| Streak fire animation | Snapchat | Streak counter |
| Activity heatmap | GitHub | Progress visualization |
| Radial progress | Apple Watch | Progress rings |
| Sticky summary header | Notion | Challenge detail collapse |

---

## Implementation Notes

### CSS Variables Setup
All colors, spacing, and effects should be defined as CSS custom properties in `:root` and `.dark` for easy theming.

### Animation Library
Use Framer Motion for React component animations and GSAP for complex sequences (confetti, scroll-triggered).

### Component Organization
```
src/
├── components/
│   ├── ui/           # Primitives (Button, Input, Card)
│   ├── features/     # Feature components (CheckInForm, ProgressRing)
│   ├── layout/       # Layout components (GlassCard, FloatingCTA)
│   └── animations/   # Animation components (ConfettiBurst)
├── styles/
│   ├── tokens.css    # Design tokens
│   └── animations.css # Keyframes
└── hooks/
    ├── useScrollAnimation.ts
    └── useReducedMotion.ts
```

### Performance Considerations
- Use `will-change` sparingly, only on actively animating elements
- Prefer `transform` and `opacity` for animations (GPU-accelerated)
- Lazy load non-critical animations
- Respect `prefers-reduced-motion`

---

## Summary

This design specification provides a comprehensive blueprint for transforming the 100 Days Challenge app into an Awwwards-caliber product. The key differentiators are:

1. **Dark-first glass morphism** that feels premium and modern
2. **Category-aware theming** that gives each challenge type its own identity
3. **Celebration-driven UX** where every milestone feels rewarding
4. **Micro-interactions** that make the app feel alive and responsive
5. **Progressive disclosure** that doesn't overwhelm but invites exploration

The next step is to implement these specifications component by component, starting with the design tokens and core primitives, then building up to the full screens.
