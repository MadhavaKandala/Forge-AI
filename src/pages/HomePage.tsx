import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Bell,
    Check,
    ChevronDown,
    Circle,
    Dumbbell,
    Flame,
    ListChecks,
    Shield,
    Target,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import GuidedTour, { type TourStep } from '@/components/GuidedTour';
import MoodCheck from '@/components/MoodCheck';
import MotivationCard from '@/components/MotivationCard';
import CuratedRoutineRail from '@/components/CuratedRoutineRail';
import HabitMagicDeck from '@/components/HabitMagicDeck';
import ProgressJournalPanel from '@/components/ProgressJournalPanel';
import { useHabitStore, type Habit } from '@/store/useHabitStore';
import { useAppStore } from '@/store/useAppStore';
import { useProgramStore } from '@/store/useProgramStore';
import { MOOD_CONTENT, type MoodKey } from '@/lib/moodContent';
import { getGoalMotivationCard } from '@/lib/motivationCards';
import { getProgressStats } from '@/lib/progress';
import { cn } from '@/lib/utils';
import { type Task } from '@/types/task';
import { widgetBridge } from '@/services/widgetBridge';

const formatToday = (): string => new Date().toISOString().split('T')[0];

const toMinutes = (timeValue?: string): number => {
    if (!timeValue) return 1440;
    const trimmed = timeValue.trim();
    const twelveHour = trimmed.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (twelveHour) {
        const rawHour = Number(twelveHour[1]);
        const minutes = Number(twelveHour[2]);
        const suffix = twelveHour[3].toUpperCase();
        return (rawHour % 12 + (suffix === 'PM' ? 12 : 0)) * 60 + minutes;
    }

    const twentyFourHour = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (twentyFourHour) {
        return Number(twentyFourHour[1]) * 60 + Number(twentyFourHour[2]);
    }

    return 1440;
};

const greeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const categoryColor = (category?: string): string => {
    const colors: Record<string, string> = {
        coding: '#C8FF00',
        gym: '#FF4444',
        diet: '#22C55E',
        personal: '#FFFFFF',
        academics: '#F59E0B',
        devotional: '#C8FF00',
        work: '#F59E0B',
        other: '#666666',
    };
    return colors[category ?? 'personal'] ?? '#666666';
};

const categoryLabel = (category?: string): string => (category ?? 'personal').replace(/_/g, ' ').toUpperCase();

const isActiveTask = (task: Task): boolean => task.status !== 'completed' && task.status !== 'cancelled' && !task.completed;

type DailyOpType = 'habit' | 'task';

interface DailyOp {
    id: string;
    type: DailyOpType;
    title: string;
    time: string;
    category?: string;
    completed: boolean;
    sortTime: number;
    priorityScore: number;
    effortScore: number;
}

interface EmptyStateProps {
    label: string;
    title: string;
    body: string;
    actionLabel?: string;
    onAction?: () => void;
}

const HOME_TOUR_KEY = 'home-tour';

const HOME_TOUR_STEPS: TourStep[] = [
    {
        targetId: 'mood-check-section',
        title: 'DAILY MODE',
        description: "Set how you're showing up today. The app adjusts your schedule based on your mood.",
        position: 'bottom',
    },
    {
        targetId: 'progress-cards',
        title: "TODAY'S SCORE",
        description: 'Track habits completed and missions done. Hit 100% to earn bonus XP.',
        position: 'top',
    },
    {
        targetId: 'active-programs-bar',
        title: 'ACTIVE PROGRAMS',
        description: 'Your enrolled programs appear here. Each one auto-fills your daily schedule.',
        position: 'top',
    },
    {
        targetId: 'daily-ops-section',
        title: 'DAILY OPS',
        description: 'Your habits for today, sorted by time. Tap the checkbox to complete each one.',
        position: 'top',
    },
];

