# 100 Days Challenge — Complete Project Documentation

> **App ID:** `com.hundreddays.app`  
> **Stack:** React 18 + TypeScript + Vite + TailwindCSS v4 + Capacitor (Android)  
> **Local Database:** CapacitorSQLite (`blitzit_db`)  
> **State Management:** Zustand (with `persist` middleware)

---

## 1. What This App Is

**100 Days Challenge** is a personal life-operating system built as a mobile-first (Android) Progressive Web App (PWA). Its core philosophy is to help a student/developer take full control of their day — tracking habits, crushing tasks, logging deep work, following self-improvement programs, and always knowing *what to do next*.

It is **not** a generic to-do app. It is a **discipline engine** tailored around a highly structured day that spans:

- Early morning coding sessions
- Gym and physical training
- College academic blocks
- Evening study and self-development routines
- Devotional practices (Bhagavad Gita, meditation, prayer)

The name reflects the classic "100 Days of X" challenge methodology — but extended to cover **every pillar of life simultaneously**.

---

## 2. Developer's Main Aim & Purpose

> *"I want an app that runs my life — not just my tasks."*

The developer (Madhava Kandala) built this app for himself, with the following goals:

| Goal | Implementation |
|---|---|
| **Never waste time deciding what to do** | `WhatNextPage` — an algorithmic task suggester |
| **Build unbreakable habits** | Habit tracker with streaks, XP, and heatmaps |
| **Deep focus work sessions** | Blitz Mode + Pomodoro with Focus Mode overlay |
| **Follow structured programs** | 7 pre-built multi-phase programs (LeetCode, Gym, Gita, etc.) |
| **Voice-driven input** | Voice Note page to add tasks hands-free |
| **Data persistence offline** | SQLite via Capacitor for full offline-first storage |
| **Gamification to stay motivated** | XP, levels, streaks, achievement badges |
| **Schedule awareness** | Schedule page with time-block planning |

---

## 3. App Architecture

```
src/
├── App.tsx                  ← Root router (HashRouter), app-state init, notification setup
├── main.tsx                 ← Entry point, DB init, PWA setup
├── pages/                   ← Route-level screens (11 pages)
├── components/              ← Feature components + Radix UI components
│   ├── blitz/               ← Blitz mode timer & task cards
│   ├── habit-tracker/       ← Habits, schedule, tasks, analytics
│   ├── timer/               ← Pomodoro timer component
│   ├── voice/               ← Voice recorder + NLP results screen
│   ├── dashboard/           ← Charts, analytics panels
│   └── ui/                  ← shadcn/ui base components
├── store/                   ← Zustand global state (9 stores)
├── services/                ← Business logic layer (11 services)
├── repositories/            ← SQLite data access layer (7 repositories)
├── types/                   ← TypeScript interfaces (schema, task, challenge, etc.)
└── lib/
    └── db.ts                ← CapacitorSQLite singleton (DatabaseService)
```

### Data Flow

```
UI Component → Zustand Store → Service Layer → Repository → SQLite (blitzit_db)
                     ↓
              LocalStorage (persist middleware fallback)
```

---

## 4. All Application Routes

| Route | Page | Guard |
|---|---|---|
| `/onboarding` | `OnboardingPage` | Public |
| `/` | `Index` (Task Dashboard) | Protected |
| `/blitz` | `BlitzFocusPage` | Protected |
| `/pomodoro` | `PomodoroPage` | Protected |
| `/schedule` | `SchedulePage` | Protected |
| `/programs` | `ProgramsPage` | Protected |
| `/programs/:id` | `ProgramDetailPage` | Protected |
| `/what-next` | `WhatNextPage` | Protected |
| `/tasks` | `TasksPage` | Protected |
| `/voice` | `VoiceNotePage` | Protected |

**Protected routes** redirect to `/onboarding` if the user hasn't completed setup.

---

## 5. Feature Breakdown

### 5.1 Onboarding (`/onboarding`)

A 3-step first-launch flow:

1. **Privacy Consent** — displays data collection notice, agree/disagree
2. **Notification Permission** — requests local notification access via Capacitor
3. **Name Entry** — captures first + last name, writes user record to SQLite, sets `onboarding_completed = 1`

