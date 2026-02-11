import { dbService } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

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
}

export const programService = {
    async getActivePrograms(): Promise<Program[]> {
        try {
            const result = await dbService.query("SELECT * FROM programs WHERE status = 'active'");
            return result.map(row => ({
                id: row.id,
                name: row.name,
                description: row.description,
                programType: row.program_type,
                totalDays: row.total_days,
                currentDay: row.current_day,
                status: row.status as any,
                startedAt: row.started_at,
                completedAt: row.completed_at
            }));
        } catch (error) {
            console.error("Error fetching active programs", error);
            return [];
        }
    },

    async startProgram(name: string, type: string, days: number): Promise<void> {
        const id = uuidv4();
        const now = new Date().toISOString();
        // Check if already active
        const active = await this.getActivePrograms();
        if (active.find(p => p.programType === type)) {
            return; // Already active
        }

        const sql = `
        INSERT INTO programs (id, name, description, program_type, total_days, current_day, status, started_at)
        VALUES (?, ?, ?, ?, ?, 1, 'active', ?)
      `;
        // Description is hardcoded for now based on type
        let desc = '';
        if (type === '75_hard') desc = '75 days of discipline.';
        if (type === 'morning_routine') desc = 'Build a perfect morning.';

        await dbService.run(sql, [id, name, desc, type, days, now]);
    },

    async getAvailablePrograms(): Promise<any[]> {
        // Return static list for now, checking against DB status
        const active = await this.getActivePrograms();
        const activeTypes = active.map(p => p.programType);

        const all = [
            { type: '75_hard', name: '75 Hard Challenge', days: 75, description: 'Mental toughness program.' },
            { type: 'morning_routine', name: 'Morning Routine', days: 30, description: 'Start your day right.' },
            { type: '100_days_code', name: '100 Days of Code', days: 100, description: 'Code every day.' }
        ];

        return all.filter(p => !activeTypes.includes(p.type));
    }
};
