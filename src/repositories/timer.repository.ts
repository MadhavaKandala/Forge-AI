import { BaseRepository } from './base.repository';
import { PomodoroSession } from '../types/schema';
import { dbService } from '../lib/db';

export class TimerRepository extends BaseRepository<PomodoroSession> {
    protected tableName = 'pomodoro_sessions';

    async findByDate(date: string): Promise<PomodoroSession[]> {
        // Assuming started_at is ISO string, we can filter by date prefix or range
        return this.query(`SELECT * FROM ${this.tableName} WHERE started_at LIKE ? ORDER BY started_at DESC`, [`${date}%`]);
    }

    async getTodayStats(): Promise<{ count: number; totalMinutes: number }> {
        const today = new Date().toISOString().split('T')[0];
        const sessions = await this.findByDate(today);

        const count = sessions.filter(s => s.was_completed === 1).length;
        const totalMinutes = sessions.reduce((acc, curr) => {
            // calculated based on stored duration or actual difference?
            // simpler to use duration_minutes if completed, or partial if we track it
            if (curr.was_completed === 1) {
                return acc + (curr.duration_minutes || 0);
            }
            return acc;
        }, 0);

        return { count, totalMinutes };
    }
}

export const timerRepository = new TimerRepository();
