import { dbService } from '../lib/db';

export abstract class BaseRepository<T> {
    protected abstract tableName: string;

    async findAll(): Promise<T[]> {
        const query = `SELECT * FROM ${this.tableName}`;
        const result = await dbService.query(query);
        return result as T[];
    }

    async findById(id: string): Promise<T | null> {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const result = await dbService.query(query, [id]);
        return result.length > 0 ? (result[0] as T) : null;
    }

    async create(data: Partial<T>): Promise<T> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const columns = keys.join(', ');

        const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
        await dbService.run(query, values);

        // SQLite doesn't always return the inserted row, so we might need to fetch it
        // assuming 'id' is in data.
        if ((data as any).id) {
            return await this.findById((data as any).id) as T;
        }
        return data as T;
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key) => `${key} = ?`).join(', ');

        const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
        await dbService.run(query, [...values, id]);

        return await this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        await dbService.run(query, [id]);
        return true;
    }

    async query(query: string, values?: any[]): Promise<T[]> {
        const result = await dbService.query(query, values);
        return result as T[];
    }
}
