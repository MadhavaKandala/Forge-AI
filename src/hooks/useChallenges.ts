import { useState, useEffect, useCallback } from 'react';
import { Challenge, CheckIn, ChallengeStatus } from '@/types/challenge';

const STORAGE_KEY = 'challenge-tracker-data';

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
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
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
    }
  }, [challenges, isLoaded]);

  const createChallenge = useCallback((challenge: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt' | 'checkIns' | 'status'>) => {
    const now = new Date().toISOString();
    const newChallenge: Challenge = {
      ...challenge,
      id: crypto.randomUUID(),
      status: 'active',
      checkIns: [],
      createdAt: now,
      updatedAt: now,
    };
    setChallenges(prev => [...prev, newChallenge]);
    return newChallenge;
  }, []);

  const updateChallenge = useCallback((id: string, updates: Partial<Challenge>) => {
    setChallenges(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    ));
  }, []);

  const deleteChallenge = useCallback((id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
  }, []);

  const checkIn = useCallback((challengeId: string, notes?: string, link?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
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
        createdAt: new Date().toISOString(),
      };
      
      return {
        ...c,
        checkIns: [...c.checkIns, newCheckIn],
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const hasCheckedInToday = useCallback((challengeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const challenge = challenges.find(c => c.id === challengeId);
    return challenge?.checkIns.some(ci => ci.date === today) ?? false;
  }, [challenges]);

  const getStreak = useCallback((challenge: Challenge) => {
    if (challenge.checkIns.length === 0) return 0;
    
    const sortedDates = [...challenge.checkIns]
      .map(ci => ci.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if streak is still active (checked in today or yesterday)
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }
    
    let streak = 1;
    let currentDate = new Date(sortedDates[0]);
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      
      if (sortedDates[i] === prevDateStr) {
        streak++;
        currentDate = new Date(sortedDates[i]);
      } else {
        break;
      }
    }
    
    return streak;
  }, []);

  const getBestStreak = useCallback((challenge: Challenge) => {
    if (challenge.checkIns.length === 0) return 0;
    
    const sortedDates = [...challenge.checkIns]
      .map(ci => ci.date)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  }, []);

  const getDaysRemaining = useCallback((challenge: Challenge) => {
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 100);
    const today = new Date();
    const remaining = Math.ceil((endDate.getTime() - today.getTime()) / 86400000);
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
  };
}