const taskPriorityScore = (task: Task): number => {
    const priority = task.priority === 'high' ? 3 : task.priority === 'medium' ? 2 : 1;
    const size = task.size === 'big' ? 3 : task.size === 'medium' ? 2 : 1;
    const status = task.status === 'in_progress' ? 3 : task.status === 'today' ? 2 : 1;
    const quadrant = task.quadrant === 'q1' ? 3 : task.quadrant === 'q2' ? 2 : 1;
    return priority * 100 + size * 30 + status * 10 + quadrant;
};

const habitEffortScore = (habit: Habit): number => {
    const title = habit.title.toLowerCase();
    if (title.includes('leetcode') || title.includes('dsa') || title.includes('gym') || title.includes('workout')) return 2;
    return 1;
};

const byCommandPriority = (a: DailyOp, b: DailyOp): number => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    if (a.sortTime !== b.sortTime) return a.sortTime - b.sortTime;
    return a.title.localeCompare(b.title);
};

const bySmallestFirst = (a: DailyOp, b: DailyOp): number => {
    if (a.effortScore !== b.effortScore) return a.effortScore - b.effortScore;
    if (a.sortTime !== b.sortTime) return a.sortTime - b.sortTime;
    return a.title.localeCompare(b.title);
};

const isGymOp = (item: DailyOp): boolean => item.category === 'gym' || /gym|workout|train|lift|cardio/i.test(item.title);

const isHardCodingOp = (item: DailyOp): boolean => (
    item.category === 'coding'
    || /leetcode|dsa|array|graph|tree|dp|interview|placement/i.test(item.title)
) && item.priorityScore >= 200;

const resolvePrimaryAction = (mood: MoodKey | null, ops: DailyOp[]): DailyOp | null => {
    const incomplete = ops.filter((item) => !item.completed);
    if (incomplete.length === 0) return null;

    if (mood === 'rock_bottom') {
        return incomplete.filter((item) => item.type === 'habit').sort(bySmallestFirst)[0] ?? null;
    }

    if (mood === 'numb') {
        return [...incomplete].sort(bySmallestFirst)[0] ?? null;
    }

    if (mood === 'overwhelmed') {
        return incomplete.filter((item) => item.type === 'task').sort(byCommandPriority)[0] ?? incomplete.sort(bySmallestFirst)[0];
    }

    if (mood === 'frustrated') {
        return incomplete.find(isGymOp)
            ?? incomplete.find(isHardCodingOp)
            ?? [...incomplete].sort(byCommandPriority)[0];
    }

    return [...incomplete].sort(byCommandPriority)[0];
};

const resolveVisibleOps = (mood: MoodKey | null, ops: DailyOp[], primaryAction: DailyOp | null): DailyOp[] => {
    const incomplete = ops.filter((item) => !item.completed);
    if (incomplete.length === 0) return [];

    if (mood === 'rock_bottom') {
        return incomplete.filter((item) => item.type === 'habit').sort(bySmallestFirst).slice(0, 3);
    }

    if (mood === 'overwhelmed') {
        return primaryAction ? [primaryAction] : incomplete.filter((item) => item.type === 'task').sort(byCommandPriority).slice(0, 1);
    }

    if (mood === 'numb') {
        return [...incomplete].sort(bySmallestFirst).slice(0, 3);
    }

    if (mood === 'frustrated') {
        const redirected = incomplete.filter((item) => isGymOp(item) || isHardCodingOp(item)).sort(byCommandPriority);
        const merged = [...redirected, ...incomplete.sort(byCommandPriority)].filter(
            (item, index, list) => list.findIndex((candidate) => candidate.id === item.id && candidate.type === item.type) === index,
        );
        return merged.slice(0, 3);
    }

    return [...incomplete].sort(byCommandPriority).slice(0, 3);
};

