import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PomodoroSession } from '../types/schema';
import { timerRepository } from '../repositories/timer.repository';
import { v4 as uuidv4 } from 'uuid';

export type SessionType = 'work' | 'short_break' | 'long_break';

interface TimerState {
    timeLeft: number;
    initialTime: number;
    isActive: boolean;
    mode: SessionType;
    sessionId: string | null;
    settings: {
        work: number;
        short_break: number;
        long_break: number;
    };
    todayStats: {
        count: number;
        minutes: number;
    };

    // Actions
    setTimeLeft: (time: number) => void;
    setIsActive: (active: boolean) => void;
    setMode: (mode: SessionType) => void;

    startSession: () => Promise<void>;
    pauseSession: () => void;
    resetSession: () => Promise<void>;
    completeSession: () => Promise<void>;

    fetchTodayStats: () => Promise<void>;
    updateSettings: (newSettings: Partial<TimerState['settings']>) => void;
}

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            timeLeft: 25 * 60,
            initialTime: 25 * 60,
            isActive: false,
            mode: 'work',
            sessionId: null,
            settings: {
                work: 25 * 60,
                short_break: 5 * 60,
                long_break: 15 * 60
            },
            todayStats: { count: 0, minutes: 0 },

            setTimeLeft: (time) => set({ timeLeft: time }),
            setIsActive: (active) => set({ isActive: active }),
            setMode: (mode) => {
                const newTime = get().settings[mode];
                set({ mode, timeLeft: newTime, initialTime: newTime, isActive: false, sessionId: null });
            },

            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            startSession: async () => {
                const { mode, settings, sessionId } = get();
                // Create session record if didn't exist
                if (!sessionId && mode === 'work') {
                    const newId = uuidv4();
                    const session: PomodoroSession = {
                        id: newId,
                        user_id: 'default-user', // TODO: use actual user
                        category: 'general',
                        session_type: mode,
                        duration_minutes: settings[mode] / 60,
                        started_at: new Date().toISOString(),
                        total_pause_duration_minutes: 0,
                        was_completed: 0,
                        was_interrupted: 0,
                        distractions_count: 0,
                        xp_earned: 0,
                        created_at: new Date().toISOString()
                    };
                    await timerRepository.create(session);
                    set({ sessionId: newId, isActive: true });
                } else {
                    set({ isActive: true });
                }
            },

            pauseSession: () => {
                set({ isActive: false });
            },

            resetSession: async () => {
                const { sessionId, mode, settings } = get();
                if (sessionId) {
                    // Mark as interrupted
                    await timerRepository.update(sessionId, {
                        was_interrupted: 1,
                        ended_at: new Date().toISOString(),
                        was_completed: 0
                    });
                }
                set({
                    isActive: false,
                    timeLeft: settings[mode],
                    sessionId: null
                });
            },

            completeSession: async () => {
                const { sessionId, mode } = get();
                if (sessionId) {
                    await timerRepository.update(sessionId, {
                        was_completed: 1,
                        ended_at: new Date().toISOString(),
                        xp_earned: 25 // TODO: dynamic XP
                    });
                    // Refresh stats
                    get().fetchTodayStats();
                }

                // Logic for auto-switch could go here or in UI
                set({ isActive: false, sessionId: null });
            },

            fetchTodayStats: async () => {
                const stats = await timerRepository.getTodayStats();
                set({ todayStats: { count: stats.count, minutes: stats.totalMinutes } });
            }
        }),
        {
            name: 'timer-storage', // unique name
            partialize: (state) => ({ settings: state.settings, mode: state.mode, timeLeft: state.timeLeft, isActive: state.isActive, sessionId: state.sessionId }), // persist these fields
        }
    )
);
