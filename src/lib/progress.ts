import type { Habit } from '@/store/useHabitStore';
import type { Task } from '@/types/task';

export const formatDateKey = (date: Date): string => date.toISOString().split('T')[0];

export const getCompletionStatus = (completed: number, total: number): 'strong' | 'steady' | 'low' => {
    if (total > 0 && completed >= total) return 'strong';
    if (completed > 0) return 'steady';
    return 'low';
};

export const getStatusColor = (status: 'strong' | 'steady' | 'low'): string => {
    if (status === 'strong') return '#22C55E';
    if (status === 'steady') return '#FACC15';
    return '#FF4444';
};

export const getProgressStats = (habits: Habit[], tasks: Task[]) => {
    const today = formatDateKey(new Date());
    const checkboxHabits = habits.filter((habit) => habit.type === 'checkbox');
    const todayCompletedHabits = checkboxHabits.filter((habit) => habit.completedDates.includes(today)).length;
    const activeTodayTasks = tasks.filter((task) => task.status === 'today' || task.status === 'in_progress' || task.scheduledDate === today);
    const completedTodayTasks = activeTodayTasks.filter((task) => task.completed || task.status === 'completed').length;
    const completedToday = todayCompletedHabits + completedTodayTasks;
    const totalToday = checkboxHabits.length + activeTodayTasks.length;
    const longestStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
    const totalHabitCompletions = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
    const totalTaskCompletions = tasks.filter((task) => task.completed || task.status === 'completed').length;
    const last30 = Array.from({ length: 30 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - index));
        const key = formatDateKey(date);
        const completed = checkboxHabits.filter((habit) => habit.completedDates.includes(key)).length;
        const total = checkboxHabits.length;
        return {
            date: key,
            day: date.getDate(),
            completed,
            total,
            status: getCompletionStatus(completed, total),
        };
    });

    return {
        today,
        completedToday,
        totalToday,
        status: getCompletionStatus(completedToday, totalToday),
        longestStreak,
        totalCompleted: totalHabitCompletions + totalTaskCompletions,
        currentStreak: longestStreak,
        last30,
    };
};
