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