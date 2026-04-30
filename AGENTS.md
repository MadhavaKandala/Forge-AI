# AGENTS.md — Forge AI

## What This App Is
Personal life OS for Madhava. Tracks habits, missions (tasks), programs 
(multi-day challenges like LeetCode 75 and 75 Hard), and a daily schedule.
Single user. Android mobile app built with React + Capacitor.

## Tech Stack
- React 18 + TypeScript + Vite 5
- State: Zustand 5 with persist middleware (localStorage only — NO SQLite)
- UI: shadcn/ui + Tailwind v4 + Radix UI
- Animation: Framer Motion + GSAP
- Drag and drop Kanban: @hello-pangea/dnd
- Charts: Recharts
- Mobile: Capacitor 8 → Android APK
- Voice: @capacitor-community/speech-recognition

## Design System (DO NOT CHANGE)
- Background: #0A0A0A
- Cards: #141414 and #1C1C1C  
- Primary accent: #C8FF00 (neon yellow-green)
- Text primary: #FFFFFF
- Text secondary: #666666
- Danger: #FF4444
- Success: #22C55E
- Language: military — "Mission", "Deploy", "Tactical", "Intel", "Sync"
- All CTA buttons: UPPERCASE text

## Absolute Rules
1. NEVER light background or white themes
2. NEVER purple/blue accents
3. ALL screen data from Zustand store — zero hardcoded UI data
4. ALL user actions show a toast (sonner is installed)
5. ALL forms validate before submit
6. XP awarded on every completion — always call store.addXP()
7. Zustand persist handles ALL storage — no raw localStorage calls
8. Auth guard: if !store.isAuthenticated → show AuthPage, block all other routes

## Target File Structure
src/
  store/useAppStore.ts        ← single Zustand store, ALL state here
  pages/
    AuthPage.tsx              ← email + OTP login
    HomePage.tsx              ← daily command center
    MissionControlPage.tsx    ← Kanban task board
    ProgramsPage.tsx          ← challenge programs
    StatsPage.tsx             ← analytics
    VoicePage.tsx             ← voice → mission
    ProfilePage.tsx           ← user + settings
  components/
    BottomNav.tsx
    MissionCard.tsx
    HabitItem.tsx
    ProgramCard.tsx
    DailyOpsItem.tsx
    NewMissionModal.tsx
  hooks/
    useToday.ts               ← today's computed habits/missions
  lib/
    xp.ts                     ← XP/level helpers
    programs.ts               ← default program seed data

## COMPLETED PHASES

### Phase 1 — Planner (28 Apr 2026)
- 1 critical build error: JeepSqlite in db.ts ✅ Fixed
- 9 hardcoded data locations found
- 5 stores need persist middleware
- 4 null crash risks identified

### Phase 2 — Build Error Resolver (28 Apr 2026)  
- JeepSqlite import removed ✅
- dbService references cleaned ✅
- Build: 3,035 modules, 0 errors ✅

## COMPLETED PHASES

### Phase 4A — TypeScript Reviewer (28 Apr 2026)
- HomePage.tsx created ✅
- MissionControlPage.tsx created (Kanban + drag-drop) ✅  
- StatsPage.tsx created (analytics) ✅
- addXP, completeHabit, completeTask added to useHabitStore ✅
- TypeScript: 0 errors ✅
- PENDING: routes in App.tsx need verification
- PENDING: useTaskStore vs useHabitStore.tasks conflict unresolved

### Phase 4B — Architect (28 Apr 2026)
- Auth: useAppStore + AuthPage (email + OTP) ✅
- App.tsx auth gate: unauthenticated → AuthPage ✅
- Programs: enrollInProgram, unenrollFromProgram, habit injection ✅
- ProgramsPage rebuilt: active cards + deploy sheet + time picker ✅
- Voice: VoicePage with SpeechRecognition + DEPLOY AS MISSION ✅
- NewMissionModal with URL param prefill ✅
- Build: 0 errors ✅

### Phase 5A — Security Review (28 Apr 2026)
- OTP hashed with SHA-256, expires 5 min ✅
- Session token + integrity check in App.tsx gate ✅
- Email validation at store level ✅
- Rate limit: 5 attempts → 30s lockout ✅
- Zero console.log of sensitive data ✅
- Build: 0 errors ✅

