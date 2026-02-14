import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { Task, TaskCategory, TaskPriority, TaskStatus, EisenhowerQuadrant, CreateTaskDTO } from '@/types/task';

export type HabitType = 'checkbox' | 'numeric' | 'timer';
export type Category = 'coding' | 'devotional' | 'diet' | 'gym' | 'personal' | 'academics' | 'breaks';
export type TimeBlock = 'morning' | 'bus_college' | 'college' | 'bus_home' | 'evening';

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

interface HabitState {
    user: User;
    habits: Habit[];
    schedule: ScheduleItem[];
    tasks: Task[];
    selectedDate: Date;

    // Actions
    toggleHabit: (habitId: string, date: Date) => void;
    updateHabitValue: (habitId: string, date: Date, value: number) => void;
    setSelectedDate: (date: Date) => void;

    // Task Actions
    addTask: (taskData: CreateTaskDTO) => void;
    toggleTask: (taskId: string) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;
    fetchTasks: () => Promise<void>;

    // Schedule/Habit Actions
    addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates' | 'history'>) => void;
    fetchHabits: () => Promise<void>;
    addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
    removeScheduleItem: (id: string) => void;

    updateUser: (updates: Partial<User>) => void;
    resetData: () => void;
    restoreBackup: () => void;

    // Deep Work logging
    logDeepWork: (minutes: number) => void;

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
    { id: 'h1', title: 'Morning Code Session', time: '6:00 AM', streak: 12, completedDates: [], type: 'timer', category: 'coding', goal: 120, unit: 'min', history: {} },
    { id: 'h2', title: 'LeetCode Problem (Daily)', time: '9:00 PM', streak: 12, completedDates: [], type: 'checkbox', category: 'coding', history: {} },
    { id: 'h3', title: 'Code Notes & Review', time: '10:00 PM', streak: 12, completedDates: [], type: 'checkbox', category: 'coding', history: {} },

    // GYM
    { id: 'h4', title: 'Morning Gym Session', time: '8:30 AM', streak: 12, completedDates: [], type: 'timer', category: 'gym', goal: 90, unit: 'min', history: {} },
    { id: 'h5', title: 'Post-Workout Protein', time: '10:15 AM', streak: 12, completedDates: [], type: 'checkbox', category: 'gym', history: {} },
    { id: 'h6', title: 'Evening Cardio', time: '6:00 PM', streak: 12, completedDates: [], type: 'checkbox', category: 'gym', history: {} },
    { id: 'h7', title: 'Progress Photo (Weekly)', time: 'Sunday', streak: 12, completedDates: [], type: 'checkbox', category: 'gym', history: {} },

    // DIET
    { id: 'h8', title: 'Drink 8 Glasses Water', time: 'All Day', streak: 12, completedDates: [], type: 'numeric', category: 'diet', goal: 8, unit: 'glasses', history: {} },
    { id: 'h9', title: 'Log All Meals', time: 'All Day', streak: 12, completedDates: [], type: 'checkbox', category: 'diet', history: {} },
    { id: 'h10', title: 'Hit Calorie Goal (2200)', time: 'All Day', streak: 12, completedDates: [], type: 'numeric', category: 'diet', goal: 2200, unit: 'cal', history: {} },
    { id: 'h11', title: 'Hit Macro Goals (P/C/F)', time: 'All Day', streak: 12, completedDates: [], type: 'checkbox', category: 'diet', history: {} },
    { id: 'h12', title: 'Meal Prep (Sunday)', time: 'Sunday', streak: 12, completedDates: [], type: 'checkbox', category: 'diet', history: {} },

    // DEVOTIONAL
    { id: 'h13', title: 'Morning Meditation', time: '5:45 AM', streak: 12, completedDates: [], type: 'timer', category: 'devotional', goal: 15, unit: 'min', history: {} },
    { id: 'h14', title: 'Bhagavad Gita Reading', time: '10:30 PM', streak: 12, completedDates: [], type: 'timer', category: 'devotional', goal: 30, unit: 'min', history: {} },
    { id: 'h15', title: 'Evening Prayer', time: '8:30 PM', streak: 12, completedDates: [], type: 'checkbox', category: 'devotional', history: {} },

