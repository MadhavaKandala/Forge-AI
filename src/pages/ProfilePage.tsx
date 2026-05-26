import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, RotateCcw, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/store/useAppStore';
import { useHabitStore } from '@/store/useHabitStore';
import { useProgramStore } from '@/store/useProgramStore';
import { useUserStore } from '@/store/useUserStore';

const LEVELS = [
    { threshold: 0, level: 1, title: 'RECRUIT' },
    { threshold: 1000, level: 2, title: 'OPERATIVE' },
    { threshold: 3000, level: 3, title: 'AGENT' },
    { threshold: 6000, level: 4, title: 'COMMANDER' },
    { threshold: 10000, level: 5, title: 'ELITE' },
];

const getLevelInfo = (xp: number) => LEVELS.reduceRight((acc, level) => (xp >= level.threshold ? level : acc), LEVELS[0]);

export default function ProfilePage() {
    const navigate = useNavigate();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const { habitUser, habits } = useHabitStore(
        useShallow((s) => ({
            habitUser: s.user,
            habits: s.habits,
        })),
    );
    const profileUser = useUserStore((s) => s.user);
    const { appUser, signOut, resetOnboarding } = useAppStore(
        useShallow((s) => ({
            appUser: s.user,
            signOut: s.signOut,
            resetOnboarding: s.resetOnboarding,
        })),
    );
    const { activePrograms, enrollments } = useProgramStore(
        useShallow((s) => ({
            activePrograms: s.activePrograms,
            enrollments: s.enrollments,
        })),
    );
    const name = appUser?.name || profileUser?.display_name || profileUser?.name || habitUser?.name || 'Operator';
    const xp = habitUser?.xp ?? appUser?.totalXP ?? profileUser?.total_xp ?? 0;
    const levelInfo = getLevelInfo(xp);
    const nextLevel = LEVELS.find((level) => level.threshold > xp);
    const levelStart = levelInfo.threshold;
    const levelTarget = nextLevel?.threshold ?? levelStart + 5000;
    const levelProgress = Math.min(100, Math.round(((xp - levelStart) / Math.max(levelTarget - levelStart, 1)) * 100));
    const totalHabitsCompleted = useMemo(
        () => habits.reduce((total, habit) => total + habit.completedDates.length, 0),
        [habits],
    );
    const currentStreak = useMemo(
        () => habits.reduce((max, habit) => Math.max(max, habit.streak), 0),
        [habits],
    );
    const longestStreak = currentStreak;
    const activeProgramCount = activePrograms.length || enrollments.length;

    const handleRerunOnboarding = useCallback(() => {
        resetOnboarding();
        toast.success('Onboarding reset.');
        navigate('/onboarding', { replace: true });
    }, [navigate, resetOnboarding]);

    const handleSignOut = useCallback(async () => {
        if (isSigningOut) return;
        setIsSigningOut(true);
        try {
            await signOut();
            navigate('/', { replace: true });
        } catch {
            toast.error('Sign out failed. Try again.');
        } finally {
            setIsSigningOut(false);
        }
    }, [isSigningOut, navigate, signOut]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] px-6 pb-28 pt-8 text-white">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">PROFILE</p>
            <h1 className="mt-2 text-3xl font-black">{name}</h1>
            <p className="mt-1 text-sm font-bold text-[#C8FF00]">{xp} XP</p>

            <section className="mt-8 rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#141414] text-[#C8FF00]">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.14em]">Operator</p>
                        <p className="text-sm text-zinc-500">Single-user Forge AI profile</p>
                    </div>
                </div>
            </section>

            <section className="mt-4 rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Level</p>
                        <p className="mt-2 text-3xl font-black">{levelInfo.title}</p>
                    </div>
                    <p className="text-5xl font-black text-[#C8FF00]">{levelInfo.level}</p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-900">
                    <div className="h-full bg-[#C8FF00]" style={{ width: `${levelProgress}%` }} />
                </div>
                <p className="mt-2 text-xs font-bold text-zinc-500">{xp}/{levelTarget} XP TO NEXT LEVEL</p>
            </section>

            <section className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-[#141414] p-3">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Habits Done</p>
                    <p className="mt-2 text-2xl font-black">{totalHabitsCompleted}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-[#141414] p-3">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Current</p>
                    <p className="mt-2 text-2xl font-black">{currentStreak}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-[#141414] p-3">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Longest</p>
                    <p className="mt-2 text-2xl font-black">{longestStreak}</p>
                </div>
            </section>

            <section className="mt-4 rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Programs</p>
                <p className="mt-2 text-2xl font-black text-[#C8FF00]">{activeProgramCount} Programs Active</p>
            </section>

            <section className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#141414] p-4">
                    <Bell className="h-5 w-5 text-[#C8FF00]" />
                    <div>
                        <p className="text-sm font-bold">Reminders</p>
                        <p className="text-xs text-zinc-500">{habitUser?.notificationsEnabled ? 'Enabled' : 'Configure in onboarding'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#141414] p-4">
                    <Shield className="h-5 w-5 text-[#C8FF00]" />
                    <div>
                        <p className="text-sm font-bold">Local Data</p>
                        <p className="text-xs text-zinc-500">Zustand persisted on device</p>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Setup</p>
                <p className="mt-2 text-sm font-semibold text-zinc-500">Change goals, focus lanes, and wake time.</p>
                <button
                    type="button"
                    onClick={handleRerunOnboarding}
                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#C8FF00]/40 bg-[#141414] text-xs font-black uppercase tracking-[0.16em] text-[#C8FF00]"
                >
                    <RotateCcw className="h-4 w-4" />
                    RERUN ONBOARDING
                </button>
            </section>

            <button
                type="button"
                onClick={() => { void handleSignOut(); }}
                disabled={isSigningOut}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#FF4444]/60 bg-[#141414] text-xs font-black uppercase tracking-[0.16em] text-[#FF4444] disabled:opacity-60"
            >
                <LogOut className="h-4 w-4" />
                {isSigningOut ? 'SIGNING OUT' : 'LOG OUT'}
            </button>
        </div>
    );
}
