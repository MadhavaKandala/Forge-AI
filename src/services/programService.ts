import { v4 as uuidv4 } from 'uuid';
import { Program, ProgramDay, ProgramMilestone } from '../types/schema';
import { PROGRAM_TEMPLATES, type ProgramTemplate } from '../lib/programs';

// Re-export types for convenience
export type { Program, ProgramDay, ProgramMilestone };
export { PROGRAM_TEMPLATES, type ProgramTemplate };

export const difficultyStars = (diff: string) => {
    switch (diff) {
        case 'beginner': return '⭐';
        case 'intermediate': return '⭐⭐';
        case 'advanced': return '⭐⭐⭐';
        case 'extreme': return '⭐⭐⭐⭐';
        default: return '⭐';
    }
};

export const getCurrentPhase = (day: number, phases: any[]) => {
    if (!phases || phases.length === 0) return null;
    return phases.find(p => day >= p.startDay && day <= p.endDay);
};

export const programService = {
    async getActivePrograms(): Promise<Program[]> {
        return [];
    },

    async getCompletedPrograms(): Promise<Program[]> {
        return [];
    },

    async getAvailablePrograms(): Promise<ProgramTemplate[]> {
        return PROGRAM_TEMPLATES;
    },

    async getProgramById(id: string): Promise<Program | null> {
        return null;
    },

    async getProgramDays(programId: string): Promise<ProgramDay[]> {
        return [];
    },

    async getProgramMilestones(programId: string): Promise<ProgramMilestone[]> {
        return [];
    },

    async startProgram(templateType: string): Promise<Program | null> {
        return null;
    },

    async completeProgramDay(programId: string, notes?: string): Promise<void> {
        console.log(`Completed day for program ${programId}`);
    },

    async pauseProgram(programId: string): Promise<void> {
        console.log(`Paused program ${programId}`);
    },

    async resumeProgram(programId: string): Promise<void> {
        console.log(`Resumed program ${programId}`);
    },

    mapRowToProgram(row: any): Program {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            programType: row.program_type,
            totalDays: row.total_days,
            currentDay: row.current_day,
            status: row.status,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            category: row.category,
            difficulty: row.difficulty,
            dailyRequirements: typeof row.daily_requirements === 'string' ? JSON.parse(row.daily_requirements) : row.daily_requirements,
            phases: typeof row.phases === 'string' ? JSON.parse(row.phases) : row.phases,
            totalXpPotential: row.total_xp_potential,
            xpEarned: row.xp_earned,
            completionPercentage: row.completion_percentage,
            daysMissed: row.days_missed
        };
    }
};
