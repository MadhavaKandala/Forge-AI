import { taskService } from './taskService';
import { useHabitStore } from '../store/useHabitStore';
import { Task } from '../types/task';
import { format, parse, isSameDay } from 'date-fns';

export interface ScheduleItem {
    id: string;
    title: string;
    time: string; // HH:MM
    scheduledTime?: string;
    date: string; // YYYY-MM-DD
    type: 'task' | 'habit' | 'event';
    duration?: number; // minutes
    status: 'pending' | 'completed';
    category?: string;
}

export const scheduleService = {
    async getScheduleForDate(date: Date): Promise<ScheduleItem[]> {
        const dateStr = format(date, 'yyyy-MM-dd');
        const items: ScheduleItem[] = [];

        // 1. Fetch Tasks for this date
        const tasks = await taskService.getTasksByDate(dateStr);
        tasks.forEach(task => {
            if (task.scheduledTime) {
                items.push({
                    id: task.id,
                    title: task.title,
                    time: task.scheduledTime,
                    date: task.scheduledDate || dateStr,
                    type: 'task',
                    duration: task.estimatedMinutes,
                    status: task.status === 'completed' ? 'completed' : 'pending',
                    category: task.category
                });
            }
        });

        // 2. Fetch Habits (from Store for now, as they are not fully in SQLite yet)
        // In a real migration, Habits would be in SQLite too.
        // For now, we mock or read from Store if possible.
        // Accessing Store outside of React component is tricky with Zustand if not using vanilla store.
        const habitStore = useHabitStore.getState();
        const habits = habitStore.habits;

        habits.forEach(habit => {
            const scheduledTime = (habit as any).scheduledTime ?? habit.time ?? 'All Day';

            // Check if completed for this date
            const isCompleted = habit.completedDates.includes(dateStr);

            // Only add if it makes sense to show on schedule
            items.push({
                id: habit.id,
                title: habit.title,
                time: scheduledTime,
                scheduledTime,
                date: dateStr,
                type: 'habit',
                status: isCompleted ? 'completed' : 'pending',
                category: 'habit'
            });
        });

        // Sort by time
        return items.sort((a, b) => a.time.localeCompare(b.time));
    }
};
