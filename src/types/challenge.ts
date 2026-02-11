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

export type ChallengeVisibility = 'private' | 'public';

export interface Evidence {
  type: 'photo' | 'link' | 'voice';
  url: string;
  caption?: string;
}

export interface CheckIn {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  notes?: string;
  link?: string;
  photos?: string[]; // Base64 or URLs
  voiceNote?: string; // Base64 audio
  isRetroactive?: boolean;
  mood?: 'great' | 'good' | 'okay' | 'struggling';
  createdAt: string;
}

export interface Challenge {
  id: string;
  name: string;
  category: ChallengeCategory;
  description?: string;
  goalTarget?: string;
  difficulty: ChallengeDifficulty;
  visibility: ChallengeVisibility;
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
  description: string;
  unlockedAt?: string;
}

export interface FitnessRecord {
  id: string;
  name: string;
  value: string;
  unit: string;
  icon: string;
  date: string; // ISO date
  isRecent: boolean;
}

export interface BodyMetric {
  start: number;
  current: number;
  goal: number;
  unit: string;
}

export interface FitnessProfile {
  records: FitnessRecord[];
  metrics: {
    weight: BodyMetric;
    bodyFat: BodyMetric;
    muscle: BodyMetric;
  };
  photos: {
    id: string;
    date: string;
    url: string;
    weight: number;
  }[];
}

export interface CodingLanguage {
  name: string;
  percentage: number;
  color: string;
}

export interface GitHubStats {
  username: string;
  commits: number;
  pullRequests: number;
  contributions: number;
  streak: number;
  isConnected: boolean;
}

export interface CodingProfile {
  bestTimeToCode: string; // e.g., "9:00 PM - 11:00 PM"
  averageSessionDuration: string; // e.g., "1h 45m"
  languages: CodingLanguage[];
  github: GitHubStats;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  totalPages: number;
  currentPage: number;
  status: 'to-read' | 'reading' | 'completed';
  rating?: number;
  startedAt?: string;
  finishedAt?: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  pagesRead: number;
  durationMinutes?: number;
  date: string;
}

export interface ReadingProfile {
  books: Book[];
  sessions: ReadingSession[];
  dailyGoalPages: number;
  annualGoalBooks: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'struggling';
  title?: string;
  content: string;
  tags?: string[];
  createdAt: string;
}

export interface MindfulnessProfile {
  journalEntries: JournalEntry[];
  streak: number;
}

export interface UserProfile {
  name: string;
  fitness: FitnessProfile;
  coding: CodingProfile;
  reading: ReadingProfile;
  mindfulness: MindfulnessProfile;
}

export interface UserStats {
  totalChallenges: number;
  completedChallenges: number;
  totalDaysCompleted: number;
  longestStreak: number;
  averageStreak: number;
  categoryBreakdown: Record<ChallengeCategory, number>;
  completionRate: number;
}

export interface WeeklyStats {
  weekStart: string;
  checkInsCount: number;
  consistencyScore: number;
  streakMaintained: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { day: 7, name: 'Week Warrior', badge: '🏅', description: 'Completed your first week!' },
  { day: 14, name: 'Halfway Ready', badge: '🎯', description: 'Two weeks of dedication!' },
  { day: 21, name: 'Habit Formed', badge: '💪', description: 'Science says habits form in 21 days!' },
  { day: 30, name: 'One Month Beast', badge: '🔥', description: 'A full month of consistency!' },
  { day: 50, name: 'Unstoppable', badge: '⭐', description: 'Halfway to legendary status!' },
  { day: 75, name: 'Champion', badge: '👑', description: 'Three quarters of the way there!' },
  { day: 100, name: '100 Day Legend', badge: '🏆', description: 'You achieved the impossible!' },
];

