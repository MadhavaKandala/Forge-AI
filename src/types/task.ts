export type TaskCategory = 'coding' | 'gym' | 'diet' | 'personal' | 'work' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
    id: string;
    title: string;
    description?: string;
    category: TaskCategory;
    priority: TaskPriority;
    status: TaskStatus;

    // Time tracking
    estimatedMinutes?: number;
    actualMinutes?: number;

    // Scheduling
    scheduledDate?: string; // YYYY-MM-DD
    scheduledTime?: string; // HH:MM
    dueDate?: string; // YYYY-MM-DD

    // Recurrence
    isRecurring: boolean;
    recurrencePattern?: string; // daily, weekly, custom

    // Links
    notes?: string;
    externalLinks?: string[]; // stored as JSON string in DB

    // Timestamps
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskDTO extends Omit<Task, 'id' | 'createdAt' | 'updatedAt'> { }
export interface UpdateTaskDTO extends Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> { }