---

### 5.2 Task Dashboard — "Blitz List" (`/`)

The home screen. Inspired by minimal, military-grade productivity apps.

**Features:**
- **4 Status Buckets:** `Backlog | This Week | Today | Done`
- **List Manager:** Create/delete custom named & colored task lists (e.g., "Coding", "College")
- **Blitz Task Cards:** Each task shows estimated time, category color, status pill
- **Quick Add Task:** Bottom sheet form — title + estimated minutes + auto-assigns to active tab bucket
- **BLITZ NOW Button:** One tap launches a Blitz Focus Session for the top task
- **Unlimited Mode Toggle:** Removes task limits/filters (UI toggle, visual indicator)
- **Overall Progress Bar:** Completion ratio (done/total) with animated gradient fill
- **Real-time Sync:** Tasks persisted to SQLite, fallback to Zustand persist on DB failure

---

### 5.3 Blitz Focus Mode (`/blitz`)

An immersive, distraction-free task execution screen.

**Features:**
- **Countdown Timer:** Counts down from estimated task duration
- **Full-screen Mode:** Tap to expand timer to fullscreen with ambient glow
- **Pause/Resume/Skip controls**
- **Subtask Summary:** Shows subtask completion progress inline
- **Break Button:** Start a timed break mid-session (logged to `blitz_breaks` table)
- **DONE Button:** Marks session complete, calculates actual vs. estimated time, updates task status to `done`, navigates back to dashboard
- **Session Logging:** Every session written to `blitz_sessions` table with `started_at`, `ended_at`, `est_minutes`, `taken_minutes`, `was_completed`

---

### 5.4 Pomodoro / Deep Work Timer (`/pomodoro`)

A full-featured Pomodoro timer for structured deep work.

**Features:**
- **3 Session Modes:** Work (25 min) | Short Break (5 min) | Long Break (15 min)
- **Animated SVG Ring Timer** with glow intensity tied to active state
- **Auto-Switch:** Work → Short Break on completion
- **Focus Mode Overlay:** Full-screen black overlay with timer only + animated pulse rings + "Digital Silence Active" label
- **Today Stats Panel:** Session count, total minutes, streak
- **Session History:** Last 5 sessions with time, duration, completion dot, XP earned
- **XP Awards:** +25 XP per completed work session
- **Persistence:** Timer state (mode, timeLeft, sessionId) saved to localStorage across app restarts
- **Habit Integration:** Deep work minutes logged back to the `coding` habit's timer history via `logDeepWork()`

---

### 5.5 Smart Suggester — "What Next?" (`/what-next`)

The most unique feature. An algorithmic engine that tells you exactly what task to do right now.

**How It Works (5-step algorithm):**

1. **Context Gathering** — Current time, day of week, energy level (inferred from hour), available minutes until next scheduled event, recent completed tasks, streak
2. **Task Fetching** — Pulls all non-completed tasks from DB
3. **Actionable Filtering** — Filters tasks that fit the available time window (±15 minutes), prioritizes high-priority tasks regardless
4. **Scoring (5 dimensions):**
   - `Priority Score` (30%) — high=90, medium=60, low=30; overdue tasks → 100
   - `Time Fit Score` (25%) — how well the task duration matches available time
   - `Impact Score` (20%) — category weight (academics=95, coding=90, gym=80, etc.)
   - `Momentum Score` (15%) — streak bonus + recent category match
   - `Energy Match Score` (10%) — matches task intensity to current energy level
5. **Output Generation** — Returns #1 suggestion + 3 alternatives + reasoning bullets + optimized multi-step day plan

**UI Features:**
- Context overview cards (available time, energy level)
- Primary suggestion with score badge, reasoning list, "Why this?" section
- Start Now / Skip / Other Options action buttons
- Alternatives list with score chips
- Proposed Day Timeline (sequential plan for remaining tasks)

**Energy Level Inference by Hour:**

