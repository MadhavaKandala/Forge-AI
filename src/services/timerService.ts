import { PomodoroSession, SessionType } from '../types/timer';
import { v4 as uuidv4 } from 'uuid';

export const timerService = {
    async startSession(taskId: string | undefined, habitId: string | undefined, type: SessionType, duration: number): Promise<string> {
        const id = uuidv4();
        return id;
    },

    async completeSession(sessionId: string, wasInterrupted: boolean = false): Promise<void> {
        console.log(`Timer session ${sessionId} completed`);
    },

    async logDistraction(sessionId: string): Promise<void> {
        console.log(`Distraction logged for session ${sessionId}`);
    },

    async getSessionHistory(taskId?: string): Promise<any[]> {
        return [];
    },

    async getTodaysSessions(): Promise<any[]> {
        return [];
    },

    async getDailySessions(date: string): Promise<PomodoroSession[]> {
        return [];
    }
};
