export type MoodKey = 'locked_in' | 'frustrated' | 'numb' | 'overwhelmed' | 'rock_bottom';

export interface MoodBehaviorFlags {
    reorderTasks?: boolean;
    hardestMissionFirst?: boolean;
    showOnlyThreeTasks?: boolean;
    showHabitsOnly?: boolean;
    preferSmallestHabit?: boolean;
    showMinimalView?: boolean;
}

export interface MoodContent {
    emoji: string;
    label: string;
    message: string;
    action: string;
    quote: string;
    behavior: MoodBehaviorFlags;
}

export const MOOD_CONTENT: Record<MoodKey, MoodContent> = {
    locked_in: {
        emoji: '⚡',
        label: 'LOCKED IN',
        message: "Good. Don't waste it.",
        action: 'Start with your hardest mission.',
        quote: "The disciplined man does what needs to be done even when he doesn't feel like it. Today, you already feel like it.",
        behavior: {
            reorderTasks: true,
            hardestMissionFirst: true,
        },
    },
    frustrated: {
        emoji: '😤',
        label: 'FRUSTRATED',
        message: 'Channel it. Anger is energy. Use it.',
        action: 'Pick gym or a hard coding mission and deploy.',
        quote: 'Every person who doubted you becomes fuel. Work.',
        behavior: {
            reorderTasks: true,
            hardestMissionFirst: true,
        },
    },
    numb: {
        emoji: '😶',
        label: 'NUMB',
        message: "You don't need motivation. You need momentum.",
        action: 'Start with the smallest habit.',
        quote: "Don't think. Just start. The feeling follows the action.",
        behavior: {
            showOnlyThreeTasks: true,
            preferSmallestHabit: true,
        },
    },
    overwhelmed: {
        emoji: '🌀',
        label: 'OVERWHELMED',
        message: 'One thing. Just one.',
        action: 'Keep only the next three tactical items visible.',
        quote: 'You cannot do everything today. You can do one thing.',
        behavior: {
            showOnlyThreeTasks: true,
        },
    },
    rock_bottom: {
        emoji: '💥',
        label: 'ROCK BOTTOM',
        message: 'You showed up. That already makes you different.',
        action: 'Read this. Then take one small win.',
        quote: 'Small win today beats no win today. Structure first, intensity later.',
        behavior: {
            showHabitsOnly: true,
            showMinimalView: true,
            preferSmallestHabit: true,
        },
    },
};

export const MOOD_ORDER: MoodKey[] = ['locked_in', 'frustrated', 'numb', 'overwhelmed', 'rock_bottom'];

export const MOOD_SCORE: Record<MoodKey, number> = {
    rock_bottom: 1,
    overwhelmed: 2,
    numb: 3,
    frustrated: 4,
    locked_in: 5,
};