| Hour | Energy Level |
|---|---|
| 0–6 | Low |
| 7–8 | Waking |
| 9–11 | High |
| 12 | Dropping |
| 13 | Low |
| 14–16 | Peak |
| 17–18 | Medium |
| 19–20 | Dropping |
| 21+ | Low |

---

### 5.6 Programs (`/programs`, `/programs/:id`)

Structured multi-day self-improvement challenges with phases, milestones, and XP.

**7 Built-in Program Templates:**

| Program | Duration | Difficulty | XP Potential |
|---|---|---|---|
| LeetCode 75 Hard | 75 days | Advanced ⭐⭐⭐ | 7,500 XP |
| Gym Progress | 90 days | Intermediate ⭐⭐ | 9,000 XP |
| Bhagavad Gita Journey | 60 days | Beginner ⭐ | 4,200 XP |
| Nutrition Mastery | 45 days | Beginner ⭐ | 2,700 XP |
| Academic Excellence | 120 days | Intermediate ⭐⭐ | 10,000 XP |
| Creative Skills (Video Editing) | 60 days | Intermediate ⭐⭐ | 3,000 XP |
| Break Time Mastery | 30 days | Beginner ⭐ | 1,200 XP |

**Each Program Has:**
- 2–3 named Phases (e.g., Foundation → Hypertrophy → Power)
- Phase-specific XP per day (escalates with difficulty)
- Daily Requirements checklist
- Milestone rewards at phase end + program completion (500 XP bonus)
- Pause / Resume support
- Real-time Day counter and completion percentage

**Program Lifecycle:**
1. Start → Insert into `programs` table with `status = 'active'`, `current_day = 1`
2. Milestones auto-created per phase end day + final day
3. Daily check-in → Insert into `program_days`, update `current_day`, recalculate `completion_percentage`
4. `current_day >= total_days` → status = `completed`, `completed_at` stamped

---

### 5.7 Habit Tracker

The backbone of the daily discipline system.

**27 Pre-seeded Habits across 7 Categories:**
- **Coding:** Morning Code Session, LeetCode Daily, Code Notes
- **Gym:** Morning Gym, Post-Workout Protein, Evening Cardio, Weekly Progress Photo
- **Diet:** Water intake (8 glasses), Meal Logging, Calorie Goal (2200 cal), Macro Goals, Sunday Meal Prep
- **Devotional:** Morning Meditation (15 min), Bhagavad Gita (30 min), Evening Prayer
- **Academics:** Attend Classes, Study Session (2–3h), Review Notes, Practice Problems
- **Personal:** Morning Journal, Gratitude Practice, Sleep by 11:30 PM, Reading (30 min), Weekly Planning
- **Breaks:** Creative Learning, Hobby Time, Social Time

**3 Habit Types:**
- `checkbox` — simple done/not done
- `numeric` — track a count against a goal (e.g., glasses of water)
- `timer` — track minutes against a duration goal

**Core Mechanics:**
- **Streak Tracking** — auto-increments on daily completion, decrements on undo
- **History Map** — `Record<YYYY-MM-DD, number>` for numeric/timer habits
- **XP System** — +10 XP on numeric/timer goal achievement, -10 XP on undo
- **Daily Progress** — percentage of habits completed for any selected date
- **Date Navigation** — view/edit completions for past dates

---

### 5.8 Schedule (`/schedule`)

A daily time-block planner with 15 pre-seeded schedule items mapped to 5 day blocks.

**Time Blocks:**
- `morning` — Pre-college (5:45 AM – 8:30 AM)
- `bus_college` — Commute to college
- `college` — Academic block (10:00 AM – 5:00 PM), marked `isFixed = true`
- `bus_home` — Commute back
- `evening` — Post-college (6:00 PM – 11:15 PM)

**Features:**
- Add/Remove schedule items
- Period scoping: today / week / month
- Color-coded visual timeline
- Notification integration — schedule items trigger local push notifications

---

### 5.9 Voice Notes (`/voice`)

Hands-free task/schedule creation via device microphone.

**Flow:**
1. User taps mic → `SpeechRecognition` API (Capacitor plugin) records speech
2. Transcript sent to `nlpService` → parses intent, extracts task title, due date/time, duration, action type
3. Results shown on `VoiceResultsScreen` — pending items list
4. User confirms → items created in respective stores

