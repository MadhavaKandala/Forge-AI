import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/store/useAppStore';
import { useHabitStore } from '@/store/useHabitStore';
import { useProgramStore } from '@/store/useProgramStore';

const formatDateKey = (date = new Date()): string => date.toISOString().split('T')[0];

const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
};

export default function DailyBrief() {
    const [isVisible, setIsVisible] = useState(true);
    const appUser = useAppStore((s) => s.user);
    const setDailyBriefShown = useAppStore((s) => s.setDailyBriefShown);
    const { habits, tasks } = useHabitStore(
        useShallow((s) => ({
            habits: s.habits,
            tasks: s.tasks,
        })),
    );
    const activePrograms = useProgramStore((s) => s.activePrograms);

    const today = formatDateKey();
    const firstName = (appUser?.name ?? 'Operator').trim().split(/\s+/)[0] || 'Operator';
    const activeStreak = useMemo(() => habits.reduce((max, habit) => Math.max(max, habit.streak), 0), [habits]);
    const program = activePrograms[0];
    const primaryMission = useMemo(() => {
        const priorityRank = { high: 0, medium: 1, low: 2 };
        return tasks
            .filter((task) => !task.completed && task.status !== 'completed' && task.status !== 'cancelled')
            .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])[0];
    }, [tasks]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setIsVisible(false);
        }, 4000);

        return () => window.clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
    };

    const handleAnimationComplete = () => {
        if (!isVisible) {
            setDailyBriefShown(today);
        }
    };

    return (
        <motion.button
            type="button"
            initial={{ opacity: 0, y: 36 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -28 }}
            transition={isVisible ? { duration: 0.5, ease: 'easeOut' } : { duration: 0.3, ease: 'easeIn' }}
            onAnimationComplete={handleAnimationComplete}
            onClick={handleDismiss}
            className="fixed inset-0 z-[70] flex min-h-screen w-full flex-col items-center justify-between bg-[#0A0A0A] px-6 py-10 text-center text-white"
        >
            <p className="text-3xl font-black uppercase tracking-[0.08em] text-zinc-700">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>

            <div className="w-full space-y-5">
                <div className="mx-auto h-28 w-28 rounded-full" style={{ background: 'radial-gradient(circle, #C8FF0024 0%, transparent 72%)' }} />
                <div>
                    <h2 className="text-4xl font-black uppercase leading-tight tracking-[0.04em]">
                        {getGreeting()} {firstName}
                    </h2>
                    <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#C8FF00]">
                        🔥 {activeStreak} DAY STREAK
                    </p>
                    <p className="mt-3 text-sm font-bold text-zinc-500">
                        {program ? `${program.name} · Day ${program.currentDay}` : 'No active program deployed'}
                    </p>
                </div>
            </div>

            <div className="w-full">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">TODAY'S PRIMARY MISSION:</p>
                <p className="mt-3 text-2xl font-black leading-tight">
                    {primaryMission?.title ?? 'Deploy one mission. Keep the chain alive.'}
                </p>
            </div>

            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C8FF00]">TAP TO DEPLOY</p>
        </motion.button>
    );
}
