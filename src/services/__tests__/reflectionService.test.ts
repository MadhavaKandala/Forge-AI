import { describe, it, expect } from 'vitest';
import { reflectionService } from '../reflectionService';
import { Challenge, CheckIn } from '../../types/challenge';

const createMockCheckIn = (
  id: string,
  date: string,
  notes?: string,
  link?: string,
  photos?: string[]
): CheckIn => ({
  id,
  date,
  createdAt: date,
  notes,
  link,
  photos,
});

const createMockChallenge = (checkIns: CheckIn[]): Challenge => ({
  id: 'c1',
  name: 'Mock Challenge',
  category: 'coding',
  difficulty: 'medium',
  visibility: 'private',
  startDate: new Date().toISOString(),
  status: 'active',
  checkIns,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('ReflectionService', () => {
  describe('generateReflection', () => {
    it('generates a "milestone" whisper for the very first check-in', () => {
      const checkIns = [createMockCheckIn('1', '2023-10-01T10:00:00Z')];
      const challenge = createMockChallenge(checkIns);

      const result = reflectionService.generateReflection(challenge);

      expect(result.whisper.type).toBe('milestone');
      expect(result.whisper.title).toBe('The First Spark');

      // Milestones
      expect(result.milestones).toHaveLength(1);
      expect(result.milestones[0].type).toBe('start');
    });

    it('generates a "momentum" whisper for a hot streak', () => {
      // 5 check-ins for momentum (streak logic in mock checkIns.length >= 5)
      const checkIns = [
        createMockCheckIn('1', '2023-10-01T10:00:00Z'),
        createMockCheckIn('2', '2023-10-02T10:00:00Z'),
        createMockCheckIn('3', '2023-10-03T10:00:00Z'),
        createMockCheckIn('4', '2023-10-04T10:00:00Z'),
        createMockCheckIn('5', '2023-10-05T10:00:00Z'),
      ];
      const challenge = createMockChallenge(checkIns);

      const result = reflectionService.generateReflection(challenge);

      expect(result.whisper.type).toBe('momentum');
      expect(result.whisper.title).toBe('Unstoppable Momentum');
    });

    it('generates a "recovery" whisper when returning after missing a day', () => {
      // Only 2 check-ins, but gap > 1 day
      const checkIns = [
        createMockCheckIn('1', '2023-10-01T10:00:00Z'),
        createMockCheckIn('2', '2023-10-03T10:00:00Z'),
      ];
      const challenge = createMockChallenge(checkIns);

      const result = reflectionService.generateReflection(challenge);

      expect(result.whisper.type).toBe('recovery');
      expect(result.whisper.title).toBe('The Grace of Return');
    });

    it('generates an "insight" whisper when recent check-in has detailed notes', () => {
      const longNote = 'This is a very detailed note that exceeds twenty characters easily.';
      const checkIns = [
        createMockCheckIn('1', '2023-10-01T10:00:00Z'),
        createMockCheckIn('2', '2023-10-02T10:00:00Z'),
        createMockCheckIn('3', '2023-10-03T10:00:00Z', longNote),
      ];
      const challenge = createMockChallenge(checkIns);

      const result = reflectionService.generateReflection(challenge);

      expect(result.whisper.type).toBe('insight');
      expect(result.whisper.title).toBe('Depth Over Distance');
    });

    it('generates a "consistency" whisper as fallback', () => {
      const checkIns = [
        createMockCheckIn('1', '2023-10-01T10:00:00Z'),
        createMockCheckIn('2', '2023-10-02T10:00:00Z'),
        createMockCheckIn('3', '2023-10-03T10:00:00Z'),
        createMockCheckIn('4', '2023-10-04T10:00:00Z'),
      ];
      const challenge = createMockChallenge(checkIns);

      const result = reflectionService.generateReflection(challenge);

      expect(result.whisper.type).toBe('consistency');
      expect(result.whisper.title).toBe('Steady Progress');
    });

    it('extracts "streak" and "big_push" milestones correctly', () => {
      const checkIns = [
        createMockCheckIn('1', '2023-10-01T10:00:00Z'),
        createMockCheckIn('2', '2023-10-02T10:00:00Z'),
        createMockCheckIn('3', '2023-10-03T10:00:00Z'),
        createMockCheckIn('4', '2023-10-04T10:00:00Z'),
        createMockCheckIn('5', '2023-10-05T10:00:00Z'),
        createMockCheckIn('6', '2023-10-06T10:00:00Z'),
        createMockCheckIn('7', '2023-10-07T10:00:00Z'),
        createMockCheckIn('8', '2023-10-08T10:00:00Z'),
        createMockCheckIn('9', '2023-10-09T10:00:00Z', 'A very deep focus note that is long enough'), // big push
      ];
      const challenge = createMockChallenge(checkIns);

      const result = reflectionService.generateReflection(challenge);

      const milestoneTypes = result.milestones.map(m => m.type);
      expect(milestoneTypes).toContain('start');
      expect(milestoneTypes).toContain('streak');
      expect(milestoneTypes).toContain('big_push');
    });

    it('calculates summary properties accurately', () => {
      const checkIns = [
        createMockCheckIn('1', '2023-10-01T10:00:00Z', undefined, 'link1'), // Sunday
        createMockCheckIn('2', '2023-10-02T10:00:00Z', undefined, undefined, ['photo1']), // Monday
        createMockCheckIn('3', '2023-10-02T12:00:00Z'), // Monday
        createMockCheckIn('4', '2023-10-03T10:00:00Z'), // Tuesday
        createMockCheckIn('5', '2023-10-04T10:00:00Z', 'Some notes'), // Wednesday
      ];
      const challenge = createMockChallenge(checkIns);

      const result = reflectionService.generateReflection(challenge);

      expect(result.summary.totalEvidence).toBe(2); // link1, photo1
      expect(result.summary.mostProductiveDay).toBe('Monday'); // 2 checkins

      // Intensity growth logic
      // first half (2 items): notes lengths: 0, 0 -> avg 0
      // second half (3 items): notes lengths: 0, 0, 10 -> avg 3.33
      // growth: (3.33 - 0) / (0 || 1) * 100 = 333
      expect(result.summary.intensityGrowth).toBe(333);
    });

    it('handles 0 check-ins correctly', () => {
      const challenge = createMockChallenge([]);
      const result = reflectionService.generateReflection(challenge);

      expect(result.whisper.type).toBe('consistency');
      expect(result.milestones).toHaveLength(0);
      expect(result.summary.totalEvidence).toBe(0);
      expect(result.summary.mostProductiveDay).toBe('Unknown');
      expect(result.summary.intensityGrowth).toBe(0);
    });

    it('handles intensity growth when check-ins < 5', () => {
      const checkIns = [
        createMockCheckIn('1', '2023-10-01T10:00:00Z', 'note'),
        createMockCheckIn('2', '2023-10-02T10:00:00Z', 'note'),
      ];
      const challenge = createMockChallenge(checkIns);
      const result = reflectionService.generateReflection(challenge);

      expect(result.summary.intensityGrowth).toBe(0);
    });

    it('handles intensity growth with 0 notes in first half', () => {
      const checkIns = [
        createMockCheckIn('1', '2023-10-01T10:00:00Z'),
        createMockCheckIn('2', '2023-10-02T10:00:00Z'),
        createMockCheckIn('3', '2023-10-03T10:00:00Z', 'Some notes'),
        createMockCheckIn('4', '2023-10-04T10:00:00Z', 'More notes'),
        createMockCheckIn('5', '2023-10-05T10:00:00Z', 'Even more notes here!'),
      ];
      const challenge = createMockChallenge(checkIns);
      const result = reflectionService.generateReflection(challenge);

      // First half avg = 0. Second half avg = (10 + 10 + 21) / 3 = 13.66.
      // Math.round(((13.66 - 0) / (0 || 1)) * 100) = 1367
      expect(result.summary.intensityGrowth).toBeGreaterThan(0);
    });
  });
});
