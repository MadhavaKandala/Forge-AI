import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, animate, motion } from 'framer-motion';
import { Check, Flame, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import GuidedTour, { type TourStep } from '@/components/GuidedTour';
import { MOOD_CONTENT, MOOD_ORDER, type MoodKey } from '@/lib/moodContent';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useHabitStore, type Habit } from '@/store/useHabitStore';
import { useProgramStore } from '@/store/useProgramStore';
import { type Task } from '@/types/task';

type DateFilter = 'today' | 'week' | 'year';

interface LevelInfo {
    title: 'RECRUIT' | 'WARRIOR' | 'ELITE' | 'LEGEND' | 'MASTER';
    floor: number;
    next: number | null;
}

interface PeriodRange {
    start: Date;
    end: Date;
    label: string;
}

interface HeatmapDay {
    key: string;
    label: string;
    completed: number;
    total: number;
    percent: number;
    isToday: boolean;
}

const FILTERS: { value: DateFilter; label: string }[] = [
    { value: 'today', label: 'TODAY' },
    { value: 'week', label: 'THIS WEEK' },
    { value: 'year', label: 'THIS YEAR' },
];

const STATS_TOUR_KEY = 'stats-tour';

const STATS_TOUR_STEPS: TourStep[] = [
    {
        targetId: 'operator-card',
        title: 'YOUR LEVEL',
        description: 'Complete habits and missions to earn XP and level up from RECRUIT to MASTER.',
        position: 'bottom',
    },
    {
        targetId: 'today-summary',
        title: "TODAY'S PERFORMANCE",
        description: "Real-time score of today's habits and missions. Aim for 100% every day.",
        position: 'top',
    },
    {
        targetId: 'mood-history',
        title: 'MOOD INTELLIGENCE',
        description: "Your mood patterns over time. See when you're most consistent and why.",
        position: 'top',
    },
    {
        targetId: 'consistency-heatmap',
        title: 'CONSISTENCY MAP',
        description: 'Your last 30 days at a glance. Brighter green means more habits completed.',
        position: 'top',
    },
];

const LEVELS: LevelInfo[] = [
    { title: 'RECRUIT', floor: 0, next: 1000 },
    { title: 'WARRIOR', floor: 1000, next: 2500 },
    { title: 'ELITE', floor: 2500, next: 5000 },
    { title: 'LEGEND', floor: 5000, next: 10000 },
    { title: 'MASTER', floor: 10000, next: null },
];

const MOOD_COLORS: Record<MoodKey, string> = {
    locked_in: '#C8FF00',
    frustrated: '#FF6B35',
    numb: '#888888',
    overwhelmed: '#3B82F6',
    rock_bottom: '#FF4444',
};

const PRIORITY_ROWS = [
    { key: 'high', label: 'HIGH', icon: '🔴', color: '#FF4444' },
    { key: 'medium', label: 'MEDIUM', icon: '🟠', color: '#FF6B35' },
    { key: 'low', label: 'LOW', icon: '⚫', color: '#666666' },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
    coding: '#C8FF00',
    gym: '#FF6B35',
    work: '#F59E0B',
    academics: '#F59E0B',
    personal: '#FFFFFF',
    diet: '#22C55E',
    devotional: '#22C55E',
    breaks: '#888888',
    other: '#666666',
};

const sectionVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0 },
};

const pageVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const todayKey = (): string => new Date().toISOString().split('T')[0];

const formatDateKey = (date: Date): string => date.toISOString().split('T')[0];

const dateFromKey = (dateKey: string): Date => new Date(`${dateKey}T00:00:00`);

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const endOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const getWeekStart = (date: Date): Date => {
    const start = startOfDay(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    return start;
};

const getPeriodRange = (filter: DateFilter): PeriodRange => {
    const now = new Date();
    if (filter === 'today') {
        return { start: startOfDay(now), end: endOfDay(now), label: 'TODAY' };
    }

    if (filter === 'week') {
        const start = getWeekStart(now);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start, end: endOfDay(end), label: 'THIS WEEK' };
    }

    return {
        start: new Date(now.getFullYear(), 0, 1),
        end: endOfDay(now),
        label: 'THIS YEAR',
    };
};

