import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type HabitType = 'checkbox' | 'numeric' | 'timer';
export type Category = 'coding' | 'devotional' | 'diet' | 'gym' | 'personal';
export type TimeBlock = 'morning' | 'bus_college' | 'college' | 'bus_home' | 'evening';
export type EisenhowerQuadrant = 'q1' | 'q2' | 'q3' | 'q4';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    size: 'big' | 'medium' | 'small'; // For 1-3-5 Rule
    quadrant: EisenhowerQuadrant;
    dueDate?: string;
    subtasks: { id: string; title: string; completed: boolean }[];
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
    addTask: (task: Omit<Task, 'id' | 'completed' | 'subtasks'>) => void;
    toggleTask: (taskId: string) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;

    // Schedule/Habit Actions
    addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates' | 'history'>) => void;
    addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
    removeScheduleItem: (id: string) => void;

    updateUser: (updates: Partial<User>) => void;
    resetData: () => void;

    // Selectors
    getDailyProgress: (date: Date) => number;
    syncDate: () => void;
}

const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const INITIAL_TASKS: Task[] = [
    {
        id: 't1',
        title: 'Complete 3 LeetCode Problems',
        completed: false,
        size: 'big',
        quadrant: 'q1',
        subtasks: [
            { id: 'st1', title: 'Problem 1 (Easy)', completed: false },
            { id: 'st2', title: 'Problem 2 (Medium)', completed: false },
            { id: 'st3', title: 'Problem 3 (Medium)', completed: false }
        ]
    },
    { id: 't2', title: 'Study MongoDB Course', completed: false, size: 'medium', quadrant: 'q2', subtasks: [] },
    { id: 't3', title: 'Review CP Class Notes', completed: false, size: 'medium', quadrant: 'q2', subtasks: [] },
    { id: 't4', title: 'Gita Reading (Chapter 2)', completed: false, size: 'medium', quadrant: 'q2', subtasks: [] },
    { id: 't5', title: 'Morning meditation', completed: false, size: 'small', quadrant: 'q2', subtasks: [] },
    { id: 't6', title: 'Read in bus', completed: false, size: 'small', quadrant: 'q2', subtasks: [] },
    { id: 't7', title: 'Log meals', completed: false, size: 'small', quadrant: 'q2', subtasks: [] },
    { id: 't8', title: 'Water intake', completed: false, size: 'small', quadrant: 'q2', subtasks: [] },
    { id: 't9', title: 'Evening journal', completed: false, size: 'small', quadrant: 'q2', subtasks: [] },
];

const INITIAL_HABITS: Habit[] = [
    // CODING
    {
        id: '1', title: 'LeetCode Daily', time: '1:30 PM (CP)', streak: 0, completedDates: [],
        type: 'checkbox', category: 'coding', history: {}
    },
    {
        id: '2', title: 'Full Stack Class', time: '9:30 AM', streak: 0, completedDates: [],
        type: 'checkbox', category: 'coding', history: {}
    },
    {
        id: '3', title: 'CP Practice', time: '2:30 PM', streak: 0, completedDates: [],
        type: 'checkbox', category: 'coding', history: {}
    },
    // DEVOTIONAL
    {
        id: '4', title: 'Morning Meditation', time: '6:15 AM', streak: 0, completedDates: [],
        type: 'timer', category: 'devotional', goal: 15, unit: 'min', history: {}
    },
    {
        id: '5', title: 'Gita/Book Reading', time: 'Bus Ride', streak: 0, completedDates: [],
        type: 'timer', category: 'devotional', goal: 30, unit: 'min', history: {}
    },
    // DIET
    {
        id: '6', title: 'Log All Meals', time: 'All Day', streak: 0, completedDates: [],
        type: 'checkbox', category: 'diet', history: {}
    },
    {
        id: '7', title: 'Water Intake', time: 'All Day', streak: 0, completedDates: [],
        type: 'numeric', category: 'diet', goal: 4000, unit: 'ml', history: {}
    },
    // PERSONAL
    {
        id: '8', title: 'Morning Journal', time: '6:30 AM', streak: 0, completedDates: [],
        type: 'checkbox', category: 'personal', history: {}
    },
    {
        id: '9', title: 'Sleep by 11 PM', time: '11:00 PM', streak: 0, completedDates: [],
        type: 'checkbox', category: 'personal', history: {}
    }
];

const INITIAL_SCHEDULE: ScheduleItem[] = [
    // MORNING
    { id: 's1', title: 'Wake Up & Routine', time: '6:00 AM', duration: '1h', color: '#10b981', period: 'today', block: 'morning' },
    // BUS
    { id: 's2', title: 'Bus to College (Reading)', time: '8:00 AM', duration: '1h', color: '#f59e0b', period: 'today', block: 'bus_college' },
    // COLLEGE
    { id: 's3', title: 'Full Stack Class', time: '9:30 AM', duration: '3h', color: '#3b82f6', period: 'today', block: 'college', isFixed: true },
    { id: 's4', title: 'Lunch Break', time: '12:30 PM', duration: '1h', color: '#64748b', period: 'today', block: 'college', isFixed: true },
    { id: 's5', title: 'CP Class (Coding)', time: '1:30 PM', duration: '2.5h', color: '#8b5cf6', period: 'today', block: 'college', isFixed: true },
    // BUS HOME
    { id: 's6', title: 'Bus Home (Reading)', time: '4:30 PM', duration: '1.5h', color: '#f59e0b', period: 'today', block: 'bus_home' },
    // EVENING
    { id: 's7', title: 'Peak Productivity', time: '6:30 PM', duration: '2h 40m', color: '#ef4444', period: 'today', block: 'evening' },
    { id: 's8', title: 'Dinner & Family', time: '9:10 PM', duration: '30m', color: '#10b981', period: 'today', block: 'evening' },
];

const INITIAL_USER: User = {
    name: 'Madhava',
    level: 1,
    xp: 0,
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
            addTask: (task) => set((state) => ({
                tasks: [...state.tasks, { ...task, id: Math.random().toString(36).substr(2, 9), completed: false, subtasks: [] }]
            })),

            toggleTask: (taskId) => set((state) => ({
                tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
            })),

            updateTask: (taskId, updates) => set((state) => ({
                tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
            })),

            deleteTask: (taskId) => set((state) => ({
                tasks: state.tasks.filter(t => t.id !== taskId)
            })),

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
                console.log("Resetting Data to REAL defaults");
                set({
                    user: INITIAL_USER,
                    habits: INITIAL_HABITS,
                    schedule: INITIAL_SCHEDULE,
                    tasks: INITIAL_TASKS,
                    selectedDate: new Date()
                });
            },
        }),
        {
            name: 'habit-tracker-storage',
            version: 5, // Increment version again to force update
            migrate: (persistedState, version) => {
                // Force reset for version 5
                return {
                    user: INITIAL_USER,
                    habits: INITIAL_HABITS,
                    schedule: INITIAL_SCHEDULE,
                    tasks: INITIAL_TASKS,
                    selectedDate: new Date()
                } as HabitState;
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
