import { BaseRepository } from './base.repository';
import { Task, Subtask } from '../types/schema';
import { supabase } from '../lib/supabase';

export class TaskRepository extends BaseRepository<Task> {
    protected tableName = 'tasks';

    async findByCategory(category: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('category', category);

        if (error) throw error;
        return data as Task[];
    }

    async findByStatus(status: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('status', status);

        if (error) throw error;
        return data as Task[];
    }

    async findByScheduledDate(date: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('scheduled_date', date);

        if (error) throw error;
        return data as Task[];
    }

    async findByListId(listId: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('list_id', listId);

        if (error) throw error;
        return data as Task[];
    }

    async getSubtasks(taskId: string): Promise<Subtask[]> {
        const { data, error } = await supabase
            .from('subtasks')
            .select('*')
            .eq('task_id', taskId);

        if (error) throw error;
        return data as Subtask[];
    }

    async addSubtask(subtask: Partial<Subtask>): Promise<Subtask> {
        const { data, error } = await supabase
            .from('subtasks')
            .insert(subtask)
            .select()
            .single();

        if (error) throw error;
        return data as Subtask;
    }

    async updateSubtask(subtaskId: string, updates: Partial<Subtask>): Promise<Subtask> {
        const { data, error } = await supabase
            .from('subtasks')
            .update(updates)
            .eq('id', subtaskId)
            .select()
            .single();

        if (error) throw error;
        return data as Subtask;
    }

    async deleteSubtask(subtaskId: string): Promise<boolean> {
        const { error } = await supabase
            .from('subtasks')
            .delete()
            .eq('id', subtaskId);

        if (error) throw error;
        return true;
    }
}

export const taskRepository = new TaskRepository();