const isDateInRange = (dateKey: string | null | undefined, range: PeriodRange): boolean => {
    if (!dateKey) return false;
    const date = dateFromKey(dateKey);
    return date >= range.start && date <= range.end;
};

const displayDate = (dateKey: string): string => (
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(dateFromKey(dateKey))
);

const displayCategory = (category?: string): string => (category ?? 'personal').replace(/_/g, ' ').toUpperCase();

const getLevelInfo = (xp: number): LevelInfo => (
    LEVELS.reduce((current, level) => (xp >= level.floor ? level : current), LEVELS[0])
);

const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'OP';
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
};

const isCompletedMission = (task: Task): boolean => task.completed || task.status === 'completed';

const isTodayMission = (task: Task): boolean => task.status === 'today' || task.status === 'in_progress';

const isBacklogMission = (task: Task): boolean => task.status === 'backlog' || task.status === 'this_week';

const getCompletionDateKey = (task: Task): string | null => {
    if (!isCompletedMission(task)) return null;
    const value = task.completedAt ?? task.updatedAt ?? task.dueDate ?? task.scheduledDate ?? task.createdAt;
    return value ? value.slice(0, 10) : null;
};

const getTaskActivityDateKey = (task: Task): string | null => {
    const value = getCompletionDateKey(task) ?? task.dueDate ?? task.scheduledDate ?? task.updatedAt ?? task.createdAt;
    return value ? value.slice(0, 10) : null;
};

const getHabitCompletionCount = (habits: Habit[], dateKey: string): number => (
    habits.filter((habit) => habit.completedDates.includes(dateKey)).length
);

const getHeatmapColor = (percent: number): string => {
    if (percent <= 0) return '#1C1C1C';
    if (percent < 50) return '#4A5500';
    if (percent < 80) return '#7A8C00';
    if (percent < 100) return '#A8CC00';
    return '#C8FF00';
};

const buildHeatmap = (habits: Habit[], today: string): HeatmapDay[] => (
    Array.from({ length: 30 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - index));
        const key = formatDateKey(date);
        const completed = getHabitCompletionCount(habits, key);
        const total = habits.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            key,
            label: displayDate(key),
            completed,
            total,
            percent,
            isToday: key === today,
        };
    })
);

const getXpByDate = (habits: Habit[], tasks: Task[]): Map<string, number> => {
    const xpByDate = new Map<string, number>();

    habits.forEach((habit) => {
        Array.from(new Set(habit.completedDates)).forEach((date) => {
            xpByDate.set(date, (xpByDate.get(date) ?? 0) + 10);
        });
    });

    tasks.forEach((task) => {
        const completedDate = getCompletionDateKey(task);
        if (completedDate) {
            xpByDate.set(completedDate, (xpByDate.get(completedDate) ?? 0) + 25);
        }
    });

    return xpByDate;
};

const getPerfectWeeks = (heatmapDays: HeatmapDay[]): number => {
    let perfectWeeks = 0;
    for (let index = 0; index <= heatmapDays.length - 7; index += 7) {
        const week = heatmapDays.slice(index, index + 7);
        if (week.length === 7 && week.every((day) => day.total > 0 && day.percent === 100)) {
            perfectWeeks += 1;
        }
    }
    return perfectWeeks;
};

const SectionLabel = ({ children, subtext }: { children: string; subtext?: string }) => (
    <div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">{children}</p>
        {subtext && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">{subtext}</p>}
    </div>
);

const AnimatedNumber = ({
    value,
    prefix = '',
    suffix = '',
    className,
}: {
    value: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 1,
            ease: 'easeOut',
            onUpdate: (latest) => setDisplay(Math.round(latest)),
        });

        return () => controls.stop();
    }, [value]);

    return <span className={className}>{prefix}{display.toLocaleString()}{suffix}</span>;
};

