export type MotivationCardType = 'quote' | 'streak' | 'challenge' | 'coding_fact' | 'reminder';

export interface MotivationCard {
    type: MotivationCardType;
    title: string;
    content: string | ((streak: number) => string);
    author?: string;
}

export const DAILY_CARDS: MotivationCard[] = [
    {
        type: 'quote',
        title: 'FIELD NOTE',
        content: 'Consistency is not about being perfect every day. It is about refusing to disappear.',
        author: 'Future You',
    },
    {
        type: 'streak',
        title: 'STREAK STATUS',
        content: (streak) => `${streak} days. The version of you from ${streak} days ago needed proof. This is proof.`,
    },
    {
        type: 'challenge',
        title: 'GYM NUDGE',
        content: "If training is on today's list, do not negotiate with comfort. Pack the bag and move.",
    },
    {
        type: 'coding_fact',
        title: 'CODING INTEL',
        content: 'Most placement problems are pattern recognition under pressure. Reps make the pattern obvious.',
    },
    {
        type: 'reminder',
        title: 'MISSION REMINDER',
        content: 'You are not behind. You are under-repped. Reps can be fixed today.',
    },
    {
        type: 'quote',
        title: 'TACTICAL TRUTH',
        content: 'A boring plan followed daily beats a perfect plan restarted weekly.',
    },
    {
        type: 'streak',
        title: 'CHAIN ACTIVE',
        content: (streak) => `${streak} days straight. Protect the chain before you chase anything fancy.`,
    },
    {
        type: 'challenge',
        title: 'LEETCODE DEPLOY',
        content: 'One problem today keeps the fear smaller tomorrow. Start ugly if you have to.',
    },
    {
        type: 'coding_fact',
        title: 'DSA INTEL',
        content: 'Arrays, maps, stacks, and two pointers cover more interviews than your anxiety admits.',
    },
    {
        type: 'reminder',
        title: 'PLACEMENT SIGNAL',
        content: 'Your batch is moving. Good. Let that pressure become structure, not panic.',
    },
    {
        type: 'quote',
        title: 'FORGE STANDARD',
        content: 'The day does not need to feel good to count. It needs one honest completion.',
    },
    {
        type: 'streak',
        title: 'MOMENTUM CHECK',
        content: (streak) => `${streak} days is not luck. It is identity starting to harden.`,
    },
    {
        type: 'challenge',
        title: 'HEALTH PROTOCOL',
        content: 'Water, protein, walk. When the brain is noisy, stabilize the body first.',
    },
    {
        type: 'coding_fact',
        title: 'DEBUG INTEL',
        content: 'When stuck, write the brute force. Clarity usually arrives after the first working shape.',
    },
    {
        type: 'reminder',
        title: 'DAILY OPS',
        content: 'Do not wait for a clean mood. Deploy the smallest useful action and let the day respond.',
    },
    {
        type: 'quote',
        title: 'PRESSURE NOTE',
        content: 'Pressure is not the enemy. Unused pressure is.',
    },
    {
        type: 'streak',
        title: 'STREAK REPORT',
        content: (streak) => `${streak} days of evidence. Do not break it for a temporary mood.`,
    },
    {
        type: 'challenge',
        title: 'STUDY BLOCK',
        content: 'Open the hardest subject for twenty minutes. Momentum can negotiate after that.',
    },
    {
        type: 'coding_fact',
        title: 'INTERVIEW INTEL',
        content: 'Explaining your approach out loud is a skill. Practice it before the room demands it.',
    },
    {
        type: 'reminder',
        title: 'WIN CONDITION',
        content: 'Today does not need a comeback story. It needs a checked box.',
    },
    {
        type: 'quote',
        title: 'DISCIPLINE LOG',
        content: 'The work you do while nobody is impressed is the work that changes the scoreboard.',
    },
    {
        type: 'streak',
        title: 'CHAIN REPORT',
        content: (streak) => `${streak} days logged. Most people quit before the system starts working.`,
    },
    {
        type: 'challenge',
        title: 'FOCUS DEPLOY',
        content: 'Put the phone away for one deep block. Attention is the resource today.',
    },
    {
        type: 'coding_fact',
        title: 'CODE REPS',
        content: 'A clean solution usually comes after one messy draft. Draft first, refine second.',
    },
    {
        type: 'reminder',
        title: 'IDENTITY CHECK',
        content: 'You are building the person who can handle the opportunity before it arrives.',
    },
    {
        type: 'quote',
        title: 'MORNING ORDER',
        content: 'Start before the mind finishes arguing.',
    },
    {
        type: 'streak',
        title: 'CONSISTENCY SIGNAL',
        content: (streak) => `${streak} days means your system is louder than your excuses.`,
    },
    {
        type: 'challenge',
        title: 'RECOVERY NUDGE',
        content: 'Sleep is part of the build. Do not sabotage tomorrow for one more scroll.',
    },
    {
        type: 'coding_fact',
        title: 'PATTERN INTEL',
        content: 'If a problem asks for subarray, order, or window size, check sliding window before panic.',
    },
    {
        type: 'reminder',
        title: 'FINAL ORDER',
        content: 'One honest rep. One clean check. One day stronger.',
    },
];

export const getDayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / 86400000);
};

export const getDailyMotivationCard = (date: Date, streak: number): MotivationCard => {
    if (streak > 0) {
        const streakCards = DAILY_CARDS.filter((card) => card.type === 'streak');
        return streakCards[getDayOfYear(date) % streakCards.length];
    }

    return DAILY_CARDS[getDayOfYear(date) % DAILY_CARDS.length];
};

export const resolveMotivationContent = (card: MotivationCard, streak: number): string =>
    typeof card.content === 'function' ? card.content(streak) : card.content;
