import { BaseRepository } from './base.repository';
import { Habit, HabitCompletion } from '../types/schema';
import { dbService } from '../lib/db';

export class HabitRepository extends BaseRepository<Habit> {
    protected tableName = 'habits';

    async findByUserId(userId: string): Promise<Habit[]> {
        return this.query(`SELECT * FROM ${this.tableName} WHERE user_id = ? AND is_archived = 0`, [userId]);
    }

    async getCompletions(habitId: string): Promise<HabitCompletion[]> {
        const query = `SELECT * FROM habit_completions WHERE habit_id = ?`;
        const result = await dbService.query(query, [habitId]);
        return result as HabitCompletion[];
    }

    async getCompletionByDate(habitId: string, date: string): Promise<HabitCompletion | null> {
        const query = `SELECT * FROM habit_completions WHERE habit_id = ? AND completion_date = ?`;
        const result = await dbService.query(query, [habitId, date]);
        return result.length > 0 ? (result[0] as HabitCompletion) : null;
    }

    async addCompletion(completion: Partial<HabitCompletion>): Promise<void> {
        const keys = Object.keys(completion);
        const values = Object.values(completion);
        const placeholders = keys.map(() => '?').join(', ');
        const columns = keys.join(', ');

        const query = `INSERT INTO habit_completions (${columns}) VALUES (${placeholders})`;
        await dbService.run(query, values);
    }

    async removeCompletion(habitId: string, date: string): Promise<void> {
        const query = `DELETE FROM habit_completions WHERE habit_id = ? AND completion_date = ?`;
        await dbService.run(query, [habitId, date]);
    }
}

export const habitRepository = new HabitRepository();
