import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from './taskService';

// Mock console.log to avoid cluttering test output
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('taskService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createTask', () => {
        it('should create a task with default values when minimal data is provided', async () => {
            const taskDTO = { title: 'Test Task' };
            const task = await taskService.createTask(taskDTO);

            expect(task).toBeDefined();
            expect(task.title).toBe('Test Task');
            expect(task.id).toBeDefined();
            expect(typeof task.id).toBe('string');
            expect(task.category).toBe('other');
            expect(task.priority).toBe('medium');
            expect(task.status).toBe('backlog');
            expect(task.completed).toBe(false);
            expect(task.size).toBe('small');
            expect(task.quadrant).toBe('q4');
            expect(task.subtasks).toEqual([]);
            expect(task.createdAt).toBeDefined();
            expect(task.updatedAt).toBeDefined();
            expect(task.createdAt).toBe(task.updatedAt);
        });

        it('should use provided values over defaults', async () => {
            const taskDTO = {
                title: 'Custom Task',
                category: 'work' as const,
                priority: 'high' as const,
                status: 'in_progress' as const,
                completed: true,
                size: 'big' as const,
                quadrant: 'q1' as const,
                subtasks: [{ id: '1', title: 'Sub 1', completed: false }]
            };

            const task = await taskService.createTask(taskDTO);

            expect(task.title).toBe('Custom Task');
            expect(task.category).toBe('work');
            expect(task.priority).toBe('high');
            expect(task.status).toBe('in_progress');
            expect(task.completed).toBe(true);
            expect(task.size).toBe('big');
            expect(task.quadrant).toBe('q1');
            expect(task.subtasks).toHaveLength(1);
        });

        it('should use provided id if given', async () => {
            const customId = 'my-custom-id-123';
            const task = await taskService.createTask({ title: 'Task with ID', id: customId });

            expect(task.id).toBe(customId);
        });
    });

    describe('getTasks', () => {
        it('should return an empty array', async () => {
            const tasks = await taskService.getTasks();
            expect(tasks).toEqual([]);
        });

        it('should accept filters and return an empty array', async () => {
            const tasks = await taskService.getTasks({ category: 'work', status: 'completed' });
            expect(tasks).toEqual([]);
        });
    });

    describe('updateTask', () => {
        it('should execute without throwing', async () => {
            await expect(taskService.updateTask('1', { title: 'Updated' })).resolves.not.toThrow();
        });
    });

    describe('deleteTask', () => {
        it('should execute without throwing', async () => {
            await expect(taskService.deleteTask('1')).resolves.not.toThrow();
        });
    });

    describe('completeTask', () => {
        it('should execute without throwing', async () => {
            await expect(taskService.completeTask('1')).resolves.not.toThrow();
        });
    });

    describe('getTasksByDate', () => {
        it('should return an empty array', async () => {
            const tasks = await taskService.getTasksByDate('2023-10-27');
            expect(tasks).toEqual([]);
        });
    });
});
