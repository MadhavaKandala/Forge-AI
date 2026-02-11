import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useChallenges } from '../hooks/useChallenges';
import { renderHook, act } from '@testing-library/react';
import { format } from 'date-fns';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('useChallenges Hook - Streak Logic', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should initialize with 0 streak', () => {
        const { result } = renderHook(() => useChallenges());

        act(() => {
            result.current.createChallenge({
                name: 'Test Challenge',
                category: 'coding',
                difficulty: 'medium',
                startDate: new Date().toISOString(),
                visibility: 'private'
            });
        });

        const challenge = result.current.challenges[0];
        expect(result.current.getStreak(challenge)).toBe(0);
    });

    it('should have streak of 1 after checking in today', () => {
        const { result } = renderHook(() => useChallenges());

        act(() => {
            result.current.createChallenge({
                name: 'Test Challenge',
                category: 'coding',
                difficulty: 'medium',
                startDate: new Date().toISOString(),
                visibility: 'private'
            });
        });

        const challengeId = result.current.challenges[0].id;

        act(() => {
            result.current.checkIn(challengeId);
        });

        expect(result.current.getStreak(result.current.challenges[0])).toBe(1);
    });

    it('should calculate multi-day streak correctly', () => {
        const { result } = renderHook(() => useChallenges());

        // Create challenge
        act(() => {
            result.current.createChallenge({
                name: 'Multi Day Challenge',
                category: 'coding',
                difficulty: 'medium',
                startDate: new Date().toISOString(),
                visibility: 'private'
            });
        });

        const challengeId = result.current.challenges[0].id;

        // Capture real timestamps before mocking
        const realNow = new Date();
        const realYesterday = new Date(realNow);
        realYesterday.setDate(realYesterday.getDate() - 1);

        // Check in yesterday
        vi.setSystemTime(realYesterday);
        act(() => {
            result.current.checkIn(challengeId);
        });

        // Check in today
        vi.setSystemTime(realNow);
        act(() => {
            result.current.checkIn(challengeId);
        });

        expect(result.current.getStreak(result.current.challenges[0])).toBe(2);
    });

    it('should add journal entry when checking in with mood', () => {
        const { result } = renderHook(() => useChallenges());

        act(() => {
            result.current.createChallenge({
                name: 'Mood Challenge',
                category: 'health',
                difficulty: 'easy',
                startDate: new Date().toISOString(),
                visibility: 'private'
            });
        });

        const challengeId = result.current.challenges[0].id;

        act(() => {
            result.current.checkIn(challengeId, 'Feeling great today!', undefined, 'great');
        });

        // Verify challenge has check-in with mood
        const challenge = result.current.challenges[0];
        expect(challenge.checkIns[0].mood).toBe('great');
        expect(challenge.checkIns[0].notes).toBe('Feeling great today!');

        // Verify user profile has journal entry
        const profile = result.current.userProfile;
        expect(profile.mindfulness.journalEntries).toHaveLength(1);
        expect(profile.mindfulness.journalEntries[0].mood).toBe('great');
        expect(profile.mindfulness.journalEntries[0].content).toBe('Feeling great today!');
    });
});
