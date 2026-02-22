import { BaseRepository } from './base.repository';
import { BlitzList, BlitzSession, BlitzBreak } from '../types/schema';
import { dbService } from '../lib/db';

export class BlitzRepository extends BaseRepository<BlitzList> {
    protected tableName = 'blitz_lists';

    async findAllLists(): Promise<BlitzList[]> {
        return this.findAll();
    }

    // Blitz Sessions
    private allowedSessionColumns = ['id', 'task_id', 'started_at', 'ended_at', 'duration_seconds', 'est_minutes', 'taken_minutes', 'was_completed'];

    async saveSession(session: Partial<BlitzSession>): Promise<BlitzSession> {
        const keys = Object.keys(session).filter(key => this.allowedSessionColumns.includes(key));
        if (keys.length === 0) throw new Error('No valid columns provided');

        const values = keys.map(key => (session as any)[key]);
        const placeholders = keys.map(() => '?').join(', ');
        const columns = keys.join(', ');

        const query = `INSERT INTO blitz_sessions (${columns}) VALUES (${placeholders})`;
        await dbService.run(query, values);

        return session as BlitzSession;
    }

    async getSessionsByTask(taskId: string): Promise<BlitzSession[]> {
        const query = `SELECT * FROM blitz_sessions WHERE task_id = ? ORDER BY started_at DESC`;
        const result = await dbService.query(query, [taskId]);
        return result as BlitzSession[];
    }

    async updateSession(id: string, updates: Partial<BlitzSession>): Promise<void> {
        const keys = Object.keys(updates).filter(key => this.allowedSessionColumns.includes(key));
        if (keys.length === 0) return;

        const values = keys.map(key => (updates as any)[key]);
        const setClause = keys.map((key) => `${key} = ?`).join(', ');

        const query = `UPDATE blitz_sessions SET ${setClause} WHERE id = ?`;
        await dbService.run(query, [...values, id]);
    }

    // Blitz Breaks
    private allowedBreakColumns = ['id', 'session_id', 'started_at', 'ended_at'];

    async saveBreak(blitzBreak: Partial<BlitzBreak>): Promise<BlitzBreak> {
        const keys = Object.keys(blitzBreak).filter(key => this.allowedBreakColumns.includes(key));
        if (keys.length === 0) throw new Error('No valid columns provided');

        const values = keys.map(key => (blitzBreak as any)[key]);
        const placeholders = keys.map(() => '?').join(', ');
        const columns = keys.join(', ');

        const query = `INSERT INTO blitz_breaks (${columns}) VALUES (${placeholders})`;
        await dbService.run(query, values);

        return blitzBreak as BlitzBreak;
    }

    async updateBreak(id: string, updates: Partial<BlitzBreak>): Promise<void> {
        const keys = Object.keys(updates).filter(key => this.allowedBreakColumns.includes(key));
        if (keys.length === 0) return;

        const values = keys.map(key => (updates as any)[key]);
        const setClause = keys.map((key) => `${key} = ?`).join(', ');

        const query = `UPDATE blitz_breaks SET ${setClause} WHERE id = ?`;
        await dbService.run(query, [...values, id]);
    }

    async getBreaksBySession(sessionId: string): Promise<BlitzBreak[]> {
        const query = `SELECT * FROM blitz_breaks WHERE session_id = ? ORDER BY started_at ASC`;
        const result = await dbService.query(query, [sessionId]);
        return result as BlitzBreak[];
    }
}

export const blitzRepository = new BlitzRepository();
