import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Circle, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import MoodCheck from '@/components/MoodCheck';
import MotivationCard from '@/components/MotivationCard';
import { useHabitStore } from '@/store/useHabitStore';
import { useProgramStore } from '@/store/useProgramStore';
import { MOOD_CONTENT, MoodKey } from '@/lib/moodContent';
import { getDailyMotivationCard } from '@/lib/motivationCards';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';

const formatToday = (): string => new Date().toISOString().split('T')[0];

const toMinutes = (timeValue?: string): number => {
    if (!timeValue) return 1440;
    const parsed = timeValue.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!parsed) return 1440;
    const rawHour = Number(parsed[1]);
    const minutes = Number(parsed[2]);
    const suffix = parsed[3].toUpperCase();
    return (rawHour % 12 + (suffix === 'PM' ? 12 : 0)) * 60 + minutes;
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
    };
    return colors[category ?? 'personal'] ?? '#666666';
};

type DailyOp =
    | {
          id: string;
          type: 'habit';
          title: string;
          time: string;
          category: string;
          completed: boolean;
          sortTime: number;
      }
    | {
          id: string;
          type: 'task';
          title: string;
          time: string;
          category: string;
          completed: boolean;
          sortTime: number;
      };

const isActiveTask = (task: Task): boolean => task.status !== 'completed' && task.status !== 'cancelled' && !task.completed;

