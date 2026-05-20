import { ChallengeCategory, ChallengeDifficulty } from '@/types/challenge';

export interface ChallengeTemplate {
  id: string;
  name: string;
  category: ChallengeCategory;
  description: string;
  goalTarget: string;
  difficulty: ChallengeDifficulty;
  tips: string[];
  icon: string;
  color: string;
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'coding',
    name: '100 Days of Code',
    category: 'coding',
    description: 'Code for at least an hour every day for 100 days. Build projects, solve problems, and level up your skills.',
    goalTarget: 'Complete 100 coding sessions and build 5+ projects',
    difficulty: 'medium',
    tips: [
      'Start with small projects to build momentum',
      'Share your progress on Twitter with #100DaysOfCode',
      'Focus on consistency over perfection',
      'Keep a log of what you learn each day',
    ],
    icon: '💻',
    color: 'hsl(240, 60%, 55%)',
  },
  {
    id: 'writing',
    name: '100 Days of Writing',
    category: 'creativity',
    description: 'Write every day for 100 days. Journal, blog, fiction, or anything that gets words on the page.',
    goalTarget: 'Write 500+ words daily and complete 3 major pieces',
    difficulty: 'medium',
    tips: [
      'Set a minimum word count that feels achievable',
      'Write at the same time each day to build habit',
      'Don\'t edit while writing - that\'s for later',
      'Keep a ideas journal for inspiration',
    ],
    icon: '✍️',
    color: 'hsl(300, 65%, 55%)',
  },
  {
    id: 'fitness',
    name: '100 Days of Fitness',
    category: 'fitness',
    description: 'Move your body every day for 100 days. Any exercise counts - gym, running, yoga, or a simple walk.',
    goalTarget: 'Complete 100 workout sessions',
    difficulty: 'hard',
    tips: [
      'Start with 20-30 minutes if you\'re new',
      'Mix cardio, strength, and flexibility',
      'Rest days can be light stretching or walks',
      'Track your progress with photos or measurements',
    ],
    icon: '💪',
    color: 'hsl(340, 75%, 55%)',
  },
  {
    id: 'reading',
    name: '100 Days of Reading',
    category: 'reading',
    description: 'Read every day for 100 days. Books, articles, or audiobooks - expand your mind daily.',
    goalTarget: 'Read 10+ books or equivalent content',
    difficulty: 'easy',
    tips: [
      'Keep a book by your bed and read before sleep',
      'Mix genres to stay engaged',
      'Take notes on key insights',
      'Join a book club for accountability',
    ],
    icon: '📚',
    color: 'hsl(160, 60%, 45%)',
  },
  {
    id: 'meditation',
    name: '100 Days of Meditation',
    category: 'health',
    description: 'Meditate daily for 100 days. Start with 5 minutes and gradually increase your practice.',
    goalTarget: 'Build a consistent meditation practice',
    difficulty: 'easy',
    tips: [
      'Start with guided meditations using an app',
      'Same time, same place builds habit',
      'Focus on breath when mind wanders',
      'Track your mood before and after sessions',
    ],
    icon: '🧘',
    color: 'hsl(140, 60%, 45%)',
  },
  {
    id: 'learning',
    name: '100 Days of Learning',
    category: 'learning',
    description: 'Learn something new every day for 100 days. Take courses, watch tutorials, or practice new skills.',
    goalTarget: 'Complete 2+ courses and acquire 1 new skill',
    difficulty: 'medium',
    tips: [
      'Pick a specific topic or skill to focus on',
      'Use spaced repetition for better retention',
      'Teach what you learn to solidify knowledge',
      'Set weekly learning goals',
    ],
    icon: '🎓',
    color: 'hsl(280, 65%, 55%)',
  },
];

export function getTemplateById(id: string): ChallengeTemplate | undefined {
  return CHALLENGE_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: ChallengeCategory): ChallengeTemplate[] {
  return CHALLENGE_TEMPLATES.filter(t => t.category === category);
}
