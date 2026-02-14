import { dbService } from '../lib/db';
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
        try {
            // Aggregate Pomodoro Sessions by Task Category
            // Join pomodoro_sessions -> tasks
            const sql = `
            SELECT t.category, SUM(ps.duration_minutes) as total_minutes
            FROM pomodoro_sessions ps
            JOIN tasks t ON ps.task_id = t.id
            WHERE ps.started_at BETWEEN ? AND ?
            GROUP BY t.category
        `;

            const result = await dbService.query(sql, [startDate, endDate]);

            // Map result to simpler array
            const map: Record<string, number> = {};
            result.forEach(row => {
                const cat = row.category || 'uncategorized';
                map[cat] = (map[cat] || 0) + row.total_minutes;
            });

            // Also consider manual time logs if implemented (future)

            return Object.entries(map).map(([category, totalMinutes]) => ({
                category,
                totalMinutes
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
            WHERE status = 'completed' AND estimated_minutes IS NOT NULL
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
