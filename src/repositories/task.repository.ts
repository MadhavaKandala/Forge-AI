import { BaseRepository } from './base.repository';
import { Task, Subtask } from '../types/schema';
import { dbService } from '../lib/db';

export class TaskRepository extends BaseRepository<Task> {
    protected tableName = 'tasks';

    async findByCategory(category: string): Promise<Task[]> {
        return this.query(`SELECT * FROM ${this.tableName} WHERE category = ? ORDER BY created_at DESC`, [category]);
    }

    async findByStatus(status: string): Promise<Task[]> {
        return this.query(`SELECT * FROM ${this.tableName} WHERE status = ? ORDER BY created_at DESC`, [status]);
    }

    async findByScheduledDate(date: string): Promise<Task[]> {
        return this.query(`SELECT * FROM ${this.tableName} WHERE scheduled_date = ? ORDER BY scheduled_time ASC`, [date]);
    }

    async getSubtasks(taskId: string): Promise<Subtask[]> {
        const query = `SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order ASC`;
        const result = await dbService.query(query, [taskId]);
        return result as Subtask[];
    }

    async addSubtask(subtask: Partial<Subtask>): Promise<Subtask> {
        const keys = Object.keys(subtask);
        const values = Object.values(subtask);
        const placeholders = keys.map(() => '?').join(', ');
        const columns = keys.join(', ');

        const query = `INSERT INTO subtasks (${columns}) VALUES (${placeholders})`;
        await dbService.run(query, values);

        // Update task counts
        if (subtask.task_id) {
            await this.updateTaskCounts(subtask.task_id);
        }

        return subtask as Subtask;
    }

    async updateSubtask(id: string, data: Partial<Subtask>): Promise<void> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key) => `${key} = ?`).join(', ');

        const query = `UPDATE subtasks SET ${setClause} WHERE id = ?`;
        await dbService.run(query, [...values, id]);

        // precise tracking might require fetching the subtask first to get task_id
        // For now assuming caller handles refresh or we just update counts for associated task if possible
    }

    async updateTaskCounts(taskId: string): Promise<void> {
        const subtasks = await this.getSubtasks(taskId);
        const total = subtasks.length;
        const completed = subtasks.filter(s => s.is_completed).length;

        await this.update(taskId, {
            total_subtasks: total,
            completed_subtasks: completed
        });
    }
}

export const taskRepository = new TaskRepository();
