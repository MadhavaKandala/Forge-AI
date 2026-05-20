export abstract class BaseRepository<T> {
    protected abstract tableName: string;

    async findAll(): Promise<T[]> {
        return [];
    }

    async findById(id: string): Promise<T | null> {
        return null;
    }

    async create(data: Partial<T>): Promise<T> {
        return data as T;
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        return data as T;
    }

    async delete(id: string): Promise<boolean> {
        return true;
    }

    async query(query: string, values?: any[]): Promise<T[]> {
        return [];
    }
}
