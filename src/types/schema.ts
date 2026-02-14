export interface User {
    id: string;
    name: string;
    email?: string;
    password_hash?: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    level: number;
    total_xp: number;
    current_streak: number;
    longest_streak: number;
    perfect_days: number;
    total_habits_completed: number;
    total_tasks_completed: number;
    total_focus_minutes: number;
    invite_code?: string;
    is_public_profile: number; // 0 or 1
    privacy_share_progress: number; // 0 or 1
    privacy_show_habits: number; // 0 or 1
    notifications_enabled: number; // 0 or 1
    quiet_hours_start?: string;
    quiet_hours_end?: string;
    joined_at: string;
    last_active_at: string;
    created_at: string;
    updated_at: string;
}

export interface Habit {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    category: 'coding' | 'gym' | 'diet' | 'personal' | string;
    subcategory?: string;
    habit_type: 'completion' | 'counter' | 'progress' | 'duration';
    counter_goal?: number;
    counter_unit?: string;
    progress_goal?: number;
    progress_unit?: string;
    duration_goal_minutes?: number;
    reminder_time?: string;
    recurrence_pattern?: string;
    active_days?: string; // JSON
    difficulty: 'easy' | 'medium' | 'hard';
    xp_value: number;
    current_streak: number;
    longest_streak: number;
    total_completions: number;
    is_active: number; // 0 or 1
    is_paused: number; // 0 or 1
    is_archived: number; // 0 or 1
    created_at: string;
    updated_at: string;
}

export interface HabitCompletion {
    id: string;
    habit_id: string;
    user_id: string;
    completed_at: string;
    completion_date: string;
    counter_value?: number;
    progress_value?: number;
    duration_minutes?: number;
    xp_earned: number;
    notes?: string;
    mood_rating?: number;
    completed_via?: string;
    location?: string;
}

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    category: 'coding' | 'gym' | 'diet' | 'personal' | string;
    subcategory?: string;
    tags?: string; // JSON array
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
    estimated_minutes?: number;
    actual_minutes?: number;
    time_accuracy_score?: number;
    scheduled_date?: string;
    scheduled_time?: string;
    due_date?: string;
    due_time?: string;
    is_recurring: number; // 0 or 1
    recurrence_pattern?: string;
    recurrence_config?: string; // JSON
    parent_task_id?: string;
    has_subtasks: number; // 0 or 1
    completed_subtasks: number;
    total_subtasks: number;
    notes?: string;
    external_links?: string; // JSON array
    attachments?: string; // JSON array
    xp_value: number;
    difficulty_multiplier: number;
    completed_at?: string;
    completed_via?: string;
    created_at: string;
    updated_at: string;
}

export interface Subtask {
    id: string;
    task_id: string;
    title: string;
    is_completed: number; // 0 or 1
    sort_order: number;
    completed_at?: string;
    created_at: string;
}

export interface PomodoroSession {
    id: string;
    user_id: string;
    entity_type?: 'habit' | 'task' | 'none';
    entity_id?: string;
    category: string;
    session_type: 'work' | 'short_break' | 'long_break';
    duration_minutes: number;
    preset_name?: string;
    started_at: string;
    ended_at?: string;
    paused_at?: string;
    total_pause_duration_minutes: number;
    was_completed: number; // 0 or 1
    was_interrupted: number; // 0 or 1
    interruption_reason?: string;
    focus_score?: number;
    distractions_count: number;
    distraction_notes?: string;
    notes?: string;
    mood_before?: number;
    mood_after?: number;
    xp_earned: number;
    created_at: string;
}

export interface Schedule {
    id: string;
    user_id: string;
    schedulable_type: 'habit' | 'task';
    schedulable_id: string;
    scheduled_date: string;
    scheduled_time?: string;
    end_time?: string;
    estimated_duration_minutes?: number;
    buffer_before_minutes: number;
    buffer_after_minutes: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'rescheduled';
    notification_sent: number; // 0 or 1
    notification_time_minutes: number;
    actual_start_time?: string;
    actual_end_time?: string;
    actual_duration_minutes?: number;
    rescheduled_from?: string;
    rescheduled_reason?: string;
    created_at: string;
    updated_at: string;
}

export interface CategoryTimeStats {
    id: string;
    user_id: string;
    category: string;
    date: string;
    total_minutes: number;
    focus_minutes: number;
    habit_minutes: number;
    task_minutes: number;
    completed_habits: number;
    total_habits: number;
    completed_tasks: number;
    total_tasks: number;
    estimated_minutes: number;
    actual_minutes: number;
    accuracy_percentage?: number;
    pomodoro_sessions: number;
    completed_pomodoros: number;
    interrupted_pomodoros: number;
    xp_earned: number;
    created_at: string;
    updated_at: string;
}

export interface Program {
    id: string;
    name: string;
    description: string;
    programType: string;
    totalDays: number;
    currentDay: number;
    status: 'active' | 'completed' | 'paused' | 'failed' | 'not_started';
    startedAt?: string;
    completedAt?: string;
    category?: string;
    difficulty?: string;
    dailyRequirements?: string[];
    phases?: {
        name: string;
        startDay: number;
        endDay: number;
        description: string;
        xpPerDay: number;
    }[];
    totalXpPotential: number;
    xpEarned?: number;
    completionPercentage?: number;
    daysMissed?: number;
    icon?: string;
}

export interface ProgramDay {
    id: string;
    programId: string;
    dayNumber: number;
    isCompleted: boolean;
    completedAt?: string;
    notes?: string;
    dailyXp: number;
}

export interface ProgramMilestone {
    id: string;
    programId: string;
    milestoneName: string;
    dayNumber: number;
    isCompleted: boolean;
    xpReward: number;
}
