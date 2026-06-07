import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { animate, AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import { BottomSheet } from '@/components/ui/BottomSheet';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { GOAL_OPTIONS, SUBCATEGORY_OPTIONS, type OnboardingGoalId } from '@/lib/onboarding';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useHabitStore } from '@/store/useHabitStore';
import { useProgramStore } from '@/store/useProgramStore';
import { useUserStore } from '@/store/useUserStore';

const LEVELS = [
    { min: 0, next: 1000, title: 'RECRUIT', icon: '⚡' },
    { min: 1000, next: 2500, title: 'WARRIOR', icon: '⚡' },
    { min: 2500, next: 5000, title: 'ELITE', icon: '⚡' },
    { min: 5000, next: 10000, title: 'LEGEND', icon: '⚡' },
    { min: 10000, next: null, title: 'MASTER', icon: '⚡' },
] as const;

const QUICK_WAKE_TIMES = ['04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30'];
const goalById = new Map(GOAL_OPTIONS.map((goal) => [goal.id, goal]));

const isGoalId = (value: string): value is OnboardingGoalId => goalById.has(value as OnboardingGoalId);

const formatWakeTime = (time: string): string => {
    const [rawHour, rawMinute] = time.split(':').map(Number);
    if (Number.isNaN(rawHour) || Number.isNaN(rawMinute)) return time;
    const suffix = rawHour >= 12 ? 'PM' : 'AM';
    const hour = rawHour % 12 === 0 ? 12 : rawHour % 12;
    return `${hour}:${String(rawMinute).padStart(2, '0')} ${suffix}`;
};

const getLevelInfo = (xp: number) => {
    const level = LEVELS.reduce((current, item) => (xp >= item.min ? item : current), LEVELS[0]);
    const nextLevelXP = level.next ?? Math.max(xp, level.min);
    const progress = level.next
        ? Math.min(100, Math.max(0, ((xp - level.min) / (level.next - level.min)) * 100))
        : 100;

    return { ...level, nextLevelXP, progress };
};

const getInitial = (name: string): string => (name.trim().charAt(0) || 'O').toUpperCase();

const completedMissionCount = (tasks: { completed?: boolean; status?: string }[]): number => (
    tasks.filter((task) => task.completed || task.status === 'completed' || task.status === 'done').length
);

const AnimatedNumber = memo(({ value, delay = 0 }: { value: number; delay?: number }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            delay,
            duration: 1,
            ease: 'easeOut',
            onUpdate: (latest) => setDisplayValue(Math.round(latest)),
        });

        return () => controls.stop();
    }, [delay, value]);

    return <>{displayValue.toLocaleString()}</>;
});

AnimatedNumber.displayName = 'AnimatedNumber';

const SectionLabel = memo(({ children }: { children: ReactNode }) => (
    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#666666]">{children}</p>
));

SectionLabel.displayName = 'SectionLabel';

interface SettingRowProps {
    icon: string;
    label: string;
    right: ReactNode;
    onClick: () => void;
    index: number;
    danger?: boolean;
}

const SettingRow = memo(({ icon, label, right, onClick, index, danger = false }: SettingRowProps) => (
    <motion.button
        type="button"
        onClick={onClick}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.26, ease: 'easeOut', delay: index * 0.05 }}
        whileTap={{ scale: 0.985 }}
        className="flex min-h-[58px] w-full items-center justify-between gap-4 border-b border-[#333333] py-4 text-left last:border-b-0"
    >
        <span className="flex min-w-0 items-center gap-3">
            <span className={cn('text-lg', danger && 'text-[#FF4444]')}>{icon}</span>
            <span className={cn('truncate text-sm font-black', danger ? 'text-[#FF4444]' : 'text-white')}>
                {label}
            </span>
        </span>
        <span className="shrink-0">{right}</span>
    </motion.button>
));

SettingRow.displayName = 'SettingRow';

