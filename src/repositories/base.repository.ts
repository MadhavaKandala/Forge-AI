import { supabase } from '../lib/supabase';

export abstract class BaseRepository<T> {
    protected abstract tableName: string;

    async findAll(): Promise<T[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*');

        if (error) throw error;
        return data as T[];
    }

    async findById(id: string): Promise<T | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Handle "No rows found"
        return data as T | null;
    }

    async create(data: Partial<T>): Promise<T> {
        const { data: createdData, error } = await supabase
            .from(this.tableName)
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return createdData as T;
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        const { data: updatedData, error } = await supabase
            .from(this.tableName)
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return updatedData as T | null;
    }

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    async query(query: string, values?: any[]): Promise<T[]> {
        // Not implemented for supabase directly via SQL string typically unless rpc is used.
        // Keeping as stub.
        return [];
    }
}
