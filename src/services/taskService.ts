import { dbService } from '../lib/db';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../types/task';
import { v4 as uuidv4 } from 'uuid';

export const taskService = {
    async createTask(task: CreateTaskDTO): Promise<Task> {
        console.log("taskService: Creating Task", task);
        const id = uuidv4();
        const now = new Date().toISOString();

        const sql = `
      INSERT INTO tasks (
        id, title, description, category, priority, status, completed,
        size, quadrant, estimated_minutes, actual_minutes,
        scheduled_date, scheduled_time, due_date,
        is_recurring, recurrence_pattern, notes, 
        external_links, attachments, tags, subtasks,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        try {
            await dbService.run(sql, [
                id,
                task.title,
                task.description || null,
                task.category || 'other',
                task.priority || 'medium',
                task.status || 'backlog',
                task.completed ? 1 : 0,
                task.size || 'small',
                task.quadrant || 'q4',
                task.estimatedMinutes !== undefined ? task.estimatedMinutes : null,
                task.actualMinutes !== undefined ? task.actualMinutes : null,
                task.scheduledDate || null,
                task.scheduledTime || null,
                task.dueDate || null,
                task.isRecurring ? 1 : 0,
                task.recurrencePattern || null,
                task.notes || null,
                JSON.stringify(task.externalLinks || []),
                JSON.stringify(task.attachments || []),
                JSON.stringify(task.tags || []),
                JSON.stringify(task.subtasks || []),
                now,
                now
            ]);
            console.log("taskService: Task Created Successfully");
        } catch (err) {
            console.error("taskService: Error inserting task", err);
            throw err;
        }

        return {
            ...task,
            id,
            category: task.category || 'other',
            priority: task.priority || 'medium',
            status: task.status || 'backlog',
            completed: !!task.completed,
            size: task.size || 'small',
            quadrant: task.quadrant || 'q4',
            subtasks: task.subtasks || [],
            createdAt: now,
            updatedAt: now
        };
    },

    async getTasks(filter?: { category?: string; status?: string }): Promise<Task[]> {
        console.log("taskService: Fetching Tasks", filter);
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
        console.log(`taskService: Fetched ${result.length} tasks`);

        return result.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category,
            priority: row.priority,
            status: row.status,
            completed: Boolean(row.completed),
            size: row.size,
            quadrant: row.quadrant,
            estimatedMinutes: row.estimated_minutes,
            actualMinutes: row.actual_minutes,
            scheduledDate: row.scheduled_date,
            scheduledTime: row.scheduled_time,
            dueDate: row.due_date,
            isRecurring: Boolean(row.is_recurring),
            recurrencePattern: row.recurrence_pattern,
            notes: row.notes,
            externalLinks: row.external_links ? JSON.parse(row.external_links) : [],
            attachments: row.attachments ? JSON.parse(row.attachments) : [],
            tags: row.tags ? JSON.parse(row.tags) : [],
            subtasks: row.subtasks ? JSON.parse(row.subtasks) : [],
            completedAt: row.completed_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    },

    async updateTask(id: string, updates: UpdateTaskDTO): Promise<void> {
        console.log(`taskService: Updating Task ${id}`, updates);
        const setClauses = [];
        const params = [];
        const now = new Date().toISOString();

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                // Map camelCase to snake_case for DB
                const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                setClauses.push(`${dbKey} = ?`);

                // Handle complex fields
                if (['externalLinks', 'attachments', 'tags', 'subtasks'].includes(key)) {
                    params.push(JSON.stringify(value));
                } else if (key === 'completed' || key === 'isRecurring') {
                    params.push(value ? 1 : 0);
                } else {
                    params.push(value);
                }
            }
        });

        if (setClauses.length === 0) return;

        setClauses.push('updated_at = ?');
        params.push(now);
        params.push(id); // for WHERE clause

        const sql = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`;
        try {
            await dbService.run(sql, params);
            console.log("taskService: Task Updated Successfully");
        } catch (err) {
            console.error("taskService: Error updating task", err);
            throw err;
        }
    },

    async deleteTask(id: string): Promise<void> {
        await dbService.run('DELETE FROM tasks WHERE id = ?', [id]);
    },

    async completeTask(id: string): Promise<void> {
        const now = new Date().toISOString();
        await dbService.run("UPDATE tasks SET status = 'completed', completed = 1, completed_at = ?, updated_at = ? WHERE id = ?", [now, now, id]);
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
            completed: Boolean(row.completed),
            size: row.size,
            quadrant: row.quadrant,
            estimatedMinutes: row.estimated_minutes,
            actualMinutes: row.actual_minutes,
            scheduledDate: row.scheduled_date,
            scheduledTime: row.scheduled_time,
            dueDate: row.due_date,
            isRecurring: Boolean(row.is_recurring),
            recurrencePattern: row.recurrence_pattern,
            notes: row.notes,
            externalLinks: row.external_links ? JSON.parse(row.external_links) : [],
            attachments: row.attachments ? JSON.parse(row.attachments) : [],
            tags: row.tags ? JSON.parse(row.tags) : [],
            subtasks: row.subtasks ? JSON.parse(row.subtasks) : [],
            completedAt: row.completed_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }
};