interface ConfirmationDialogProps {
    open: boolean;
    title: string;
    body: string;
    confirmLabel: string;
    isWorking?: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

const ConfirmationDialog = memo(({
    open,
    title,
    body,
    confirmLabel,
    isWorking = false,
    onOpenChange,
    onConfirm,
}: ConfirmationDialogProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-2rem)] rounded-xl border border-zinc-800 bg-[#141414] p-5 text-white shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            <DialogHeader>
                <DialogTitle className="text-left text-base font-black uppercase tracking-[0.14em] text-white">
                    {title}
                </DialogTitle>
                <DialogDescription className="whitespace-pre-line text-left text-sm font-semibold leading-6 text-zinc-500">
                    {body}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:space-x-0">
                <button
                    type="button"
                    onClick={() => {
                        onOpenChange(false);
                        toast.info('Action cancelled.');
                    }}
                    className="h-11 rounded-lg border border-zinc-800 bg-[#0A0A0A] text-xs font-black uppercase tracking-[0.14em] text-zinc-400"
                >
                    CANCEL
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isWorking}
                    className="h-11 rounded-lg border border-[#FF4444]/50 bg-[#FF4444]/15 text-xs font-black uppercase tracking-[0.14em] text-[#FF4444] disabled:opacity-50"
                >
                    {isWorking ? 'WORKING' : confirmLabel}
                </button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
));