export default function HomePage() {
    const navigate = useNavigate();
    const [isMoodOpen, setIsMoodOpen] = useState(false);
    const [isMoodPillHidden, setIsMoodPillHidden] = useState(false);
    const {
        user,
        habits,
        tasks,
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
            user: s.user,
            habits: s.habits,
            tasks: s.tasks,
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
    const moodContent = currentMood ? MOOD_CONTENT[currentMood.mood] : null;

    const checkboxHabits = useMemo(
        () => habits.filter((habit) => habit.type === 'checkbox').sort((a, b) => toMinutes(a.time) - toMinutes(b.time)),
        [habits],
    );
    const activeTasks = useMemo(() => tasks.filter(isActiveTask), [tasks]);

    const completedHabits = checkboxHabits.filter((habit) => habit.completedDates.includes(today)).length;
    const completedMissions = tasks.filter((task) => task.completed || task.status === 'completed').length;
    const habitProgress = checkboxHabits.length ? Math.round((completedHabits / checkboxHabits.length) * 100) : 0;
    const missionProgress = tasks.length ? Math.round((completedMissions / tasks.length) * 100) : 0;

    const activeStreak = useMemo(() => habits.reduce((max, habit) => Math.max(max, habit.streak), 0), [habits]);
    const motivationCard = useMemo(() => getDailyMotivationCard(new Date(), activeStreak), [activeStreak]);
    const isMotivationDismissed = dismissedMotivationDate === today;

    const dailyOps = useMemo<DailyOp[]>(() => {
        const habitOps: DailyOp[] = checkboxHabits.map((habit) => ({
            id: habit.id,
            type: 'habit',
            title: habit.title,
            time: habit.time || 'All Day',
            category: habit.category,
            completed: habit.completedDates.includes(today),
            sortTime: toMinutes(habit.time),
        }));
        const taskOps: DailyOp[] = activeTasks.slice(0, 6).map((task) => ({
            id: task.id,
            type: 'task',
            title: task.title,
            time: task.scheduledTime || 'All Day',
            category: task.category,
            completed: task.completed || task.status === 'completed',
            sortTime: toMinutes(task.scheduledTime),
        }));

        return [...habitOps, ...taskOps].sort((a, b) => a.sortTime - b.sortTime);
    }, [activeTasks, checkboxHabits, today]);

    const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const currentLineIndex = dailyOps.findIndex((item) => item.sortTime >= currentMinutes);

    const handleMoodSelect = useCallback((mood: MoodKey) => {
        setTodayMood(mood);
        setIsMoodOpen(false);
        setIsMoodPillHidden(false);
    }, [setTodayMood]);

    const handleOpComplete = useCallback((item: DailyOp) => {
        if (item.completed) return;
        if (item.type === 'habit') {
            const completedNow = completeHabit(item.id);
            if (completedNow) toast.success('+10 XP');
            return;
        }

        completeTask(item.id);
        toast.success('+25 XP');
    }, [completeHabit, completeTask]);

    const ProgressRing = ({ value }: { value: number }) => (
        <div className="relative grid h-12 w-12 place-items-center rounded-full" style={{ background: `conic-gradient(#C8FF00 ${value * 3.6}deg, #2A2A2A 0deg)` }}>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#1C1C1C] text-[10px] font-black text-white">
                {value}%
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0A0A0A] px-5 pb-28 pt-8 text-white">
            <AnimatePresence>{isMoodOpen && <MoodCheck onSelect={handleMoodSelect} />}</AnimatePresence>

            <header className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">DAILY COMMAND</p>
                    <h1 className="mt-2 text-2xl font-black">{greeting()}, {user.name}</h1>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#C8FF00]">XP: {user.xp}</p>
                </div>
                <button type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-zinc-800 bg-[#141414] text-[#C8FF00]">
                    <Bell className="h-5 w-5" />
                </button>
            </header>

            <section className="mt-6">
                {!currentMood ? (
                    <button
                        type="button"
                        onClick={() => setIsMoodOpen(true)}
                        className="w-full rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4 text-left"
                    >
                        <div className="border-l-4 border-[#C8FF00] pl-4">
                            <p className="text-base font-black">⚡ How are you showing up today?</p>
                            <p className="mt-1 text-sm text-zinc-500">Tap to set your daily mode</p>
                        </div>
                    </button>
                ) : (
                    !isMoodPillHidden && (
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setIsMoodOpen(true)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    setIsMoodOpen(true);
                                }
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-[#C8FF00]/30 bg-[#1C1C1C] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#C8FF00]"
                        >
                            <span>{moodContent?.emoji} {moodContent?.label}</span>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setIsMoodPillHidden(true);
                                }}
                                aria-label="Dismiss mood badge"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )
                )}
            </section>

            <section className="mt-6 grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">HABITS</p>
                        <p className="mt-2 text-xl font-black">{completedHabits}/{checkboxHabits.length}</p>
                    </div>
                    <ProgressRing value={habitProgress} />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">MISSIONS</p>
                        <p className="mt-2 text-xl font-black">{completedMissions}/{tasks.length}</p>
                    </div>
                    <ProgressRing value={missionProgress} />
                </div>
            </section>

            <section className="mt-6 flex gap-3 overflow-x-auto pb-1">
                {activePrograms.length > 0 ? (
                    activePrograms.map((program) => {
                        const progress = program.totalDays ? (program.currentDay / program.totalDays) * 100 : 0;
                        return (
                            <div key={program.id} className="min-w-[190px] rounded-xl border border-zinc-800 bg-[#1C1C1C] p-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{program.icon ?? '🎯'}</span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-black">{program.name}</p>
                                        <p className="text-xs text-zinc-500">Day {program.currentDay}</p>
                                    </div>
                                </div>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                                    <div className="h-full bg-[#C8FF00]" style={{ width: `${Math.min(progress, 100)}%` }} />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <button
                        type="button"
                        onClick={() => navigate('/programs')}
                        className="min-w-full rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4 text-left text-sm font-black text-[#C8FF00]"
                    >
                        → Activate a Program
                    </button>
                )}
            </section>

            <button
                type="button"
                onClick={() => navigate('/schedule')}
                className="mt-4 h-11 w-full rounded-lg border border-[#C8FF00]/30 bg-[#141414] text-xs font-black uppercase tracking-[0.16em] text-[#C8FF00]"
            >
                VIEW HISTORY
            </button>

            <AnimatePresence>
                {!isMotivationDismissed && (
                    <div className="mt-6">
                        <MotivationCard card={motivationCard} streak={activeStreak} onDismiss={dismissMotivationForToday} />
                    </div>
                )}
            </AnimatePresence>

            <section className="mt-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">DAILY OPS</h2>
                    <span className="text-xs font-bold text-zinc-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="relative space-y-2">
                    {dailyOps.map((item, index) => (
                        <React.Fragment key={`${item.type}-${item.id}`}>
                            {index === currentLineIndex && <div className="h-px w-full bg-[#C8FF00]" />}
                            <button
                                type="button"
                                onClick={() => handleOpComplete(item)}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-[#1C1C1C] p-3 text-left transition-opacity',
                                    item.completed && 'opacity-50',
                                )}
                            >
                                <span className="w-16 shrink-0 text-xs font-bold text-zinc-500">{item.time}</span>
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColor(item.category) }} />
                                <span className={cn('min-w-0 flex-1 text-sm font-semibold text-white', item.completed && 'line-through text-zinc-500')}>
                                    {item.title}
                                </span>
                                <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border', item.completed ? 'border-[#C8FF00] bg-[#C8FF00] text-black' : 'border-white text-white')}>
                                    {item.completed ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                </span>
                            </button>
                        </React.Fragment>
                    ))}
                    {currentLineIndex === -1 && dailyOps.length > 0 && <div className="h-px w-full bg-[#C8FF00]" />}
                    {dailyOps.length === 0 && (
                        <div className="rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4 text-sm text-zinc-500">
                            No daily ops loaded. Activate a program to deploy structure.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
