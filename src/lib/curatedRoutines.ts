import type { Category } from '@/store/useHabitStore';

export interface RoutineStep {
    title: string;
    time: string;
    category: Category;
}

export interface CuratedRoutine {
    id: string;
    name: string;
    tagline: string;
    description: string;
    icon: string;
    bg: string;
    accent: string;
    steps: RoutineStep[];
}

export const CURATED_ROUTINES: CuratedRoutine[] = [
    {
        id: 'perfect_morning',
        name: 'Perfect Morning',
        tagline: 'Start clean. Move early.',
        description: 'Wake up, hydrate, move, eat, and enter the day with control.',
        icon: '🌅',
        bg: '#E8F4FF',
        accent: '#38BDF8',
        steps: [
            { title: 'Wake up and make bed', time: '6:00 AM', category: 'personal' },
            { title: 'Drink water', time: '6:05 AM', category: 'diet' },
            { title: 'Yoga or mobility', time: '6:15 AM', category: 'gym' },
            { title: 'Breakfast', time: '7:15 AM', category: 'diet' },
            { title: 'Freshen up and plan day', time: '7:45 AM', category: 'personal' },
        ],
    },
    {
        id: 'always_clean_house',
        name: 'Always Clean House',
        tagline: 'Declutter without thinking.',
        description: 'A simple room reset for books, clothes, laundry, and visible surfaces.',
        icon: '🧹',
        bg: '#F4E8FF',
        accent: '#C084FC',
        steps: [
            { title: 'Clear desk surface', time: '5:30 PM', category: 'personal' },
            { title: 'Stack books and notes', time: '5:40 PM', category: 'academics' },
            { title: 'Laundry sort', time: '5:50 PM', category: 'personal' },
            { title: 'Wardrobe reset', time: '6:05 PM', category: 'personal' },
            { title: 'Final 5-minute floor sweep', time: '6:20 PM', category: 'personal' },
        ],
    },
    {
        id: 'exercise_habit',
        name: 'Exercise Habit',
        tagline: 'Make movement automatic.',
        description: 'A routine for students who want gym, sport, or home training to stick.',
        icon: '💪',
        bg: '#FFE8E2',
        accent: '#FB7185',
        steps: [
            { title: 'Change into workout clothes', time: '6:00 PM', category: 'gym' },
            { title: 'Warm up', time: '6:10 PM', category: 'gym' },
            { title: 'Main workout', time: '6:20 PM', category: 'gym' },
            { title: 'Cool down and stretch', time: '7:05 PM', category: 'gym' },
            { title: 'Log workout', time: '7:15 PM', category: 'gym' },
        ],
    },
    {
        id: 'peaceful_night',
        name: 'Peaceful Night',
        tagline: 'Close the day properly.',
        description: 'A 10-minute reset to reduce mental noise before sleep.',
        icon: '🌙',
        bg: '#E8FBEF',
        accent: '#22C55E',
        steps: [
            { title: 'Tea or water break', time: '9:30 PM', category: 'breaks' },
            { title: 'Call or message someone', time: '9:40 PM', category: 'personal' },
            { title: 'Write daily journal', time: '9:55 PM', category: 'personal' },
            { title: 'Plan tomorrow top mission', time: '10:10 PM', category: 'personal' },
            { title: 'Phone away', time: '10:30 PM', category: 'personal' },
        ],
    },
    {
        id: 'skincare_reset',
        name: 'Skincare Reset',
        tagline: 'Look fresh. Feel ready.',
        description: 'Face wash, ice roller, serum, sunscreen, and simple grooming.',
        icon: '✨',
        bg: '#FFF4CC',
        accent: '#FACC15',
        steps: [
            { title: 'Wash face', time: '7:00 AM', category: 'personal' },
            { title: 'Ice roller or massage', time: '7:15 AM', category: 'personal' },
            { title: 'Cleanser and serum', time: '7:20 AM', category: 'personal' },
            { title: 'Sunscreen', time: '7:35 AM', category: 'personal' },
            { title: 'Final grooming check', time: '7:40 AM', category: 'personal' },
        ],
    },
];
