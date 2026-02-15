import { dbService } from '../lib/db';
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
    private currentTime: Date = new Date();

    async getNextAction(): Promise<SuggestionResult> {
        this.currentTime = new Date();

        // Step 1: Gather context
        const context = await this.gatherContext();

        // Step 2: Get all non-completed tasks
        const tasks = await taskService.getTasks({ status: 'active' }) as Task[];

        // Step 3: Filter actionable tasks
        const actionableTasks = this.getActionableTasks(tasks, context);

        // Step 4: Score each task
        const scoredTasks: ScoredTask[] = actionableTasks.map(task => ({
            ...task,
            score: this.calculateScore(task, context),
            reasoning: [] // Will be populated later
        }));

        // Step 5: Sort by score
        scoredTasks.sort((a, b) => b.score - a.score);

        // Populate reasoning for top tasks
        scoredTasks.slice(0, 5).forEach(task => {
            task.reasoning = this.generateReasoning(task, context);
        });

        // Step 6: Return top suggestion with reasoning
        const result: SuggestionResult = {
            nextAction: scoredTasks[0] || null,
            alternatives: scoredTasks.slice(1, 4),
            reasoning: scoredTasks[0] ? scoredTasks[0].reasoning : ["No tasks found for your current context."],
            multiStepPlan: this.generateDayPlan(scoredTasks, context),
            context
        };

        if (!result.nextAction && context.isCurrentlyInBreak) {
            result.nextAction = {
                id: 'break-default',
                title: 'Refuel & Recharge',
                description: 'Take this time to disconnect and refuel for your next mission.',
                category: 'personal',
                priority: 'medium',
                status: 'today',
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as ScoredTask;
            result.reasoning = ["Rest is a weapon. Use this time to recover your cognitive energy."];
        }

        return result;
    }

    private async gatherContext(): Promise<SuggesterContext> {
        const currentHour = this.currentTime.getHours();

        // Calculate available time until next event
        const schedule = await scheduleService.getScheduleForDate(this.currentTime);
        const nextEvent = schedule
            .filter(s => {
                if (!s.time) return false;
                const eventTime = this.parseTimeToDate(s.time);
                return eventTime > this.currentTime;
            })
            .sort((a, b) => {
                const timeA = this.parseTimeToDate(a.time).getTime();
                const timeB = this.parseTimeToDate(b.time).getTime();
                return timeA - timeB;
            })[0];

        const availableMinutes = nextEvent && nextEvent.time
            ? Math.floor((this.parseTimeToDate(nextEvent.time).getTime() - this.currentTime.getTime()) / 60000)
            : 120; // Default 2 hours if no event

        const energyLevel = this.inferEnergyLevel(currentHour);

        // In a real app, location would come from Geolocation API
        const location = 'home'; // placeholder

        const recentTasks = (await taskService.getTasks({ status: 'completed' })).slice(0, 5) as Task[];
        const streak = 5; // Placeholder for streak calculation logic

        const isBreakOverdue = false; // Placeholder

        // Detect if currently in a break block (hour 13 or similar)
        const isCurrentlyInBreak = currentHour === 13 || currentHour === 14;

        return {
            currentTime: this.currentTime,
            currentHour,
            dayOfWeek: this.currentTime.getDay(),
            availableMinutes,
            energyLevel,
            location,
            recentTasks,
            streak,
            isBreakOverdue,
            isCurrentlyInBreak // Adding this to context
        };
    }

    private parseTimeToDate(timeStr: string): Date {
        const date = new Date(this.currentTime);
        let [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        // Handle cases without AM/PM if they exist in DB
        if (!modifier && hours < 7) hours += 12; // heuristic for pm tasks if missing

        date.setHours(hours, minutes || 0, 0, 0);
        return date;
    }

    private inferEnergyLevel(hour: number): SuggesterContext['energyLevel'] {
        if (hour < 7) return 'low';
        if (hour < 9) return 'waking';
        if (hour < 12) return 'high';
        if (hour < 13) return 'dropping';
        if (hour < 14) return 'low';
        if (hour < 17) return 'peak';
        if (hour < 19) return 'medium';
        if (hour < 21) return 'dropping';
        return 'low';
    }

    private getActionableTasks(tasks: Task[], context: SuggesterContext): Task[] {
        let filtered = tasks.filter(task => {
            if (task.status === 'completed' || task.status === 'cancelled') return false;
            return true;
        });

        // If we have tasks, but none fit the time window, we still want to show them
        // rather than showing "No Active Missions". We'll just score them lower.
        const fittingTasks = filtered.filter(task => {
            const estimatedTime = task.estimatedMinutes || 30;
            return estimatedTime <= context.availableMinutes + 15 || task.priority === 'high';
        });

        return fittingTasks.length > 0 ? fittingTasks : filtered;
    }

    private calculateScore(task: Task, context: SuggesterContext): number {
        const priorityScore = this.calculatePriorityScore(task);
        const timeFitScore = this.calculateTimeFitScore(task, context);
        const impactScore = this.calculateImpactScore(task);
        const momentumScore = this.calculateMomentumScore(task, context);
        const energyMatchScore = this.calculateEnergyMatchScore(task, context);

        const finalScore =
            (priorityScore * 0.30) +
            (timeFitScore * 0.25) +
            (impactScore * 0.20) +
            (momentumScore * 0.15) +
            (energyMatchScore * 0.10);

        return Math.round(finalScore);
    }

    private calculatePriorityScore(task: Task): number {
        const priorityMap: Record<string, number> = {
            'high': 90,
            'medium': 60,
            'low': 30
        };

        let score = priorityMap[task.priority] || 50;

        // Boost if due date is today or tomorrow
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const diffDays = Math.ceil((dueDate.getTime() - this.currentTime.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays <= 0) score = 100;
            else if (diffDays <= 1) score = Math.max(score, 95);
            else if (diffDays <= 3) score = Math.max(score, 80);
        }

        return score;
    }

    private calculateTimeFitScore(task: Task, context: SuggesterContext): number {
        const taskTime = task.estimatedMinutes || 30;
        const availableTime = context.availableMinutes;
        const ratio = taskTime / availableTime;

        if (ratio >= 0.9 && ratio <= 1.1) return 100;
        if (ratio >= 0.7 && ratio <= 1.3) return 85;
        if (ratio >= 0.5 && ratio <= 1.5) return 70;
        if (ratio >= 0.3 && ratio <= 2.0) return 50;

        return 20;
    }

    private calculateImpactScore(task: Task): number {
        const categoryImpact: Record<string, number> = {
            'academics': 95,
            'coding': 90,
            'gym': 80,
            'diet': 70,
            'personal': 60,
            'other': 50
        };

        return categoryImpact[task.category] || 50;
    }

    private calculateMomentumScore(task: Task, context: SuggesterContext): number {
        let score = 50;
        if (context.streak > 0) score += Math.min(30, context.streak * 2);

        const similarRecent = context.recentTasks.some(t => t.category === task.category);
        if (similarRecent) score += 15;

        return Math.min(100, score);
    }

    private calculateEnergyMatchScore(task: Task, context: SuggesterContext): number {
        const categoryIntensity: Record<string, 'high' | 'medium' | 'low'> = {
            'coding': 'high',
            'academics': 'high',
            'personal': 'medium',
            'other': 'low'
        };

        const intensity = categoryIntensity[task.category] || 'medium';
        const energy = context.energyLevel;

        if (energy === 'peak' || energy === 'high') {
            return intensity === 'high' ? 100 : 70;
        } else if (energy === 'medium') {
            return intensity === 'medium' ? 100 : 70;
        } else {
            return intensity === 'low' ? 100 : 40;
        }
    }

    private generateReasoning(task: Task, context: SuggesterContext): string[] {
        const reasons: string[] = [];
        if (task.priority === 'high') reasons.push("High priority task with upcoming deadline");

        const taskTime = task.estimatedMinutes || 30;
        if (Math.abs(taskTime - context.availableMinutes) < 15) {
            reasons.push(`Fits perfectly in your ${context.availableMinutes}m window`);
        }

        if (context.energyLevel === 'peak' && (task.category === 'coding' || task.category === 'academics')) {
            reasons.push("Perfect time for high-focus work");
        }

        if (reasons.length === 0) reasons.push("Top balanced choice for your current state");

        return reasons;
    }

    private generateDayPlan(scoredTasks: ScoredTask[], context: SuggesterContext): any[] {
        // Simplified version for now
        return scoredTasks.slice(0, 5).map((task, index) => ({
            time: new Date(context.currentTime.getTime() + index * 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            task: task.title,
            duration: task.estimatedMinutes || 30
        }));
    }

    async saveSuggestion(suggestion: any): Promise<void> {
        const id = uuidv4();
        const sql = `
            INSERT INTO smart_suggestions (
                id, user_id, suggested_task_id, rank, time_available_minutes,
                energy_level, current_time, day_of_week, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await dbService.run(sql, [
            id, suggestion.userId || 'default', suggestion.taskId, suggestion.rank,
            suggestion.availableMinutes, suggestion.energyLevel,
            new Date().toISOString(), new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            new Date().toISOString()
        ]);
    }
}

export const suggesterService = new SuggesterService();
