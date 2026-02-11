import { BaseRepository } from './base.repository';
import { User } from '../types/schema';

export class UserRepository extends BaseRepository<User> {
    protected tableName = 'users';

    async findByEmail(email: string): Promise<User | null> {
        const result = await this.query(`SELECT * FROM ${this.tableName} WHERE email = ?`, [email]);
        return result.length > 0 ? result[0] : null;
    }

    // For single user local-first app, we might just get the first user
    async getCurrentUser(): Promise<User | null> {
        const result = await this.query(`SELECT * FROM ${this.tableName} LIMIT 1`);
        return result.length > 0 ? result[0] : null;
    }
}

export const userRepository = new UserRepository();
