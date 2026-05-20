import { BaseRepository } from './base.repository';
import { PomodoroSession } from '../types/schema';

export class TimerRepository extends BaseRepository<PomodoroSession> {
    protected tableName = 'pomodoro_sessions';

    async findByDate(date: string): Promise<PomodoroSession[]> {
        return [];
    }

    async getTodayStats(): Promise<{ count: number; totalMinutes: number }> {
        return { count: 0, totalMinutes: 0 };
    }
}

export const timerRepository = new TimerRepository();