**Example commands:**
- *"Add a task to complete LeetCode problem 13 tomorrow"*
- *"Schedule a meeting with client on Friday at 3 PM"*
- *"Remind me to buy groceries this weekend for 30 minutes"*

---

### 5.10 Tasks Page (`/tasks`)

Extended task management with Eisenhower Matrix prioritization.

**Features:**
- Eisenhower Quadrant view: Q1 (Urgent+Important), Q2 (Not Urgent+Important), Q3/Q4
- Category filtering (coding, gym, academics, personal, diet)
- Priority badges (high/medium/low)
- Task size labels (small/medium/big)
- Subtask support with completion tracking
- Recurring tasks support
- Notes, external links, attachments fields in schema

---

### 5.11 Gamification System

| Element | Details |
|---|---|
| **XP** | Habit completions (+10), deep work minutes (×2), Pomodoro sessions (+25), program days (phase-scaled) |
| **Level** | Stored on User profile, increases with total XP thresholds |
| **Streaks** | Per-habit streak + global user streak |
| **Badges** | Achievement badges component (`AchievementBadge.tsx`) |
| **Leaderboard** | `Leaderboard.tsx` component (multi-user ranking scaffold) |
| **Confetti** | `ConfettiCelebration.tsx` — triggered on milestone/program completions |
| **Profile Card** | Avatar, name, level, XP bar, stats (habits completed, tasks done, focus minutes, perfect days) |

---

## 6. Data Layer

### Local Database (`blitzit_db` — SQLite)

| Table | Purpose |
|---|---|
| `users` | Single user profile with XP, streaks, privacy settings |
| `habits` | Habit definitions (type, goal, category, XP value) |
| `habit_completions` | Per-date completion records |
| `tasks` | Full task schema with quadrant, size, subtasks, recurrence |
| `subtasks` | Child tasks under a parent task |
| `blitz_lists` | Custom task lists (colored, labeled) |
| `blitz_sessions` | Per-task Blitz focus session records |
| `blitz_breaks` | Break logs linked to sessions |
| `pomodoro_sessions` | Deep work timer session logs |
| `schedules` | Scheduled habits/tasks with time blocks |
| `programs` | Active/completed multi-day challenge programs |
| `program_days` | Daily check-in records per program |
| `program_milestones` | Phase-end and completion milestone records |
| `smart_suggestions` | Logged WhatNext suggestions with user action tracking |
| `user_patterns` | Learned behavioral patterns (best times, preferred durations) |
| `category_time_stats` | Daily aggregated time stats per category |
| `voice_notes` | Transcripts + NLP parsed items |
| `task_scores` | Scored task snapshots from the suggester |

### Persistence Strategy

- **Primary:** CapacitorSQLite (IndexedDB on web, native SQLite on Android)
- **Fallback:** Zustand `persist` middleware to `localStorage` (version 6, with migration)
- **Emergency Backup:** Manual `localStorage` snapshot via `resetData()` / `restoreBackup()` actions

---

## 7. Notification System

- **Platform:** `@capacitor/local-notifications`
- **Channel:** `schedule-channel` with importance=5, vibration=true, custom sound `beep.wav`
- **Permissions:** Requested at app startup and during onboarding
- **Listeners:** `localNotificationReceived` + `localNotificationActionPerformed`
- **Auto-sync:** `appStateChange` listener re-syncs date and re-fetches habits on app resume
- **Interval Sync:** Every 60 seconds, `syncDate()` is called to correct date drift

---

## 8. Tech Stack

| Dependency | Role |
|---|---|
| React 18 + TypeScript | UI framework + type safety |
| Vite + SWC | Build tool + fast dev server |
| TailwindCSS v4 | Utility-first styling |
| Radix UI (full suite) | Accessible headless UI primitives |
| shadcn/ui | Component library (built on Radix) |
| Zustand v5 | Global state management |
| React Router DOM v6 | Client-side routing (HashRouter) |
| Capacitor v8 | Native Android bridge |
| CapacitorSQLite | On-device SQLite database |
| Framer Motion | Animations and transitions |
| GSAP | Advanced animation sequences |
| date-fns | Date formatting/manipulation |
| Recharts | Analytics charts |
| TanStack Query | Server-state caching layer |
| React Hook Form + Zod | Form validation |
| Sonner | Toast notifications |
| @hello-pangea/dnd | Drag-and-drop task reordering |
| Vitest + Testing Library | Unit testing |
| vite-plugin-pwa | PWA manifest + service worker |