const ProgressBar = ({ value, color = '#C8FF00' }: { value: number; color?: string }) => (
    <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
        <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
        />
    </div>
);

const RingProgress = ({ percent, color }: { percent: number; color: string }) => {
    const radius = 33;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(Math.max(percent, 0), 100) / 100) * circumference;

    return (
        <svg viewBox="0 0 84 84" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="42" cy="42" r={radius} fill="none" stroke="#27272A" strokeWidth="5" />
            <motion.circle
                cx="42"
                cy="42"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: 'easeOut' }}
            />
        </svg>
    );
};

const TodayStatCard = ({
    icon,
    label,
    color,
    children,
    subtext,
}: {
    icon: React.ReactNode;
    label: string;
    color: string;
    children: React.ReactNode;
    subtext?: React.ReactNode;
}) => (
    <motion.article
        variants={sectionVariants}
        className="min-h-[146px] rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-4 shadow-[0_0_22px_rgba(200,255,0,0.03)]"
    >
        <div className="flex items-start justify-between gap-3">
            <p className="text-[9px] font-black uppercase tracking-[0.17em] text-zinc-500">{label}</p>
            <span className="text-lg leading-none" style={{ color }}>{icon}</span>
        </div>
        <div className="mt-4">{children}</div>
        {subtext && <div className="mt-3 text-[10px] font-black uppercase tracking-[0.13em] text-zinc-500">{subtext}</div>}
    </motion.article>
);

const StatBox = ({ value, label }: { value: number; label: string }) => (
    <div className="rounded-xl border border-zinc-800 bg-[#1C1C1C] p-3">
        <p className="text-lg font-black leading-none text-white">{value}</p>
        <p className="mt-2 text-[8px] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
    </div>
);

