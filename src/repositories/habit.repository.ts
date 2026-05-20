import { BaseRepository } from './base.repository';
import { Habit, HabitCompletion } from '../types/schema';

export class HabitRepository extends BaseRepository<Habit> {
    protected tableName = 'habits';

    async findByUserId(userId: string): Promise<Habit[]> {
        return [];
    }

    async getCompletions(habitId: string): Promise<HabitCompletion[]> {
        return [];
    }

    async getCompletionByDate(habitId: string, date: string): Promise<HabitCompletion | null> {
        return null;
    }

    async addCompletion(completion: Partial<HabitCompletion>): Promise<void> {
        console.log('Adding habit completion', completion);
    }

    async removeCompletion(habitId: string, date: string): Promise<void> {
        console.log(`Removing habit ${habitId} completion for ${date}`);
    }
}

export const habitRepository = new HabitRepository();
