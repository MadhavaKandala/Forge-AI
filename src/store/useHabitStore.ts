import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { Task, TaskCategory, TaskPriority, TaskStatus, EisenhowerQuadrant, CreateTaskDTO } from '@/types/task';
import { MoodKey } from '@/lib/moodContent';

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

interface HabitState {
    user: User;
    habits: Habit[];
    schedule: ScheduleItem[];
    tasks: Task[];
    onboardingDataChoice: 'unset' | 'demo' | 'fresh';
    todayMood: MoodHistoryEntry | null;
    moodHistory: MoodHistoryEntry[];
    dismissedMotivationDate: string | null;
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

    // Motivation Actions
    dismissMotivationForToday: (date?: Date) => void;

    // Selectors
    getDailyProgress: (date: Date) => number;
    syncDate: () => void;
}

const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const INITIAL_TASKS: Task[] = [
    { id: 't1', title: 'Two Sum Problem', completed: true, status: 'completed', size: 'medium', quadrant: 'q1', category: 'coding', priority: 'high', isRecurring: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), subtasks: [] },
    { id: 't2', title: 'Study Ch5', completed: false, status: 'today', size: 'big', quadrant: 'q1', category: 'academics', priority: 'high', isRecurring: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), subtasks: [] },
    { id: 't3', title: 'Chest Workout', completed: false, status: 'this_week', size: 'medium', quadrant: 'q2', category: 'gym', priority: 'medium', isRecurring: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), subtasks: [] },
    { id: 't4', title: 'Reverse Linked List', completed: false, status: 'today', size: 'medium', quadrant: 'q1', category: 'coding', priority: 'high', isRecurring: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), subtasks: [] },
    { id: 't5', title: 'Bhagavad Gita Reading', completed: false, status: 'this_week', size: 'small', quadrant: 'q2', category: 'devotional', priority: 'low', isRecurring: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), subtasks: [] },
];

