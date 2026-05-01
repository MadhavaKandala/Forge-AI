import { toast } from 'sonner';
import type { Habit, ScheduleItem } from '@/store/useHabitStore';
import { useHabitStore } from '@/store/useHabitStore';
import { useProgramStore, type ProgramEnrollment } from '@/store/useProgramStore';
import type { Task } from '@/types/task';
import type { Program } from '@/services/programService';

const today = (): string => new Date().toISOString().split('T')[0];
const now = (): string => new Date().toISOString();

export const DEMO_HABITS: Habit[] = [
    { id: 'demo-habit-meditation', title: 'Morning Meditation', time: '5:45 AM', streak: 3, completedDates: [], type: 'timer', category: 'devotional', goal: 15, unit: 'min', history: {} },
    { id: 'demo-habit-code-session', title: 'Morning Code Session', time: '6:00 AM', streak: 5, completedDates: [], type: 'timer', category: 'coding', goal: 120, unit: 'min', history: {} },
    { id: 'demo-habit-journal', title: 'Journal Intel', time: '6:15 AM', streak: 2, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
    { id: 'demo-habit-gym', title: 'Gym', time: '8:00 AM', streak: 4, completedDates: [], type: 'timer', category: 'gym', goal: 60, unit: 'min', history: {} },
    { id: 'demo-habit-protein', title: 'Post-Workout Protein', time: '9:15 AM', streak: 4, completedDates: [], type: 'checkbox', category: 'diet', history: {} },
    { id: 'demo-habit-class-focus', title: 'Class Focus Block', time: '10:00 AM', streak: 1, completedDates: [], type: 'checkbox', category: 'academics', history: {} },
    { id: 'demo-habit-leetcode-study', title: 'LeetCode Study', time: '2:00 PM', streak: 5, completedDates: [], type: 'timer', category: 'coding', goal: 90, unit: 'min', history: {} },
    { id: 'demo-habit-dsa-notes', title: 'DSA Notes', time: '3:30 PM', streak: 3, completedDates: [], type: 'checkbox', category: 'coding', history: {} },
    { id: 'demo-habit-water', title: 'Water Target', time: 'All Day', streak: 6, completedDates: [], type: 'numeric', category: 'diet', goal: 3, unit: 'liters', history: {} },
    { id: 'demo-habit-meals', title: 'Clean Meals', time: 'All Day', streak: 2, completedDates: [], type: 'checkbox', category: 'diet', history: {} },
    { id: 'demo-habit-review', title: 'Review', time: '7:00 PM', streak: 5, completedDates: [], type: 'checkbox', category: 'academics', history: {} },
    { id: 'demo-habit-aptitude', title: 'Aptitude Sprint', time: '7:45 PM', streak: 1, completedDates: [], type: 'timer', category: 'academics', goal: 30, unit: 'min', history: {} },
    { id: 'demo-habit-gita', title: 'Bhagavad Gita Reading', time: '9:30 PM', streak: 3, completedDates: [], type: 'timer', category: 'devotional', goal: 20, unit: 'min', history: {} },
    { id: 'demo-habit-plan', title: 'Plan Tomorrow', time: '10:30 PM', streak: 2, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
    { id: 'demo-habit-sleep', title: 'Sleep', time: '11:00 PM', streak: 4, completedDates: [], type: 'checkbox', category: 'personal', history: {} },
];

export const DEMO_MISSIONS: Task[] = [
    { id: 'demo-mission-two-sum', title: 'Solved Two Sum', category: 'coding', priority: 'high', status: 'completed', completed: true, size: 'medium', quadrant: 'q1', estimatedMinutes: 35, scheduledDate: today(), dueDate: today(), isRecurring: false, subtasks: [], completedAt: now(), createdAt: now(), updatedAt: now() },
    { id: 'demo-mission-gym-log', title: 'Logged Push Day Workout', category: 'gym', priority: 'medium', status: 'completed', completed: true, size: 'small', quadrant: 'q2', estimatedMinutes: 20, scheduledDate: today(), dueDate: today(), isRecurring: false, subtasks: [], completedAt: now(), createdAt: now(), updatedAt: now() },
    { id: 'demo-mission-review', title: 'Reviewed Binary Search Notes', category: 'academics', priority: 'medium', status: 'completed', completed: true, size: 'small', quadrant: 'q2', estimatedMinutes: 25, scheduledDate: today(), dueDate: today(), isRecurring: false, subtasks: [], completedAt: now(), createdAt: now(), updatedAt: now() },
];

export const DEMO_PROGRAMS: Program[] = [
    {
        id: 'demo-program-morning-protocol',
        name: 'Morning Protocol',
        description: 'Meditation, code, gym, and planning before the day gets noisy.',
        programType: 'routine',
        totalDays: 30,
        currentDay: 4,
        status: 'active',
        startedAt: now(),
        category: 'productivity',
        difficulty: 'beginner',
        dailyRequirements: ['Morning Meditation', 'Morning Code Session', 'Gym'],
        totalXpPotential: 3000,
        xpEarned: 300,
        completionPercentage: 10,
        icon: '⚡',
    },
    {
        id: 'demo-program-leetcode-75',
        name: 'LeetCode 75',
        description: 'One focused DSA problem every day for placement prep.',
        programType: 'leetcode_75',
        totalDays: 75,
        currentDay: 6,
        status: 'active',
        startedAt: now(),
        category: 'learning',
        difficulty: 'advanced',
        dailyRequirements: ['Complete 1 LeetCode problem', 'Document solution approach'],
        totalXpPotential: 7500,
        xpEarned: 500,
        completionPercentage: 8,
        icon: '💻',
    },
];

const DEMO_SCHEDULE: ScheduleItem[] = [
    { id: 'demo-schedule-meditation', title: 'Morning Meditation', time: '5:45 AM', duration: '15m', tag: 'Devotional', color: '#C8FF00', period: 'today', block: 'morning' },
    { id: 'demo-schedule-code', title: 'Morning Code Session', time: '6:00 AM', duration: '2h', tag: 'Coding', color: '#C8FF00', period: 'today', block: 'morning' },
    { id: 'demo-schedule-gym', title: 'Gym', time: '8:00 AM', duration: '1h', tag: 'Gym', color: '#FF4444', period: 'today', block: 'morning' },
    { id: 'demo-schedule-leetcode', title: 'LeetCode Study', time: '2:00 PM', duration: '90m', tag: 'DSA', color: '#C8FF00', period: 'today', block: 'college' },
    { id: 'demo-schedule-review', title: 'Review', time: '7:00 PM', duration: '45m', tag: 'Academics', color: '#F59E0B', period: 'today', block: 'evening' },
    { id: 'demo-schedule-sleep', title: 'Sleep', time: '11:00 PM', duration: '8h', tag: 'Recovery', color: '#22C55E', period: 'today', block: 'evening' },
];

export const seedDemoData = (): void => {
    const startedAt = now();
    const enrollments: ProgramEnrollment[] = [
        {
            id: 'demo-enrollment-morning-protocol',
            programId: 'demo-morning-protocol',
            startedAt,
            preferredTime: '05:45',
            currentDay: 4,
            totalDays: 30,
            streak: 3,
            completedDays: 3,
        },
        {
            id: 'demo-enrollment-leetcode-75',
            programId: 'leetcode_75',
            startedAt,
            preferredTime: '14:00',
            currentDay: 6,
            totalDays: 75,
            streak: 5,
            completedDays: 5,
        },
    ];

    useHabitStore.setState({
        onboardingDataChoice: 'demo',
        habits: DEMO_HABITS,
        tasks: DEMO_MISSIONS,
        schedule: DEMO_SCHEDULE,
    });

    useProgramStore.setState({
        enrollments,
        activePrograms: DEMO_PROGRAMS,
        completedPrograms: [],
    });

    toast.success('Demo loaded. Edit to match your life.');
};
