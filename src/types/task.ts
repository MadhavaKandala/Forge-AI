export type TaskCategory = 'coding' | 'gym' | 'diet' | 'personal' | 'work' | 'academics' | 'devotional' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'backlog' | 'this_week' | 'today' | 'in_progress' | 'completed' | 'cancelled';
export type EisenhowerQuadrant = 'q1' | 'q2' | 'q3' | 'q4';

export interface Task {
    id: string;
    title: string;
    description?: string;
    category: TaskCategory;
    priority: TaskPriority;
    status: TaskStatus;
    completed: boolean;

    // 1-3-5 and Eisenhower Rule
    size: 'big' | 'medium' | 'small';
    quadrant: EisenhowerQuadrant;

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

    // Links & Content
    notes?: string;
    externalLinks?: string[];
    attachments?: string[];
    tags?: string[];

    // Subtasks
    subtasks: { id: string; title: string; completed: boolean }[];

    // Timestamps
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskDTO extends Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'priority' | 'status' | 'size'> {
    completed?: boolean;
    priority?: TaskPriority;
    status?: TaskStatus;
    size?: 'big' | 'medium' | 'small';
}
export interface UpdateTaskDTO extends Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> { }
