import { describe, it, expect } from 'vitest';
import {
    difficultyStars,
    getCurrentPhase,
    programService,
    PROGRAM_TEMPLATES
} from '../services/programService';

describe('programService', () => {
    describe('difficultyStars', () => {
        it('should return ⭐ for beginner', () => {
            expect(difficultyStars('beginner')).toBe('⭐');
        });

        it('should return ⭐⭐ for intermediate', () => {
            expect(difficultyStars('intermediate')).toBe('⭐⭐');
        });

        it('should return ⭐⭐⭐ for advanced', () => {
            expect(difficultyStars('advanced')).toBe('⭐⭐⭐');
        });

        it('should return ⭐⭐⭐⭐ for extreme', () => {
            expect(difficultyStars('extreme')).toBe('⭐⭐⭐⭐');
        });

        it('should return ⭐ for default/unknown', () => {
            expect(difficultyStars('unknown')).toBe('⭐');
        });
    });

    describe('getCurrentPhase', () => {
        it('should return null if phases is null', () => {
            expect(getCurrentPhase(1, null as any)).toBeNull();
        });

        it('should return null if phases is empty', () => {
            expect(getCurrentPhase(1, [])).toBeNull();
        });

        it('should return the correct phase if day is within a phase', () => {
            const phases = [
                { name: 'Phase 1', startDay: 1, endDay: 14 },
                { name: 'Phase 2', startDay: 15, endDay: 30 }
            ];
            expect(getCurrentPhase(5, phases)).toEqual({ name: 'Phase 1', startDay: 1, endDay: 14 });
            expect(getCurrentPhase(15, phases)).toEqual({ name: 'Phase 2', startDay: 15, endDay: 30 });
            expect(getCurrentPhase(30, phases)).toEqual({ name: 'Phase 2', startDay: 15, endDay: 30 });
        });

        it('should return undefined if day is not within any phase', () => {
            const phases = [
                { name: 'Phase 1', startDay: 1, endDay: 14 },
                { name: 'Phase 2', startDay: 15, endDay: 30 }
            ];
            expect(getCurrentPhase(31, phases)).toBeUndefined();
        });
    });

    describe('programService.getAvailablePrograms', () => {
        it('should return PROGRAM_TEMPLATES', async () => {
            const programs = await programService.getAvailablePrograms();
            expect(programs).toBe(PROGRAM_TEMPLATES);
        });
    });

    describe('programService.mapRowToProgram', () => {
        it('should map a row correctly when daily_requirements and phases are already objects', () => {
            const row = {
                id: '123',
                name: 'Test Program',
                description: 'A test program',
                program_type: 'test',
                total_days: 30,
                current_day: 5,
                status: 'active',
                started_at: '2023-01-01',
                completed_at: null,
                category: 'fitness',
                difficulty: 'beginner',
                daily_requirements: ['pushups', 'situps'],
                phases: [{ name: 'Phase 1', startDay: 1, endDay: 30 }],
                total_xp_potential: 1000,
                xp_earned: 200,
                completion_percentage: 16.6,
                days_missed: 0
            };

            const program = programService.mapRowToProgram(row);

            expect(program).toEqual({
                id: '123',
                name: 'Test Program',
                description: 'A test program',
                programType: 'test',
                totalDays: 30,
                currentDay: 5,
                status: 'active',
                startedAt: '2023-01-01',
                completedAt: null,
                category: 'fitness',
                difficulty: 'beginner',
                dailyRequirements: ['pushups', 'situps'],
                phases: [{ name: 'Phase 1', startDay: 1, endDay: 30 }],
                totalXpPotential: 1000,
                xpEarned: 200,
                completionPercentage: 16.6,
                daysMissed: 0
            });
        });

        it('should parse daily_requirements and phases correctly when they are strings', () => {
            const row = {
                id: '123',
                name: 'Test Program',
                description: 'A test program',
                program_type: 'test',
                total_days: 30,
                current_day: 5,
                status: 'active',
                started_at: '2023-01-01',
                completed_at: null,
                category: 'fitness',
                difficulty: 'beginner',
                daily_requirements: JSON.stringify(['pushups', 'situps']),
                phases: JSON.stringify([{ name: 'Phase 1', startDay: 1, endDay: 30 }]),
                total_xp_potential: 1000,
                xp_earned: 200,
                completion_percentage: 16.6,
                days_missed: 0
            };

            const program = programService.mapRowToProgram(row);

            expect(program).toEqual({
                id: '123',
                name: 'Test Program',
                description: 'A test program',
                programType: 'test',
                totalDays: 30,
                currentDay: 5,
                status: 'active',
                startedAt: '2023-01-01',
                completedAt: null,
                category: 'fitness',
                difficulty: 'beginner',
                dailyRequirements: ['pushups', 'situps'],
                phases: [{ name: 'Phase 1', startDay: 1, endDay: 30 }],
                totalXpPotential: 1000,
                xpEarned: 200,
                completionPercentage: 16.6,
                daysMissed: 0
            });
        });
    });
});
