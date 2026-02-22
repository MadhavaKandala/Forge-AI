import { create } from 'zustand';
import { Task, Subtask } from '../types/schema';
import { taskRepository } from '../repositories/task.repository';
import { v4 as uuidv4 } from 'uuid';

interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchTasks: (filter?: { category?: string; listId?: string; status?: string }) => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;

    // Subtask Actions
    addSubtask: (taskId: string, title: string) => Promise<void>;
    toggleSubtask: (subtaskId: string, isCompleted: boolean) => Promise<void>;

    // Derived
    getTasksByStatus: (status: Task['status']) => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchTasks: async (filter) => {
        set({ isLoading: true, error: null });
        try {
            let tasks: Task[];
            if (filter?.listId) {
                tasks = await taskRepository.findByListId(filter.listId);
            } else if (filter?.category) {
                tasks = await taskRepository.findByCategory(filter.category);
            } else if (filter?.status) {
                tasks = await taskRepository.findByStatus(filter.status);
            } else {
                tasks = await taskRepository.findAll();
            }
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
            } as Task;

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
                sort_order: 0,
                created_at: new Date().toISOString()
            };
            await taskRepository.addSubtask(newSubtask);
            await get().fetchTasks();
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    toggleSubtask: async (subtaskId, isCompleted) => {
        try {
            await taskRepository.updateSubtask(subtaskId, { is_completed: isCompleted ? 1 : 0 });
            await get().fetchTasks();
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    getTasksByStatus: (status) => {
        return get().tasks.filter(t => t.status === status);
    }
}));
