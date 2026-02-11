import { create } from 'zustand';
import { Task, Subtask } from '../types/schema';
import { taskRepository, TaskRepository } from '../repositories/task.repository';
import { v4 as uuidv4 } from 'uuid';

interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchTasks: (category?: string) => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;

    // Subtask Actions
    addSubtask: (taskId: string, title: string) => Promise<void>;
    toggleSubtask: (subtaskId: string, isCompleted: boolean) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchTasks: async (category?: string) => {
        set({ isLoading: true, error: null });
        try {
            // TODO: Replace with real user ID
            const tasks = category
                ? await taskRepository.findByCategory(category)
                : await taskRepository.findAll();
            set({ tasks });
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ isLoading: false });
        }
    },

    addTask: async (taskData) => {
        set({ isLoading: true, error: null });
        try {
            const newTask: Task = {
                ...taskData,
                id: uuidv4(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            } as Task; // Casting because we're providing defaults

            await taskRepository.create(newTask);
            set((state) => ({ tasks: [newTask, ...state.tasks] }));
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ isLoading: false });
        }
    },

    updateTask: async (id, updates) => {
        try {
            await taskRepository.update(id, { ...updates, updated_at: new Date().toISOString() });
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    deleteTask: async (id) => {
        try {
            await taskRepository.delete(id);
            set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id)
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    addSubtask: async (taskId, title) => {
        try {
            const newSubtask: Partial<Subtask> = {
                id: uuidv4(),
                task_id: taskId,
                title,
                is_completed: 0,
                sort_order: 0, // Logic for order needed
                created_at: new Date().toISOString()
            };
            await taskRepository.addSubtask(newSubtask);
            // Refresh tasks or optimistically update
            await get().fetchTasks(); // Simple refresh for now to get updated counts
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    toggleSubtask: async (subtaskId, isCompleted) => {
        try {
            await taskRepository.updateSubtask(subtaskId, { is_completed: isCompleted ? 1 : 0 });
            // Refresh logic - ideally we just update local state but subtasks aren't deeply nested in Task type yet in store
            await get().fetchTasks();
        } catch (error) {
            set({ error: (error as Error).message });
        }
    }
}));