ConfirmationDialog.displayName = 'ConfirmationDialog';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [activeSheet, setActiveSheet] = useState<'wake' | 'data' | 'about' | null>(null);
    const [confirmAction, setConfirmAction] = useState<'reset' | 'logout' | null>(null);
    const [pendingWakeTime, setPendingWakeTime] = useState('06:00');
    const [expandedGoalIds, setExpandedGoalIds] = useState<string[]>([]);
    const [avatarFailed, setAvatarFailed] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const {
        appUser,
        userGoals,
        userSubcategories,
        wakeTime,
        notificationsEnabled,
        moodCheckEnabled,
        signOut,
        resetOnboarding,
        startOnboardingEdit,
        setWakeTime,
        setNotificationsEnabled,
        setMoodCheckEnabled,
    } = useAppStore(
        useShallow((state) => ({
            appUser: state.user,
            userGoals: state.userGoals,
            userSubcategories: state.userSubcategories,
            wakeTime: state.wakeTime,
            notificationsEnabled: state.notificationsEnabled,
            moodCheckEnabled: state.moodCheckEnabled,
            signOut: state.signOut,
            resetOnboarding: state.resetOnboarding,
            startOnboardingEdit: state.startOnboardingEdit,
            setWakeTime: state.setWakeTime,
            setNotificationsEnabled: state.setNotificationsEnabled,
            setMoodCheckEnabled: state.setMoodCheckEnabled,
        })),
    );
    const {
        habitUser,
        habits,
        tasks,
        totalCompletions,
        totalDone,
    } = useHabitStore(
        useShallow((state) => ({
            habitUser: state.user,
            habits: state.habits,
            tasks: state.tasks,
            totalCompletions: state.totalCompletions,
            totalDone: state.totalDone,
        })),
    );
    const profileUser = useUserStore((state) => state.user);
    const { activePrograms, fetchActivePrograms } = useProgramStore(
        useShallow((state) => ({
            activePrograms: state.activePrograms,
            fetchActivePrograms: state.fetchActivePrograms,
        })),
    );

    useEffect(() => {
        void fetchActivePrograms();
    }, [fetchActivePrograms]);

    useEffect(() => {
        setPendingWakeTime(wakeTime || '06:00');
    }, [wakeTime]);

    useEffect(() => {
        setExpandedGoalIds(userGoals);
    }, [userGoals]);

    const name = appUser?.name || profileUser?.display_name || profileUser?.name || habitUser?.name || 'Operator';
    const email = appUser?.email || profileUser?.email || 'No email linked';
    const avatarUrl = appUser?.avatar || habitUser?.avatarUrl || profileUser?.avatar_url || '';
    const xp = habitUser?.xp ?? appUser?.totalXP ?? profileUser?.total_xp ?? 0;
    const levelInfo = getLevelInfo(xp);

    const selectedGoals = useMemo(
        () => userGoals.map((goalId) => goalById.get(goalId as OnboardingGoalId)).filter(Boolean),
        [userGoals],
    );
    const completedDatesTotal = useMemo(
        () => habits.reduce((total, habit) => total + habit.completedDates.length, 0),
        [habits],
    );
    const currentStreak = useMemo(
        () => habits.reduce((max, habit) => Math.max(max, habit.streak), 0),
        [habits],
    );
    const totalHabitsCompleted = Math.max(totalCompletions ?? 0, completedDatesTotal);
    const totalMissionsCompleted = Math.max(totalDone ?? 0, completedMissionCount(tasks));
    const visiblePrograms = activePrograms.slice(0, 3);
    const hiddenProgramCount = Math.max(0, activePrograms.length - visiblePrograms.length);

    const openPrograms = useCallback(() => {
        toast.info('Opening Programs.');
        navigate('/programs');
    }, [navigate]);

    const openOnboardingEditor = useCallback(() => {
        startOnboardingEdit();
        toast.info('Opening setup editor.');
        navigate('/onboarding?returnTo=/profile');
    }, [navigate, startOnboardingEdit]);

    const toggleGoalExpanded = useCallback((goalId: string) => {
        setExpandedGoalIds((current) => {
            const isExpanded = current.includes(goalId);
            toast.info(isExpanded ? 'Focus lane collapsed.' : 'Focus lane expanded.');
            return isExpanded ? current.filter((id) => id !== goalId) : [...current, goalId];
        });
    }, []);

    const toggleNotifications = useCallback(async () => {
        const nextEnabled = !notificationsEnabled;

        if (!nextEnabled) {
            setNotificationsEnabled(false);
            toast.info('Daily reminders disabled.');
            return;
        }

        try {
            const currentStatus = await LocalNotifications.checkPermissions();
            const nextStatus = currentStatus.display === 'granted'
                ? currentStatus
                : await LocalNotifications.requestPermissions();

            if (nextStatus.display === 'granted') {
                setNotificationsEnabled(true);
                toast.success('Daily reminders armed.');
                return;
            }

            setNotificationsEnabled(false);
            toast.error('Notification permission denied.');
        } catch {
            setNotificationsEnabled(false);
            toast.error('Notifications unavailable on this device.');
        }
    }, [notificationsEnabled, setNotificationsEnabled]);

    const toggleMoodCheck = useCallback(() => {
        const nextEnabled = !moodCheckEnabled;
        setMoodCheckEnabled(nextEnabled);
        toast[nextEnabled ? 'success' : 'info'](
            nextEnabled ? 'Daily mood check armed.' : 'Daily mood check disabled.',
        );
    }, [moodCheckEnabled, setMoodCheckEnabled]);

    const openWakeSheet = useCallback(() => {
        setPendingWakeTime(wakeTime || '06:00');
        setActiveSheet('wake');
        toast.info('Wake time editor opened.');
    }, [wakeTime]);

    const saveWakeTime = useCallback(() => {
        if (!/^\d{2}:\d{2}$/.test(pendingWakeTime)) {
            toast.error('Select a valid wake time.');
            return;
        }

        setWakeTime(pendingWakeTime);
        setActiveSheet(null);
        toast.success(`Wake time synced: ${formatWakeTime(pendingWakeTime)}.`);
    }, [pendingWakeTime, setWakeTime]);

    const confirmResetOnboarding = useCallback(() => {
        resetOnboarding();
        setConfirmAction(null);
        toast.success('Setup reset. Rebuild your OS.');
        navigate('/onboarding?returnTo=/profile', { replace: true });
    }, [navigate, resetOnboarding]);

    const confirmSignOut = useCallback(async () => {
        if (isSigningOut) return;
        setIsSigningOut(true);

        try {
            await signOut();
            setConfirmAction(null);
            navigate('/', { replace: true });
        } catch {
            toast.error('Log out failed. Try again.');
        } finally {
            setIsSigningOut(false);
        }
    }, [isSigningOut, navigate, signOut]);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#0A0A0A] px-5 pb-28 pt-8 text-white">
            <main className="mx-auto max-w-md">
                <section className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border-2 border-[#C8FF00] bg-[#141414] shadow-[0_0_28px_rgba(200,255,0,0.22)]"
                    >
                        {avatarUrl && !avatarFailed ? (
                            <img
                                src={avatarUrl}
                                alt={`${name} profile`}
                                onError={() => setAvatarFailed(true)}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-[32px] font-black text-[#C8FF00]">{getInitial(name)}</span>
                        )}
                    </motion.div>

                    <h1 className="mt-4 max-w-full truncate text-[22px] font-black leading-tight text-white">{name}</h1>
                    <p className="mt-1 max-w-full truncate text-xs font-semibold text-[#666666]">{email}</p>

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.32, delay: 0.3, ease: 'easeOut' }}
                        className="mt-4 rounded-full border border-[#C8FF00]/70 bg-[#C8FF00]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#C8FF00]"
                    >
                        {levelInfo.icon} {levelInfo.title}
                    </motion.div>

                    <div className="mt-5 w-4/5">
                        <div className="h-2.5 overflow-hidden rounded-full bg-[#1C1C1C]">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${levelInfo.progress}%` }}
                                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                                className="h-full rounded-full bg-[#C8FF00] shadow-[0_0_16px_rgba(200,255,0,0.72)]"
                            />
                        </div>
                        <p className="mt-2 text-center text-[11px] font-black uppercase tracking-[0.12em] text-zinc-500">
                            {xp.toLocaleString()} / {levelInfo.nextLevelXP.toLocaleString()} XP
                        </p>
                    </div>

                    <div className="-mx-5 mt-5 flex w-[calc(100%+2.5rem)] gap-2 overflow-x-auto px-5 pb-1">
                        {selectedGoals.length > 0 ? selectedGoals.map((goal) => (
                            <span
                                key={goal.id}
                                className="shrink-0 rounded-full border border-[#C8FF00]/45 bg-[#C8FF00]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#C8FF00]"
                            >
                                {goal.emoji} {goal.title}
                            </span>
                        )) : (
                            <span className="rounded-full border border-zinc-800 bg-[#141414] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">
                                NO FOCUS LOCKED
                            </span>
                        )}
                    </div>
                </section>

                <section className="mt-8 grid grid-cols-3 overflow-hidden rounded-xl border border-zinc-800 bg-[#141414]">
                    <div className="border-r border-[#333333] p-3 text-center">
                        <p className="text-lg">🔥</p>
                        <p className="mt-1 text-2xl font-black text-white">
                            <AnimatedNumber value={currentStreak} delay={0} />
                        </p>
                        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#666666]">DAY STREAK</p>
                    </div>
                    <div className="border-r border-[#333333] p-3 text-center">
                        <p className="text-lg text-[#C8FF00]">✓</p>
                        <p className="mt-1 text-2xl font-black text-white">
                            <AnimatedNumber value={totalHabitsCompleted} delay={0.1} />
                        </p>
                        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#666666]">ALL TIME</p>
                    </div>
                    <div className="p-3 text-center">
                        <p className="text-lg">🎯</p>
                        <p className="mt-1 text-2xl font-black text-white">
                            <AnimatedNumber value={totalMissionsCompleted} delay={0.2} />
                        </p>
                        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#666666]">ALL TIME</p>
                    </div>
                </section>

                <section className="mt-8">
                    <SectionLabel>ACTIVE PROGRAMS</SectionLabel>
                    <div className="mt-3 border-y border-zinc-800">
                        {visiblePrograms.length === 0 ? (
                            <div className="py-4">
                                <p className="text-sm font-semibold text-[#666666]">No active programs</p>
                                <button
                                    type="button"
                                    onClick={openPrograms}
                                    className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#C8FF00]"
                                >
                                    → GO TO PROGRAMS
                                </button>
                            </div>
                        ) : (
                            <>
                                {visiblePrograms.map((program) => (
                                    <button
                                        key={program.id}
                                        type="button"
                                        onClick={openPrograms}
                                        className="flex min-h-[58px] w-full items-center justify-between gap-4 border-b border-[#333333] py-3 text-left last:border-b-0"
                                    >
                                        <span className="min-w-0 truncate text-sm font-black text-white">
                                            <span className="mr-2">{program.icon || '⚡'}</span>
                                            {program.name}
                                        </span>
                                        <span className="flex shrink-0 items-center gap-2">
                                            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#C8FF00]">
                                                Day {program.currentDay}
                                            </span>
                                            <span className="h-1.5 w-[60px] overflow-hidden rounded-full bg-[#1C1C1C]">
                                                <span
                                                    className="block h-full rounded-full bg-[#C8FF00]"
                                                    style={{ width: `${Math.min(100, Math.max(0, program.completionPercentage))}%` }}
                                                />
                                            </span>
                                        </span>
                                    </button>
                                ))}
                                {hiddenProgramCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={openPrograms}
                                        className="py-3 text-xs font-black uppercase tracking-[0.14em] text-zinc-500"
                                    >
                                        + {hiddenProgramCount} MORE
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </section>

                <section className="mt-8">
                    <div className="flex items-center justify-between gap-4">
                        <SectionLabel>YOUR FOCUS AREAS</SectionLabel>
                        <button
                            type="button"
                            onClick={openOnboardingEditor}
                            className="text-[11px] font-black uppercase tracking-[0.16em] text-[#C8FF00]"
                        >
                            EDIT →
                        </button>
                    </div>

                    <div className="mt-4 space-y-4">
                        {userGoals.length === 0 ? (
                            <p className="text-sm font-semibold text-[#666666]">No focus areas locked</p>
                        ) : userGoals.map((goalId) => {
                            const goal = goalById.get(goalId as OnboardingGoalId);
                            const isExpanded = expandedGoalIds.includes(goalId);
                            const subcategories = isGoalId(goalId)
                                ? SUBCATEGORY_OPTIONS[goalId].filter((item) => userSubcategories.includes(item.id))
                                : [];

                            return (
                                <div key={goalId}>
                                    <button
                                        type="button"
                                        onClick={() => toggleGoalExpanded(goalId)}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#C8FF00]/55 bg-[#141414] px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#C8FF00]"
                                    >
                                        {goal?.emoji ?? '⚡'} {goal?.title ?? goalId.replace(/_/g, ' ')}
                                        <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-90')} />
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {subcategories.length > 0 ? subcategories.map((subcategory) => (
                                                        <span
                                                            key={subcategory.id}
                                                            className="rounded-full border border-zinc-800 bg-[#1C1C1C] px-3 py-1.5 text-[11px] font-bold text-zinc-400"
                                                        >
                                                            {subcategory.label}
                                                        </span>
                                                    )) : (
                                                        <span className="rounded-full border border-zinc-800 bg-[#1C1C1C] px-3 py-1.5 text-[11px] font-bold text-zinc-500">
                                                            No subcategory selected
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-8">
                    <SectionLabel>SETTINGS</SectionLabel>
                    <div className="mt-3 border-y border-zinc-800">
                        <SettingRow
                            icon="🔔"
                            label="Daily Reminders"
                            right={(
                                <Switch
                                    checked={notificationsEnabled}
                                    className="pointer-events-none data-[state=checked]:bg-[#C8FF00] data-[state=unchecked]:bg-[#333333]"
                                />
                            )}
                            onClick={toggleNotifications}
                            index={0}
                        />
                        <SettingRow
                            icon="⏰"
                            label="Wake Up Time"
                            right={<span className="text-xs font-black uppercase tracking-[0.12em] text-[#C8FF00]">{formatWakeTime(wakeTime)}</span>}
                            onClick={openWakeSheet}
                            index={1}
                        />
                        <SettingRow
                            icon="⚡"
                            label="Daily Mood Check"
                            right={(
                                <Switch
                                    checked={moodCheckEnabled}
                                    className="pointer-events-none data-[state=checked]:bg-[#C8FF00] data-[state=unchecked]:bg-[#333333]"
                                />
                            )}
                            onClick={toggleMoodCheck}
                            index={2}
                        />
                        <SettingRow
                            icon="🛡️"
                            label="Your Data"
                            right={<span className="text-xs font-bold text-zinc-500">Local + Supabase</span>}
                            onClick={() => {
                                setActiveSheet('data');
                                toast.info('Data intel opened.');
                            }}
                            index={3}
                        />
                        <SettingRow
                            icon="ℹ️"
                            label="About Forge AI"
                            right={<span className="text-xs font-bold text-zinc-500">v1.0.0</span>}
                            onClick={() => {
                                setActiveSheet('about');
                                toast.info('About Forge AI opened.');
                            }}
                            index={4}
                        />
                    </div>
                </section>

                <section className="mt-8">
                    <SectionLabel>ACCOUNT</SectionLabel>
                    <div className="mt-3 border-y border-zinc-800">
                        <SettingRow
                            icon="🔄"
                            label="Redo Setup"
                            right={<ChevronRight className="h-4 w-4 text-zinc-600" />}
                            onClick={() => {
                                setConfirmAction('reset');
                                toast.info('Setup reset confirmation opened.');
                            }}
                            index={0}
                        />
                        <SettingRow
                            icon="→"
                            label="Log Out"
                            right={<ChevronRight className="h-4 w-4 text-[#FF4444]" />}
                            onClick={() => {
                                setConfirmAction('logout');
                                toast.info('Log out confirmation opened.');
                            }}
                            index={1}
                            danger
                        />
                    </div>
                </section>
            </main>

            <BottomSheet
                open={activeSheet === 'wake'}
                onOpenChange={(open) => setActiveSheet(open ? 'wake' : null)}
                title="WAKE TIME"
                description="Set the first Daily Ops checkpoint."
                className="border-zinc-800 bg-[#141414]"
            >
                <div className="space-y-4">
                    <input
                        type="time"
                        value={pendingWakeTime}
                        onChange={(event) => setPendingWakeTime(event.target.value)}
                        className="h-12 w-full rounded-lg border border-zinc-800 bg-[#0A0A0A] px-4 text-center text-lg font-black text-[#C8FF00] outline-none focus:border-[#C8FF00]"
                    />
                    <div className="grid grid-cols-3 gap-2">
                        {QUICK_WAKE_TIMES.map((time) => (
                            <button
                                key={time}
                                type="button"
                                onClick={() => {
                                    setPendingWakeTime(time);
                                    toast.info(`Wake time staged: ${formatWakeTime(time)}.`);
                                }}
                                className={cn(
                                    'h-10 rounded-lg border text-[11px] font-black uppercase tracking-[0.1em]',
                                    pendingWakeTime === time
                                        ? 'border-[#C8FF00] bg-[#C8FF00] text-black'
                                        : 'border-zinc-800 bg-[#0A0A0A] text-zinc-400',
                                )}
                            >
                                {formatWakeTime(time)}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={saveWakeTime}
                        className="h-12 w-full rounded-lg bg-[#C8FF00] text-xs font-black uppercase tracking-[0.16em] text-black"
                    >
                        SAVE WAKE TIME
                    </button>
                </div>
            </BottomSheet>

            <BottomSheet
                open={activeSheet === 'data'}
                onOpenChange={(open) => setActiveSheet(open ? 'data' : null)}
                title="YOUR DATA"
                description="Storage and sync status."
                className="border-zinc-800 bg-[#141414]"
            >
                <div className="space-y-5">
                    <p className="text-sm font-semibold leading-6 text-zinc-400">
                        Your data is stored locally on this device and synced with Supabase cloud.
                        Uninstalling the app removes local data. Your cloud data remains safe.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setActiveSheet(null);
                            toast.info('Data intel closed.');
                        }}
                        className="h-11 w-full rounded-lg border border-zinc-800 bg-[#0A0A0A] text-xs font-black uppercase tracking-[0.16em] text-zinc-300"
                    >
                        CLOSE
                    </button>
                </div>
            </BottomSheet>

            <BottomSheet
                open={activeSheet === 'about'}
                onOpenChange={(open) => setActiveSheet(open ? 'about' : null)}
                title="ABOUT FORGE AI"
                description="Version and source intel."
                className="border-zinc-800 bg-[#141414]"
            >
                <div className="space-y-5 text-center">
                    <p className="text-3xl font-black uppercase tracking-[0.18em] text-[#C8FF00] drop-shadow-[0_0_18px_rgba(200,255,0,0.35)]">
                        FORGE AI
                    </p>
                    <p className="text-sm font-black uppercase tracking-[0.14em] text-white">Version 1.0.0</p>
                    <p className="text-sm font-semibold leading-6 text-zinc-400">
                        Built for people who are building themselves.
                    </p>
                    <p className="break-all text-xs font-bold text-zinc-500">github.com/MadhavaKandala/Forge-AI</p>
                    <button
                        type="button"
                        onClick={() => {
                            setActiveSheet(null);
                            toast.info('About Forge AI closed.');
                        }}
                        className="h-11 w-full rounded-lg border border-zinc-800 bg-[#0A0A0A] text-xs font-black uppercase tracking-[0.16em] text-zinc-300"
                    >
                        CLOSE
                    </button>
                </div>
            </BottomSheet>

            <ConfirmationDialog
                open={confirmAction === 'reset'}
                title="REDO SETUP?"
                body={'This will reset your goals and\nprogram recommendations. Continue?'}
                confirmLabel="CONFIRM"
                onOpenChange={(open) => setConfirmAction(open ? 'reset' : null)}
                onConfirm={confirmResetOnboarding}
            />

            <ConfirmationDialog
                open={confirmAction === 'logout'}
                title="LOG OUT?"
                body={'Are you sure you want to log out?\nYour data will be saved.'}
                confirmLabel="LOG OUT"
                isWorking={isSigningOut}
                onOpenChange={(open) => setConfirmAction(open ? 'logout' : null)}
                onConfirm={() => { void confirmSignOut(); }}
            />
        </div>
    );
}
