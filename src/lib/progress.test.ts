import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDateKey,
  getCompletionStatus,
  getStatusColor,
  getProgressStats,
} from './progress';
import type { Habit } from '@/store/useHabitStore';
import type { Task } from '@/types/task';

describe('progress utilities', () => {
  describe('formatDateKey', () => {
    it('correctly extracts the YYYY-MM-DD part of a Date object', () => {
      const date = new Date('2023-10-15T14:30:00Z');
      expect(formatDateKey(date)).toBe('2023-10-15');
    });

    it('formats single-digit months and days correctly', () => {
      const date = new Date('2023-05-05T00:00:00Z');
      expect(formatDateKey(date)).toBe('2023-05-05');
    });
  });

  describe('getCompletionStatus', () => {
    it('returns strong when completed >= total and total > 0', () => {
      expect(getCompletionStatus(5, 5)).toBe('strong');
      expect(getCompletionStatus(6, 5)).toBe('strong');
    });

    it('returns steady when completed > 0 and completed < total', () => {
      expect(getCompletionStatus(1, 5)).toBe('steady');
      expect(getCompletionStatus(4, 5)).toBe('steady');
    });

    it('returns low when completed is 0', () => {
      expect(getCompletionStatus(0, 5)).toBe('low');
    });

    it('handles edge cases like total = 0 and completed = 0', () => {
      expect(getCompletionStatus(0, 0)).toBe('low');
    });
  });

  describe('getStatusColor', () => {
    it('returns correct color for strong', () => {
      expect(getStatusColor('strong')).toBe('#22C55E');
    });

    it('returns correct color for steady', () => {
      expect(getStatusColor('steady')).toBe('#FACC15');
    });

    it('returns correct color for low', () => {
      expect(getStatusColor('low')).toBe('#FF4444');
    });
  });

  describe('getProgressStats', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-05-21T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('calculates default stats with empty habits and tasks arrays', () => {
      const stats = getProgressStats([], []);

      expect(stats.today).toBe('2024-05-21');
      expect(stats.completedToday).toBe(0);
      expect(stats.totalToday).toBe(0);
      expect(stats.status).toBe('low');
      expect(stats.longestStreak).toBe(0);
      expect(stats.totalCompleted).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.last30.length).toBe(30);
      expect(stats.last30[29].date).toBe('2024-05-21');
      expect(stats.last30[29].status).toBe('low');
    });

    it('calculates stats with various habits and tasks combinations', () => {
      const habits: Habit[] = [
        { id: '1', title: 'H1', type: 'checkbox', streak: 5, completedDates: ['2024-05-21', '2024-05-20'], category: 'gym', time: 'Morning', history: {} },
        { id: '2', title: 'H2', type: 'checkbox', streak: 2, completedDates: ['2024-05-20'], category: 'gym', time: 'Morning', history: {} },
        { id: '3', title: 'H3', type: 'timer', streak: 10, completedDates: ['2024-05-21'], category: 'coding', time: 'Evening', history: {} },
      ] as Habit[];

      const tasks: Task[] = [
        { id: 't1', title: 'T1', status: 'today', completed: true, category: 'work', priority: 'high', size: 'medium', quadrant: 'q1', isRecurring: false, createdAt: '', updatedAt: '', subtasks: [] },
        { id: 't2', title: 'T2', status: 'in_progress', completed: false, category: 'work', priority: 'high', size: 'medium', quadrant: 'q1', isRecurring: false, createdAt: '', updatedAt: '', subtasks: [] },
        { id: 't3', title: 'T3', status: 'completed', completed: true, category: 'work', priority: 'high', size: 'medium', quadrant: 'q1', isRecurring: false, createdAt: '', updatedAt: '', subtasks: [] },
        { id: 't4', title: 'T4', status: 'backlog', scheduledDate: '2024-05-21', completed: true, category: 'work', priority: 'high', size: 'medium', quadrant: 'q1', isRecurring: false, createdAt: '', updatedAt: '', subtasks: [] },
        { id: 't5', title: 'T5', status: 'backlog', completed: false, category: 'work', priority: 'high', size: 'medium', quadrant: 'q1', isRecurring: false, createdAt: '', updatedAt: '', subtasks: [] },
      ] as Task[];

      const stats = getProgressStats(habits, tasks);

      expect(stats.completedToday).toBe(3);
      expect(stats.totalToday).toBe(5);
      expect(stats.status).toBe('steady');

      expect(stats.longestStreak).toBe(10);
      expect(stats.currentStreak).toBe(10);

      expect(stats.totalCompleted).toBe(7);

      expect(stats.last30.length).toBe(30);
      const todayInLast30 = stats.last30[29];
      expect(todayInLast30.date).toBe('2024-05-21');
      expect(todayInLast30.completed).toBe(1);
      expect(todayInLast30.total).toBe(2);
      expect(todayInLast30.status).toBe('steady');

      const yesterdayInLast30 = stats.last30[28];
      expect(yesterdayInLast30.date).toBe('2024-05-20');
      expect(yesterdayInLast30.completed).toBe(2);
      expect(yesterdayInLast30.total).toBe(2);
      expect(yesterdayInLast30.status).toBe('strong');
    });
  });
});