const EmptyState = ({ label, title, body, actionLabel, onAction }: EmptyStateProps) => (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-[#141414] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
        <h3 className="mt-2 text-sm font-black uppercase text-white">{title}</h3>
        <p className="mt-1 text-xs font-semibold leading-5 text-zinc-500">{body}</p>
        {actionLabel && onAction && (
            <button
                type="button"
                onClick={onAction}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-[#C8FF00] px-4 text-[10px] font-black uppercase tracking-[0.14em] text-black"
            >
                {actionLabel}
                <ArrowRight className="h-3.5 w-3.5" />
            </button>
        )}
    </div>
);

const Metric = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
    <div className="rounded-xl border border-zinc-800 bg-[#141414] p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
        <p className="mt-2 text-lg font-black leading-none text-white">{value}</p>
        <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.12em] text-[#C8FF00]">{detail}</p>
    </div>
);

const OpIcon = ({ item }: { item: DailyOp }) => {
    if (item.completed) return <Check className="h-4 w-4" />;
    if (item.type === 'task') return <Target className="h-4 w-4" />;
    if (isGymOp(item)) return <Dumbbell className="h-4 w-4" />;
    return <Circle className="h-4 w-4" />;
};

export default function HomePage() {
    const navigate = useNavigate();
    const [isMoodOpen, setIsMoodOpen] = useState(false);
    const [isMoreIntelOpen, setIsMoreIntelOpen] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const {
        habitUser,
        habits,
        tasks,
        streakShields,
        todayMood,
        moodHistory,
        dismissedMotivationDate,
        completeHabit,
        completeTask,
        setTodayMood,
        dismissMotivationForToday,
        initializeDefaults,
    } = useHabitStore(
        useShallow((s) => ({
            habitUser: s.user,
            habits: s.habits,
            tasks: s.tasks,
            streakShields: s.streakShields,
            todayMood: s.todayMood,
            moodHistory: s.moodHistory,
            dismissedMotivationDate: s.dismissedMotivationDate,
            completeHabit: s.completeHabit,
            completeTask: s.completeTask,
            setTodayMood: s.setTodayMood,
            dismissMotivationForToday: s.dismissMotivationForToday,
            initializeDefaults: s.initializeDefaults,
        })),
    );
    const {
        appUser,
        userGoals,
        moodCheckEnabled,
        onboardingComplete,
        completedTours,
        markTourComplete,
    } = useAppStore(
        useShallow((s) => ({
            appUser: s.user,
            userGoals: s.userGoals,
            moodCheckEnabled: s.moodCheckEnabled,
            onboardingComplete: s.onboardingComplete,
            completedTours: s.completedTours,
            markTourComplete: s.markTourComplete,
        })),
    );
    const { activePrograms, fetchAll } = useProgramStore(
        useShallow((s) => ({ activePrograms: s.activePrograms, fetchAll: s.fetchAll })),
    );

    useEffect(() => {
        initializeDefaults();
        fetchAll();
    }, [fetchAll, initializeDefaults]);

    const today = formatToday();
    const currentMood = useMemo(
        () => (todayMood?.date === today ? todayMood : moodHistory.find((item) => item.date === today) ?? null),
        [moodHistory, today, todayMood],
    );
    const currentMoodKey = currentMood?.mood ?? null;
    const moodContent = currentMoodKey ? MOOD_CONTENT[currentMoodKey] : null;

    useEffect(() => {
        if (moodCheckEnabled && !currentMood) {
            setIsMoodOpen(true);
        }
    }, [currentMood, moodCheckEnabled]);

    useEffect(() => {
        if (isMoodOpen || !onboardingComplete || completedTours.includes(HOME_TOUR_KEY)) return undefined;

        setIsMoreIntelOpen(true);
        const timer = window.setTimeout(() => setShowTour(true), 1000);
        return () => window.clearTimeout(timer);
    }, [completedTours, isMoodOpen, onboardingComplete]);

    const checkboxHabits = useMemo(
        () => habits.filter((habit) => habit.type === 'checkbox').sort((a, b) => toMinutes(a.time) - toMinutes(b.time)),
        [habits],
    );
    const activeTasks = useMemo(() => tasks.filter(isActiveTask), [tasks]);

    const completedHabits = useMemo(
        () => checkboxHabits.filter((habit) => habit.completedDates.includes(today)).length,
        [checkboxHabits, today],
    );
    const completedMissions = useMemo(
        () => tasks.filter((task) => task.completed || task.status === 'completed').length,
        [tasks],
    );
    const activeStreak = useMemo(() => habits.reduce((max, habit) => Math.max(max, habit.streak), 0), [habits]);
    const progressStats = useMemo(() => getProgressStats(habits, tasks), [habits, tasks]);
    const motivationCard = useMemo(() => getGoalMotivationCard(new Date(), activeStreak, userGoals), [activeStreak, userGoals]);
    const isMotivationDismissed = dismissedMotivationDate === today;
    const totalXp = habitUser?.xp ?? appUser?.totalXP ?? 0;

    const dailyOps = useMemo<DailyOp[]>(() => {
        const habitOps: DailyOp[] = checkboxHabits.map((habit) => ({
            id: habit.id,
            type: 'habit',
            title: habit.title,
            time: habit.time || 'All Day',
            category: habit.category,
            completed: habit.completedDates.includes(today),
            sortTime: toMinutes(habit.time),
            priorityScore: 80 + habitEffortScore(habit),
            effortScore: habitEffortScore(habit),
        }));
        const taskOps: DailyOp[] = activeTasks.map((task) => ({
            id: task.id,
            type: 'task',
            title: task.title,
            time: task.scheduledTime || 'All Day',
            category: task.category,
            completed: task.completed || task.status === 'completed',
            sortTime: toMinutes(task.scheduledTime),
            priorityScore: taskPriorityScore(task),
            effortScore: task.size === 'big' ? 3 : task.size === 'medium' ? 2 : 1,
        }));

        return [...habitOps, ...taskOps].sort((a, b) => a.sortTime - b.sortTime);
    }, [activeTasks, checkboxHabits, today]);

    const primaryAction = useMemo(() => resolvePrimaryAction(currentMoodKey, dailyOps), [currentMoodKey, dailyOps]);
    const visibleOps = useMemo(
        () => resolveVisibleOps(currentMoodKey, dailyOps, primaryAction),
        [currentMoodKey, dailyOps, primaryAction],
    );
    const structureChecklist = useMemo(
        () => dailyOps.filter((item) => item.type === 'habit' && !item.completed).sort(bySmallestFirst).slice(0, 3),
        [dailyOps],
    );

    const handleMoodSelect = useCallback((mood: MoodKey) => {
        setTodayMood(mood);
        setIsMoodOpen(false);
    }, [setTodayMood]);

    const openMoodCheck = useCallback(() => {
        setIsMoodOpen(true);
        toast.info('Mood check opened.');
    }, []);

    const handleNotificationTap = useCallback(() => {
        toast.info('Notification center standing by.');
    }, []);

    const handleOpenOps = useCallback(() => {
        const target = dailyOps.length > 0 ? '/schedule' : '/tasks';
        toast.info(dailyOps.length > 0 ? 'Opening Daily Ops.' : 'Opening Mission Control.');
        navigate(target);
    }, [dailyOps.length, navigate]);

    const handleProgramsOpen = useCallback(() => {
        toast.info('Opening Programs.');
        navigate('/programs');
    }, [navigate]);

    const handleJournalOpen = useCallback(() => {
        toast.info('Opening Journal Intel.');
        navigate('/journal');
    }, [navigate]);

    const handleProgressOpen = useCallback(() => {
        toast.info('Opening Progress Intel.');
        navigate('/progress');
    }, [navigate]);

    const toggleMoreIntel = useCallback(() => {
        setIsMoreIntelOpen((isOpen) => {
            toast.info(isOpen ? 'More Intel collapsed.' : 'More Intel expanded.');
            return !isOpen;
        });
    }, []);

    const handleTourComplete = useCallback(() => {
        markTourComplete(HOME_TOUR_KEY);
        setShowTour(false);
    }, [markTourComplete]);

    const handleOpComplete = useCallback((item: DailyOp) => {
        if (item.completed) {
            toast.info('Op already complete.');
            return;
        }

        if (item.type === 'habit') {
            const completedNow = completeHabit(item.id);
            if (completedNow) {
                toast.success('+10 XP');
            } else {
                toast.info('Habit unchecked.');
            }
            return;
        }

        completeTask(item.id);
        toast.success('+25 XP');
    }, [completeHabit, completeTask]);

    useEffect(() => {
        void widgetBridge.saveOps(dailyOps, progressStats.status).catch(() => undefined);
    }, [dailyOps, progressStats.status]);

    useEffect(() => {
        void widgetBridge.consumeCompletedIds()
            .then((ids) => {
                if (ids.length === 0) return;
                dailyOps
                    .filter((item) => ids.includes(item.id) && !item.completed)
                    .forEach((item) => handleOpComplete(item));
            })
            .catch(() => undefined);
    }, [dailyOps, handleOpComplete]);

    const operatorName = appUser?.name ?? habitUser?.name ?? 'Operator';
    const shieldLabel = `${streakShields} SHIELDS`;
    const modeLabel = moodContent?.label ?? 'UNSET';
    const modeMessage = moodContent?.message ?? 'How are you showing up today?';
    const modeAction = moodContent?.action ?? 'Sync mood intel so Forge can order the day.';
    const isRockBottom = currentMoodKey === 'rock_bottom';

    return (
        <div className="min-h-screen bg-[#0A0A0A] px-5 pb-28 pt-7 text-white">
            <AnimatePresence>{isMoodOpen && <MoodCheck onSelect={handleMoodSelect} />}</AnimatePresence>
            {showTour && (
                <GuidedTour
                    steps={HOME_TOUR_STEPS}
                    storageKey={HOME_TOUR_KEY}
                    onComplete={handleTourComplete}
                />
            )}

            <header className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C8FF00]">MISSION CONTROL</p>
                    <h1 className="mt-2 text-[26px] font-black leading-tight">{greeting()}, {operatorName}</h1>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-zinc-800 bg-[#141414] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-white">
                            {totalXp} XP
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#141414] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-white">
                            <Flame className="h-3.5 w-3.5 text-[#C8FF00]" />
                            {activeStreak} DAY
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#141414] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-white">
                            <Shield className="h-3.5 w-3.5 text-[#C8FF00]" />
                            {shieldLabel}
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleNotificationTap}
                    aria-label="Open notifications"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-zinc-800 bg-[#141414] text-[#C8FF00]"
                >
                    <Bell className="h-5 w-5" />
                </button>
            </header>

            <main className="mt-5 flex flex-col gap-5">
                <section id="mood-check-section" className="rounded-2xl border border-zinc-800 bg-[#141414] p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">DAILY MODE</p>
                            <h2 className="mt-2 flex items-center gap-2 text-lg font-black uppercase leading-tight text-white">
                                <span>{moodContent?.emoji ?? '⚡'}</span>
                                {modeLabel}
                            </h2>
                            <p className="mt-2 text-sm font-semibold leading-5 text-zinc-400">{modeMessage}</p>
                        </div>
                        <button
                            type="button"
                            onClick={openMoodCheck}
                            className="h-10 shrink-0 rounded-lg border border-[#C8FF00]/40 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#C8FF00]"
                        >
                            SYNC
                        </button>
                    </div>
                    <div className="mt-4 border-l-2 border-[#C8FF00] pl-3">
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-[#C8FF00]">TODAY ORDER</p>
                        <p className="mt-1 text-sm font-semibold leading-5 text-white">{modeAction}</p>
                    </div>
                </section>

                <section className="rounded-2xl border border-[#C8FF00]/30 bg-[#1C1C1C] p-4 shadow-[0_0_24px_rgba(200,255,0,0.06)]">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8FF00]">PRIMARY ACTION</p>
                        <span className="rounded-full bg-[#C8FF00] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-black">
                            NEXT BEST
                        </span>
                    </div>

                    {isRockBottom ? (
                        <div className="mt-4">
                            <h2 className="text-xl font-black leading-tight text-white">Structure first. No pressure sprint.</h2>
                            <p className="mt-2 text-sm font-semibold leading-5 text-zinc-400">
                                Read this, then take the smallest clean win. Forge will keep the day narrow.
                            </p>
                            <div className="mt-4 flex flex-col gap-2">
                                {(structureChecklist.length > 0 ? structureChecklist : visibleOps).slice(0, 3).map((item) => (
                                    <button
                                        key={`${item.type}-${item.id}`}
                                        type="button"
                                        onClick={() => handleOpComplete(item)}
                                        className="flex min-h-12 items-center gap-3 rounded-xl border border-zinc-800 bg-[#141414] px-3 text-left"
                                    >
                                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#1C1C1C] text-[#C8FF00]">
                                            <OpIcon item={item} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-black text-white">{item.title}</span>
                                            <span className="mt-0.5 block text-[10px] font-black uppercase tracking-[0.13em] text-zinc-500">
                                                {item.type === 'habit' ? 'SMALL STRUCTURE' : 'MINIMAL MISSION'}
                                            </span>
                                        </span>
                                    </button>
                                ))}
                                {structureChecklist.length === 0 && visibleOps.length === 0 && (
                                    <EmptyState
                                        label="STRUCTURE"
                                        title="NO SMALL CHECKLIST"
                                        body="Activate one program or deploy a simple habit to give today rails."
                                        actionLabel="OPEN PROGRAMS"
                                        onAction={handleProgramsOpen}
                                    />
                                )}
                            </div>
                        </div>
                    ) : primaryAction ? (
                        <div className="mt-4">
                            <div className="flex items-start gap-3">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#C8FF00] text-black">
                                    <OpIcon item={primaryAction} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-xl font-black leading-tight text-white">{primaryAction.title}</h2>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-400">
                                            {primaryAction.time}
                                        </span>
                                        <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-400">
                                            {categoryLabel(primaryAction.category)}
                                        </span>
                                        <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-400">
                                            {primaryAction.type === 'habit' ? 'HABIT' : 'MISSION'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleOpComplete(primaryAction)}
                                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C8FF00] text-[11px] font-black uppercase tracking-[0.16em] text-black"
                            >
                                COMPLETE OP
                                <Check className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <EmptyState
                                label="PRIMARY"
                                title="NO ACTIVE OPS"
                                body="Deploy one mission or activate a program to give today a clear target."
                                actionLabel="DEPLOY MISSION"
                                onAction={handleOpenOps}
                            />
                        </div>
                    )}
                </section>

                <section id="daily-ops-section" className="rounded-2xl border border-zinc-800 bg-[#141414] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">TODAY OPS</p>
                            <h2 className="mt-1 text-base font-black uppercase text-white">
                                {currentMoodKey === 'overwhelmed' ? 'One thing visible' : currentMoodKey === 'numb' ? 'Smallest three' : 'Next three'}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleOpenOps}
                            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#C8FF00] px-3 text-[10px] font-black uppercase tracking-[0.14em] text-black"
                        >
                            OPEN OPS
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                        {dailyOps.length === 0 && (
                            <EmptyState
                                label="DAILY OPS"
                                title="NO OPS QUEUED"
                                body="Deploy a mission or activate a program to build today's structure."
                                actionLabel="DEPLOY MISSION"
                                onAction={handleOpenOps}
                            />
                        )}
                        {dailyOps.length > 0 && visibleOps.length === 0 && (
                            <EmptyState
                                label="DAILY OPS"
                                title="OPS COMPLETE"
                                body="No upcoming ops remain on today's command line."
                                actionLabel="OPEN OPS"
                                onAction={handleOpenOps}
                            />
                        )}
                        {visibleOps.map((item) => (
                            <button
                                key={`${item.type}-${item.id}`}
                                type="button"
                                onClick={() => handleOpComplete(item)}
                                className="flex min-h-14 items-center gap-3 rounded-xl border border-zinc-800 bg-[#1C1C1C] px-3 text-left transition-colors active:border-[#C8FF00]/50"
                            >
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-zinc-800 text-[#C8FF00]">
                                    <OpIcon item={item} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-black text-white">{item.title}</span>
                                    <span className="mt-1 flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: categoryColor(item.category) }} />
                                        <span className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                                            {item.time} · {item.type === 'habit' ? 'HABIT' : 'MISSION'}
                                        </span>
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                <section id="progress-cards">
                    <div className="mb-3 flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-[#C8FF00]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">TACTICAL METRICS</p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <Metric label="Habits" value={checkboxHabits.length > 0 ? `${completedHabits}/${checkboxHabits.length}` : '0'} detail="DAILY" />
                        <Metric label="Missions" value={tasks.length > 0 ? `${completedMissions}/${tasks.length}` : '0'} detail={`${activeTasks.length} ACTIVE`} />
                        <Metric label="Streak" value={`${activeStreak}D`} detail="CHAIN" />
                        <Metric label="XP" value={`${totalXp}`} detail="TOTAL" />
                    </div>
                </section>

                {checkboxHabits.length === 0 && (
                    <EmptyState
                        label="HABITS"
                        title="NO HABITS ACTIVE"
                        body="Activate a program to push habits into Daily Ops."
                        actionLabel="OPEN PROGRAMS"
                        onAction={handleProgramsOpen}
                    />
                )}

                <section>
                    <button
                        type="button"
                        onClick={toggleMoreIntel}
                        className="flex h-14 w-full items-center justify-between rounded-xl border border-zinc-800 bg-[#1C1C1C] px-4 text-left"
                        aria-expanded={isMoreIntelOpen}
                    >
                        <span className="min-w-0">
                            <span className="block text-xs font-black uppercase tracking-[0.22em] text-[#C8FF00]">MORE INTEL</span>
                            <span className="mt-0.5 block truncate text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                                MOTIVATION, PROGRAMS, JOURNAL, PROGRESS, ROUTINES
                            </span>
                        </span>
                        <ChevronDown className={cn('h-5 w-5 shrink-0 text-[#C8FF00] transition-transform', isMoreIntelOpen && 'rotate-180')} />
                    </button>

                    <AnimatePresence initial={false}>
                        {isMoreIntelOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.24, ease: 'easeOut' }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4">
                                    <AnimatePresence>
                                        {!isMotivationDismissed && motivationCard ? (
                                            <MotivationCard card={motivationCard} streak={activeStreak} onDismiss={dismissMotivationForToday} />
                                        ) : (
                                            <EmptyState
                                                label="MOTIVATION"
                                                title="DAILY INTEL CLEAR"
                                                body="No motivation card is queued right now."
                                            />
                                        )}
                                    </AnimatePresence>

                                    <section id="active-programs-bar" className="mt-5">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h2 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">ACTIVE PROGRAMS</h2>
                                            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#C8FF00]">{activePrograms.length} ACTIVE</span>
                                        </div>
                                        {activePrograms.length > 0 ? (
                                            <div className="flex gap-3 overflow-x-auto pb-1">
                                                {activePrograms.map((program) => {
                                                    const progress = program.totalDays ? (program.currentDay / program.totalDays) * 100 : 0;
                                                    return (
                                                        <div key={program.id} className="min-w-[190px] rounded-xl border border-zinc-800 bg-[#1C1C1C] p-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl">{program.icon ?? '🎯'}</span>
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-black">{program.name}</p>
                                                                    <p className="text-xs text-zinc-500">DAY {program.currentDay}</p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                                                                <div className="h-full bg-[#C8FF00]" style={{ width: `${Math.min(progress, 100)}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <EmptyState
                                                label="PROGRAMS"
                                                title="NO ACTIVE PROGRAMS"
                                                body="Activate one program to auto-load habits into Daily Ops."
                                                actionLabel="OPEN PROGRAMS"
                                                onAction={handleProgramsOpen}
                                            />
                                        )}
                                    </section>

                                    <ProgressJournalPanel
                                        streak={activeStreak}
                                        completedToday={progressStats.completedToday}
                                        totalToday={progressStats.totalToday}
                                        mood={currentMood}
                                        onMoodTap={openMoodCheck}
                                        onJournalOpen={handleJournalOpen}
                                        onProgressOpen={handleProgressOpen}
                                        status={progressStats.status}
                                    />

                                    <CuratedRoutineRail />
                                    <HabitMagicDeck />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>
        </div>
    );
}
