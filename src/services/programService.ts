import { v4 as uuidv4 } from 'uuid';
import { Program, ProgramDay, ProgramMilestone } from '../types/schema';

// Re-export types for convenience
export type { Program, ProgramDay, ProgramMilestone };

export interface ProgramTemplate {
    type: string;
    name: string;
    description: string;
    days: number;
    icon: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'extreme';
    category: 'fitness' | 'mental' | 'learning' | 'health' | 'productivity';
    dailyRequirements: string[];
    totalXpPotential: number;
    phases?: {
        name: string;
        startDay: number;
        endDay: number;
        description: string;
        xpPerDay: number;
    }[];
}

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
    {
        type: 'leetcode_75',
        name: 'LeetCode 75 Hard',
        description: '75 Days of Code. Master 75 most important problems.',
        days: 75,
        icon: '💻',
        difficulty: 'advanced',
        category: 'learning',
        dailyRequirements: [
            'Complete 1 LeetCode problem',
            'Document solution approach'
        ],
        totalXpPotential: 7500,
        phases: [
            { name: 'Fundamentals', startDay: 1, endDay: 20, description: 'Arrays & Strings (Easy)', xpPerDay: 75 },
            { name: 'Data Structures', startDay: 21, endDay: 60, description: 'Linked Lists, Trees, Graphs (Medium)', xpPerDay: 100 },
            { name: 'Optimization', startDay: 61, endDay: 75, description: 'DP & Hard Problems', xpPerDay: 150 }
        ]
    },
    {
        type: 'gym_progress',
        name: 'Gym Progress',
        description: '90-day physical transformation journey.',
        days: 90,
        icon: '💪',
        difficulty: 'intermediate',
        category: 'fitness',
        dailyRequirements: [
            'Complete assigned workout',
            'Log sets, reps, weights',
            'Rate form quality'
        ],
        totalXpPotential: 9000,
        phases: [
            { name: 'Foundation', startDay: 1, endDay: 30, description: 'PPL Split (4x/week)', xpPerDay: 80 },
            { name: 'Hypertrophy', startDay: 31, endDay: 60, description: 'Upper/Lower (5x/week)', xpPerDay: 100 },
            { name: 'Power', startDay: 61, endDay: 90, description: 'Arnold Split (6x/week)', xpPerDay: 120 }
        ]
    }
];

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