---

## 9. Feature Scalability Roadmap

### 🔵 Near-Term (Infrastructure Ready)

| Feature | Evidence in Codebase |
|---|---|
| Multi-user / Social | `is_public_profile`, `invite_code`, `privacy_*` fields in User schema; `Leaderboard.tsx` exists |
| GitHub Activity Integration | `githubService.ts` scaffolded |
| Analytics Dashboard | `AnalyticsDashboard.tsx`, `analyticsService.ts`, `CategoryTimeStats` schema all exist |
| Reflection / Journaling | `reflectionService.ts` implemented |
| Smart Notifications | `notificationService.ts` with per-habit scheduling logic |
| User Behavior Learning | `UserPattern` schema + `updatePatterns()` in suggester store |
| Task Time Accuracy Tracking | `time_accuracy_score`, `actual_minutes` fields in tasks |

### 🟡 Mid-Term (Schema Designed, Not Yet Wired)

| Feature | Notes |
|---|---|
| Focus Score per Pomodoro | `focus_score`, `distractions_count` columns in `pomodoro_sessions` |
| Mood Tracking | `mood_rating` in `habit_completions` |
| Location-aware suggestions | `location` field in `SuggesterContext` (currently hardcoded `'home'`) |
| Habit Heatmap | `HeatmapCalendar.tsx` component exists |
| Community Challenges | `CommunitySection.tsx` component exists |
| Journey Timeline | `JourneyTimeline.tsx` component exists |

### 🟢 Long-Term (Planned)

| Feature | Notes |
|---|---|
| AI-powered NLP (cloud) | `nlpService.ts` can be switched from regex → API call |
| Cloud Sync | Replace SQLite repositories with REST API calls behind same interface |
| iOS Build | Add `@capacitor/ios`, minimal config change needed |
| Wearable Integration | Heart rate → live energy level updates to suggester |
| Program Marketplace | User-created program templates with sharing |

---

## 10. Key Design Decisions

1. **HashRouter over BrowserRouter** — Required for Capacitor Android WebView compatibility
2. **SQLite over REST API** — Fully offline, zero-latency, no backend cost for personal use
3. **Zustand over Redux** — Simpler API, smaller bundle, sufficient for this scale
4. **Two stores for habits** — `useHabitStore` (legacy persist-heavy store) and `useUserStore` (new schema-based) coexist; migration in progress
5. **Fallback-first task creation** — Tasks saved locally first; DB sync attempted async; toast shown on failure
6. **Pre-seeded data** — 27 habits, 15 schedule items, 5 sample tasks loaded from constants so app feels useful immediately
7. **Capacitor for PWA+Native** — Single codebase runs in browser and compiles to Android APK via `npx cap build android`

---

## 11. Project Status Summary

| Module | Status |
|---|---|
| Onboarding | ✅ Complete |
| Task Dashboard (Blitz List) | ✅ Complete |
| Blitz Focus Mode | ✅ Complete |
| Pomodoro / Deep Work | ✅ Complete |
| What Next Suggester | ✅ Complete (scoring algorithm done) |
| Programs | ✅ Complete (7 templates, day tracking) |
| Habit Tracker | ✅ Complete |
| Schedule | ✅ Complete |
| Voice Notes | ✅ UI Complete (NLP wired) |
| Gamification (XP/Streaks) | ✅ Core done |
| Analytics Dashboard | 🟡 Components built, not fully wired |
| Social / Leaderboard | 🟡 Schema + UI scaffolded |
| GitHub Integration | 🟡 Service scaffolded |
| Cloud Sync | ❌ Not started |
| iOS Build | ❌ Not started |

---

*Last updated: April 2026*