    // ACADEMICS
    { id: 'h16', title: 'Attend All Classes', time: '10:00 AM', streak: 12, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
    { id: 'h17', title: 'Study Session (2-3h)', time: '3:00 PM', streak: 12, completedDates: [], type: 'timer', category: 'personal', goal: 180, unit: 'min', history: {} },
    { id: 'h18', title: 'Review Lecture Notes', time: '7:00 PM', streak: 12, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
    { id: 'h19', title: 'Practice Problems', time: '7:30 PM', streak: 12, completedDates: [], type: 'checkbox', category: 'personal', history: {} },

    // PERSONAL
    { id: 'h20', title: 'Morning Journal Entry', time: '6:15 AM', streak: 12, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
    { id: 'h21', title: 'Gratitude Practice', time: '11:00 PM', streak: 12, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
    { id: 'h22', title: 'Sleep by 11:30 PM', time: '11:30 PM', streak: 12, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
    { id: 'h23', title: 'Reading (30 min)', time: '9:00 PM', streak: 12, completedDates: [], type: 'timer', category: 'personal', goal: 30, unit: 'min', history: {} },
    { id: 'h24', title: 'Weekly Planning', time: 'Sunday', streak: 12, completedDates: [], type: 'checkbox', category: 'personal', history: {} },

    // BREAKS
    { id: 'h25', title: 'Creative Learning', time: 'Flexible', streak: 12, completedDates: [], type: 'timer', category: 'personal', goal: 60, unit: 'min', history: {} },
    { id: 'h26', title: 'Hobby Time', time: 'Flexible', streak: 12, completedDates: [], type: 'timer', category: 'personal', goal: 60, unit: 'min', history: {} },
    { id: 'h27', title: 'Social Time', time: 'Flexible', streak: 12, completedDates: [], type: 'timer', category: 'personal', goal: 30, unit: 'min', history: {} },
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
            tasks: INITIAL_TASKS,
            habits: INITIAL_HABITS,
            schedule: INITIAL_SCHEDULE,

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
                        history: {}
                    }
                ]
            })),

            // Task Actions
            addTask: async (taskData) => {
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

                const newTask = await taskService.createTask({
                    ...taskData,
                    size,
                    priority,
                    status,
                    isRecurring: taskData.isRecurring || false,
                    subtasks: taskData.subtasks || []
                });

                set((state) => ({ tasks: [newTask, ...state.tasks] }));
            },

            toggleTask: (taskId) => set((state) => {
                const updatedTasks = state.tasks.map(t => {
                    if (t.id === taskId) {
                        const newCompleted = !t.completed;
                        const newStatus = newCompleted ? 'completed' : 'today';

                        // Async update in background
                        import('@/services/taskService').then(({ taskService }) => {
                            taskService.updateTask(taskId, { completed: newCompleted, status: newStatus as any });
                        });

                        return { ...t, completed: newCompleted, status: newStatus as any };
                    }
                    return t;
                });
                return { tasks: updatedTasks };
            }),

            updateTask: (taskId, updates) => set((state) => {
                // Async update in background
                import('@/services/taskService').then(({ taskService }) => {
                    taskService.updateTask(taskId, updates);
                });

                return {
                    tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
                };
            }),

            deleteTask: (taskId) => set((state) => {
                // Async update in background
                import('@/services/taskService').then(({ taskService }) => {
                    taskService.deleteTask(taskId);
                });
                return { tasks: state.tasks.filter(t => t.id !== taskId) };
            }),

            fetchTasks: async () => {
                const { taskService } = await import('@/services/taskService');
                const tasks = await taskService.getTasks();
                set({ tasks });
            },

            fetchHabits: async () => {
                // Future: add persistence for habits
                console.log("Habits synchronized");
            },

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

                // Find a 'coding' timer habit or target a specific one
                const codingHabit = habits.find(h => h.category === 'coding' && h.type === 'timer');
                if (codingHabit) {
                    const currentVal = codingHabit.history[dateStr] || 0;
                    updateHabitValue(codingHabit.id, today, currentVal + minutes);
                }

                // Also give XP bonus for deep work
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
                    set({ selectedDate: today });
                }
            },

            updateUser: (updates) => set((state) => ({
                user: { ...state.user, ...updates }
            })),

            resetData: () => {
                const currentState = get();
                // Create emergency backup in localStorage
                localStorage.setItem('habit-tracker-emergency-backup', JSON.stringify({
                    user: currentState.user,
                    habits: currentState.habits,
                    schedule: currentState.schedule,
                    tasks: currentState.tasks,
                    version: 6,
                    timestamp: new Date().toISOString()
                }));

                console.log("Resetting Data - Emergency backup created");
                set({
                    user: INITIAL_USER,
                    habits: INITIAL_HABITS,
                    schedule: INITIAL_SCHEDULE,
                    tasks: INITIAL_TASKS,
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
            version: 6, // Increment version for deep work action
            migrate: (persistedState: any, version: number) => {
                if (version < 6) {
                    // Just return common structures, defaults will handle the rest
                    return {
                        ...persistedState,
                        tasks: persistedState.tasks || INITIAL_TASKS,
                        user: persistedState.user || INITIAL_USER
                    };
                }
                return persistedState;
            },
            partialize: (state) => ({
                user: state.user,
                habits: state.habits,
                schedule: state.schedule,
                tasks: state.tasks
            }),
        }
    )
);