export default function StatsPage() {
    const [dateFilter, setDateFilter] = useState<DateFilter>('today');
    const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<HeatmapDay | null>(null);
    const [showTour, setShowTour] = useState(false);

    const {
        habitUser,
        habits,
        tasks,
        moodHistory,
        streakShields,
        initializeDefaults,
    } = useHabitStore(
        useShallow((state) => ({
            habitUser: state.user,
            habits: state.habits,
            tasks: state.tasks,
            moodHistory: state.moodHistory,
            streakShields: state.streakShields,
            initializeDefaults: state.initializeDefaults,
        })),
    );
    const { appUser, completedTours, markTourComplete } = useAppStore(
        useShallow((state) => ({
            appUser: state.user,
            completedTours: state.completedTours,
            markTourComplete: state.markTourComplete,
        })),
    );
    const { activePrograms, enrollments, fetchAll } = useProgramStore(
        useShallow((state) => ({
            activePrograms: state.activePrograms,
            enrollments: state.enrollments,
            fetchAll: state.fetchAll,
        })),
    );

    useEffect(() => {
        initializeDefaults();
        void fetchAll();
    }, [fetchAll, initializeDefaults]);

    useEffect(() => {
        if (completedTours.includes(STATS_TOUR_KEY)) return undefined;

        const timer = window.setTimeout(() => setShowTour(true), 1000);
        return () => window.clearTimeout(timer);
    }, [completedTours]);

    const today = todayKey();
    const periodRange = useMemo(() => getPeriodRange(dateFilter), [dateFilter]);
    const totalXP = habitUser?.xp ?? appUser?.totalXP ?? 0;
    const levelInfo = useMemo(() => getLevelInfo(totalXP), [totalXP]);
    const nextLevelProgress = levelInfo.next
        ? ((totalXP - levelInfo.floor) / (levelInfo.next - levelInfo.floor)) * 100
        : 100;

    const operatorName = appUser?.name ?? habitUser?.name ?? 'Operator';
    const operatorEmail = appUser?.email ?? 'LOCAL PROFILE';
    const operatorAvatar = appUser?.avatar || habitUser?.avatarUrl || '';

    const completedHabitsToday = useMemo(() => getHabitCompletionCount(habits, today), [habits, today]);
    const totalHabits = habits.length;
    const habitPercent = totalHabits > 0 ? Math.round((completedHabitsToday / totalHabits) * 100) : 0;
    const habitColor = totalHabits === 0
        ? '#666666'
        : habitPercent === 100
            ? '#C8FF00'
            : habitPercent > 50
                ? '#FF6B35'
                : '#FF4444';

    const todayMissions = useMemo(
        () => tasks.filter((task) => (
            isDateInRange(getTaskActivityDateKey(task), getPeriodRange('today'))
            || (!isCompletedMission(task) && isTodayMission(task))
        )),
        [tasks],
    );
    const completedMissionsToday = useMemo(
        () => todayMissions.filter(isCompletedMission).length,
        [todayMissions],
    );
    const missionColor = todayMissions.length > 0 && completedMissionsToday === todayMissions.length
        ? '#C8FF00'
        : completedMissionsToday > 0
            ? '#FF6B35'
            : '#666666';

    const currentStreak = useMemo(
        () => habits.reduce((max, habit) => Math.max(max, habit.streak), 0),
        [habits],
    );

    const xpByDate = useMemo(() => getXpByDate(habits, tasks), [habits, tasks]);
    const xpEarnedToday = Math.max(
        completedHabitsToday * 10 + completedMissionsToday * 25,
        xpByDate.get(today) ?? 0,
    );
    const bestDayXP = useMemo(
        () => Math.max(xpEarnedToday, ...Array.from(xpByDate.values()), 0),
        [xpByDate, xpEarnedToday],
    );

    const heatmapDays = useMemo(() => buildHeatmap(habits, today), [habits, today]);
    const perfectDays = useMemo(
        () => heatmapDays.filter((day) => day.total > 0 && day.percent === 100).length,
        [heatmapDays],
    );
    const perfectWeeks = useMemo(() => getPerfectWeeks(heatmapDays), [heatmapDays]);

    const periodMoods = useMemo(
        () => moodHistory.filter((entry) => isDateInRange(entry.date, periodRange)),
        [moodHistory, periodRange],
    );
    const moodCounts = useMemo(() => {
        const counts = MOOD_ORDER.reduce<Record<MoodKey, number>>((acc, mood) => {
            acc[mood] = 0;
            return acc;
        }, {} as Record<MoodKey, number>);

        periodMoods.forEach((entry) => {
            counts[entry.mood] += 1;
        });

        return counts;
    }, [periodMoods]);
    const totalMoodChecks = periodMoods.length;
    const topMood = useMemo(
        () => MOOD_ORDER.reduce<MoodKey>((top, mood) => (moodCounts[mood] > moodCounts[top] ? mood : top), 'locked_in'),
        [moodCounts],
    );
    const lockedInPercent = totalMoodChecks > 0 ? Math.round((moodCounts.locked_in / totalMoodChecks) * 100) : 0;
    const maxMoodCount = Math.max(...Object.values(moodCounts), 1);

    const filteredTasks = useMemo(
        () => tasks.filter((task) => (
            isDateInRange(getTaskActivityDateKey(task), periodRange)
            || (dateFilter === 'today' && !isCompletedMission(task) && isTodayMission(task))
        )),
        [dateFilter, periodRange, tasks],
    );

    const missionBreakdown = useMemo(() => ({
        total: filteredTasks.length,
        completed: filteredTasks.filter(isCompletedMission).length,
        inProgress: filteredTasks.filter((task) => task.status === 'in_progress').length,
        backlog: filteredTasks.filter(isBacklogMission).length,
    }), [filteredTasks]);

    const priorityCounts = useMemo(() => {
        const counts = { high: 0, medium: 0, low: 0 };
        filteredTasks.forEach((task) => {
            counts[task.priority] += 1;
        });
        return counts;
    }, [filteredTasks]);
    const maxPriorityCount = Math.max(...Object.values(priorityCounts), 1);

    const categoryBreakdown = useMemo(() => {
        const counts = filteredTasks.reduce<Record<string, number>>((acc, task) => {
            const category = task.category ?? 'personal';
            acc[category] = (acc[category] ?? 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts)
            .map(([category, count]) => ({
                category,
                count,
                percent: filteredTasks.length > 0 ? Math.round((count / filteredTasks.length) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);
    }, [filteredTasks]);

    const enrollmentByProgramId = useMemo(
        () => new Map(enrollments.map((enrollment) => [enrollment.programId, enrollment])),
        [enrollments],
    );

    const handleFilterChange = useCallback((filter: DateFilter) => {
        setDateFilter(filter);
        const label = FILTERS.find((item) => item.value === filter)?.label ?? 'FILTER';
        toast.info(`${label} intel loaded.`);
    }, []);

    const handleHeatmapSelect = useCallback((day: HeatmapDay) => {
        setSelectedHeatmapDay(day);
        toast.info(`${day.label}: ${day.completed}/${day.total} habits complete.`);
    }, []);

    const handleTourComplete = useCallback(() => {
        markTourComplete(STATS_TOUR_KEY);
        setShowTour(false);
    }, [markTourComplete]);

    return (
        <motion.div
            className="min-h-screen bg-[#0A0A0A] px-5 pb-28 pt-7 text-white"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
        >
            {showTour && (
                <GuidedTour
                    steps={STATS_TOUR_STEPS}
                    storageKey={STATS_TOUR_KEY}
                    onComplete={handleTourComplete}
                />
            )}
            <motion.header variants={sectionVariants} transition={{ duration: 0.32, ease: 'easeOut' }}>
                <h1 className="text-2xl font-black uppercase tracking-[0.06em] text-white">INTEL DASHBOARD</h1>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    REAL-TIME PERFORMANCE ANALYSIS
                </p>
            </motion.header>

            <main className="mt-6 flex flex-col gap-7">
                <motion.section
                    id="operator-card"
                    variants={sectionVariants}
                    transition={{ duration: 0.32, ease: 'easeOut' }}
                    className="rounded-2xl border border-zinc-800 border-l-4 border-l-[#C8FF00] bg-[#1C1C1C] p-4 shadow-[0_0_28px_rgba(200,255,0,0.07)]"
                >
                    <div className="flex items-start justify-between gap-5">
                        <div className="min-w-0">
                            {operatorAvatar ? (
                                <img
                                    src={operatorAvatar}
                                    alt=""
                                    className="h-12 w-12 rounded-full border border-[#C8FF00]/40 object-cover"
                                />
                            ) : (
                                <div className="grid h-12 w-12 place-items-center rounded-full border border-[#C8FF00]/50 bg-[#C8FF00]/10 text-sm font-black text-[#C8FF00] shadow-[0_0_18px_rgba(200,255,0,0.18)]">
                                    {getInitials(operatorName)}
                                </div>
                            )}
                            <h2 className="mt-3 truncate text-base font-black text-white">{operatorName}</h2>
                            <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">{operatorEmail}</p>
                        </div>

                        <div className="min-w-[150px] flex-1 text-right">
                            <p className="text-3xl font-black leading-none text-[#C8FF00] drop-shadow-[0_0_12px_rgba(200,255,0,0.18)]">
                                {levelInfo.title}
                            </p>
                            <p className="mt-2 text-sm font-black uppercase tracking-[0.12em] text-white">
                                {totalXP.toLocaleString()} XP
                            </p>
                            <div className="mt-4">
                                <ProgressBar value={nextLevelProgress} />
                                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">
                                    {levelInfo.next ? `${totalXP.toLocaleString()} / ${levelInfo.next.toLocaleString()} to next level` : 'MASTER TIER ACHIEVED'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section id="today-summary" variants={sectionVariants} transition={{ duration: 0.32, ease: 'easeOut' }}>
                    <SectionLabel>TODAY&apos;S PERFORMANCE</SectionLabel>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <TodayStatCard
                            label="HABITS COMPLETED"
                            icon={<Check className="h-5 w-5" />}
                            color={habitColor}
                        >
                            <div className="relative mx-auto grid h-[84px] w-[84px] place-items-center">
                                <RingProgress percent={habitPercent} color={habitColor} />
                                <p className="text-xl font-black leading-none text-white">
                                    <AnimatedNumber value={completedHabitsToday} />
                                    <span className="text-zinc-600">/</span>
                                    <AnimatedNumber value={totalHabits} />
                                </p>
                            </div>
                        </TodayStatCard>

                        <TodayStatCard
                            label="MISSIONS DONE"
                            icon={<span>🎯</span>}
                            color={missionColor}
                            subtext={todayMissions.length === 0 ? 'DEPLOY MISSIONS TO SEE DATA' : undefined}
                        >
                            <p className="text-3xl font-black leading-none text-white">
                                <AnimatedNumber value={completedMissionsToday} />
                                <span className="text-zinc-600">/</span>
                                <AnimatedNumber value={todayMissions.length} />
                            </p>
                        </TodayStatCard>

                        <TodayStatCard
                            label="DAY STREAK"
                            icon={<span>🔥</span>}
                            color="#FF6B35"
                            subtext={streakShields > 0 ? `🛡️ ${streakShields} shields` : 'NO SHIELDS ARMED'}
                        >
                            <p className="text-3xl font-black leading-none text-[#FF6B35]">
                                <AnimatedNumber value={currentStreak} />
                            </p>
                        </TodayStatCard>

                        <TodayStatCard
                            label="XP EARNED TODAY"
                            icon={<Zap className="h-5 w-5" />}
                            color="#C8FF00"
                            subtext={`BEST: +${bestDayXP.toLocaleString()}`}
                        >
                            <p className="text-3xl font-black leading-none text-[#C8FF00]">
                                <AnimatedNumber value={xpEarnedToday} prefix="+" />
                            </p>
                        </TodayStatCard>
                    </div>
                </motion.section>

                <motion.section variants={sectionVariants} transition={{ duration: 0.32, ease: 'easeOut' }}>
                    <div className="flex justify-center gap-2">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => handleFilterChange(filter.value)}
                                className={cn(
                                    'h-10 rounded-full px-4 text-[10px] font-black uppercase tracking-[0.15em] transition-colors',
                                    dateFilter === filter.value
                                        ? 'bg-[#C8FF00] text-black'
                                        : 'border border-zinc-800 bg-[#1C1C1C] text-zinc-500',
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </motion.section>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={dateFilter}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="flex flex-col gap-7"
                    >
                        <motion.section id="mood-history" variants={sectionVariants} initial="hidden" animate="visible" transition={{ duration: 0.32, ease: 'easeOut' }}>
                            <SectionLabel>MOOD INTELLIGENCE</SectionLabel>
                            <div className="mt-3 rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="flex items-center gap-2 text-2xl font-black uppercase leading-none text-white">
                                            <span className="text-3xl">{totalMoodChecks > 0 ? MOOD_CONTENT[topMood].emoji : '—'}</span>
                                            {totalMoodChecks > 0 ? MOOD_CONTENT[topMood].label : 'NO MOOD SYNCED'}
                                        </p>
                                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                                            {moodCounts[topMood]} times · {periodRange.label}
                                        </p>
                                    </div>
                                    <div className="rounded-full border border-[#C8FF00]/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#C8FF00]">
                                        {totalMoodChecks} CHECKS
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-3">
                                    {MOOD_ORDER.map((mood) => {
                                        const count = moodCounts[mood];
                                        const width = (count / maxMoodCount) * 100;
                                        return (
                                            <div key={mood} className="grid grid-cols-[112px_1fr_50px] items-center gap-2">
                                                <p className="truncate text-[10px] font-black uppercase tracking-[0.08em] text-zinc-400">
                                                    <span className="mr-1">{MOOD_CONTENT[mood].emoji}</span>
                                                    {MOOD_CONTENT[mood].label}
                                                </p>
                                                <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                                                    <motion.div
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: MOOD_COLORS[mood] }}
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${width}%` }}
                                                        viewport={{ once: true, amount: 0.4 }}
                                                        transition={{ duration: 0.7, ease: 'easeOut' }}
                                                    />
                                                </div>
                                                <p className="text-right text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">
                                                    {count} {dateFilter === 'today' ? 'hits' : 'days'}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <p className="mt-5 text-xs italic leading-5 text-zinc-500">
                                    {totalMoodChecks > 0
                                        ? `You were LOCKED IN ${lockedInPercent}% of the time.`
                                        : 'Sync mood intel to expose the pattern.'}
                                </p>
                            </div>
                        </motion.section>

                        <motion.section variants={sectionVariants} initial="hidden" animate="visible" transition={{ duration: 0.32, ease: 'easeOut' }}>
                            <SectionLabel>MISSION ANALYTICS</SectionLabel>
                            <div className="mt-3 grid grid-cols-4 gap-2">
                                <StatBox value={missionBreakdown.total} label="TOTAL" />
                                <StatBox value={missionBreakdown.completed} label="COMPLETED" />
                                <StatBox value={missionBreakdown.inProgress} label="IN PROGRESS" />
                                <StatBox value={missionBreakdown.backlog} label="BACKLOG" />
                            </div>

                            <div className="mt-3 rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">PRIORITY BREAKDOWN</p>
                                <div className="mt-4 flex flex-col gap-3">
                                    {PRIORITY_ROWS.map((row) => {
                                        const count = priorityCounts[row.key];
                                        const width = (count / maxPriorityCount) * 100;
                                        return (
                                            <div key={row.key} className="grid grid-cols-[82px_1fr_78px] items-center gap-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400">
                                                    <span className="mr-1">{row.icon}</span>
                                                    {row.label}
                                                </p>
                                                <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                                                    <motion.div
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: row.color }}
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${width}%` }}
                                                        viewport={{ once: true, amount: 0.4 }}
                                                        transition={{ duration: 0.7, ease: 'easeOut' }}
                                                    />
                                                </div>
                                                <p className="text-right text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">
                                                    {count} missions
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {dateFilter !== 'today' && (
                                <div className="mt-3 rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">CATEGORY BREAKDOWN</p>
                                    {categoryBreakdown.length === 0 ? (
                                        <p className="mt-4 text-center text-xs font-semibold text-zinc-500">
                                            Complete missions to see category split.
                                        </p>
                                    ) : (
                                        <div className="mt-4 flex flex-col gap-3">
                                            {categoryBreakdown.map((item) => (
                                                <div key={item.category} className="grid grid-cols-[80px_42px_1fr] items-center gap-2">
                                                    <p className="truncate text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400">
                                                        {displayCategory(item.category)}
                                                    </p>
                                                    <p className="text-right text-[10px] font-black text-white">{item.percent}%</p>
                                                    <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                                                        <motion.div
                                                            className="h-full rounded-full"
                                                            style={{ backgroundColor: CATEGORY_COLORS[item.category] ?? '#666666' }}
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${item.percent}%` }}
                                                            viewport={{ once: true, amount: 0.4 }}
                                                            transition={{ duration: 0.7, ease: 'easeOut' }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.section>
                    </motion.div>
                </AnimatePresence>

                <motion.section id="consistency-heatmap" variants={sectionVariants} transition={{ duration: 0.32, ease: 'easeOut' }}>
                    <SectionLabel subtext="Last 30 days">CONSISTENCY MAP</SectionLabel>
                    <div className="mt-3 rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-4">
                        <div className="grid grid-cols-6 gap-0.5">
                            {heatmapDays.map((day, index) => (
                                <motion.button
                                    key={day.key}
                                    type="button"
                                    aria-label={`${day.label}: ${day.completed} of ${day.total} habits complete`}
                                    onClick={() => handleHeatmapSelect(day)}
                                    className={cn(
                                        'h-3 w-3 rounded-[3px] border transition-transform active:scale-125',
                                        day.isToday ? 'border-[#C8FF00]' : 'border-transparent',
                                    )}
                                    style={{ backgroundColor: getHeatmapColor(day.percent) }}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.005, duration: 0.16, ease: 'easeOut' }}
                                />
                            ))}
                        </div>

                        <AnimatePresence>
                            {selectedHeatmapDay && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="mt-4 rounded-xl border border-[#C8FF00]/30 bg-[#141414] px-3 py-2"
                                >
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#C8FF00]">
                                        {selectedHeatmapDay.label}
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-zinc-400">
                                        {selectedHeatmapDay.completed}/{selectedHeatmapDay.total} habits completed · {selectedHeatmapDay.percent}%
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">
                            <span>Less</span>
                            <span className="text-[#1C1C1C]">░</span>
                            <span className="text-[#4A5500]">▒</span>
                            <span className="text-[#7A8C00]">▓</span>
                            <span className="text-[#C8FF00]">█</span>
                            <span>More</span>
                        </div>
                        <p className="mt-3 text-xs font-semibold text-zinc-500">
                            {perfectDays} perfect days in last 30
                        </p>
                    </div>
                </motion.section>

                <motion.section variants={sectionVariants} transition={{ duration: 0.32, ease: 'easeOut' }}>
                    <SectionLabel>PROGRAM STATUS</SectionLabel>
                    <div className="mt-3">
                        {activePrograms.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#1C1C1C] p-6 text-center">
                                <p className="text-sm font-semibold text-zinc-500">
                                    No active programs. Go to Programs to deploy one.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {activePrograms.map((program, index) => {
                                    const enrollment = enrollmentByProgramId.get(program.programType);
                                    const totalDays = Math.max(program.totalDays ?? enrollment?.totalDays ?? 1, 1);
                                    const currentDay = Math.min(program.currentDay ?? enrollment?.currentDay ?? 1, totalDays);
                                    const progress = program.completionPercentage ?? ((currentDay / totalDays) * 100);
                                    const streak = enrollment?.streak ?? 0;
                                    return (
                                        <motion.article
                                            key={program.id}
                                            className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-4"
                                            initial={{ opacity: 0, y: 14 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, amount: 0.3 }}
                                            transition={{ delay: index * 0.05, duration: 0.28, ease: 'easeOut' }}
                                        >
                                            <span className="text-2xl leading-none">{program.icon ?? '🎯'}</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-black text-white">{program.name}</p>
                                                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                                                    Day {currentDay} of {totalDays}
                                                </p>
                                                <div className="mt-3">
                                                    <ProgressBar value={progress} />
                                                </div>
                                                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#C8FF00]">
                                                    {Math.round(progress)}% complete
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-xs font-black uppercase tracking-[0.08em] text-[#FF6B35]">
                                                🔥 {streak}d
                                            </p>
                                        </motion.article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.section>

                <motion.section variants={sectionVariants} transition={{ duration: 0.32, ease: 'easeOut' }}>
                    <SectionLabel>PERSONAL RECORDS</SectionLabel>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-3 text-center">
                            <Flame className="mx-auto h-6 w-6 text-[#FF6B35]" />
                            <p className="mt-3 text-lg font-black uppercase leading-none text-white">{currentStreak} DAYS</p>
                            <p className="mt-2 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-500">Best streak ever</p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-3 text-center">
                            <Zap className="mx-auto h-6 w-6 text-[#C8FF00]" />
                            <p className="mt-3 text-lg font-black uppercase leading-none text-[#C8FF00]">+{bestDayXP}</p>
                            <p className="mt-2 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-500">Most XP in one day</p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-3 text-center">
                            <Shield className="mx-auto h-6 w-6 text-[#C8FF00]" />
                            <p className="mt-3 text-lg font-black uppercase leading-none text-white">{perfectWeeks}</p>
                            <p className="mt-2 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-500">Weeks with 100% habits</p>
                        </div>
                    </div>
                </motion.section>
            </main>
        </motion.div>
    );
}
