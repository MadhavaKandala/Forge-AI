import { taskService } from './taskService';
import { useHabitStore } from '../store/useHabitStore';
import { Task } from '../types/task';
import { format, parse, isSameDay } from 'date-fns';

export interface ScheduleItem {
    id: string;
    title: string;
    time: string; // HH:MM
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
            // Simple heuristic for time: check if habit.time looks like HH:MM or simple string
            // If "Morning", assign 08:00
            // If "Evening", assign 20:00
            let time = '09:00';
            if (habit.time.match(/\d{1,2}:\d{2}/)) {
                time = habit.time; // "10:00 AM" needs parsing
            } else if (habit.time.toLowerCase().includes('morning')) {
                time = '08:00';
            } else if (habit.time.toLowerCase().includes('evening')) {
                time = '20:00';
            }

            // Check if completed for this date
            const isCompleted = habit.completedDates.includes(dateStr);

            // Only add if it makes sense to show on schedule
            items.push({
                id: habit.id,
                title: habit.title,
                time: time, // potentially needs simpler format
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
