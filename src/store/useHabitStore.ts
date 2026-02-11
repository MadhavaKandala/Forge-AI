import { create } from 'zustand';
import { Habit, HabitCompletion } from '../types/schema';
import { habitRepository } from '../repositories/habit.repository';
import { v4 as uuidv4 } from 'uuid';
import { dbService } from '../lib/db';

// Extended Habit type for UI
export interface HabitWithCompletion extends Habit {
    completedDates: string[]; // YYYY-MM-DD
    history: Record<string, number>; // Date -> Value (for numeric/timer)
}

interface HabitState {
    habits: HabitWithCompletion[];
    isLoading: boolean;
    error: string | null;
    selectedDate: Date;

    // Actions
    fetchHabits: () => Promise<void>;
    addHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'current_streak' | 'longest_streak' | 'total_completions' | 'is_active' | 'is_paused' | 'is_archived' | 'xp_value'>) => Promise<void>;
    toggleHabit: (habitId: string, date: Date) => Promise<void>;
    updateHabitValue: (habitId: string, date: Date, value: number) => Promise<void>;
    setSelectedDate: (date: Date) => void;
    deleteHabit: (id: string) => Promise<void>;

    // Selectors
    getDailyProgress: (date: Date) => number;
}

export const useHabitStore = create<HabitState>((set, get) => ({
    habits: [],
    isLoading: false,
    error: null,
    selectedDate: new Date(),

    fetchHabits: async () => {
        set({ isLoading: true });
        try {
            const habits = await habitRepository.findByUserId('default-user');

            const enrichedHabits = await Promise.all(habits.map(async (h) => {
                const completions = await habitRepository.getCompletions(h.id);
                const completedDates = completions.map(c => c.completion_date);
                const history: Record<string, number> = {};
                completions.forEach(c => {
                    history[c.completion_date] = c.counter_value || c.duration_minutes || c.progress_value || 1;
                });

                return {
                    ...h,
                    completedDates,
                    history
                };
            }));

            set({ habits: enrichedHabits });
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ isLoading: false });
        }
    },

    addHabit: async (habitData) => {
        try {
            const newHabit: Habit = {
                ...habitData,
                id: uuidv4(),
                user_id: 'default-user',
                current_streak: 0,
                longest_streak: 0,
                total_completions: 0,
                is_active: 1,
                is_paused: 0,
                is_archived: 0,
                xp_value: 10, // Default
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            } as Habit;

            await habitRepository.create(newHabit);

            const habitWithCompletion: HabitWithCompletion = { ...newHabit, completedDates: [], history: {} };
            set((state) => ({ habits: [...state.habits, habitWithCompletion] }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    toggleHabit: async (habitId, date) => {
        const dateStr = date.toISOString().split('T')[0];
        const { habits } = get();
        const habitIndex = habits.findIndex(h => h.id === habitId);
        if (habitIndex === -1) return;

        const habit = habits[habitIndex];
        const isCompleted = habit.completedDates.includes(dateStr);

        try {
            if (isCompleted) {
                await habitRepository.removeCompletion(habitId, dateStr);
            } else {
                const completion: Partial<HabitCompletion> = {
                    id: uuidv4(),
                    habit_id: habitId,
                    user_id: 'default-user',
                    completion_date: dateStr,
                    xp_earned: habit.xp_value,
                    completed_at: new Date().toISOString()
                };
                await habitRepository.addCompletion(completion);
            }

            // Sync local state
            const newCompletedDates = isCompleted
                ? habit.completedDates.filter(d => d !== dateStr)
                : [...habit.completedDates, dateStr];

            set((state) => ({
                habits: state.habits.map(h =>
                    h.id === habitId ? { ...h, completedDates: newCompletedDates } : h
                )
            }));

        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    updateHabitValue: async (habitId, date, value) => {
        const dateStr = date.toISOString().split('T')[0];
        const { habits } = get();
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        try {
            // Check if completion exists
            const existingCompletion = await habitRepository.getCompletionByDate(habitId, dateStr);

            if (existingCompletion) {
                // Update
                const setClause = habit.habit_type === 'counter' ? 'counter_value = ?' :
                    habit.habit_type === 'duration' ? 'duration_minutes = ?' : 'progress_value = ?';
                const query = `UPDATE habit_completions SET ${setClause} WHERE id = ?`;
                await dbService.run(query, [value, existingCompletion.id]);

            } else {
                // Create
                const completion: Partial<HabitCompletion> = {
                    id: uuidv4(),
                    habit_id: habitId,
                    user_id: 'default-user',
                    completion_date: dateStr,
                    xp_earned: habit.xp_value,
                    completed_at: new Date().toISOString()
                };
                if (habit.habit_type === 'counter') completion.counter_value = value;
                else if (habit.habit_type === 'duration') completion.duration_minutes = value;
                else if (habit.habit_type === 'progress') completion.progress_value = value;

                await habitRepository.addCompletion(completion);
            }

            // Update local state
            set((state) => ({
                habits: state.habits.map(h => {
                    if (h.id === habitId) {
                        const newHistory = { ...h.history, [dateStr]: value };

                        let goal = 0;
                        if (habit.habit_type === 'counter') goal = habit.counter_goal || 0;
                        else if (habit.habit_type === 'duration') goal = habit.duration_goal_minutes || 0;
                        else if (habit.habit_type === 'progress') goal = habit.progress_goal || 0;

                        const isGoalMet = value >= goal;
                        let newCompletedDates = [...h.completedDates];
                        if (isGoalMet && !newCompletedDates.includes(dateStr)) {
                            newCompletedDates.push(dateStr);
                        } else if (!isGoalMet && newCompletedDates.includes(dateStr)) {
                            newCompletedDates = newCompletedDates.filter(d => d !== dateStr);
                        }

                        return { ...h, history: newHistory, completedDates: newCompletedDates };
                    }
                    return h;
                })
            }));

        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    deleteHabit: async (id) => {
        try {
            await habitRepository.delete(id);
            set((state) => ({ habits: state.habits.filter(h => h.id !== id) }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    setSelectedDate: (date) => set({ selectedDate: date }),

    getDailyProgress: (date) => {
        const { habits } = get();
        if (habits.length === 0) return 0;
        const dateStr = date.toISOString().split('T')[0];
        const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
        return Math.round((completedCount / habits.length) * 100);
    }
}));
