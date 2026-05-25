export type OnboardingGoalId = 'FITNESS' | 'CODING' | 'WORK' | 'STUDIES' | 'GROWTH' | 'SELF_CARE';

export interface GoalOption {
    id: OnboardingGoalId;
    emoji: string;
    title: string;
    subtitle: string;
}

export interface SubcategoryOption {
    id: string;
    label: string;
}

export interface ProgramRecommendation {
    id: string;
    name: string;
    description: string;
    duration: string;
}

export const GOAL_OPTIONS: GoalOption[] = [
    {
        id: 'FITNESS',
        emoji: '💪',
        title: 'FITNESS',
        subtitle: 'Gym, workouts, diet, transformation',
    },
    {
        id: 'CODING',
        emoji: '💻',
        title: 'CODING & CAREER',
        subtitle: 'LeetCode, placements, projects, internships',
    },
    {
        id: 'WORK',
        emoji: '🏢',
        title: 'WORK & OFFICE',
        subtitle: 'Tasks, meetings, deadlines, productivity',
    },
    {
        id: 'STUDIES',
        emoji: '📚',
        title: 'STUDIES',
        subtitle: 'Exams, assignments, revision, focus',
    },
    {
        id: 'GROWTH',
        emoji: '🌱',
        title: 'PERSONAL GROWTH',
        subtitle: 'Habits, mindset, reading, journaling',
    },
    {
        id: 'SELF_CARE',
        emoji: '✨',
        title: 'SELF CARE',
        subtitle: 'Skin, sleep, mental health, wellness',
    },
];

export const SUBCATEGORY_OPTIONS: Record<OnboardingGoalId, SubcategoryOption[]> = {
    FITNESS: [
        { id: 'fitness_weight_loss', label: 'Weight Loss' },
        { id: 'fitness_muscle_building', label: 'Muscle Building' },
        { id: 'fitness_maintain', label: 'Maintain Fitness' },
        { id: 'fitness_cardio', label: 'Marathon/Cardio' },
        { id: 'fitness_yoga', label: 'Yoga & Flexibility' },
    ],
    CODING: [
        { id: 'coding_placement', label: 'Placement Preparation' },
        { id: 'coding_dsa', label: 'DSA / LeetCode' },
        { id: 'coding_projects', label: 'Building Projects' },
        { id: 'coding_internship', label: 'Internship Tasks' },
        { id: 'coding_competitive', label: 'Competitive Coding' },
    ],
    WORK: [
        { id: 'work_tasks', label: 'Task Management' },
        { id: 'work_meetings', label: 'Meeting Prep' },
        { id: 'work_client', label: 'Client Work' },
        { id: 'work_team', label: 'Team Projects' },
        { id: 'work_reporting', label: 'Daily Reporting' },
    ],
    STUDIES: [
        { id: 'studies_exam', label: 'Exam Preparation' },
        { id: 'studies_revision', label: 'Daily Revision' },
        { id: 'studies_assignments', label: 'Assignment Tracking' },
        { id: 'studies_attendance', label: 'Attendance & Schedule' },
        { id: 'studies_group', label: 'Group Study' },
    ],
    GROWTH: [
        { id: 'growth_morning', label: 'Morning Routine' },
        { id: 'growth_reading', label: 'Reading Habit' },
        { id: 'growth_journaling', label: 'Journaling' },
        { id: 'growth_meditation', label: 'Meditation' },
        { id: 'growth_goals', label: 'Goal Setting' },
    ],
    SELF_CARE: [
        { id: 'self_care_skin', label: 'Skin Care Routine' },
        { id: 'self_care_sleep', label: 'Sleep Schedule' },
        { id: 'self_care_mental', label: 'Mental Wellness' },
        { id: 'self_care_nutrition', label: 'Nutrition Tracking' },
        { id: 'self_care_hydration', label: 'Hydration Goals' },
    ],
};

export const PROGRAM_RECOMMENDATIONS: Record<string, ProgramRecommendation> = {
    gym_progress: {
        id: 'gym_progress',
        name: 'Gym Protocol',
        description: 'Progressive workout structure with daily training logs.',
        duration: '90 days',
    },
    hard_75: {
        id: 'hard_75',
        name: '75 Hard',
        description: 'Discipline stack for training, diet, water, reading, and daily proof.',
        duration: '75 days',
    },
    morning_protocol: {
        id: 'morning_protocol',
        name: 'Morning Protocol',
        description: 'A clean morning launch sequence before the day gets noisy.',
        duration: '30 days',
    },
    leetcode_150: {
        id: 'leetcode_150',
        name: 'LeetCode 150',
        description: 'One interview problem per day in placement-ready topic order.',
        duration: '150 days',
    },
    dsa_sheet: {
        id: 'dsa_sheet',
        name: 'DSA Sheet',
        description: 'Striver A2Z practice with three problems per day.',
        duration: '90 days',
    },
    core_subjects: {
        id: 'core_subjects',
        name: 'Core Subjects',
        description: 'DBMS, OS, CN, and OOP revision loop for placements and exams.',
        duration: '60 days',
    },
    hundred_day_challenge: {
        id: 'hundred_day_challenge',
        name: '100 Day Challenge',
        description: 'One focused build rep every day until consistency becomes default.',
        duration: '100 days',
    },
    work_daily_checklist: {
        id: 'work_daily_checklist',
        name: 'Daily Office Checklist',
        description: 'Planning, priority review, meeting prep, and daily reporting.',
        duration: 'Ongoing',
    },
};

const pushUnique = (target: string[], ids: string[]) => {
    ids.forEach((id) => {
        if (!target.includes(id)) target.push(id);
    });
};

export const getRecommendedProgramIds = (
    goals: string[],
    subcategories: string[],
): string[] => {
    const result: string[] = [];
    const goalSet = new Set(goals);
    const subcategorySet = new Set(subcategories);

    if (goalSet.has('FITNESS') && subcategorySet.has('fitness_muscle_building')) {
        pushUnique(result, ['gym_progress', 'hard_75']);
    }
    if (goalSet.has('FITNESS') && subcategorySet.has('fitness_weight_loss')) {
        pushUnique(result, ['hard_75', 'morning_protocol']);
    }
    if (goalSet.has('CODING') && subcategorySet.has('coding_placement')) {
        pushUnique(result, ['leetcode_150', 'dsa_sheet', 'core_subjects']);
    }
    if (goalSet.has('CODING') && subcategorySet.has('coding_projects')) {
        pushUnique(result, ['morning_protocol', 'hundred_day_challenge']);
    }
    if (goalSet.has('WORK')) {
        pushUnique(result, ['morning_protocol', 'work_daily_checklist']);
    }
    if (goalSet.has('STUDIES')) {
        pushUnique(result, ['core_subjects', 'morning_protocol']);
    }
    if (goalSet.has('GROWTH')) {
        pushUnique(result, ['morning_protocol', 'hundred_day_challenge']);
    }
    if (goalSet.has('SELF_CARE')) {
        pushUnique(result, ['morning_protocol', 'gym_progress']);
    }

    if (goalSet.has('FITNESS')) pushUnique(result, ['gym_progress']);
    if (goalSet.has('CODING')) pushUnique(result, ['leetcode_150']);

    return result.slice(0, 3);
};

export const getRecommendedPrograms = (
    goals: string[],
    subcategories: string[],
): ProgramRecommendation[] =>
    getRecommendedProgramIds(goals, subcategories)
        .map((id) => PROGRAM_RECOMMENDATIONS[id])
        .filter((program): program is ProgramRecommendation => Boolean(program));
