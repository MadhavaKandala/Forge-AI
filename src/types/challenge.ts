export type ChallengeCategory = 
  | 'coding'
  | 'fitness'
  | 'reading'
  | 'learning'
  | 'productivity'
  | 'creativity'
  | 'health'
  | 'other';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export type ChallengeStatus = 'active' | 'completed' | 'abandoned';

export interface CheckIn {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  notes?: string;
  link?: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  name: string;
  category: ChallengeCategory;
  description?: string;
  goalTarget?: string;
  difficulty: ChallengeDifficulty;
  startDate: string; // ISO date string
  status: ChallengeStatus;
  checkIns: CheckIn[];
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  day: number;
  name: string;
  badge: string;
  unlockedAt?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { day: 7, name: 'Week Warrior', badge: '🏅' },
  { day: 14, name: 'Halfway Ready', badge: '🎯' },
  { day: 21, name: 'Habit Formed', badge: '💪' },
  { day: 30, name: 'One Month Beast', badge: '🔥' },
  { day: 50, name: 'Unstoppable', badge: '⭐' },
  { day: 75, name: 'Champion', badge: '👑' },
  { day: 100, name: '100 Day Legend', badge: '🏆' },
];

export const CATEGORY_CONFIG: Record<ChallengeCategory, { label: string; emoji: string; color: string }> = {
  coding: { label: 'Coding', emoji: '💻', color: 'category-coding' },
  fitness: { label: 'Fitness', emoji: '💪', color: 'category-fitness' },
  reading: { label: 'Reading', emoji: '📚', color: 'category-reading' },
  learning: { label: 'Learning', emoji: '🧠', color: 'category-learning' },
  productivity: { label: 'Productivity', emoji: '⚡', color: 'category-productivity' },
  creativity: { label: 'Creativity', emoji: '🎨', color: 'category-creativity' },
  health: { label: 'Health', emoji: '🥗', color: 'category-health' },
  other: { label: 'Other', emoji: '🎯', color: 'category-other' },
};

export const MOTIVATIONAL_QUOTES = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements lead to stunning results.",
  "Consistency is more important than perfection.",
  "Every day is a chance to get better.",
  "Success is the sum of small efforts repeated daily.",
  "You don't have to be great to start, but you have to start to be great.",
  "The habit of today shapes the you of tomorrow.",
  "Progress, not perfection.",
];
