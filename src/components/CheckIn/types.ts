import { CheckIn, ChallengeCategory } from '@/types/challenge';

// Extended check-in data for category-specific forms
export interface CategoryCheckInData {
  // Base fields (all categories)
  date: string;
  notes?: string;
  link?: string;
  mood?: 'great' | 'good' | 'okay' | 'struggling';
  isRetroactive?: boolean;

  // Code-specific fields
  codeData?: {
    hoursCoded: number;
    languages: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    hadBlockers: boolean;
    blockerNotes?: string;
    nextGoal?: string;
    commitLink?: string;
  };

  // Fitness-specific fields
  fitnessData?: {
    workoutType: 'running' | 'strength' | 'yoga' | 'cardio' | 'hiit' | 'swimming' | 'cycling' | 'other';
    durationMinutes: number;
    intensity: 'easy' | 'moderate' | 'hard';
    caloriesBurned?: number;
    personalRecord: boolean;
    prDescription?: string;
    distance?: number;
    distanceUnit?: 'km' | 'miles';
  };

  // Reading-specific fields
  readingData?: {
    pagesRead: number;
    bookTitle: string;
    genre?: string;
    finishedBook: boolean;
    rating?: number;
    favoriteQuote?: string;
  };

  // Writing-specific fields  
  writingData?: {
    wordsWritten: number;
    projectName?: string;
    writingType: 'fiction' | 'non-fiction' | 'journal' | 'blog' | 'poetry' | 'other';
    publishedLink?: string;
  };

  // Learning-specific fields
  learningData?: {
    topicLearned: string;
    courseName?: string;
    timeSpentMinutes: number;
    conceptsCount: number;
    resourceLink?: string;
    practiceCompleted: boolean;
  };

  // Generic/Other fields
  genericData?: {
    activityDescription: string;
    timeSpentMinutes?: number;
    satisfaction: 1 | 2 | 3 | 4 | 5;
  };
}

// Available languages for code check-in
export const CODE_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'SQL',
  'HTML/CSS',
  'React',
  'Vue',
  'Angular',
  'Node.js',
  'Other',
];

// Workout types for fitness check-in
export const WORKOUT_TYPES = [
  { value: 'running', label: 'Running', emoji: '🏃', caloriesPerMinute: 10 },
  { value: 'strength', label: 'Strength Training', emoji: '🏋️', caloriesPerMinute: 6 },
  { value: 'yoga', label: 'Yoga', emoji: '🧘', caloriesPerMinute: 3 },
  { value: 'cardio', label: 'Cardio', emoji: '💓', caloriesPerMinute: 8 },
  { value: 'hiit', label: 'HIIT', emoji: '⚡', caloriesPerMinute: 12 },
  { value: 'swimming', label: 'Swimming', emoji: '🏊', caloriesPerMinute: 9 },
  { value: 'cycling', label: 'Cycling', emoji: '🚴', caloriesPerMinute: 7 },
  { value: 'other', label: 'Other', emoji: '🎯', caloriesPerMinute: 5 },
] as const;

// Book genres for reading check-in
export const BOOK_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Self-Help',
  'Business',
  'Biography',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'History',
  'Science',
  'Philosophy',
  'Psychology',
  'Technology',
  'Other',
];

// Helper to convert category check-in data to standard CheckIn format
export function categoryDataToCheckIn(data: CategoryCheckInData): Partial<CheckIn> {
  const checkIn: Partial<CheckIn> = {
    date: data.date,
    notes: buildNotesFromCategoryData(data),
    link: data.link || data.codeData?.commitLink,
    mood: data.mood,
    isRetroactive: data.isRetroactive,
  };

  return checkIn;
}

// Build comprehensive notes from category-specific data
function buildNotesFromCategoryData(data: CategoryCheckInData): string {
  const parts: string[] = [];

  // Add user notes first
  if (data.notes) {
    parts.push(data.notes);
  }

  // Add code-specific summary
  if (data.codeData) {
    const { hoursCoded, languages, difficulty, hadBlockers, blockerNotes, nextGoal } = data.codeData;
    parts.push(`⏱️ ${hoursCoded}h coded`);
    if (languages.length > 0) {
      parts.push(`💻 Languages: ${languages.join(', ')}`);
    }
    parts.push(`📊 Difficulty: ${difficulty}`);
    if (hadBlockers && blockerNotes) {
      parts.push(`🚧 Blockers: ${blockerNotes}`);
    }
    if (nextGoal) {
      parts.push(`🎯 Next: ${nextGoal}`);
    }
  }

  // Add fitness-specific summary
  if (data.fitnessData) {
    const { workoutType, durationMinutes, intensity, caloriesBurned, personalRecord, prDescription, distance, distanceUnit } = data.fitnessData;
    const workoutInfo = WORKOUT_TYPES.find(w => w.value === workoutType);
    parts.push(`${workoutInfo?.emoji || '🏃'} ${workoutInfo?.label || workoutType}`);
    parts.push(`⏱️ ${durationMinutes} minutes`);
    parts.push(`💪 Intensity: ${intensity}`);
    if (caloriesBurned) {
      parts.push(`🔥 ${caloriesBurned} calories burned`);
    }
    if (distance) {
      parts.push(`📏 ${distance} ${distanceUnit || 'km'}`);
    }
    if (personalRecord) {
      parts.push(`🏆 PR: ${prDescription || 'New personal record!'}`);
    }
  }

  // Add reading-specific summary
  if (data.readingData) {
    const { pagesRead, bookTitle, finishedBook, rating, favoriteQuote } = data.readingData;
    parts.push(`📖 "${bookTitle}"`);
    parts.push(`📄 ${pagesRead} pages read`);
    if (finishedBook) {
      parts.push(`✅ Finished the book!`);
      if (rating) {
        parts.push(`⭐ Rating: ${rating}/5`);
      }
    }
    if (favoriteQuote) {
      parts.push(`💬 "${favoriteQuote}"`);
    }
  }

  // Add writing-specific summary
  if (data.writingData) {
    const { wordsWritten, projectName, writingType } = data.writingData;
    parts.push(`✍️ ${wordsWritten} words written`);
    if (projectName) {
      parts.push(`📝 Project: ${projectName}`);
    }
    parts.push(`📚 Type: ${writingType}`);
  }

  // Add learning-specific summary
  if (data.learningData) {
    const { topicLearned, courseName, timeSpentMinutes, conceptsCount, practiceCompleted } = data.learningData;
    parts.push(`🧠 Learned: ${topicLearned}`);
    if (courseName) {
      parts.push(`📚 Course: ${courseName}`);
    }
    parts.push(`⏱️ ${timeSpentMinutes} minutes`);
    parts.push(`💡 ${conceptsCount} concepts covered`);
    if (practiceCompleted) {
      parts.push(`✅ Practice completed`);
    }
  }

  // Add generic summary
  if (data.genericData) {
    const { activityDescription, timeSpentMinutes, satisfaction } = data.genericData;
    parts.push(activityDescription);
    if (timeSpentMinutes) {
      parts.push(`⏱️ ${timeSpentMinutes} minutes`);
    }
    parts.push(`😊 Satisfaction: ${satisfaction}/5`);
  }

  return parts.join('\n');
}
