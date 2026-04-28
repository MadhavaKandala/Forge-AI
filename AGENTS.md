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