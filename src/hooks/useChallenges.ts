import { useState, useEffect, useCallback } from 'react';
import { Challenge, CheckIn, UserProfile } from '@/types/challenge';
import { format, differenceInCalendarDays, startOfDay, parse } from 'date-fns';

const STORAGE_KEY = 'challenge-tracker-data';
const PROFILE_KEY = 'challenge-tracker-profile';

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'User',
    fitness: {
      records: [],
      metrics: {
        weight: { start: 0, current: 0, goal: 0, unit: 'lbs' },
        bodyFat: { start: 0, current: 0, goal: 0, unit: '%' },
        muscle: { start: 0, current: 0, goal: 0, unit: 'lbs' },
      },
      photos: [],
    },
    coding: {
      bestTimeToCode: 'Late Night',
      averageSessionDuration: '0h 0m',
      languages: [],
      github: {
        username: '',
        commits: 0,
        pullRequests: 0,
        contributions: 0,
        streak: 0,
        isConnected: false,
      },
    },
    reading: {
      books: [],
      sessions: [],
      dailyGoalPages: 20,
      annualGoalBooks: 12,
    },
    mindfulness: {
      journalEntries: [],
      streak: 0,
    },
    diet: {
      dailyCalorieGoal: 2000,
      dailyWaterGoalLiters: 2.5,
      logs: [],
      currentWeight: 0,
      goalWeight: 0,
    },
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setChallenges(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored challenges:', e);
      }
    }

    // Load profile
    const storedProfile = localStorage.getItem(PROFILE_KEY);
    if (storedProfile) {
      try {
        setUserProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.error('Failed to parse stored profile:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
    }
  }, [challenges, userProfile, isLoaded]);

  const createChallenge = useCallback((challenge: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt' | 'checkIns' | 'status'>) => {
    const now = new Date().toISOString();
    const newChallenge: Challenge = {
      ...challenge,
      id: crypto.randomUUID(),
      status: 'active',
      visibility: challenge.visibility || 'private',
      checkIns: [],
      createdAt: now,
      updatedAt: now,
    };
    setChallenges(prev => [...prev, newChallenge]);
    return newChallenge;
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile> | ((prev: UserProfile) => Partial<UserProfile>)) => {
    setUserProfile(prev => {
      const newValues = typeof updates === 'function' ? updates(prev) : updates;
      return { ...prev, ...newValues };
    });
  }, []);

  const updateChallenge = useCallback((id: string, updates: Partial<Challenge>) => {
    setChallenges(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    ));
  }, []);

  const deleteChallenge = useCallback((id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
  }, []);

  const checkIn = useCallback((challengeId: string, notes?: string, link?: string, mood?: 'great' | 'good' | 'okay' | 'struggling') => {
    // Use local date for check-in
    const today = format(new Date(), 'yyyy-MM-dd');

    setChallenges(prev => prev.map(c => {
      if (c.id !== challengeId) return c;

      // Prevent duplicate check-ins for the same day
      if (c.checkIns.some(ci => ci.date === today)) {
        return c;
      }

      const newCheckIn: CheckIn = {
        id: crypto.randomUUID(),
        date: today,
        notes,
        link,
        mood,
        createdAt: new Date().toISOString(),
      };

      return {
        ...c,
        checkIns: [...c.checkIns, newCheckIn],
        updatedAt: new Date().toISOString(),
      };
    }));

    // If there's a mood or notes, add to mindfulness journal
    if (mood || notes) {
      setUserProfile(prev => ({
        ...prev,
        mindfulness: {
          ...prev.mindfulness,
          journalEntries: [
            ...prev.mindfulness.journalEntries,
            {
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
              mood: mood || 'okay',
              content: notes || '',
              createdAt: new Date().toISOString(),
            }
          ]
        }
      }));
    }
  }, []);

  const hasCheckedInToday = useCallback((challengeId: string) => {
    if (!challenges.length) return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    const challenge = challenges.find(c => c.id === challengeId);
    return challenge?.checkIns.some(ci => ci.date === today) ?? false;
  }, [challenges]);

  // Optimized streak calculation
  const getStreak = useCallback((challenge: Challenge) => {
    if (!challenge.checkIns.length) return 0;

    // Unique dates sorted descending
    const sortedDates = [...new Set(challenge.checkIns.map(ci => ci.date))]
      .sort((a, b) => b.localeCompare(a));

    if (sortedDates.length === 0) return 0;

    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

    // If most recent check-in is not today or yesterday, streak is broken
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    // Parse the most recent date string into a Date object (midnight local time)
    let currentDate = parse(sortedDates[0], 'yyyy-MM-dd', new Date());

    for (let i = 1; i < sortedDates.length; i++) {
      // Subtract 1 day from current date
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);

      // Format back to string (local time) to compare with stored string
      const expectedPrevDateStr = format(prevDate, 'yyyy-MM-dd');

      if (sortedDates[i] === expectedPrevDateStr) {
        streak++;
        currentDate = parse(sortedDates[i], 'yyyy-MM-dd', new Date());
      } else {
        break;
      }
    }

    return streak;
  }, []);

  const getBestStreak = useCallback((challenge: Challenge) => {
    if (challenge.checkIns.length === 0) return 0;

    const sortedDates = [...new Set(challenge.checkIns.map(ci => ci.date))]
      .sort((a, b) => a.localeCompare(b));

    if (sortedDates.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      // Difference in calendar days to account for DST etc
      const diff = differenceInCalendarDays(
        new Date(sortedDates[i]),
        new Date(sortedDates[i - 1])
      );

      if (diff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (diff > 1) {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }, []);

  const getDaysRemaining = useCallback((challenge: Challenge) => {
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 100);

    const today = startOfDay(new Date());
    const remaining = differenceInCalendarDays(endDate, today);
    return Math.max(0, remaining);
  }, []);

  const getProgress = useCallback((challenge: Challenge) => {
    return Math.min(100, Math.round((challenge.checkIns.length / 100) * 100));
  }, []);

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return {
    challenges,
    activeChallenges,
    completedChallenges,
    isLoaded,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    checkIn,
    hasCheckedInToday,
    getStreak,
    getBestStreak,
    getDaysRemaining,
    getProgress,
    userProfile,
    updateUserProfile,
  };
}