### Phase 5B — Performance (28 Apr 2026)
- shallow selectors on all 3 pages ✅
- useMemo: sortedSchedule, tasksByStatus ✅
- useCallback: handleHabitTap, handleDragEnd ✅
- React.memo on TaskCard ✅
- Bundle: 291KB gzipped ✅
- TypeScript: 0 errors ✅

### Phase 6 — E2E QA (28 Apr 2026)
- Auth ✅ | Programs ✅ | Missions ✅
- Habits ✅ | Voice ✅ | Persistence ✅
- Build: 0 errors, 3018 modules ✅
- Capacitor sync: complete, 4 plugins ✅
- STATUS: PRODUCTION READY



## WHO THIS APP IS REALLY FOR (Updated Vision)

After thinking about your college batch, the real user is:

> A 20–22 year old CS student who is grinding LeetCode, preparing for
> placements, trying to stay consistent at gym, managing college stress,
> and feeling like they're behind everyone else.

They don't need another to-do list. They need:
- A structured day that runs on autopilot
- LeetCode problem tracking with a schedule
- Gym/health consistency without overthinking
- Something that makes them FEEL like they're winning every day
- A mood check that redirects their energy instead of wasting it

This is Forge AI. A personal operating system for people who are building
themselves from the ground up.

---

## PHASE 1 SCOPE — What to add before Play Store

### Priority 1 — MUST HAVE (blocks launch)
- OTP bug fix
- Onboarding flow (3 screens)
- App icon + splash screen
- Empty states on all screens
- Loading skeletons
- Mood Check feature (your idea — based on your journals)
- Daily Motivation card (one quote/insight per day)
- Play Store assets

### Priority 2 — SHIP WITH V1.1 (within 2 weeks of launch)
- Placement Prep Program (LeetCode 150, DSA sheet)
- Social sharing (share streak as image)
- Widget support (home screen habit checker)

### Priority 3 — V1.2 onwards
- AI coaching
- Leaderboard (optional, for friend groups)
- iOS version

---

## FEATURE 1 — MOOD CHECK (Your Most Unique Feature)

This is the feature no other productivity app has. Based on your own
journals and experience — that's the authenticity that makes it real.

### How it works:

Every day when user opens app, a small card appears:
"How are you showing up today?"

5 mood states (not clinical — just real):

```
⚡ LOCKED IN      — Ready to work, high energy
😤 FRUSTRATED     — Annoyed, need to channel it
😶 NUMB/DULL      — Low energy, going through motions
🌀 OVERWHELMED    — Too much, don't know where to start
💥 ROCK BOTTOM    — Genuinely struggling today
```

### What happens after selecting mood:

**LOCKED IN:**
- App says: "Good. Don't waste it. Here's your hardest task first."
- Reorders Daily Ops to put highest priority item #1
- Shows quote: "The disciplined man does what needs to be done
  even when he doesn't feel like it. You already feel like it today."

**FRUSTRATED:**
- App says: "Channel it. Anger is energy. Use it."
- Suggests: Start with gym session OR a hard LeetCode problem
- Shows: "Every person who doubted you becomes fuel. Work."
- Redirects the emotion into output

**NUMB/DULL:**
- App says: "You don't need motivation. You need momentum."
- Suggests: Start with the SMALLEST habit (5 min task)
- Shows: "Don't think. Just start. The feeling follows the action."
- Reduces today's visible task list to just 3 items (less overwhelm)

**OVERWHELMED:**
- App says: "One thing. Just one."
- Hides everything except TODAY's top mission
- Shows: "You cannot do everything today. You CAN do one thing."
- Walks user through: What is the ONE thing that moves everything else?

**ROCK BOTTOM:**
- App says: "You showed up. That already makes you different."
- Does NOT show task list immediately
- Shows: "Read this first" — 3 lines from your journal/insights
- Gentle reminder: small win today > no win today
- Option: "I just need structure" → shows minimal 3-habit checklist

### Mood History:
- Track mood per day in store
- Show mood chart in Stats: "Your energy over the last 30 days"
- Pattern insight: "You're usually LOCKED IN on Mondays. NUMB on Thursdays."

### The Content (your journal insights):

Store these in src/lib/moodContent.ts — write them yourself
in your own voice. This is what makes it different from every
other app. Not generic quotes. YOUR actual words from your
lowest and highest points.

Example format:
```typescript
export const MOOD_CONTENT = {
  locked_in: {
    message: "Good. Don't waste it.",
    action: "Start with your hardest task",
    quote: "...",
    reorderTasks: true,
  },
  rock_bottom: {
    message: "You showed up. That already matters.",
    action: "Read this. Then do one small thing.",
    insight: "...", // your actual journal words
    showMinimalView: true,
  }
}
```

