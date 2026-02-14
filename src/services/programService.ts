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
        description: '75 Days of Code. One problem a day. No excuses.',
        days: 75,
        icon: '💻',
        difficulty: 'advanced',
        category: 'learning',
        dailyRequirements: [
            'Solve 1 LeetCode problem',
            'No social media before 10 AM',
            'Read 1 technical article'
        ],
        totalXpPotential: 7500,
        phases: [
            { name: 'Foundation', startDay: 1, endDay: 30, description: 'Arrays & Strings', xpPerDay: 80 },
            { name: 'Intermediate', startDay: 31, endDay: 60, description: 'Trees & Graphs', xpPerDay: 100 },
            { name: 'Advanced', startDay: 61, endDay: 75, description: 'DP & Hard Problems', xpPerDay: 150 }
        ]
    },
    {
        type: 'academic_excellence',
        name: 'Academic Excellence',
        description: 'Semester-long focus on studies and deep work.',
        days: 120,
        icon: '🎓',
        difficulty: 'intermediate',
        category: 'learning',
        dailyRequirements: [
            'Attend all classes',
            '2 hours self-study',
            'Review daily notes'
        ],
        totalXpPotential: 12000,
    },
    {
        type: 'gita_journey',
        name: 'Gita Journey',
        description: 'Spiritual wisdom through daily reading during commute.',
        days: 60,
        icon: '📚',
        difficulty: 'beginner',
        category: 'mental',
        dailyRequirements: [
            'Read 20-30 mins (Bus)',
            'Brief reflection note'
        ],
        totalXpPotential: 2400,
    },
    {
        type: 'mongodb_cert',
        name: 'MongoDB Certified',
        description: 'Become a certified MongoDB developer in 45 days.',
        days: 45,
        icon: '💼',
        difficulty: 'intermediate',
        category: 'learning',
        dailyRequirements: [
            'Complete 1 Course Module',
            'Practice Exercises'
        ],
        totalXpPotential: 4500,
    },
    {
        type: 'gym_dance_fitness',
        name: 'Gym & Dance',
        description: 'Physical mastery through consistent training.',
        days: 90,
        icon: '💪',
        difficulty: 'intermediate',
        category: 'fitness',
        dailyRequirements: [
            'Gym or Dance Session (2x/week)',
            'Protein intake goal',
            '8 Hours Sleep'
        ],
        totalXpPotential: 9000,
    },
    {
        type: 'nutrition_tracking',
        name: 'Nutrition 30',
        description: 'Build the habit of tracking every meal.',
        days: 30,
        icon: '🍽️',
        difficulty: 'beginner',
        category: 'health',
        dailyRequirements: [
            'Log Breakfast',
            'Log Lunch',
            'Log Dinner',
            'Drink 4L Water'
        ],
        totalXpPotential: 1500,
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
