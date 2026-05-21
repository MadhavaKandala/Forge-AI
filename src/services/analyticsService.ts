import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Task } from '../types/schema';
import { useTaskStore } from '../store/useTaskStore';

export interface CategoryTimeData {
    category: string;
    totalMinutes: number;
}

export interface WeeklyActivityData {
    day: string;
    completedTasks: number;
    completedHabits: number;
}

export const analyticsService = {
    async getTimeBreakdown(startDate: string, endDate: string, tasksSource?: Task[]): Promise<CategoryTimeData[]> {
        const tasks = tasksSource || useTaskStore.getState().tasks || [];
        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));

        const categoryMap = new Map<string, number>();

        for (const task of tasks) {
            if (task.status !== 'completed' && task.status !== 'done') continue;

            const dateStr = task.completed_at || task.updated_at || task.created_at;
            if (!dateStr) continue;

            try {
                const taskDate = parseISO(dateStr);
                if (isNaN(taskDate.getTime())) continue;

                if (isWithinInterval(taskDate, { start, end })) {
                    const minutes = task.actual_minutes ?? task.estimated_minutes ?? 0;
                    if (minutes > 0) {
                        const cat = task.category || 'other';
                        categoryMap.set(cat, (categoryMap.get(cat) || 0) + minutes);
                    }
                }
            } catch (e) {
                // Ignore invalid dates
            }
        }

        return Array.from(categoryMap.entries()).map(([category, totalMinutes]) => ({
            category,
            totalMinutes
        }));
    },

    async getPunctualityStats(tasksSource?: Task[]): Promise<{ estimated: number, actual: number }> {
        const tasks = tasksSource || useTaskStore.getState().tasks || [];
        let estimated = 0;
        let actual = 0;

        for (const task of tasks) {
            if (task.status === 'completed' || task.status === 'done') {
                estimated += (task.estimated_minutes || 0);
                actual += (task.actual_minutes || 0);
            }
        }

        return { estimated, actual };
    }
};
