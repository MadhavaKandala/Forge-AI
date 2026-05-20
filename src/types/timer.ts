export type SessionType = 'work' | 'short_break' | 'long_break';

export interface PomodoroSession {
    id: string;
    habitId?: string;
    taskId?: string;
    sessionType: SessionType;
    durationMinutes: number;
    startedAt: string;
    completedAt?: string;
    wasInterrupted: boolean;
    focusScore?: number;
    distractionsCount: number;
}

export interface TimerSettings {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    longBreakInterval: number; // number of work sessions before long break
}
