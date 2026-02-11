import { dbService } from '../lib/db';
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';

export interface CategoryTimeData {
    category: string;
    totalMinutes: number;
    color?: string;
}

export interface WeeklyActivityData {
    day: string;
    completedTasks: number;
    completedHabits: number;
}

export const analyticsService = {
    async getTimeBreakdown(startDate: string, endDate: string): Promise<CategoryTimeData[]> {
        try {
            // Aggregate Time by Category from Pomodoro Sessions
            // We use the 'category' column directly from pomodoro_sessions
            const sql = `
            SELECT category, SUM(duration_minutes) as total_minutes
            FROM pomodoro_sessions
            WHERE started_at BETWEEN ? AND ?
              AND (was_completed = 1 OR duration_minutes > 0)
            GROUP BY category
        `;

            const result = await dbService.query(sql, [startDate, endDate]);

            // Map result
            const map: Record<string, number> = {};
            result.forEach(row => {
                const cat = row.category || 'general';
                const mins = row.total_minutes || 0;
                map[cat] = (map[cat] || 0) + mins;
            });

            // Define colors for known categories
            const categoryColors: Record<string, string> = {
                coding: '#3b82f6', // blue
                gym: '#ef4444', // red
                reading: '#10b981', // green
                meditation: '#8b5cf6', // purple
                general: '#6b7280' // gray
            };

            return Object.entries(map).map(([category, totalMinutes]) => ({
                category,
                totalMinutes,
                color: categoryColors[category.toLowerCase()] || '#dfff4f'
            })).sort((a, b) => b.totalMinutes - a.totalMinutes);

        } catch (error) {
            console.error("Error getting time breakdown", error);
            return [];
        }
    },

    async getPunctualityStats(): Promise<{ estimated: number, actual: number }> {
        try {
            // Compare estimated vs actual for completed tasks
            const sql = `
            SELECT SUM(estimated_minutes) as estimated, SUM(actual_minutes) as actual
            FROM tasks
            WHERE status = 'completed' AND estimated_minutes IS NOT NULL AND actual_minutes IS NOT NULL
          `;
            const result = await dbService.query(sql);
            if (result.length > 0) {
                return {
                    estimated: result[0].estimated || 0,
                    actual: result[0].actual || 0
                };
            }
            return { estimated: 0, actual: 0 };
        } catch (error) {
            console.error("Error getting punctuality stats", error);
            return { estimated: 0, actual: 0 };
        }
    }
};