// Solo Levelling-inspired category config with neon colors
export const CATEGORY_CONFIG: Record<ChallengeCategory, {
  label: string;
  emoji: string;
  color: string;
  neonColor: string;
  glowClass: string;
  gradientClass: string;
  tips: string[];
  placeholder: string;
}> = {
  coding: {
    label: 'Code',
    emoji: '💻',
    color: '#00D9FF',
    neonColor: 'neon-cyan',
    glowClass: 'glow-cyan',
    gradientClass: 'bg-gradient-coding',
    tips: ['Solve one problem daily', 'Build projects', 'Review code'],
    placeholder: 'e.g., Solve 100 LeetCode problems'
  },
  fitness: {
    label: 'Fitness',
    emoji: '💪',
    color: '#FF1654',
    neonColor: 'neon-pink',
    glowClass: 'glow-pink',
    gradientClass: 'bg-gradient-fitness',
    tips: ['Start with 15 minutes', 'Track your progress', 'Rest days matter'],
    placeholder: 'e.g., 100 days of 30-min workouts'
  },
  reading: {
    label: 'Reading',
    emoji: '📚',
    color: '#A78BFA',
    neonColor: 'neon-purple',
    glowClass: 'glow-purple',
    gradientClass: 'bg-gradient-reading',
    tips: ['Read 20 pages daily', 'Mix fiction & non-fiction', 'Take notes'],
    placeholder: 'e.g., Read 12 books in 100 days'
  },
  learning: {
    label: 'Learning',
    emoji: '🧠',
    color: '#10B981',
    neonColor: 'neon-emerald',
    glowClass: 'glow-emerald',
    gradientClass: 'bg-gradient-learning',
    tips: ['Learn one concept daily', 'Practice immediately', 'Teach others'],
    placeholder: 'e.g., Master a new language'
  },
  productivity: {
    label: 'Productivity',
    emoji: '⚡',
    color: '#F59E0B',
    neonColor: 'neon-gold',
    glowClass: 'glow-gold',
    gradientClass: 'bg-gradient-creativity',
    tips: ['Use time blocks', 'Eliminate distractions', 'Review weekly'],
    placeholder: 'e.g., Wake up at 5 AM daily'
  },
  creativity: {
    label: 'Writing',
    emoji: '✍️',
    color: '#FCD34D',
    neonColor: 'neon-gold',
    glowClass: 'glow-gold',
    gradientClass: 'bg-gradient-creativity',
    tips: ['Create without judgment', 'Share your work', 'Find inspiration'],
    placeholder: 'e.g., Write 500 words daily'
  },
  health: {
    label: 'Health',
    emoji: '🥗',
    color: '#10B981',
    neonColor: 'neon-emerald',
    glowClass: 'glow-emerald',
    gradientClass: 'bg-gradient-learning',
    tips: ['Hydrate first thing', 'Prep meals ahead', 'Track sleep'],
    placeholder: 'e.g., Meditate 10 minutes daily'
  },
  other: {
    label: 'Other',
    emoji: '🎯',
    color: '#9CA3AF',
    neonColor: 'neon-cyan',
    glowClass: 'glow-cyan',
    gradientClass: 'bg-gradient-neon',
    tips: ['Define clear goals', 'Be consistent', 'Celebrate wins'],
    placeholder: 'e.g., Practice gratitude daily'
  },
};

export const MOTIVATIONAL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", dayRange: [1, 7] },
  { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma", dayRange: [1, 7] },
  { text: "Consistency is more important than perfection.", author: "Unknown", dayRange: [1, 100] },
  { text: "Every day is a chance to get better.", author: "Unknown", dayRange: [1, 100] },
  { text: "Success is the sum of small efforts repeated daily.", author: "Robert Collier", dayRange: [1, 100] },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", dayRange: [1, 14] },
  { text: "The habit of today shapes the you of tomorrow.", author: "Unknown", dayRange: [14, 30] },
  { text: "Progress, not perfection.", author: "Unknown", dayRange: [1, 100] },
  { text: "You're building momentum! Keep pushing!", author: "100 Days", dayRange: [7, 14] },
  { text: "Week 1 down! You're crushing it!", author: "100 Days", dayRange: [7, 14] },
  { text: "The habit is sticking! You're amazing!", author: "100 Days", dayRange: [21, 30] },
  { text: "Halfway there! Don't stop now!", author: "100 Days", dayRange: [50, 60] },
  { text: "You're in the home stretch! Legendary status awaits!", author: "100 Days", dayRange: [75, 90] },
  { text: "Almost there! You're about to make history!", author: "100 Days", dayRange: [90, 100] },
  { text: "You did it! You're a legend!", author: "100 Days", dayRange: [100, 100] },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", dayRange: [1, 100] },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown", dayRange: [1, 100] },
  { text: "Champions keep playing until they get it right.", author: "Billie Jean King", dayRange: [30, 100] },
];

export const MOOD_CONFIG = {
  great: { emoji: '🤩', label: 'Great', color: 'text-neon-emerald' },
  good: { emoji: '😊', label: 'Good', color: 'text-neon-cyan' },
  okay: { emoji: '😐', label: 'Okay', color: 'text-neon-gold' },
  struggling: { emoji: '😔', label: 'Struggling', color: 'text-neon-pink' },
};
