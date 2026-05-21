import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { Task, TaskCategory, TaskPriority, TaskStatus, EisenhowerQuadrant, CreateTaskDTO } from '@/types/task';
import { MoodKey } from '@/lib/moodContent';
import { getCurrentStoreUserId, getUserScopedStoreName } from './useAppStore';

export type HabitType = 'checkbox' | 'numeric' | 'timer';
export type Category = 'coding' | 'devotional' | 'diet' | 'gym' | 'personal' | 'academics' | 'breaks';
export type TimeBlock = 'morning' | 'bus_college' | 'college' | 'bus_home' | 'evening';

export interface WorkoutLog {
    id: string;
    exerciseName: string;
    date: string; // ISO YYYY-MM-DD
    sets: {
        reps: number;
        weight: number;
        isCompleted: boolean;
    }[];
}

export interface Habit {
    id: string;
    title: string;
    time: string; // e.g., "6:30 AM" or "Evening"
    streak: number;
    completedDates: string[]; // ISO date strings YYYY-MM-DD
    type: HabitType;
    category: Category;
    goal?: number;
    unit?: string;
    history: Record<string, number>;
    fromProgramId?: string;
}

export interface User {
    name: string;
    level: number;
    xp: number;
    avatarUrl?: string;
    notificationsEnabled?: boolean;
}

export interface ScheduleItem {
    id: string;
    title: string;
    time: string;
    duration?: string;
    tag?: string;
    color: string;
    period: 'today' | 'week' | 'month';
    block?: TimeBlock;
    isFixed?: boolean; // e.g. College classes
}

export interface MoodHistoryEntry {
    date: string;
    mood: MoodKey;
    selectedAt: string;
}

export interface JournalEntry {
    id: string;
    date: string;
    mood: MoodKey | 'unknown';
    feelings: string[];
    reasons: string[];
    note: string;
    createdAt: string;
}

interface HabitState {
    user: User | null;
    habits: Habit[];
    schedule: ScheduleItem[];
    tasks: Task[];
    onboardingDataChoice: 'unset' | 'demo' | 'fresh';
    todayMood: MoodHistoryEntry | null;
    moodHistory: MoodHistoryEntry[];
    journalEntries: JournalEntry[];
    dismissedMotivationDate: string | null;
    streakShields: number;
    lastStreakDate: string | null;
    selectedDate: Date;
    workoutLogs: WorkoutLog[];
    dietLogs: import('@/types/challenge').DietLog[];
    waterIntakeLiters: number;

    // Actions
    addXP: (amount: number) => void;
    completeHabit: (habitId: string) => boolean;
    completeTask: (taskId: string) => void;
    toggleHabit: (habitId: string, date: Date) => void;
    updateHabitValue: (habitId: string, date: Date, value: number) => void;
    setSelectedDate: (date: Date) => void;

    // Task Actions
    addTask: (taskData: CreateTaskDTO) => Promise<void>;
    toggleTask: (taskId: string) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;
    fetchTasks: () => Promise<void>;

    // Schedule/Habit Actions
    addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates' | 'history'> & { fromProgramId?: string }) => void;
    removeHabitsByProgramId: (programId: string) => void;
    fetchHabits: () => Promise<void>;
    initializeDefaults: () => void;
    markFreshStart: () => void;
    addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
    removeScheduleItem: (id: string) => void;

    updateUser: (updates: Partial<User>) => void;
    resetData: () => void;
    restoreBackup: () => void;
    clearAll: () => void;

    // Deep Work logging
    logDeepWork: (minutes: number) => void;

    // Workout Actions
    addWorkoutLog: (log: Omit<WorkoutLog, 'id'>) => void;
    updateWorkoutLog: (logId: string, updates: Partial<WorkoutLog>) => void;

    // Diet Actions
    addDietLog: (log: Omit<import('@/types/challenge').DietLog, 'id'>) => void;
    addWater: (amount: number) => void;
    updateDietGoal: (calories: number, water: number) => void;

    // Mood Actions
    setTodayMood: (mood: MoodKey, date?: Date) => void;
    getMoodForDate: (date: Date) => MoodHistoryEntry | null;
    addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;

    // Motivation Actions
    dismissMotivationForToday: (date?: Date) => void;
    checkStreakShield: (date?: Date) => void;

    // Selectors
    getDailyProgress: (date: Date) => number;
    syncDate: () => void;
}

const formatDate = (date: Date | string): string => {
    const value = date instanceof Date ? date : new Date(date);
    return value.toISOString().split('T')[0];
};

