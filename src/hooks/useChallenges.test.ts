import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChallenges } from './useChallenges';
import { Challenge } from '@/types/challenge';

const STORAGE_KEY = 'challenge-tracker-data';
const PROFILE_KEY = 'challenge-tracker-profile';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock crypto.randomUUID
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9)
  }
});

describe('useChallenges', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with empty challenges and default user profile when storage is empty', () => {
    const { result } = renderHook(() => useChallenges());

    expect(result.current.challenges).toEqual([]);
    expect(result.current.userProfile.name).toBe('User');
    expect(result.current.isLoaded).toBe(true);
  });

  it('loads data from localStorage on initialization', () => {
    const mockChallenge = { id: '1', title: 'Test', status: 'active', checkIns: [] };
    const mockProfile = { name: 'Test User', fitness: {}, coding: {}, reading: {}, mindfulness: {}, diet: {} };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([mockChallenge]));
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(mockProfile));

    const { result } = renderHook(() => useChallenges());

    expect(result.current.challenges).toEqual([mockChallenge]);
    expect(result.current.userProfile.name).toBe('Test User');
  });

  it('creates a new challenge', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.createChallenge({
        title: 'New Challenge',
        description: 'Test Description',
        startDate: '2024-01-15',
        category: 'fitness'
      });
    });

    expect(result.current.challenges).toHaveLength(1);
    expect(result.current.challenges[0]).toMatchObject({
      title: 'New Challenge',
      description: 'Test Description',
      status: 'active',
      visibility: 'private',
      checkIns: []
    });
    expect(result.current.challenges[0].id).toBeDefined();

    // Check if saved to localStorage
    expect(window.localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(result.current.challenges));
  });

  it('updates an existing challenge', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.createChallenge({
        title: 'Original Title',
        startDate: '2024-01-15',
        category: 'coding'
      });
    });

    const challengeId = result.current.challenges[0].id;

    act(() => {
      result.current.updateChallenge(challengeId, {
        title: 'Updated Title'
      });
    });

    expect(result.current.challenges[0].title).toBe('Updated Title');
  });

  it('deletes a challenge', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.createChallenge({
        title: 'To Be Deleted',
        startDate: '2024-01-15',
        category: 'fitness'
      });
    });

    const challengeId = result.current.challenges[0].id;

    act(() => {
      result.current.deleteChallenge(challengeId);
    });

    expect(result.current.challenges).toHaveLength(0);
  });

  it('allows checking in and prevents duplicate check-ins on the same day', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.createChallenge({
        title: 'Daily Task',
        startDate: '2024-01-15',
        category: 'fitness'
      });
    });

    const challengeId = result.current.challenges[0].id;

    expect(result.current.hasCheckedInToday(challengeId)).toBe(false);

    act(() => {
      result.current.checkIn(challengeId, 'Feeling good', '', 'great');
    });

    expect(result.current.challenges[0].checkIns).toHaveLength(1);
    expect(result.current.hasCheckedInToday(challengeId)).toBe(true);
    expect(result.current.challenges[0].checkIns[0]).toMatchObject({
      notes: 'Feeling good',
      mood: 'great',
      date: '2024-01-15'
    });

    // Attempt second check-in on the same day
    act(() => {
      result.current.checkIn(challengeId, 'Second check-in attempt', '', 'good');
    });

    // Should still only have 1 check-in
    expect(result.current.challenges[0].checkIns).toHaveLength(1);
  });

  it('updates mindfulness journal on check-in with mood or notes', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.createChallenge({
        title: 'Daily Task',
        startDate: '2024-01-15',
        category: 'fitness'
      });
    });

    const challengeId = result.current.challenges[0].id;

    act(() => {
      result.current.checkIn(challengeId, 'Journal entry test', '', 'good');
    });

    expect(result.current.userProfile.mindfulness.journalEntries).toHaveLength(1);
    expect(result.current.userProfile.mindfulness.journalEntries[0]).toMatchObject({
      content: 'Journal entry test',
      mood: 'good'
    });
  });

  it('calculates current streak correctly', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.createChallenge({
        title: 'Streak Test',
        startDate: '2024-01-10',
        category: 'fitness'
      });
    });

    const challengeId = result.current.challenges[0].id;
    const challenge = result.current.challenges[0];

    // Mock some check-ins directly for testing streaks
    const mockChallengeWithCheckIns: Challenge = {
      ...challenge,
      checkIns: [
        { id: '1', date: '2024-01-15', createdAt: '2024-01-15' }, // Today
        { id: '2', date: '2024-01-14', createdAt: '2024-01-14' }, // Yesterday
        { id: '3', date: '2024-01-13', createdAt: '2024-01-13' }, // 2 days ago
        { id: '4', date: '2024-01-10', createdAt: '2024-01-10' }, // Gap (should stop streak)
      ]
    };

    expect(result.current.getStreak(mockChallengeWithCheckIns)).toBe(3);
  });

  it('returns 0 streak if last check-in is before yesterday', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.createChallenge({
        title: 'Streak Broken Test',
        startDate: '2024-01-10',
        category: 'fitness'
      });
    });

    const challenge = result.current.challenges[0];

    const brokenStreakChallenge: Challenge = {
      ...challenge,
      checkIns: [
        { id: '1', date: '2024-01-13', createdAt: '2024-01-13' }, // 2 days ago
        { id: '2', date: '2024-01-12', createdAt: '2024-01-12' },
      ]
    };

    expect(result.current.getStreak(brokenStreakChallenge)).toBe(0);
  });

  it('calculates best streak correctly', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.createChallenge({
        title: 'Best Streak Test',
        startDate: '2024-01-01',
        category: 'fitness'
      });
    });

    const challenge = result.current.challenges[0];

    const bestStreakChallenge: Challenge = {
      ...challenge,
      checkIns: [
        { id: '1', date: '2024-01-01', createdAt: '2024-01-01' },
        { id: '2', date: '2024-01-02', createdAt: '2024-01-02' },
        { id: '3', date: '2024-01-03', createdAt: '2024-01-03' }, // Streak of 3

        { id: '4', date: '2024-01-05', createdAt: '2024-01-05' },
        { id: '5', date: '2024-01-06', createdAt: '2024-01-06' },
        { id: '6', date: '2024-01-07', createdAt: '2024-01-07' },
        { id: '7', date: '2024-01-08', createdAt: '2024-01-08' }, // Streak of 4
      ]
    };

    expect(result.current.getBestStreak(bestStreakChallenge)).toBe(4);
  });

  it('calculates days remaining based on 100 day default', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.createChallenge({
        title: 'Days Remaining Test',
        startDate: '2024-01-10', // 5 days ago (since today is 2024-01-15)
        category: 'fitness'
      });
    });

    const challenge = result.current.challenges[0];

    // 100 days from Jan 10 is April 19. Today is Jan 15.
    // 100 - 5 = 95 days remaining
    expect(result.current.getDaysRemaining(challenge)).toBe(95);
  });

  it('calculates progress percentage up to 100', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.createChallenge({
        title: 'Progress Test',
        startDate: '2024-01-01',
        category: 'fitness'
      });
    });

    const challenge = result.current.challenges[0];

    // Create mock check-ins
    const checkIns = Array.from({ length: 25 }).map((_, i) => ({
      id: String(i),
      date: `2024-01-${i+1}`,
      createdAt: `2024-01-${i+1}`
    }));

    const progressChallenge: Challenge = {
      ...challenge,
      checkIns
    };

    expect(result.current.getProgress(progressChallenge)).toBe(25);
  });

  it('updates user profile correctly with object', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.updateUserProfile({
        name: 'Updated Name',
        diet: {
          ...result.current.userProfile.diet,
          dailyCalorieGoal: 1500
        }
      });
    });

    expect(result.current.userProfile.name).toBe('Updated Name');
    expect(result.current.userProfile.diet.dailyCalorieGoal).toBe(1500);
  });

  it('updates user profile correctly with function', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.updateUserProfile((prev) => ({
        mindfulness: {
          ...prev.mindfulness,
          streak: prev.mindfulness.streak + 1
        }
      }));
    });

    expect(result.current.userProfile.mindfulness.streak).toBe(1);
  });

  it('filters active and completed challenges correctly', () => {
    const { result } = renderHook(() => useChallenges());

    act(() => {
      result.current.createChallenge({
        title: 'Active Challenge',
        startDate: '2024-01-15',
        category: 'fitness'
      });
    });

    const challengeId = result.current.challenges[0].id;

    act(() => {
      result.current.updateChallenge(challengeId, {
        status: 'completed'
      });
    });

    expect(result.current.activeChallenges).toHaveLength(0);
    expect(result.current.completedChallenges).toHaveLength(1);
    expect(result.current.completedChallenges[0].title).toBe('Active Challenge');
  });
});
