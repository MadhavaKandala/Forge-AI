import { dbService } from '../lib/db';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../types/task';
import { v4 as uuidv4 } from 'uuid';

export const taskService = {
    async createTask(task: CreateTaskDTO): Promise<Task> {
        const id = uuidv4();
        const now = new Date().toISOString();

        const sql = `
      INSERT INTO tasks (
        id, title, description, category, priority, status,
        estimated_minutes, scheduled_date, scheduled_time, due_date,
        is_recurring, recurrence_pattern, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        await dbService.run(sql, [
            id, task.title, task.description || null, task.category, task.priority, task.status,
            task.estimatedMinutes || null, task.scheduledDate || null, task.scheduledTime || null, task.dueDate || null,
            task.isRecurring ? 1 : 0, task.recurrencePattern || null, task.notes || null, now, now
        ]);

        return { ...task, id, createdAt: now, updatedAt: now };
    },

    async getTasks(filter?: { category?: string; status?: string }): Promise<Task[]> {
        let sql = 'SELECT * FROM tasks WHERE 1=1';
        const params: any[] = [];

        if (filter?.category) {
            sql += ' AND category = ?';
            params.push(filter.category);
        }

        if (filter?.status) {
            if (filter.status === 'completed') {
                sql += " AND status = 'completed'";
            } else {
                sql += " AND status != 'completed'";
            }
        }

        sql += ' ORDER BY created_at DESC';

        const result = await dbService.query(sql, params);

        return result.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category,
            priority: row.priority,
            status: row.status,
            estimatedMinutes: row.estimated_minutes,
            actualMinutes: row.actual_minutes,
            scheduledDate: row.scheduled_date,
            scheduledTime: row.scheduled_time,
            dueDate: row.due_date,
            isRecurring: Boolean(row.is_recurring),
            recurrencePattern: row.recurrence_pattern,
            notes: row.notes,
            completedAt: row.completed_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    },

    async updateTask(id: string, updates: UpdateTaskDTO): Promise<void> {
        const setClauses = [];
        const params = [];
        const now = new Date().toISOString();

        if (updates.title !== undefined) { setClauses.push('title = ?'); params.push(updates.title); }
        if (updates.status !== undefined) { setClauses.push('status = ?'); params.push(updates.status); }
        if (updates.category !== undefined) { setClauses.push('category = ?'); params.push(updates.category); }
        // Add other fields as needed

        setClauses.push('updated_at = ?');
        params.push(now);
        params.push(id); // for WHERE clause

        const sql = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`;
        await dbService.run(sql, params);
    },

    async deleteTask(id: string): Promise<void> {
        await dbService.run('DELETE FROM tasks WHERE id = ?', [id]);
    },

    async completeTask(id: string): Promise<void> {
        const now = new Date().toISOString();
        await dbService.run("UPDATE tasks SET status = 'completed', completed_at = ?, updated_at = ? WHERE id = ?", [now, now, id]);
    },

    async getTasksByDate(date: string): Promise<Task[]> {
        const sql = 'SELECT * FROM tasks WHERE scheduled_date = ? OR due_date = ?';
        const result = await dbService.query(sql, [date, date]);
        return result.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category,
            priority: row.priority,
            status: row.status,
            estimatedMinutes: row.estimated_minutes,
            actualMinutes: row.actual_minutes,
            scheduledDate: row.scheduled_date,
            scheduledTime: row.scheduled_time,
            dueDate: row.due_date,
            isRecurring: Boolean(row.is_recurring),
            recurrencePattern: row.recurrence_pattern,
            notes: row.notes,
            completedAt: row.completed_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }
};
