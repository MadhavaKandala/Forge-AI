import { Task } from '../types/task';
import { taskService } from './taskService';
import { scheduleService } from './scheduleService';
import { v4 as uuidv4 } from 'uuid';

export interface SuggesterContext {
    currentTime: Date;
    currentHour: number;
    dayOfWeek: number;
    availableMinutes: number;
    energyLevel: 'low' | 'waking' | 'high' | 'dropping' | 'peak' | 'medium';
    location?: string;
    recentTasks: Task[];
    streak: number;
    isBreakOverdue: boolean;
    lastBreakTime?: Date;
    isCurrentlyInBreak: boolean;
}

export interface ScoredTask extends Task {
    score: number;
    reasoning: string[];
}

export interface SuggestionResult {
    nextAction: ScoredTask | null;
    alternatives: ScoredTask[];
    reasoning: string[];
    multiStepPlan: any[];
    context?: SuggesterContext;
}

class SuggesterService {
    async getNextAction(): Promise<SuggestionResult> {
        return {
            nextAction: null,
            alternatives: [],
            reasoning: ["No suggestions available"],
            multiStepPlan: []
        };
    }

    async getSuggestion(): Promise<SuggestionResult> {
        return this.getNextAction();
    }
}

export const suggesterService = new SuggesterService();
