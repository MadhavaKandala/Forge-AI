import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';

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
    async getTimeBreakdown(startDate: string, endDate: string): Promise<CategoryTimeData[]> {
        return [];
    },

    async getPunctualityStats(): Promise<{ estimated: number, actual: number }> {
        return { estimated: 0, actual: 0 };
    }
};
