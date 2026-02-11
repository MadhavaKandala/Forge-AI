import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type HabitType = 'checkbox' | 'numeric' | 'timer';

export interface Habit {
    id: string;
    title: string;
    time: string;
    streak: number;
    completedDates: string[]; // ISO date strings YYYY-MM-DD
    type: HabitType;
    goal?: number;
    unit?: string;
    // Map date string to value (e.g., "2024-02-09": 50)
    history: Record<string, number>;
}

interface User {
    name: string;
    level: number;
    xp: number;
    avatarUrl?: string;
}

export interface ScheduleItem {
    id: string;
    title: string;
    time: string;
    duration?: string;
    tag?: string;
    color: string;
    period: 'today' | 'week' | 'month';
}

interface HabitState {
    user: User;
    habits: Habit[];
    schedule: ScheduleItem[];
    selectedDate: Date;

    // Actions
    toggleHabit: (habitId: string, date: Date) => void;
    updateHabitValue: (habitId: string, date: Date, value: number) => void;
    setSelectedDate: (date: Date) => void;
    addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates' | 'history'>) => void;
    addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
    removeScheduleItem: (id: string) => void;

    // Selectors
    getDailyProgress: (date: Date) => number;
}

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const useHabitStore = create<HabitState>()(
    persist(
        (set, get) => ({
            user: {
                name: 'Madhava',
                level: 5,
                xp: 1250,
                avatarUrl: 'https://github.com/shadcn.png'
            },
            selectedDate: new Date(),
            habits: [
                {
                    id: '1',
                    title: 'Morning meditation',
                    time: '10 min',
                    streak: 12,
                    completedDates: [formatDate(new Date())],
                    type: 'checkbox',
                    history: {}
                },
                {
                    id: '2',
                    title: 'Drink 4L of water',
                    time: 'All Day',
                    streak: 8,
                    completedDates: [],
                    type: 'numeric',
                    goal: 4000,
                    unit: 'ml',
                    history: {}
                },
                {
                    id: '3',
                    title: 'Deep Work',
                    time: 'Anytime',
                    streak: 4,
                    completedDates: [],
                    type: 'timer',
                    goal: 240, // 4 hours
                    unit: 'mins',
                    history: {}
                },
                {
                    id: '4',
                    title: 'Read 20 pages',
                    time: 'Evening',
                    streak: 45,
                    completedDates: [],
                    type: 'checkbox',
                    goal: 20,
                    unit: 'pages',
                    history: {}
                }
            ],

            schedule: [
                {
                    id: '1',
                    title: 'Morning Run',
                    time: '7:00 AM',
                    duration: '45 min',
                    tag: 'Fitness',
                    color: '#dfff4f', // Neon Lime
                    period: 'today'
                },
                {
                    id: '2',
                    title: 'Reading Time',
                    time: '8:00 PM',
                    duration: '30 min',
                    tag: 'Self-care',
                    color: '#f97316', // Orange
                    period: 'today'
                },
                {
                    id: '3',
                    title: 'Weekly Review',
                    time: 'Sunday 6:00 PM',
                    duration: '1 hr',
                    tag: 'Planning',
                    color: '#7c3aed', // Violet
                    period: 'week'
                },
                {
                    id: '4',
                    title: 'Dentist Appointment',
                    time: 'Oct 24, 10:00 AM',
                    duration: '1 hr',
                    tag: 'Health',
                    color: '#3b82f6', // Blue
                    period: 'month'
                }
            ],

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

            toggleHabit: (habitId, date) => set((state) => {
                const dateStr = formatDate(date);

                return {
                    habits: state.habits.map((h) => {
                        if (h.id !== habitId) return h;

                        const isCompleted = h.completedDates.includes(dateStr);
                        let newCompletedDates = [...h.completedDates];
                        let newStreak = h.streak;

                        if (isCompleted) {
                            // Untoggle
                            newCompletedDates = newCompletedDates.filter(d => d !== dateStr);
                            if (formatDate(new Date()) === dateStr) {
                                newStreak = Math.max(0, newStreak - 1);
                            }
                        } else {
                            // Toggle ON
                            newCompletedDates.push(dateStr);
                            if (formatDate(new Date()) === dateStr) {
                                newStreak += 1;
                            }
                        }

                        return {
                            ...h,
                            completedDates: newCompletedDates,
                            streak: newStreak
                        };
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

                    // Check if goal met
                    const isGoalMet = h.goal ? value >= h.goal : false;
                    let newCompletedDates = [...h.completedDates];
                    let newStreak = h.streak;

                    const wasCompleted = h.completedDates.includes(dateStr);

                    if (isGoalMet && !wasCompleted) {
                        newCompletedDates.push(dateStr);
                        if (isToday) {
                            newStreak += 1;
                            xpGained = 10;
                        }
                    } else if (!isGoalMet && wasCompleted) {
                        newCompletedDates = newCompletedDates.filter(d => d !== dateStr);
                        if (isToday) {
                            newStreak = Math.max(0, newStreak - 1);
                            xpGained = -10;
                        }
                    }

                    return {
                        ...h,
                        history: newHistory,
                        completedDates: newCompletedDates,
                        streak: newStreak
                    };
                });

                return {
                    habits: newHabits,
                    user: {
                        ...state.user,
                        xp: state.user.xp + xpGained
                    }
                };
            }),

            getDailyProgress: (date) => {
                const { habits } = get();
                if (habits.length === 0) return 0;

                const dateStr = formatDate(date);
                // Simple calculation: count of completed habits
                // Advanced: could sum up % of each habit (e.g. 50% of water + 100% of yoga)
                // For now, let's keep it binary (completed or not) for the main ring
                const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
                return Math.round((completedCount / habits.length) * 100);
            }
        }),
        {
            name: 'habit-tracker-storage',
            partialize: (state) => ({
                user: state.user,
                habits: state.habits
            }),
        }
    )
);
