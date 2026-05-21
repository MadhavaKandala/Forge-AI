import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    formatDateKey,
    getCompletionStatus,
    getStatusColor,
    getProgressStats
} from '../lib/progress';
import type { Habit } from '../store/useHabitStore';
import type { Task } from '../types/task';

describe('progress utilities', () => {
    describe('formatDateKey', () => {
        it('should format Date correctly as YYYY-MM-DD', () => {
            const date = new Date('2023-10-15T12:00:00Z');
            expect(formatDateKey(date)).toBe('2023-10-15');
        });
    });

    describe('getCompletionStatus', () => {
        it('should return "strong" when completed is greater than or equal to total and total > 0', () => {
            expect(getCompletionStatus(5, 5)).toBe('strong');
            expect(getCompletionStatus(6, 5)).toBe('strong');
        });

        it('should return "steady" when completed is greater than 0 but less than total', () => {
            expect(getCompletionStatus(1, 5)).toBe('steady');
            expect(getCompletionStatus(4, 5)).toBe('steady');
        });

        it('should return "low" when completed is 0', () => {
            expect(getCompletionStatus(0, 5)).toBe('low');
        });

        it('should return "low" when total is 0', () => {
            expect(getCompletionStatus(0, 0)).toBe('low');
            expect(getCompletionStatus(5, 0)).toBe('low');
        });
    });

    describe('getStatusColor', () => {
        it('should return correct color for "strong"', () => {
            expect(getStatusColor('strong')).toBe('#22C55E');
        });

        it('should return correct color for "steady"', () => {
            expect(getStatusColor('steady')).toBe('#FACC15');
        });

        it('should return correct color for "low"', () => {
            expect(getStatusColor('low')).toBe('#FF4444');
        });
    });

    describe('getProgressStats', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            // Set fake time to 2023-10-15
            vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should calculate stats correctly with empty habits and tasks', () => {
            const stats = getProgressStats([], []);
            expect(stats.today).toBe('2023-10-15');
            expect(stats.completedToday).toBe(0);
            expect(stats.totalToday).toBe(0);
            expect(stats.status).toBe('low');
            expect(stats.longestStreak).toBe(0);
            expect(stats.totalCompleted).toBe(0);
            expect(stats.currentStreak).toBe(0);
            expect(stats.last30.length).toBe(30);
            expect(stats.last30[29].date).toBe('2023-10-15');
        });

        it('should calculate stats correctly with mixed habits and tasks', () => {
            const habits: Habit[] = [
                {
                    id: '1',
                    title: 'Drink Water',
                    time: 'Morning',
                    streak: 5,
                    completedDates: ['2023-10-14', '2023-10-15'],
                    type: 'checkbox',
                    category: 'health',
                    history: {}
                },
                {
                    id: '2',
                    title: 'Read Book',
                    time: 'Evening',
                    streak: 2,
                    completedDates: ['2023-10-14'],
                    type: 'checkbox',
                    category: 'mind',
                    history: {}
                },
                {
                    id: '3',
                    title: 'Timer Habit',
                    time: 'Afternoon',
                    streak: 1,
                    completedDates: ['2023-10-15'],
                    type: 'timer',
                    category: 'learning',
                    history: {}
                }
            ];

            const tasks: Task[] = [
                {
                    id: 't1',
                    title: 'Task 1',
                    category: 'work',
                    priority: 'high',
                    status: 'today',
                    completed: true,
                    size: 'small',
                    quadrant: 'q1',
                    isRecurring: false,
                    subtasks: [],
                    createdAt: '2023-10-14',
                    updatedAt: '2023-10-14'
                },
                {
                    id: 't2',
                    title: 'Task 2',
                    category: 'personal',
                    priority: 'low',
                    status: 'in_progress',
                    completed: false,
                    size: 'medium',
                    quadrant: 'q2',
                    isRecurring: false,
                    subtasks: [],
                    createdAt: '2023-10-14',
                    updatedAt: '2023-10-14'
                },
                {
                    id: 't3',
                    title: 'Task 3',
                    category: 'gym',
                    priority: 'medium',
                    status: 'completed',
                    completed: true,
                    scheduledDate: '2023-10-14',
                    size: 'big',
                    quadrant: 'q3',
                    isRecurring: false,
                    subtasks: [],
                    createdAt: '2023-10-14',
                    updatedAt: '2023-10-14'
                }
            ];

            const stats = getProgressStats(habits as unknown as Habit[], tasks as unknown as Task[]);

            // Check today's formatted date
            expect(stats.today).toBe('2023-10-15');

            // completed today:
            // - todayCompletedHabits (checkbox only): 'Drink Water' is completed today (1)
            // - completedTodayTasks: 'Task 1' is active today (status 'today') and completed.
            //   'Task 2' is active today (status 'in_progress') but not completed.
            //   'Task 3' is not active today (scheduled '2023-10-14', status 'completed' not 'today'/'in_progress')
            expect(stats.completedToday).toBe(1 + 1); // 2

            // total today:
            // - checkboxHabits: 'Drink Water', 'Read Book' (2)
            // - activeTodayTasks: 'Task 1', 'Task 2' (2)
            expect(stats.totalToday).toBe(2 + 2); // 4

            // status: 2 / 4 -> 'steady'
            expect(stats.status).toBe('steady');

            // longest streak from habits: max(5, 2, 1) = 5
            expect(stats.longestStreak).toBe(5);

            // totalCompleted:
            // habits completed dates: 2 + 1 + 1 = 4
            // completed tasks: 'Task 1', 'Task 3' = 2
            // total = 6
            expect(stats.totalCompleted).toBe(6);

            expect(stats.currentStreak).toBe(5);

            // last30 checks
            const todayStat = stats.last30[29];
            expect(todayStat.date).toBe('2023-10-15');
            expect(todayStat.completed).toBe(1); // checkbox habit 'Drink Water'
            expect(todayStat.total).toBe(2); // checkbox habits total

            const yesterdayStat = stats.last30[28];
            expect(yesterdayStat.date).toBe('2023-10-14');
            expect(yesterdayStat.completed).toBe(2); // 'Drink Water' and 'Read Book'
        });
    });
});
