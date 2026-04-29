● Done. 3 features built. npm run build pass, 0 errors.

   1. Auth live
    - Added src/store/useAppStore.ts with requestOtp(email), verifyOtp(email, otp), isAuthenticated.
    - Added src/pages/AuthPage.tsx:
     - Screen A: email entry, neon/black styling, SEND OTP.
     - Screen B: OTP entry, 6 separate digit boxes, auto-advance, VERIFY, resend, exact error text: “Invalid code. Try again.”
    - Updated src/App.tsx:
     - useAppStore auth gate: unauthenticated -> AuthPage.
     - Routes render only after auth.
   2. Programs rebuilt
    - Reworked src/store/useProgramStore.ts:
     - Added enrollInProgram(programId, selectedTime) + unenrollFromProgram(enrollmentId).
     - Enrollment record creation.
     - Requirement loop -> habits added in useHabitStore with fromProgramId.
     - Deactivate removes enrollment + program habits.
     - Toasts on activate/deactivate.
    - Updated src/store/useHabitStore.ts:
     - Habit now supports fromProgramId.
     - Added removeHabitsByProgramId(programId).
    - Replaced src/pages/ProgramsPage.tsx:
     - Section 1: ACTIVE PROGRAMS horizontal cards + Day X/Y + progress + streak + DEACTIVATE.
     - Section 2: ALL PROGRAMS 2-column grid + ACTIVE badge or ACTIVATE.
     - Slide-up sheet with requirements + time-slot picker (5:00 AM to 11:00 PM, 30 min) + DEPLOY PROGRAM.
   3. Voice mission deploy live
    - Added src/pages/VoicePage.tsx:
     - SpeechRecognition native flow + permission check.
     - partialResults transcript wiring.
     - Mic toggle start/stop, red pulsing animation while recording.
     - Web fallback: window.SpeechRecognition || window.webkitSpeechRecognition.
     - DEPLOY AS MISSION -> navigate('/missions/new?title=' + encodeURIComponent(transcript)).
    - Updated routing in src/App.tsx:
     - /voice now uses VoicePage.
     - Added /missions/new route -> TasksPage.
    - Added src/components/NewMissionModal.tsx:
     - Reads URL search params title.
    - Updated src/components/habit-tracker/AddTaskModal.tsx:
     - Supports initialTitle prefill.
    - Updated src/pages/TasksPage.tsx:
     - Opens NewMissionModal when route is /missions/new.
     - Prefilled title from URL.