import { BaseRepository } from './base.repository';
import { Task, Subtask } from '../types/schema';

export class TaskRepository extends BaseRepository<Task> {
    protected tableName = 'tasks';

    async findByCategory(category: string): Promise<Task[]> {
        return [];
    }

    async findByStatus(status: string): Promise<Task[]> {
        return [];
    }

    async findByScheduledDate(date: string): Promise<Task[]> {
        return [];
    }

    async findByListId(listId: string): Promise<Task[]> {
        return [];
    }

    async getSubtasks(taskId: string): Promise<Subtask[]> {
        return [];
    }

    async addSubtask(subtask: Partial<Subtask>): Promise<Subtask> {
        return subtask as Subtask;
    }

    async updateSubtask(subtaskId: string, updates: Partial<Subtask>): Promise<Subtask> {
        return updates as Subtask;
    }

    async deleteSubtask(subtaskId: string): Promise<boolean> {
        return true;
    }
}

export const taskRepository = new TaskRepository();