---

## FEATURE 2 — DAILY MOTIVATION CARD

Simple but powerful. One card at top of home screen every morning.

### Types of cards (rotate daily):
- Quote of the day (curated, not random)
- "Did you know" coding fact
- Reminder of their goal ("You said you want to crack placement by Dec")
- Streak celebration ("7 days straight. Most people quit at day 3.")
- Challenge nudge ("You haven't done gym in 2 days. Today's the day.")

### Implementation:
```typescript
// src/lib/motivationCards.ts
export const DAILY_CARDS = [
  {
    type: 'quote',
    content: "Consistency is not about being perfect every day. It's about showing up every day.",
    author: "Your future self"
  },
  {
    type: 'streak',
    content: (streak: number) => `${streak} days. The version of you from ${streak} days ago would be proud.`,
  },
  // etc
]
```

Card rotates based on day of year — same card on same day for all users.

---

## FEATURE 3 — PLACEMENT PREP PROGRAM

Specifically for your college batch. This is your pitch to 100 students.

### LeetCode 150 Program:
- 150 days, 1 problem per day
- Ordered: Arrays → Strings → Linked Lists → Trees → Graphs → DP
- Each day: problem title + difficulty + estimated time
- Mark solved → logs to streak

### DSA Sheet Program (Striver's A2Z):
- 455 problems organized by topic
- Daily goal: 3 problems
- Progress: X/455 problems solved
- Topics: Arrays, Binary Search, Strings, Recursion, Stack/Queue, etc.

### Core Subjects Program:
- 60 days
- Daily: 1 hour DBMS, OS, CN, OOP rotation
- Tracks: topics covered per subject
- Exam-style: marks chapter as "revised" or "needs review"

### Aptitude & HR Program:
- 30 days before placement season
- Daily: 10 quant problems + 5 verbal + 1 HR question practice
- Common HR questions bank: "Tell me about yourself", "Why our company", etc.

### How to pitch this to your batch:
"This app tracks your LeetCode streak, schedules your DSA practice,
and manages your gym and routine — all in one place. Built by someone
who went through the same placement grind."

That's the pitch. Authentic. No need to hide that you used AI tools —
SP2 didn't hide it either. The difference is you built something
actually useful for real life, not just a browser extension.

---

## FEATURE 4 — ONBOARDING FLOW (3 Screens)

### Screen 1 — Welcome:
```
FORGE AI

"Built for people who are building themselves."

[Your name] (text input, auto-filled from profile)

What are you working towards?
○ Placement / Job hunting
○ Building consistency
○ Getting fit
○ All of the above

[BEGIN →]
```

### Screen 2 — Choose Your Programs:
```
ACTIVATE YOUR FIRST PROGRAMS

Pick what you want to work on:

[⚡ LeetCode 75]      [🏆 75 Hard]
[🌅 Morning Protocol] [💪 Gym Protocol]
[🎯 100 Day Challenge][📚 Placement Prep]

Tap to select. You can add more later.

[CONTINUE →]
```

### Screen 3 — Set Your Schedule:
```
WHEN DO YOU START YOUR DAY?

Wake up time: [5:30 AM ▼]

When do you study/code?
○ Morning (6 AM – 12 PM)
○ Afternoon (12 PM – 6 PM)
○ Night (8 PM – 2 AM)

Your Daily Ops will be scheduled around this.

[DEPLOY MY SCHEDULE →]
```

After this → Home screen loads with their chosen programs
already injected into Daily Ops.

---

## FEATURE 5 — EMPTY STATES & LOADING

Every empty screen needs a message. Not just blank.

### Mission Control (no tasks):
```
NO ACTIVE MISSIONS

Your battlefield is clear.
Deploy your first mission to begin.

[+ DEPLOY MISSION]
```

### Habits (first day):
```
NO HABITS ACTIVE

Activate a program to get your
daily habits automatically scheduled.

[→ GO TO PROGRAMS]
```

### Stats (no data yet):
```
NO DATA YET

Complete your first habit or mission
to see your performance stats.

Keep showing up. The data follows.
```

### Loading skeletons:
- Gray animated shimmer boxes where content will load
- Same shape as actual content (habit card shape, mission card shape)
- Uses Framer Motion with opacity pulse animation

---