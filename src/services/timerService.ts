import { dbService } from '../lib/db';
import { PomodoroSession, SessionType } from '../types/timer';
import { v4 as uuidv4 } from 'uuid';

export const timerService = {
    async startSession(taskId: string | undefined, habitId: string | undefined, type: SessionType, duration: number): Promise<string> {
        const id = uuidv4();
        const now = new Date().toISOString();

        const sql = `
      INSERT INTO pomodoro_sessions (
        id, task_id, habit_id, session_type, duration_minutes, started_at, distractions_count
      ) VALUES (?, ?, ?, ?, ?, ?, 0)
    `;

        await dbService.run(sql, [id, taskId || null, habitId || null, type, duration, now]);
        return id;
    },

    async completeSession(sessionId: string, wasInterrupted: boolean = false): Promise<void> {
        const now = new Date().toISOString();
        const sql = `
      UPDATE pomodoro_sessions 
      SET completed_at = ?, was_interrupted = ? 
      WHERE id = ?
    `;
        await dbService.run(sql, [now, wasInterrupted ? 1 : 0, sessionId]);
    },

    async logDistraction(sessionId: string): Promise<void> {
        const sql = `
      UPDATE pomodoro_sessions 
      SET distractions_count = distractions_count + 1 
      WHERE id = ?
    `;
        await dbService.run(sql, [sessionId]);
    },

    async getDailySessions(date: string): Promise<PomodoroSession[]> {
        // date is YYYY-MM-DD
        // We search where started_at starts with the date
        const likeDate = `${date}%`;
        const result = await dbService.query(
            'SELECT * FROM pomodoro_sessions WHERE started_at LIKE ? ORDER BY started_at DESC',
            [likeDate]
        );

        return result.map(row => ({
            id: row.id,
            habitId: row.habit_id,
            taskId: row.task_id,
            sessionType: row.session_type as SessionType,
            durationMinutes: row.duration_minutes,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            wasInterrupted: Boolean(row.was_interrupted),
            focusScore: row.focus_score,
            distractionsCount: row.distractions_count
        }));
    }
};