const INITIAL_HABITS: Habit[] = [
    // CODING
    { id: 'h1', title: 'Morning Code Session', time: '6:00 AM', streak: 0, completedDates: [], type: 'timer', category: 'coding', goal: 120, unit: 'min', history: {} },
    { id: 'h2', title: 'LeetCode Problem (Daily)', time: '9:00 PM', streak: 0, completedDates: [], type: 'checkbox', category: 'coding', history: {} },
    { id: 'h3', title: 'Code Notes & Review', time: '10:00 PM', streak: 0, completedDates: [], type: 'checkbox', category: 'coding', history: {} },

    // GYM
    { id: 'h4', title: 'Morning Gym Session', time: '8:30 AM', streak: 0, completedDates: [], type: 'timer', category: 'gym', goal: 90, unit: 'min', history: {} },
    { id: 'h5', title: 'Post-Workout Protein', time: '10:15 AM', streak: 0, completedDates: [], type: 'checkbox', category: 'gym', history: {} },
    { id: 'h6', title: 'Evening Cardio', time: '6:00 PM', streak: 0, completedDates: [], type: 'checkbox', category: 'gym', history: {} },
    { id: 'h7', title: 'Progress Photo (Weekly)', time: 'Sunday', streak: 0, completedDates: [], type: 'checkbox', category: 'gym', history: {} },

    // DIET
    { id: 'h8', title: 'Drink 8 Glasses Water', time: 'All Day', streak: 0, completedDates: [], type: 'numeric', category: 'diet', goal: 8, unit: 'glasses', history: {} },
    { id: 'h9', title: 'Log All Meals', time: 'All Day', streak: 0, completedDates: [], type: 'checkbox', category: 'diet', history: {} },
    { id: 'h10', title: 'Hit Calorie Goal (2200)', time: 'All Day', streak: 0, completedDates: [], type: 'numeric', category: 'diet', goal: 2200, unit: 'cal', history: {} },
    { id: 'h11', title: 'Hit Macro Goals (P/C/F)', time: 'All Day', streak: 0, completedDates: [], type: 'checkbox', category: 'diet', history: {} },
    { id: 'h12', title: 'Meal Prep (Sunday)', time: 'Sunday', streak: 0, completedDates: [], type: 'checkbox', category: 'diet', history: {} },

    // DEVOTIONAL
    { id: 'h13', title: 'Morning Meditation', time: '5:45 AM', streak: 0, completedDates: [], type: 'timer', category: 'devotional', goal: 15, unit: 'min', history: {} },
    { id: 'h14', title: 'Bhagavad Gita Reading', time: '10:30 PM', streak: 0, completedDates: [], type: 'timer', category: 'devotional', goal: 30, unit: 'min', history: {} },
    { id: 'h15', title: 'Evening Prayer', time: '8:30 PM', streak: 0, completedDates: [], type: 'checkbox', category: 'devotional', history: {} },

    // ACADEMICS
    { id: 'h16', title: 'Attend All Classes', time: '10:00 AM', streak: 0, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
    { id: 'h17', title: 'Study Session (2-3h)', time: '3:00 PM', streak: 0, completedDates: [], type: 'timer', category: 'personal', goal: 180, unit: 'min', history: {} },
    { id: 'h18', title: 'Review Lecture Notes', time: '7:00 PM', streak: 0, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
    { id: 'h19', title: 'Practice Problems', time: '7:30 PM', streak: 0, completedDates: [], type: 'checkbox', category: 'personal', history: {} },

    // PERSONAL
    { id: 'h20', title: 'Morning Journal Entry', time: '6:15 AM', streak: 0, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
    { id: 'h21', title: 'Gratitude Practice', time: '11:00 PM', streak: 0, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
    { id: 'h22', title: 'Sleep by 11:30 PM', time: '11:30 PM', streak: 0, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
    { id: 'h23', title: 'Reading (30 min)', time: '9:00 PM', streak: 0, completedDates: [], type: 'timer', category: 'personal', goal: 30, unit: 'min', history: {} },
    { id: 'h24', title: 'Weekly Planning', time: 'Sunday', streak: 0, completedDates: [], type: 'checkbox', category: 'personal', history: {} },

    // BREAKS
    { id: 'h25', title: 'Creative Learning', time: 'Flexible', streak: 0, completedDates: [], type: 'timer', category: 'personal', goal: 60, unit: 'min', history: {} },
    { id: 'h26', title: 'Hobby Time', time: 'Flexible', streak: 0, completedDates: [], type: 'timer', category: 'personal', goal: 60, unit: 'min', history: {} },
    { id: 'h27', title: 'Social Time', time: 'Flexible', streak: 0, completedDates: [], type: 'timer', category: 'personal', goal: 30, unit: 'min', history: {} },
];

const INITIAL_SCHEDULE: ScheduleItem[] = [
    { id: 's1', title: 'Morning Meditation', time: '5:45 AM', duration: '15m', color: '#8b5cf6', period: 'today', block: 'morning' },
    { id: 's2', title: 'Morning Code Session', time: '6:00 AM', duration: '2h', color: '#10b981', period: 'today', block: 'morning' },
    { id: 's3', title: 'Morning Journal', time: '6:15 AM', duration: '15m', color: '#3b82f6', period: 'today', block: 'morning' },
    { id: 's4', title: 'Morning Gym Session', time: '8:30 AM', duration: '1h 30m', color: '#ef4444', period: 'today', block: 'morning' },
    { id: 's5', title: 'Academic Block', time: '10:00 AM', duration: '7h', color: '#f59e0b', period: 'today', block: 'college', isFixed: true },
    { id: 's6', title: 'Study Session', time: '3:00 PM', duration: '3h', color: '#8b5cf6', period: 'today', block: 'college' },
    { id: 's7', title: 'Optional Cardio', time: '6:00 PM', duration: '30m', color: '#ef4444', period: 'today', block: 'evening' },
    { id: 's8', title: 'Review Lecture Notes', time: '7:00 PM', duration: '30m', color: '#f59e0b', period: 'today', block: 'evening' },
    { id: 's9', title: 'Practice Problems', time: '7:30 PM', duration: '1h', color: '#f59e0b', period: 'today', block: 'evening' },
    { id: 's10', title: 'Evening Prayer', time: '8:30 PM', duration: '15m', color: '#8b5cf6', period: 'today', block: 'evening' },
    { id: 's11', title: 'Reading (Atomic Habits)', time: '9:00 PM', duration: '30m', color: '#3b82f6', period: 'today', block: 'evening' },
    { id: 's12', title: 'LeetCode Problem', time: '9:30 PM', duration: '1h', color: '#10b981', period: 'today', block: 'evening' },
    { id: 's13', title: 'Code Notes & Review', time: '10:30 PM', duration: '15m', color: '#10b981', period: 'today', block: 'evening' },
    { id: 's14', title: 'Bhagavad Gita Reading', time: '10:45 PM', duration: '30m', color: '#8b5cf6', period: 'today', block: 'evening' },
    { id: 's15', title: 'Gratitude Practice', time: '11:15 PM', duration: '5m', color: '#3b82f6', period: 'today', block: 'evening' },
];

const INITIAL_USER: User = {
    name: 'Madhava',
    level: 1,
    xp: 2840,
    avatarUrl: 'https://github.com/shadcn.png',
    notificationsEnabled: true
};

export const useHabitStore = create<HabitState>()(
    persist(
        (set, get) => ({
            user: INITIAL_USER,
            selectedDate: new Date(),
            onboardingDataChoice: 'unset',
            tasks: [],
            todayMood: null,
            moodHistory: [],
            dismissedMotivationDate: null,
            habits: [],
            schedule: [],
            workoutLogs: [],
            dietLogs: [],
            waterIntakeLiters: 0,

            addXP: (amount) => set((state) => ({
                user: { ...state.user, xp: Math.max(0, state.user.xp + amount) }
            })),

            completeHabit: (habitId) => {
                const selectedDate = get().selectedDate;
                const dateStr = formatDate(selectedDate);
                const habit = get().habits.find((h) => h.id === habitId);
                const isAlreadyCompleted = habit?.completedDates.includes(dateStr) ?? false;

                get().toggleHabit(habitId, selectedDate);
                if (!isAlreadyCompleted) {
                    get().addXP(10);
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

            dismissMotivationForToday: (date = new Date()) => {
                set({ dismissedMotivationDate: formatDate(date) });
                toast.success('Daily Intel Dismissed');
            },

            addScheduleItem: (item) => set((state) => ({
                schedule: [...state.schedule, { ...item, id: Math.random().toString(36).substr(2, 9) }]
            })),

            removeScheduleItem: (id) => set((state) => ({
                schedule: state.schedule.filter((i) => i.id !== id)
            })),

            setSelectedDate: (date: Date) => set({ selectedDate: date }),

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
                        const newStatus = newCompleted ? 'completed' : 'today';

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
                            for (const task of get().tasks) {
                                await taskService.createTask(task).catch(e => console.error("Sync error:", e));
                            }
                        } else {
                            console.log("Seeding INITIAL_TASKS to DB...");
                            set({ tasks: INITIAL_TASKS });
                            for (const task of INITIAL_TASKS) {
                                await taskService.createTask(task).catch(e => console.error("Seed error:", e));
                            }
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
                return { habits: newHabits, user: { ...state.user, xp: state.user.xp + xpGained } };
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
                    user: { ...state.user, xp: state.user.xp + (minutes * 2) }
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
                set({
                    user: INITIAL_USER,
                    habits: INITIAL_HABITS,
                    schedule: INITIAL_SCHEDULE,
                    tasks: INITIAL_TASKS,
                    todayMood: null,
                    moodHistory: [],
                    dismissedMotivationDate: null,
                    selectedDate: new Date()
                });
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
            }
        }),
        {
            name: 'habit-tracker-storage',
            version: 8,
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
                dismissedMotivationDate: state.dismissedMotivationDate
            }),
        }
    )
);
