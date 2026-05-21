import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskRepository } from '../../repositories/task.repository';
import { supabase } from '../../lib/supabase';
import { Task, Subtask } from '../../types/schema';

const taskRepository = new TaskRepository();

// Properly structure the Supabase mock to allow resolving with { data, error }
const mockSupabaseQuery = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    then: vi.fn((callback) => callback({ data: [], error: null }))
};

vi.mock('../../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => mockSupabaseQuery),
    }
}));

describe('TaskRepository', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset the default resolution for each test
        mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: [], error: null }));
    });

    describe('findByCategory', () => {
        it('should call supabase with correct query for findByCategory', async () => {
            const mockData = [{ id: '1', category: 'coding' }];
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: mockData, error: null }));

            const result = await taskRepository.findByCategory('coding');

            expect(supabase.from).toHaveBeenCalledWith('tasks');
            expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('category', 'coding');
            expect(result).toEqual(mockData);
        });
    });

    describe('findByStatus', () => {
        it('should call supabase with correct query for findByStatus', async () => {
            const mockData = [{ id: '1', status: 'in_progress' }];
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: mockData, error: null }));

            const result = await taskRepository.findByStatus('in_progress');

            expect(supabase.from).toHaveBeenCalledWith('tasks');
            expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('status', 'in_progress');
            expect(result).toEqual(mockData);
        });
    });

    describe('findByScheduledDate', () => {
        it('should call supabase with correct query for findByScheduledDate', async () => {
            const mockData = [{ id: '1', scheduled_date: '2023-10-27' }];
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: mockData, error: null }));

            const result = await taskRepository.findByScheduledDate('2023-10-27');

            expect(supabase.from).toHaveBeenCalledWith('tasks');
            expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('scheduled_date', '2023-10-27');
            expect(result).toEqual(mockData);
        });
    });

    describe('findByListId', () => {
        it('should call supabase with correct query for findByListId', async () => {
            const mockData = [{ id: '1', list_id: 'list-123' }];
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: mockData, error: null }));

            const result = await taskRepository.findByListId('list-123');

            expect(supabase.from).toHaveBeenCalledWith('tasks');
            expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('list_id', 'list-123');
            expect(result).toEqual(mockData);
        });
    });

    describe('getSubtasks', () => {
        it('should call supabase with correct query for getSubtasks', async () => {
            const mockData = [{ id: 'sub-1', task_id: 'task-123' }];
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: mockData, error: null }));

            const result = await taskRepository.getSubtasks('task-123');

            expect(supabase.from).toHaveBeenCalledWith('subtasks');
            expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('task_id', 'task-123');
            expect(result).toEqual(mockData);
        });
    });

    describe('addSubtask', () => {
        it('should call supabase with correct query for addSubtask', async () => {
            const subtaskData: Partial<Subtask> = { title: 'New Subtask' };
            const mockData = { id: 'sub-1', ...subtaskData };
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: mockData, error: null }));

            const result = await taskRepository.addSubtask(subtaskData);

            expect(supabase.from).toHaveBeenCalledWith('subtasks');
            expect(mockSupabaseQuery.insert).toHaveBeenCalledWith(subtaskData);
            expect(mockSupabaseQuery.select).toHaveBeenCalled();
            expect(mockSupabaseQuery.single).toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });
    });

    describe('updateSubtask', () => {
        it('should call supabase with correct query for updateSubtask', async () => {
            const updates: Partial<Subtask> = { title: 'Updated Subtask' };
            const mockData = { id: 'sub-123', ...updates };
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: mockData, error: null }));

            const result = await taskRepository.updateSubtask('sub-123', updates);

            expect(supabase.from).toHaveBeenCalledWith('subtasks');
            expect(mockSupabaseQuery.update).toHaveBeenCalledWith(updates);
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'sub-123');
            expect(mockSupabaseQuery.select).toHaveBeenCalled();
            expect(mockSupabaseQuery.single).toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });
    });

    describe('deleteSubtask', () => {
        it('should call supabase with correct query for deleteSubtask', async () => {
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: null, error: null }));

            const result = await taskRepository.deleteSubtask('sub-123');

            expect(supabase.from).toHaveBeenCalledWith('subtasks');
            expect(mockSupabaseQuery.delete).toHaveBeenCalled();
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'sub-123');
            expect(result).toBe(true);
        });
    });

    // Test methods inherited from BaseRepository
    describe('findAll', () => {
        it('should call supabase with correct query for findAll', async () => {
            const mockData = [{ id: '1' }, { id: '2' }];
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: mockData, error: null }));

            const result = await taskRepository.findAll();

            expect(supabase.from).toHaveBeenCalledWith('tasks');
            expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
            expect(result).toEqual(mockData);
        });
    });

    describe('findById', () => {
        it('should call supabase with correct query for findById', async () => {
            const mockData = { id: 'task-123' };
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: mockData, error: null }));

            const result = await taskRepository.findById('task-123');

            expect(supabase.from).toHaveBeenCalledWith('tasks');
            expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'task-123');
            expect(mockSupabaseQuery.single).toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });

        it('should handle PGRST116 (No rows found) error gracefully', async () => {
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: null, error: { code: 'PGRST116' } }));
            const result = await taskRepository.findById('non-existent');
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should call supabase with correct query for create', async () => {
            const taskData: Partial<Task> = { title: 'New Task' };
            const mockData = { id: '1', ...taskData };
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: mockData, error: null }));

            const result = await taskRepository.create(taskData);

            expect(supabase.from).toHaveBeenCalledWith('tasks');
            expect(mockSupabaseQuery.insert).toHaveBeenCalledWith(taskData);
            expect(mockSupabaseQuery.select).toHaveBeenCalled();
            expect(mockSupabaseQuery.single).toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });
    });

    describe('update', () => {
        it('should call supabase with correct query for update', async () => {
            const taskData: Partial<Task> = { title: 'Updated Task' };
            const mockData = { id: 'task-123', ...taskData };
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: mockData, error: null }));

            const result = await taskRepository.update('task-123', taskData);

            expect(supabase.from).toHaveBeenCalledWith('tasks');
            expect(mockSupabaseQuery.update).toHaveBeenCalledWith(taskData);
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'task-123');
            expect(mockSupabaseQuery.select).toHaveBeenCalled();
            expect(mockSupabaseQuery.single).toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });
    });

    describe('delete', () => {
        it('should call supabase with correct query for delete', async () => {
            mockSupabaseQuery.then.mockImplementation((callback) => callback({ data: null, error: null }));

            const result = await taskRepository.delete('task-123');

            expect(supabase.from).toHaveBeenCalledWith('tasks');
            expect(mockSupabaseQuery.delete).toHaveBeenCalled();
            expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'task-123');
            expect(result).toBe(true);
        });
    });

    describe('query', () => {
        it('should return empty array for query stub', async () => {
            const result = await taskRepository.query('SELECT * FROM tasks');
            expect(result).toEqual([]);
        });
    });
});
