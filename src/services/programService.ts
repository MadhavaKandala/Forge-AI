import { dbService } from '../lib/db';
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
    },
    {
        type: 'gita_journey',
        name: 'Bhagavad Gita Journey',
        description: 'Spiritual wisdom through daily reading.',
        days: 60,
        icon: '📚',
        difficulty: 'beginner',
        category: 'mental',
        dailyRequirements: [
            'Read assigned verses (20-30 min)',
            'Write reflection (10-15 min)',
            'One key learning to apply'
        ],
        totalXpPotential: 4200,
        phases: [
            { name: 'Foundation', startDay: 1, endDay: 15, description: 'Chapters 1-4', xpPerDay: 60 },
            { name: 'Core', startDay: 16, endDay: 45, description: 'Chapters 5-12', xpPerDay: 70 },
            { name: 'Advanced', startDay: 46, endDay: 60, description: 'Chapters 13-18', xpPerDay: 80 }
        ]
    },
    {
        type: 'nutrition_mastery',
        name: 'Nutrition Mastery',
        description: 'Master your diet and macro tracking.',
        days: 45,
        icon: '🍽️',
        difficulty: 'beginner',
        category: 'health',
        dailyRequirements: [
            'Log all meals',
            'Hit macro goals (P/C/F)',
            'Drink 8 glasses water'
        ],
        totalXpPotential: 2700,
        phases: [
            { name: 'Baseline', startDay: 1, endDay: 10, description: 'Track every meal', xpPerDay: 50 },
            { name: 'Optimization', startDay: 11, endDay: 35, description: 'Hit macro targets', xpPerDay: 65 },
            { name: 'Mastery', startDay: 36, endDay: 45, description: 'Maintain consistency', xpPerDay: 80 }
        ]
    },
    {
        type: 'academic_excellence',
        name: 'Academic Excellence',
        description: 'Semester-long focus on deep learning.',
        days: 120,
        icon: '🎓',
        difficulty: 'intermediate',
        category: 'learning',
        dailyRequirements: [
            'Attend all classes',
            'Study 2-3 hours',
            'Complete practice problems',
            'Review lecture notes'
        ],
        totalXpPotential: 10000,
        phases: [
            { name: 'Foundation', startDay: 1, endDay: 40, description: 'Syllabus coverage', xpPerDay: 70 },
            { name: 'Consolidation', startDay: 41, endDay: 90, description: 'Deep learning', xpPerDay: 85 },
            { name: 'Exam Prep', startDay: 91, endDay: 120, description: 'Mock tests', xpPerDay: 100 }
        ]
    },
    {
        type: 'creative_skills',
        name: 'Creative Skills (Video Editing)',
        description: 'Master video editing in 60 days.',
        days: 60,
        icon: '✂️',
        difficulty: 'intermediate',
        category: 'productivity',
        dailyRequirements: [
            'Complete tutorial/lesson',
            'Practice technique',
            'Work on project'
        ],
        totalXpPotential: 3000,
        phases: [
            { name: 'Basics', startDay: 1, endDay: 20, description: 'Software & Tools', xpPerDay: 40 },
            { name: 'Projects', startDay: 21, endDay: 50, description: 'Mini projects', xpPerDay: 55 },
            { name: 'Capstone', startDay: 51, endDay: 60, description: 'Major project', xpPerDay: 75 }
        ]
    },
    {
        type: 'break_mastery',
        name: 'Break Time Mastery',
        description: 'Maintain healthy balance and guilt-free leisure.',
        days: 30,
        icon: '🎮',
        difficulty: 'beginner',
        category: 'productivity',
        dailyRequirements: [
            'Designated break activities',
            'Track break time (max 2h/day)',
            'Try new hobby/activity'
        ],
        totalXpPotential: 1200,
        phases: [
            { name: 'Discovery', startDay: 1, endDay: 10, description: 'Explore interests', xpPerDay: 30 },
            { name: 'Routine', startDay: 11, endDay: 20, description: 'Balance work/play', xpPerDay: 40 },
            { name: 'Mastery', startDay: 21, endDay: 30, description: 'Guilt-free relaxation', xpPerDay: 50 }
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
    // --- FETCHING ---
    async getActivePrograms(): Promise<Program[]> {
        try {
            const result = await dbService.query("SELECT * FROM programs WHERE status = 'active'");
            return result.map(this.mapRowToProgram);
        } catch (error) {
            console.error("Error fetching active programs", error);
            return [];
        }
    },

    async getCompletedPrograms(): Promise<Program[]> {
        try {
            const result = await dbService.query("SELECT * FROM programs WHERE status = 'completed'");
            return result.map(this.mapRowToProgram);
        } catch (error) {
            console.error("Error fetching completed programs", error);
            return [];
        }
    },

    async getAvailablePrograms(): Promise<ProgramTemplate[]> {
        // Get currently active types to exclude them
        const active = await this.getActivePrograms();
        const activeTypes = new Set(active.map(p => p.programType));

        // Return templates that aren't currently active
        return PROGRAM_TEMPLATES.filter(t => !activeTypes.has(t.type));
    },

    async getProgramById(id: string): Promise<Program | null> {
        try {
            const result = await dbService.query("SELECT * FROM programs WHERE id = ?", [id]);
            if (result.length === 0) return null;
            return this.mapRowToProgram(result[0]);
        } catch (error) {
            console.error("Error fetching program by id", error);
            return null;
        }
    },

    async getProgramDays(programId: string): Promise<ProgramDay[]> {
        try {
            const result = await dbService.query(
                "SELECT * FROM program_days WHERE program_id = ? ORDER BY day_number ASC",
                [programId]
            );
            return result.map(row => ({
                id: row.id,
                programId: row.program_id,
                dayNumber: row.day_number,
                isCompleted: row.is_completed === 1,
                completedAt: row.completed_at,
                notes: row.notes,
                dailyXp: row.daily_xp
            }));
        } catch (error) {
            console.error("Error fetching program days", error);
            return [];
        }
    },

    async getProgramMilestones(programId: string): Promise<ProgramMilestone[]> {
        try {
            const result = await dbService.query(
                "SELECT * FROM program_milestones WHERE program_id = ? ORDER BY day_number ASC",
                [programId]
            );
            return result.map(row => ({
                id: row.id,
                programId: row.program_id,
                milestoneName: row.milestone_name,
                dayNumber: row.day_number,
                isCompleted: row.is_completed === 1,
                xpReward: row.xp_reward
            }));
        } catch (error) {
            console.error("Error fetching milestones", error);
            return [];
        }
    },

    // --- ACTIONS ---

    async startProgram(templateType: string): Promise<Program | null> {
        const template = PROGRAM_TEMPLATES.find(t => t.type === templateType);
        if (!template) {
            console.error("Template not found:", templateType);
            return null;
        }

        const id = uuidv4();
        const now = new Date().toISOString();

        // Check if already active
        const active = await this.getActivePrograms();
        if (active.find(p => p.programType === templateType)) {
            console.warn("Program already active:", templateType);
            return null;
        }

        const sql = `
      INSERT INTO programs (
        id, name, description, program_type, total_days, current_day, 
        status, started_at, category, difficulty, daily_requirements,
        phases, total_xp_potential, xp_earned, completion_percentage, days_missed
      )
      VALUES (?, ?, ?, ?, ?, 1, 'active', ?, ?, ?, ?, ?, ?, 0, 0, 0)
    `;

        try {
            await dbService.run(sql, [
                id,
                template.name,
                template.description,
                template.type,
                template.days,
                now,
                template.category,
                template.difficulty,
                JSON.stringify(template.dailyRequirements),
                JSON.stringify(template.phases || []),
                template.totalXpPotential
            ]);

            // Initialize Milestones if any
            // For simplicity, we'll just add one at the end for now, or from phases
            if (template.phases) {
                for (const phase of template.phases) {
                    await dbService.run(`
             INSERT INTO program_milestones (id, program_id, milestone_name, day_number, is_completed, xp_reward)
             VALUES (?, ?, ?, ?, 0, ?)
           `, [uuidv4(), id, `Complete ${phase.name} Phase`, phase.endDay, 100]); // Bonus 100 XP
                }
            }

            // Add final milestone
            await dbService.run(`
         INSERT INTO program_milestones (id, program_id, milestone_name, day_number, is_completed, xp_reward)
         VALUES (?, ?, ?, ?, 0, ?)
       `, [uuidv4(), id, 'Program Completion', template.days, 500]);

            return this.getProgramById(id);
        } catch (error) {
            console.error("Error starting program", error);
            return null;
        }
    },

    async completeProgramDay(programId: string, notes?: string): Promise<void> {
        const program = await this.getProgramById(programId);
        if (!program) return;

        const dayId = uuidv4();
        const now = new Date().toISOString();

        // Calculate XP for the day
        let xp = 50; // Base XP
        const currentPhase = getCurrentPhase(program.currentDay, program.phases || []);
        if (currentPhase) {
            xp = currentPhase.xpPerDay;
        }

        try {
            // 1. Record the day completion
            await dbService.run(`
        INSERT INTO program_days (id, program_id, day_number, is_completed, completed_at, notes, daily_xp)
        VALUES (?, ?, ?, 1, ?, ?, ?)
      `, [dayId, programId, program.currentDay, now, notes || '', xp]);

            // 2. Update Program Stats
            const newXp = (program.xpEarned || 0) + xp;
            const newPercentage = ((program.currentDay) / program.totalDays) * 100;

            // Check for milestones
            await dbService.run(`
        UPDATE program_milestones 
        SET is_completed = 1 
        WHERE program_id = ? AND day_number = ?
      `, [programId, program.currentDay]);

            // Advance day or complete program
            let nextStatus = 'active';
            let nextDay = program.currentDay + 1;
            let completedAt = null;

            if (program.currentDay >= program.totalDays) {
                nextStatus = 'completed';
                completedAt = now;
                nextDay = program.totalDays; // Cap it
            }

            await dbService.run(`
        UPDATE programs 
        SET current_day = ?, status = ?, xp_earned = ?, completion_percentage = ?, completed_at = ?
        WHERE id = ?
      `, [nextDay, nextStatus, newXp, newPercentage, completedAt, programId]);

        } catch (error) {
            console.error("Error completing program day", error);
        }
    },

    async pauseProgram(programId: string): Promise<void> {
        await dbService.run("UPDATE programs SET status = 'paused' WHERE id = ?", [programId]);
    },

    async resumeProgram(programId: string): Promise<void> {
        await dbService.run("UPDATE programs SET status = 'active' WHERE id = ?", [programId]);
    },

    // --- HELPERS ---

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