const getDateGap = (from: string, to: string): number => {
    const fromDate = new Date(`${from}T00:00:00`);
    const toDate = new Date(`${to}T00:00:00`);
    return Math.round((toDate.getTime() - fromDate.getTime()) / 86400000);
};

const INITIAL_TASKS: Task[] = [];
const INITIAL_HABITS: Habit[] = [];
const INITIAL_SCHEDULE: ScheduleItem[] = [];
const INITIAL_USER: User | null = null;

export const useHabitStore = create<HabitState>()(
    persist(
        (set, get) => ({
            user: INITIAL_USER,
            selectedDate: new Date(),
            onboardingDataChoice: 'unset',
            tasks: [],
            todayMood: null,
            moodHistory: [],
            journalEntries: [],
            dismissedMotivationDate: null,
            streakShields: 0,
            lastStreakDate: null,
            habits: [],
            schedule: [],
            workoutLogs: [],
            dietLogs: [],
            waterIntakeLiters: 0,

            addXP: (amount) => set((state) => ({
                user: state.user ? { ...state.user, xp: Math.max(0, state.user.xp + amount) } : state.user
            })),

            completeHabit: (habitId) => {
                const selectedDate = get().selectedDate;
                const dateStr = formatDate(selectedDate);
                const habit = get().habits.find((h) => h.id === habitId);
                const isAlreadyCompleted = habit?.completedDates.includes(dateStr) ?? false;

                get().toggleHabit(habitId, selectedDate);
                if (!isAlreadyCompleted) {
                    get().addXP(10);
                    const nextHabit = get().habits.find((h) => h.id === habitId);
                    const nextStreak = nextHabit?.streak ?? 0;
                    const previousStreakDate = get().lastStreakDate;
                    if (previousStreakDate !== dateStr) {
                        const earnedShield = nextStreak > 0 && nextStreak % 7 === 0 && get().streakShields < 3;
                        set((state) => ({
                            lastStreakDate: dateStr,
                            streakShields: earnedShield ? Math.min(3, state.streakShields + 1) : state.streakShields,
                        }));
                        if (earnedShield) {
                            toast.success(`Shield earned. ${Math.min(3, get().streakShields)} shields armed.`);
                        }
                    }
                }

                return !isAlreadyCompleted;
            },

            completeTask: (taskId) => {
                const targetTask = get().tasks.find((task) => task.id === taskId);
                if (!targetTask || targetTask.completed) {
                    return;
                }

                get().updateTask(taskId, { completed: true, status: 'completed' });
                get().addXP(25);
            },

            addWorkoutLog: (log) => set((state: HabitState) => ({
                workoutLogs: [...state.workoutLogs, { ...log, id: Math.random().toString(36).substr(2, 9) }]
            }) as Partial<HabitState>),

            updateWorkoutLog: (logId, updates) => set((state: HabitState) => ({
                workoutLogs: state.workoutLogs.map(l => l.id === logId ? { ...l, ...updates } : l)
            }) as Partial<HabitState>),

            addDietLog: (log) => set((state: HabitState) => ({
                dietLogs: [...state.dietLogs, { ...log, id: Math.random().toString(36).substr(2, 9) }]
            }) as Partial<HabitState>),

            addWater: (amount: number) => set((state: HabitState) => ({
                waterIntakeLiters: state.waterIntakeLiters + amount
            }) as Partial<HabitState>),

            updateDietGoal: (calories, water) => {
                // This could update the user profile in useChallenges or the store
            },

            setTodayMood: (mood, date = new Date()) => {
                const dateStr = formatDate(date);
                const entry: MoodHistoryEntry = {
                    date: dateStr,
                    mood,
                    selectedAt: new Date().toISOString()
                };

                set((state) => ({
                    todayMood: entry,
                    moodHistory: [
                        entry,
                        ...state.moodHistory.filter((item) => item.date !== dateStr)
                    ]
                }));

                toast.success('Mood Intel Synced');
            },

            getMoodForDate: (date) => {
                const dateStr = formatDate(date);
                return get().moodHistory.find((item) => item.date === dateStr) ?? null;
            },

            addJournalEntry: (entry) => {
                const nextEntry: JournalEntry = {
                    ...entry,
                    id: Math.random().toString(36).substr(2, 9),
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    journalEntries: [
                        nextEntry,
                        ...state.journalEntries.filter((item) => item.date !== entry.date),
                    ],
                }));
                toast.success('Journal Intel Saved');
            },

            dismissMotivationForToday: (date = new Date()) => {
                set({ dismissedMotivationDate: formatDate(date) });
                toast.success('Daily Intel Dismissed');
            },

            checkStreakShield: (date = new Date()) => {
                const todayStr = formatDate(date);
                const { lastStreakDate, streakShields } = get();
                if (!lastStreakDate) return;

                const gap = getDateGap(lastStreakDate, todayStr);
                if (gap <= 1) return;

                if (streakShields > 0) {
                    const nextShields = Math.max(0, streakShields - 1);
                    set({
                        lastStreakDate: todayStr,
                        streakShields: nextShields,
                    });
                    toast.success(`Shield used! Streak protected. ${nextShields} shields left.`);
                    return;
                }

                set((state) => ({
                    lastStreakDate: null,
                    habits: state.habits.map((habit) => ({ ...habit, streak: 0 })),
                }));
                toast.error('Streak lost. Start again. You know what to do.');
            },

            addScheduleItem: (item) => set((state) => ({
                schedule: [...state.schedule, { ...item, id: Math.random().toString(36).substr(2, 9) }]
            })),

            removeScheduleItem: (id) => set((state) => ({
                schedule: state.schedule.filter((i) => i.id !== id)
            })),

            setSelectedDate: (date: Date) => {
                const todayStr = formatDate(new Date());
                if (formatDate(date) === todayStr && formatDate(get().selectedDate) !== todayStr) {
                    get().checkStreakShield(date);
                }
                set({ selectedDate: date });
            },

            addHabit: (newHabit) => set((state) => ({
                habits: [
                    ...state.habits,
                    {
                        ...newHabit,
                        id: Math.random().toString(36).substr(2, 9),
                        streak: 0,
                        completedDates: [],
                        history: {},
                        fromProgramId: newHabit.fromProgramId
                    }
                ]
            })),

            removeHabitsByProgramId: (programId) => set((state) => ({
                habits: state.habits.filter((habit) => habit.fromProgramId !== programId)
            })),

            // Task Actions
            addTask: async (taskData) => {
                console.log("Adding Task:", taskData);
                const { taskService } = await import('@/services/taskService');

                // Derive metrics from quadrant if not provided
                let size = taskData.size || 'small';
                let priority: TaskPriority = taskData.priority || 'medium';

                if (taskData.quadrant === 'q1') {
                    size = taskData.size || 'big';
                    priority = taskData.priority || 'high';
                } else if (taskData.quadrant === 'q2') {
                    size = taskData.size || 'medium';
                    priority = taskData.priority || 'high';
                } else if (taskData.quadrant === 'q3') {
                    priority = taskData.priority || 'medium';
                }

                const status = taskData.status || (taskData.quadrant === 'q1' ? 'today' : (taskData.quadrant === 'q2' ? 'this_week' : 'backlog'));

                try {
                    const newTask = await taskService.createTask({
                        ...taskData,
                        size,
                        priority,
                        status,
                        isRecurring: taskData.isRecurring || false,
                        subtasks: taskData.subtasks || []
                    });

                    console.log("Task Created in DB:", newTask);
                    set((state) => ({
                        tasks: [newTask, ...state.tasks.filter(t => !t.id.startsWith('local-'))]
                    }));

                    // Refresh suggester
                    import('./useSuggesterStore').then(({ useSuggesterStore }) => {
                        useSuggesterStore.getState().getSuggestion();
                    });
                } catch (error) {
                    console.error("Error creating task in store:", error);
                    toast.error("Database connection issue. Task saved locally only.");
                    // Fallback: add with local ID if DB fails
                    const localTask: Task = {
                        ...taskData,
                        id: `local-${Math.random().toString(36).substr(2, 9)}`,
                        size,
                        priority,
                        status,
                        completed: false,
                        isRecurring: taskData.isRecurring || false,
                        subtasks: taskData.subtasks || [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    set((state) => ({ tasks: [localTask, ...state.tasks] }));
                }
            },

            toggleTask: (taskId) => set((state) => {
                const updatedTasks = state.tasks.map(t => {
                    if (t.id === taskId) {
                        const newCompleted = !t.completed;
                        const newStatus: TaskStatus = newCompleted ? 'completed' : 'today';

                        import('@/services/taskService').then(({ taskService }) => {
                            taskService.updateTask(taskId, { completed: newCompleted, status: newStatus })
                                .catch(err => console.error("Failed to sync task toggle:", err));
                        });

                        return { ...t, completed: newCompleted, status: newStatus };
                    }
                    return t;
                });
                // Refresh suggester
                import('./useSuggesterStore').then(({ useSuggesterStore }) => {
                    useSuggesterStore.getState().getSuggestion();
                });
                return { tasks: updatedTasks };
            }),

            updateTask: (taskId, updates) => set((state) => {
                import('@/services/taskService').then(({ taskService }) => {
                    taskService.updateTask(taskId, updates)
                        .catch(err => console.error("Failed to sync task update:", err));
                });

                return {
                    tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
                };
            }),

            deleteTask: (taskId) => set((state) => {
                import('@/services/taskService').then(({ taskService }) => {
                    taskService.deleteTask(taskId)
                        .catch(err => console.error("Failed to sync task deletion:", err));

                    // Refresh suggester
                    import('./useSuggesterStore').then(({ useSuggesterStore }) => {
                        useSuggesterStore.getState().getSuggestion();
                    });
                });
                return { tasks: state.tasks.filter(t => t.id !== taskId) };
            }),

            fetchTasks: async () => {
                try {
                    const { taskService } = await import('@/services/taskService');
                    const dbTasks = await taskService.getTasks();
                    console.log("Fetched Tasks from DB:", dbTasks.length);

                    if (dbTasks.length > 0) {
                        set({ tasks: dbTasks });
                    } else {
                        // DB is empty - we need to populate it
                        if (get().tasks.length > 0) {
                            console.log("Syncing existing store tasks to DB...");
                            await Promise.all(
                                get().tasks.map(task =>
                                    taskService.createTask(task).catch(e => console.error("Sync error:", e))
                                )
                            );
                        } else {
                            console.log("Seeding INITIAL_TASKS to DB...");
                            set({ tasks: INITIAL_TASKS });
                            await Promise.all(
                                INITIAL_TASKS.map(task =>
                                    taskService.createTask(task).catch(e => console.error("Seed error:", e))
                                )
                            );
                        }
                    }

                    // Always refresh suggester after fetchTasks completes
                    import('./useSuggesterStore').then(({ useSuggesterStore }) => {
                        useSuggesterStore.getState().getSuggestion();
                    });
                } catch (error) {
                    console.error("Error fetching tasks:", error);
                }
            },

            fetchHabits: async () => {
                console.log("Habits synchronized");
            },

            initializeDefaults: () => set((state) => {
                if (state.onboardingDataChoice !== 'unset') return {};

                return {
                    tasks: state.tasks.length === 0 ? INITIAL_TASKS : state.tasks,
                    habits: state.habits.length === 0 ? INITIAL_HABITS : state.habits,
                    schedule: state.schedule.length === 0 ? INITIAL_SCHEDULE : state.schedule
                };
            }),

            markFreshStart: () => set({
                onboardingDataChoice: 'fresh',
                habits: [],
                schedule: [],
                tasks: [],
            }),

            toggleHabit: (habitId, date) => set((state) => {
                const dateStr = formatDate(date);
                return {
                    habits: state.habits.map((h) => {
                        if (h.id !== habitId) return h;
                        const isCompleted = h.completedDates.includes(dateStr);
                        let newCompletedDates = [...h.completedDates];
                        let newStreak = h.streak;
                        if (isCompleted) {
                            newCompletedDates = newCompletedDates.filter(d => d !== dateStr);
                            if (formatDate(new Date()) === dateStr) newStreak = Math.max(0, newStreak - 1);
                        } else {
                            newCompletedDates.push(dateStr);
                            if (formatDate(new Date()) === dateStr) newStreak += 1;
                        }
                        return { ...h, completedDates: newCompletedDates, streak: newStreak };
                    })
                };
            }),

            updateHabitValue: (habitId, date, value) => set((state) => {
                const dateStr = formatDate(date);
                const isToday = formatDate(new Date()) === dateStr;
                let xpGained = 0;
                const newHabits = state.habits.map((h) => {
                    if (h.id !== habitId) return h;
                    const newHistory = { ...h.history, [dateStr]: value };
                    const isGoalMet = h.goal ? value >= h.goal : false;
                    let newCompletedDates = [...h.completedDates];
                    let newStreak = h.streak;
                    const wasCompleted = h.completedDates.includes(dateStr);
                    if (isGoalMet && !wasCompleted) {
                        newCompletedDates.push(dateStr);
                        if (isToday) { newStreak += 1; xpGained = 10; }
                    } else if (!isGoalMet && wasCompleted) {
                        newCompletedDates = newCompletedDates.filter(d => d !== dateStr);
                        if (isToday) { newStreak = Math.max(0, newStreak - 1); xpGained = -10; }
                    }
                    return { ...h, history: newHistory, completedDates: newCompletedDates, streak: newStreak };
                });
                return { habits: newHabits, user: state.user ? { ...state.user, xp: state.user.xp + xpGained } : state.user };
            }),

            logDeepWork: (minutes) => {
                const today = new Date();
                const dateStr = formatDate(today);
                const { habits, updateHabitValue } = get();

                const codingHabit = habits.find(h => h.category === 'coding' && h.type === 'timer');
                if (codingHabit) {
                    const currentVal = codingHabit.history[dateStr] || 0;
                    updateHabitValue(codingHabit.id, today, currentVal + minutes);
                }

                set((state) => ({
                    user: state.user ? { ...state.user, xp: state.user.xp + (minutes * 2) } : state.user
                }));
            },

            getDailyProgress: (date) => {
                const { habits } = get();
                if (habits.length === 0) return 0;
                const dateStr = formatDate(date);
                const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
                return Math.round((completedCount / habits.length) * 100);
            },

            syncDate: () => {
                const { selectedDate } = get();
                const today = new Date();
                if (formatDate(selectedDate) !== formatDate(today)) {
                    const todayStr = formatDate(today);
                    get().checkStreakShield(today);
                    set((state) => ({
                        selectedDate: today,
                        todayMood: state.moodHistory.find((item) => item.date === todayStr) ?? null
                    }));
                }
            },

            updateUser: (updates) => set((state) => ({
                user: { ...state.user, ...updates }
            })),

            resetData: () => {
                const currentState = get();
                localStorage.setItem('habit-tracker-emergency-backup', JSON.stringify({
                    user: currentState.user,
                    habits: currentState.habits,
                    schedule: currentState.schedule,
                    tasks: currentState.tasks,
                    version: 8,
                    timestamp: new Date().toISOString()
                }));

                console.log("Resetting Data - Emergency backup created");
                get().clearAll();
            },

            restoreBackup: () => {
                const backup = localStorage.getItem('habit-tracker-emergency-backup');
                if (backup) {
                    try {
                        const data = JSON.parse(backup);
                        set({
                            user: data.user,
                            habits: data.habits,
                            schedule: data.schedule,
                            tasks: data.tasks
                        });
                        toast.success("Intel Restored from Backup");
                        localStorage.removeItem('habit-tracker-emergency-backup');
                    } catch (e) {
                        toast.error("Backup Data Corrupted");
                    }
                } else {
                    toast.error("No Emergency Backup Found");
                }
            },

            clearAll: () => set({
                user: INITIAL_USER,
                habits: [],
                schedule: [],
                tasks: [],
                onboardingDataChoice: 'unset',
                todayMood: null,
                moodHistory: [],
                journalEntries: [],
                dismissedMotivationDate: null,
                streakShields: 0,
                lastStreakDate: null,
                selectedDate: new Date(),
                workoutLogs: [],
                dietLogs: [],
                waterIntakeLiters: 0,
            })
        }),
        {
            name: getUserScopedStoreName('habit-store', getCurrentStoreUserId()),
            storage: createJSONStorage(() => localStorage),
            version: 9,
            migrate: (persistedState: any, version: number) => {
                let nextState = persistedState;
                if (version < 6) {
                    nextState = {
                        ...nextState,
                        tasks: nextState.tasks || [],
                        user: nextState.user || INITIAL_USER
                    };
                }
                if (version < 7) {
                    nextState = {
                        ...nextState,
                        todayMood: nextState.todayMood || null,
                        moodHistory: nextState.moodHistory || []
                    };
                }
                if (version < 8) {
                    nextState = {
                        ...nextState,
                        dismissedMotivationDate: nextState.dismissedMotivationDate || null
                    };
                }
                nextState = {
                    ...nextState,
                    journalEntries: nextState.journalEntries || [],
                    streakShields: version < 9 ? 0 : nextState.streakShields || 0,
                    lastStreakDate: version < 9 ? null : nextState.lastStreakDate || null
                };
                return nextState;
            },
            partialize: (state) => ({
                user: state.user,
                habits: state.habits,
                schedule: state.schedule,
                tasks: state.tasks,
                onboardingDataChoice: state.onboardingDataChoice,
                workoutLogs: state.workoutLogs,
                todayMood: state.todayMood,
                moodHistory: state.moodHistory,
                journalEntries: state.journalEntries,
                dismissedMotivationDate: state.dismissedMotivationDate,
                streakShields: state.streakShields,
                lastStreakDate: state.lastStreakDate
            }),
        }
    )
);
