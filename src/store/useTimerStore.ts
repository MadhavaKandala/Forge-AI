import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PomodoroSession } from '../types/schema';
import { timerRepository } from '../repositories/timer.repository';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentStoreUserId } from './useAppStore';

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
    history: PomodoroSession[];

    // Actions
    tick: () => void;
    setTimeLeft: (time: number) => void;
    setIsActive: (active: boolean) => void;
    setMode: (mode: SessionType) => void;

    startSession: () => Promise<void>;
    pauseSession: () => void;
    resetSession: () => Promise<void>;
    completeSession: () => Promise<void>;

    fetchTodayStats: () => Promise<void>;
    fetchHistory: () => Promise<void>;
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
            history: [],

            tick: () => {
                const { timeLeft, isActive, completeSession } = get();
                if (isActive && timeLeft > 0) {
                    set({ timeLeft: timeLeft - 1 });
                } else if (isActive && timeLeft === 0) {
                    completeSession();
                }
            },

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
                const { mode, settings, sessionId, isActive } = get();
                if (isActive) return;

                // Create session record if didn't exist
                if (!sessionId && mode === 'work') {
                    const newId = uuidv4();
                    const userId = getCurrentStoreUserId();
                    const session: PomodoroSession = {
                        id: newId,
                        user_id: userId === 'guest' ? 'default-user' : userId,
                        category: 'general',
                        session_type: mode,
                        duration_minutes: settings[mode] / 60,
                        started_at: new Date().toISOString(),
                        was_completed: 0,
                        was_interrupted: 0,
                        distractions_count: 0,
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
                const newTime = settings[mode];
                set({
                    isActive: false,
                    timeLeft: newTime,
                    initialTime: newTime,
                    sessionId: null
                });
            },

            completeSession: async () => {
                const { sessionId, mode, settings } = get();
                if (sessionId) {
                    await timerRepository.update(sessionId, {
                        was_completed: 1,
                        ended_at: new Date().toISOString()
                    });
                    // Refresh stats and history
                    get().fetchTodayStats();
                    get().fetchHistory();
                }

                // Auto-switch logic
                let nextMode: SessionType = 'work';
                if (mode === 'work') {
                    nextMode = 'short_break';
                }

                const nextTime = settings[nextMode];
                set({
                    isActive: false,
                    sessionId: null,
                    mode: nextMode,
                    timeLeft: nextTime,
                    initialTime: nextTime
                });
            },

            fetchTodayStats: async () => {
                const stats = await timerRepository.getTodayStats();
                set({ todayStats: { count: stats.count, minutes: stats.totalMinutes } });
            },

            fetchHistory: async () => {
                const today = new Date().toISOString().split('T')[0];
                const sessions = await timerRepository.findByDate(today);
                set({ history: sessions });
            }
        }),
        {
            name: 'timer-storage',
            partialize: (state) => ({
                settings: state.settings,
                mode: state.mode,
                timeLeft: state.timeLeft,
                isActive: state.isActive,
                sessionId: state.sessionId,
                initialTime: state.initialTime
            }),
        }
    )
);
