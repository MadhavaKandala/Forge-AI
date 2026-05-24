import { BaseRepository } from './base.repository';
import { Schedule } from '../types/schema';

export class ScheduleRepository extends BaseRepository<Schedule> {
    protected tableName = 'schedules';

    async findByDate(userId: string, date: string): Promise<Schedule[]> {
        return this.query(`SELECT * FROM schedules WHERE user_id = ? AND scheduled_date = ?`, [userId, date]);
    }

    async findUpcoming(userId: string): Promise<Schedule[]> {
        const today = new Date().toISOString().split('T')[0];
        return this.query(`SELECT * FROM schedules WHERE user_id = ? AND scheduled_date >= ? ORDER BY scheduled_date ASC, scheduled_time ASC`, [userId, today]);
    }
}

export const scheduleRepository = new ScheduleRepository();
