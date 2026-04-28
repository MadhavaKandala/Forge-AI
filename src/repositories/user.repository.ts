import { BaseRepository } from './base.repository';
import { User } from '../types/schema';

export class UserRepository extends BaseRepository<User> {
    protected tableName = 'users';

    async findByEmail(email: string): Promise<User | null> {
        return null;
    }

    async getCurrentUser(): Promise<User | null> {
        return null;
    }
}

export const userRepository = new UserRepository();
