import { Task, CreateTaskDTO, UpdateTaskDTO } from '../types/task';
import { v4 as uuidv4 } from 'uuid';

export const taskService = {
    async createTask(task: CreateTaskDTO & { id?: string }): Promise<Task> {
        console.log("taskService: Creating Task", task);
        const id = task.id || uuidv4();
        const now = new Date().toISOString();

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
        return [];
    },

    async updateTask(id: string, updates: UpdateTaskDTO): Promise<void> {
        console.log(`taskService: Updating Task ${id}`, updates);
    },

    async deleteTask(id: string): Promise<void> {
        console.log(`taskService: Deleting Task ${id}`);
    },

    async completeTask(id: string): Promise<void> {
        console.log(`taskService: Completing Task ${id}`);
    },

    async getTasksByDate(date: string): Promise<Task[]> {
        return [];
    }
};
