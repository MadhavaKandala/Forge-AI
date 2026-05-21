import { beforeEach, describe, expect, it } from 'vitest';
import { useTaskStore } from './useTaskStore';
import { Task } from '../types/schema';

describe('useTaskStore', () => {
    beforeEach(() => {
        localStorage.clear();
        useTaskStore.setState({
            tasks: [],
            isLoading: false,
            error: null,
        });
    });

    describe('getTasksByStatus', () => {
        it('should return empty array if no tasks match status', () => {
            const { getTasksByStatus } = useTaskStore.getState();
            expect(getTasksByStatus('todo')).toEqual([]);
        });

        it('should return tasks matching the specified status', () => {
            const mockTasks = [
                { id: '1', title: 'Task 1', status: 'todo' } as Task,
                { id: '2', title: 'Task 2', status: 'in_progress' } as Task,
                { id: '3', title: 'Task 3', status: 'todo' } as Task,
                { id: '4', title: 'Task 4', status: 'completed' } as Task,
            ];

            useTaskStore.setState({ tasks: mockTasks });

            const { getTasksByStatus } = useTaskStore.getState();

            const todoTasks = getTasksByStatus('todo');
            expect(todoTasks).toHaveLength(2);
            expect(todoTasks.map(t => t.id)).toEqual(['1', '3']);

            const inProgressTasks = getTasksByStatus('in_progress');
            expect(inProgressTasks).toHaveLength(1);
            expect(inProgressTasks[0].id).toBe('2');

            const completedTasks = getTasksByStatus('completed');
            expect(completedTasks).toHaveLength(1);
            expect(completedTasks[0].id).toBe('4');

            const doneTasks = getTasksByStatus('done');
            expect(doneTasks).toHaveLength(0);
        });
    });
});
