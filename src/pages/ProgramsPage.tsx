import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    BadgeCheck,
    CalendarDays,
    Check,
    Clock,
    Flame,
    Plus,
    Search,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import CreateProgramModal from '@/components/CreateProgramModal';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { type Program, type ProgramTemplate } from '@/services/programService';
import { type ProgramEnrollment, useProgramStore } from '@/store/useProgramStore';

type ProgramUiCategory = 'fitness' | 'coding' | 'work' | 'wellness' | 'custom';
type CategoryFilter = 'all' | ProgramUiCategory;

const CATEGORY_FILTERS: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'ALL' },
    { id: 'fitness', label: 'FITNESS' },
    { id: 'coding', label: 'CODING' },
    { id: 'work', label: 'WORK' },
    { id: 'wellness', label: 'WELLNESS' },
    { id: 'custom', label: 'CUSTOM' },
];

const PROGRAM_CATEGORY_BY_TYPE: Record<string, Exclude<ProgramUiCategory, 'custom'>> = {
    leetcode_75: 'coding',
    leetcode_150: 'coding',
    dsa_sheet: 'coding',
    core_subjects: 'coding',
    hard_75: 'fitness',
    gym_progress: 'fitness',
    morning_protocol: 'wellness',
    hundred_day_challenge: 'wellness',
    'demo-morning-protocol': 'wellness',
    work_daily_checklist: 'work',
};

const CATEGORY_CHIP_CLASS: Record<ProgramUiCategory, string> = {
    fitness: 'bg-[#F97316] text-black',
    coding: 'bg-[#2563EB] text-white',
    wellness: 'bg-[#22C55E] text-black',
    work: 'bg-[#7C3AED] text-white',
    custom: 'bg-[#C8FF00] text-black',
};

const CATEGORY_LABEL: Record<ProgramUiCategory, string> = {
    fitness: 'FITNESS',
    coding: 'CODING',
    work: 'WORK',
    wellness: 'WELLNESS',
    custom: 'CUSTOM',
};

const buildTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 5; hour <= 23; hour += 1) {
        slots.push(`${String(hour).padStart(2, '0')}:00`);
        if (hour !== 23) slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
    return slots;
};

const to12h = (time24: string): string => {
    const [hRaw, min] = time24.split(':').map(Number);
    const suffix = hRaw >= 12 ? 'PM' : 'AM';
    const h12 = hRaw % 12 === 0 ? 12 : hRaw % 12;
    return `${h12}:${String(min).padStart(2, '0')} ${suffix}`;
};

const todayKey = (): string => new Date().toISOString().split('T')[0];

const normalizeCategory = (category?: string): Exclude<ProgramUiCategory, 'custom'> => {
    if (category === 'fitness') return 'fitness';
    if (category === 'coding' || category === 'learning') return 'coding';
    if (category === 'work') return 'work';
    return 'wellness';
};

const getProgramCategory = (program: ProgramTemplate): Exclude<ProgramUiCategory, 'custom'> => (
    PROGRAM_CATEGORY_BY_TYPE[program.type] ?? normalizeCategory(program.category)
);

const getDisplayCategory = (program: ProgramTemplate): ProgramUiCategory => (
    program.isCustom ? 'custom' : getProgramCategory(program)
);

const isOngoingProgram = (program: ProgramTemplate): boolean => Boolean(program.isOngoing) || program.days >= 3650;

const getDurationLabel = (program: ProgramTemplate): string => (
    isOngoingProgram(program) ? 'ONGOING' : `${program.days} DAYS`
);

const getRequirementTime = (program: ProgramTemplate, requirement: string, fallbackTime = '09:00'): string => (
    program.dailyRequirementTimes?.[requirement] ?? fallbackTime
);

const getProgress = (program: ProgramTemplate, enrollment?: ProgramEnrollment): number => {
    if (isOngoingProgram(program)) return 100;
    const currentDay = enrollment?.currentDay ?? 1;
    return Math.min((currentDay / Math.max(program.days, 1)) * 100, 100);
};

const activeToTemplate = (program: Program): ProgramTemplate => ({
    type: program.programType,
    name: program.name,
    description: program.description,
    days: program.totalDays,
    icon: program.icon ?? '🎯',
    difficulty: (program.difficulty as ProgramTemplate['difficulty']) ?? 'beginner',
    category: (program.category as ProgramTemplate['category']) ?? 'wellness',
    dailyRequirements: program.dailyRequirements ?? [],
    phases: program.phases,
    totalXpPotential: program.totalXpPotential,
    isOngoing: program.totalDays >= 3650,
});

const estimateCompletion = (program: ProgramTemplate, enrollment?: ProgramEnrollment): string => {
    if (!enrollment || isOngoingProgram(program)) return 'ONGOING PROTOCOL';
    const date = new Date(enrollment.startedAt);
    date.setDate(date.getDate() + Math.max(program.days - enrollment.currentDay, 0));
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).toUpperCase();
};

const SectionLabel = ({ children, neon = false }: { children: React.ReactNode; neon?: boolean }) => (
    <h2
        className={cn(
            'text-[10px] font-black uppercase tracking-[0.22em]',
            neon ? 'text-[#C8FF00]' : 'text-zinc-500',
        )}
    >
        {children}
    </h2>
);

const RequirementBullet = ({ title, time }: { title: string; time: string }) => (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-[#141414] p-3">
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C8FF00]" />
        <div className="min-w-0 flex-1">
            <p className="text-sm font-black leading-5 text-white">{title}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">{to12h(time)}</p>
        </div>
    </div>
);

export default function ProgramsPage() {
    const {
        activePrograms,
        availablePrograms,
        enrollments,
        requirementCompletions,
        fetchAll,
        enrollInProgram,
        unenrollFromProgram,
        toggleRequirementCompletion,
    } = useProgramStore(
        useShallow((s) => ({
            activePrograms: s.activePrograms,
            availablePrograms: s.availablePrograms,
            enrollments: s.enrollments,
            requirementCompletions: s.requirementCompletions,
            fetchAll: s.fetchAll,
            enrollInProgram: s.enrollInProgram,
            unenrollFromProgram: s.unenrollFromProgram,
            toggleRequirementCompletion: s.toggleRequirementCompletion,
        })),
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [deploymentProgram, setDeploymentProgram] = useState<ProgramTemplate | null>(null);
    const [detailProgram, setDetailProgram] = useState<ProgramTemplate | null>(null);
    const [selectedTime, setSelectedTime] = useState('09:00');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [pulseProgramId, setPulseProgramId] = useState<string | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dateKey = useMemo(todayKey, []);
    const timeSlots = useMemo(buildTimeSlots, []);

    useEffect(() => {
        void fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        if (isSearchOpen) {
            window.requestAnimationFrame(() => searchInputRef.current?.focus());
        }
    }, [isSearchOpen]);

    const enrollmentByProgramId = useMemo(
        () => new Map(enrollments.map((enrollment) => [enrollment.programId, enrollment])),
        [enrollments],
    );

    const templateById = useMemo(
        () => new Map(availablePrograms.map((program) => [program.type, program])),
        [availablePrograms],
    );

    const activeRows = useMemo(
        () => activePrograms.map((program) => ({
            active: program,
            template: templateById.get(program.programType) ?? activeToTemplate(program),
            enrollment: enrollmentByProgramId.get(program.programType),
        })),
        [activePrograms, enrollmentByProgramId, templateById],
    );

    const activeProgramIds = useMemo(
        () => new Set(enrollments.map((enrollment) => enrollment.programId)),
        [enrollments],
    );

    const filteredPrograms = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return availablePrograms.filter((program) => {
            const matchesSearch = !query || program.name.toLowerCase().includes(query);
            const matchesCategory = categoryFilter === 'all'
                || (categoryFilter === 'custom' ? Boolean(program.isCustom) : getProgramCategory(program) === categoryFilter);
            return matchesSearch && matchesCategory;
        });
    }, [availablePrograms, categoryFilter, searchQuery]);

    const openDeployment = useCallback((program: ProgramTemplate) => {
        const defaultTime = program.dailyRequirements[0]
            ? getRequirementTime(program, program.dailyRequirements[0], '09:00')
            : '09:00';
        setSelectedTime(defaultTime);
        setDeploymentProgram(program);
        setPulseProgramId(program.type);
        window.setTimeout(() => {
            setPulseProgramId((current) => (current === program.type ? null : current));
        }, 360);
        toast.info('Deployment briefing opened.');
    }, []);

    const handleDeploy = useCallback(async () => {
        if (!deploymentProgram) return;
        await enrollInProgram(deploymentProgram.type, selectedTime);
        setDeploymentProgram(null);
    }, [deploymentProgram, enrollInProgram, selectedTime]);

    const handleDeactivate = useCallback(async (program: ProgramTemplate) => {
        const enrollment = enrollmentByProgramId.get(program.type);
        if (!enrollment) {
            toast.error('Program is not active.');
            return;
        }
        await unenrollFromProgram(enrollment.id);
    }, [enrollmentByProgramId, unenrollFromProgram]);

    const handleCategorySelect = useCallback((filter: CategoryFilter) => {
        setCategoryFilter(filter);
        toast.success(`${CATEGORY_FILTERS.find((item) => item.id === filter)?.label ?? 'ALL'} programs filtered.`);
    }, []);

    const handleSearchToggle = useCallback(() => {
        setIsSearchOpen((open) => {
            const nextOpen = !open;
            if (!nextOpen) setSearchQuery('');
            toast.info(nextOpen ? 'Search armed.' : 'Search cleared.');
            return nextOpen;
        });
    }, []);

    const handleOpenCreate = useCallback(() => {
        setIsCreateOpen(true);
        toast.info('New program builder opened.');
    }, []);

    const handleOpenDetail = useCallback((program: ProgramTemplate) => {
        setDetailProgram(program);
        toast.info('Program detail opened.');
    }, []);

    const handleCloseDetail = useCallback(() => {
        setDetailProgram(null);
        toast.info('Program detail closed.');
    }, []);

    const isRequirementComplete = useCallback((enrollmentId: string, requirement: string) => (
        requirementCompletions[enrollmentId]?.[dateKey]?.includes(requirement) ?? false
    ), [dateKey, requirementCompletions]);

    const handleRequirementToggle = useCallback((program: ProgramTemplate, requirement: string) => {
        const enrollment = enrollmentByProgramId.get(program.type);
        if (!enrollment) {
            toast.error('Deploy program before checking requirements.');
            return;
        }
        toggleRequirementCompletion(enrollment.id, requirement, dateKey);
    }, [dateKey, enrollmentByProgramId, toggleRequirementCompletion]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] px-5 pb-28 pt-7 text-white">
            <header className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl font-black uppercase tracking-[0.08em] text-white">PROGRAMS</h1>
                    <p className="mt-1 text-xs font-semibold text-zinc-500">
                        {activePrograms.length} active · {availablePrograms.length} available
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleSearchToggle}
                    aria-label={isSearchOpen ? 'Close program search' : 'Open program search'}
                    title={isSearchOpen ? 'Close search' : 'Search programs'}
                    className={cn(
                        'grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-[#141414] transition-colors',
                        isSearchOpen ? 'border-[#C8FF00] text-[#C8FF00]' : 'border-zinc-800 text-zinc-400',
                    )}
                >
                    {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </button>
            </header>

            <AnimatePresence initial={false}>
                {isSearchOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: 'easeOut' }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4">
                            <div className="flex h-12 items-center gap-3 rounded-xl border border-[#C8FF00]/40 bg-[#141414] px-3">
                                <Search className="h-4 w-4 text-[#C8FF00]" />
                                <input
                                    ref={searchInputRef}
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search programs"
                                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            toast.info('Search query cleared.');
                                        }}
                                        className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-800 text-zinc-500"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="mt-6 flex flex-col gap-7">
                <section>
                    <SectionLabel neon>ACTIVE PROGRAMS</SectionLabel>
                    <div className="mt-3">
                        {activeRows.length === 0 ? (
                            <div className="flex min-h-[170px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#C8FF00]/45 bg-[#1C1C1C] p-6 text-center shadow-[0_0_26px_rgba(200,255,0,0.06)]">
                                <div className="text-3xl">⚡</div>
                                <h3 className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-white">NO ACTIVE PROGRAMS</h3>
                                <p className="mt-2 max-w-[240px] text-xs font-semibold leading-5 text-zinc-500">
                                    Activate a program below to auto-fill your day.
                                </p>
                            </div>
                        ) : (
                            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
                                {activeRows.map(({ active, template, enrollment }, index) => {
                                    const progress = getProgress(template, enrollment);
                                    const currentDay = enrollment?.currentDay ?? active.currentDay;
                                    const streak = enrollment?.streak ?? 0;
                                    return (
                                        <motion.article
                                            key={active.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => handleOpenDetail(template)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') handleOpenDetail(template);
                                            }}
                                            initial={{ opacity: 0, x: 34 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1, duration: 0.28, ease: 'easeOut' }}
                                            className="relative flex h-[200px] min-w-[160px] flex-col rounded-xl border border-zinc-800 border-l-[3px] border-l-[#C8FF00] bg-[#1C1C1C] p-3 text-left shadow-[0_0_20px_rgba(200,255,0,0.04)]"
                                        >
                                            <span className="text-[32px] leading-none">{template.icon ?? '🎯'}</span>
                                            <h3 className="mt-3 line-clamp-2 text-sm font-black leading-5 text-white">{template.name}</h3>
                                            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.13em] text-[#C8FF00]">
                                                {isOngoingProgram(template) ? 'ONGOING' : `DAY ${currentDay} OF ${template.days}`}
                                            </p>
                                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                                <motion.div
                                                    className="h-full rounded-full bg-[#C8FF00]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.65, ease: 'easeOut' }}
                                                />
                                            </div>
                                            <p className="mt-3 text-[11px] font-black text-[#F97316]">🔥 {streak} day streak</p>
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    void handleDeactivate(template);
                                                }}
                                                className="mt-auto self-start text-[10px] font-black uppercase tracking-[0.14em] text-[#FF4444]"
                                            >
                                                DEACTIVATE
                                            </button>
                                        </motion.article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                        {CATEGORY_FILTERS.map((filter) => (
                            <button
                                key={filter.id}
                                type="button"
                                onClick={() => handleCategorySelect(filter.id)}
                                className={cn(
                                    'h-9 shrink-0 rounded-full px-4 text-[10px] font-black uppercase tracking-[0.14em] transition-colors',
                                    categoryFilter === filter.id
                                        ? 'bg-[#C8FF00] text-black'
                                        : 'border border-zinc-800 bg-[#1C1C1C] text-zinc-500',
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </section>

                <section>
                    <SectionLabel>ALL PROGRAMS</SectionLabel>
                    {filteredPrograms.length === 0 ? (
                        <div className="mt-3 rounded-2xl border border-dashed border-zinc-800 bg-[#141414] p-6 text-center">
                            <h3 className="text-sm font-black uppercase tracking-[0.1em] text-white">NO PROGRAMS MATCH</h3>
                            <p className="mt-2 text-xs font-semibold text-zinc-500">Adjust search or category filters.</p>
                        </div>
                    ) : (
                        <motion.div className="mt-3 grid grid-cols-2 gap-3">
                            {filteredPrograms.map((program, index) => {
                                const isActive = activeProgramIds.has(program.type);
                                const displayCategory = getDisplayCategory(program);
                                const pulse = pulseProgramId === program.type;
                                return (
                                    <motion.article
                                        key={program.type}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleOpenDetail(program)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') handleOpenDetail(program);
                                        }}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            borderColor: isActive ? 'rgba(200,255,0,0.72)' : 'rgba(39,39,42,1)',
                                            boxShadow: isActive
                                                ? ['0 0 0 rgba(34,197,94,0)', '0 0 22px rgba(34,197,94,0.18)', '0 0 0 rgba(34,197,94,0)']
                                                : '0 0 0 rgba(0,0,0,0)',
                                        }}
                                        transition={{ delay: index * 0.05, duration: 0.26, ease: 'easeOut' }}
                                        style={{ borderLeftWidth: isActive ? 3 : 1 }}
                                        className="flex min-h-[210px] flex-col rounded-xl border bg-[#1C1C1C] p-3 text-left"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-2xl leading-none">{program.icon ?? '🎯'}</span>
                                            <span className={cn(
                                                'rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em]',
                                                CATEGORY_CHIP_CLASS[displayCategory],
                                            )}
                                            >
                                                {CATEGORY_LABEL[displayCategory]}
                                            </span>
                                        </div>
                                        <h3 className="mt-3 line-clamp-2 text-sm font-black leading-5 text-white">{program.name}</h3>
                                        <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-4 text-zinc-500">{program.description}</p>
                                        <p className="mt-3 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">{getDurationLabel(program)}</p>

                                        <div className="mt-auto pt-4">
                                            {isActive ? (
                                                <AnimatePresence>
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="inline-flex h-9 items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#C8FF00]"
                                                    >
                                                        ACTIVE
                                                        <Check className="h-3.5 w-3.5" />
                                                    </motion.div>
                                                </AnimatePresence>
                                            ) : (
                                                <motion.button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        openDeployment(program);
                                                    }}
                                                    whileTap={{ scale: 0.95 }}
                                                    animate={pulse ? { scale: [1, 0.95, 1.05, 1] } : { scale: 1 }}
                                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                                    className="flex h-9 w-full items-center justify-center rounded-lg bg-[#C8FF00] text-[10px] font-black uppercase tracking-[0.14em] text-black"
                                                >
                                                    ACTIVATE
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </motion.div>
                    )}
                </section>

                <motion.button
                    type="button"
                    onClick={handleOpenCreate}
                    whileTap={{ scale: 0.98 }}
                    className="flex min-h-[150px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#C8FF00]/45 bg-[#1C1C1C] p-6 text-center shadow-[0_0_26px_rgba(200,255,0,0.06)]"
                >
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-[#C8FF00]/40 text-[#C8FF00]">
                        <Plus className="h-6 w-6" />
                    </span>
                    <span className="mt-4 text-sm font-black uppercase tracking-[0.12em] text-white">CREATE YOUR OWN PROGRAM</span>
                    <span className="mt-2 text-xs font-semibold text-zinc-500">Build a custom routine for any goal</span>
                </motion.button>
            </main>

            <Sheet open={!!deploymentProgram} onOpenChange={(open) => {
                if (!open) setDeploymentProgram(null);
            }}
            >
                <SheetContent
                    side="bottom"
                    className="max-h-[88vh] overflow-y-auto rounded-t-3xl border-zinc-800 bg-[#141414] px-5 pb-7 pt-6 data-[state=open]:duration-300"
                >
                    {deploymentProgram && (
                        <div className="space-y-5">
                            <SheetHeader className="pr-8 text-left">
                                <div className="text-3xl">{deploymentProgram.icon ?? '🎯'}</div>
                                <SheetTitle className="text-xl font-black uppercase tracking-[0.12em] text-white">
                                    {deploymentProgram.name}
                                </SheetTitle>
                                <SheetDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8FF00]">
                                    DEPLOYMENT BRIEFING
                                </SheetDescription>
                            </SheetHeader>

                            <p className="text-sm font-semibold leading-6 text-zinc-400">{deploymentProgram.description}</p>

                            <section className="space-y-2">
                                {deploymentProgram.dailyRequirements.map((requirement) => (
                                    <RequirementBullet
                                        key={requirement}
                                        title={requirement}
                                        time={getRequirementTime(deploymentProgram, requirement, selectedTime)}
                                    />
                                ))}
                            </section>

                            <section>
                                <SectionLabel>SELECT TIME SLOT</SectionLabel>
                                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => {
                                                setSelectedTime(slot);
                                                toast.info(`${to12h(slot)} selected.`);
                                            }}
                                            className={cn(
                                                'h-10 shrink-0 rounded-full border px-4 text-[10px] font-black uppercase tracking-[0.12em]',
                                                selectedTime === slot
                                                    ? 'border-[#C8FF00] bg-[#C8FF00] text-black'
                                                    : 'border-zinc-800 bg-[#1C1C1C] text-zinc-500',
                                            )}
                                        >
                                            {to12h(slot)}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <button
                                type="button"
                                onClick={() => void handleDeploy()}
                                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#C8FF00] text-[11px] font-black uppercase tracking-[0.16em] text-black"
                            >
                                DEPLOY PROGRAM
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDeploymentProgram(null);
                                    toast.info('Deployment cancelled.');
                                }}
                                className="w-full text-center text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500"
                            >
                                CANCEL
                            </button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <CreateProgramModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            <AnimatePresence>
                {detailProgram && (
                    <ProgramDetailOverlay
                        program={detailProgram}
                        enrollment={enrollmentByProgramId.get(detailProgram.type)}
                        isActive={activeProgramIds.has(detailProgram.type)}
                        onBack={handleCloseDetail}
                        onDeploy={() => openDeployment(detailProgram)}
                        onDeactivate={() => void handleDeactivate(detailProgram)}
                        onRequirementToggle={handleRequirementToggle}
                        isRequirementComplete={isRequirementComplete}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

interface ProgramDetailOverlayProps {
    program: ProgramTemplate;
    enrollment?: ProgramEnrollment;
    isActive: boolean;
    onBack: () => void;
    onDeploy: () => void;
    onDeactivate: () => void;
    onRequirementToggle: (program: ProgramTemplate, requirement: string) => void;
    isRequirementComplete: (enrollmentId: string, requirement: string) => boolean;
}

const ProgramDetailOverlay = ({
    program,
    enrollment,
    isActive,
    onBack,
    onDeploy,
    onDeactivate,
    onRequirementToggle,
    isRequirementComplete,
}: ProgramDetailOverlayProps) => {
    const category = getDisplayCategory(program);
    const progress = getProgress(program, enrollment);
    const currentDay = enrollment?.currentDay ?? 1;
    const preferredTime = enrollment?.preferredTime ?? '09:00';

    return (
        <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 overflow-y-auto bg-[#0A0A0A] px-5 pb-8 pt-6 text-white"
        >
            <header className="flex items-start justify-between gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Back to programs"
                    title="Back"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-zinc-800 bg-[#141414] text-[#C8FF00]"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1 text-right">
                    <div className="text-[42px] leading-none">{program.icon ?? '🎯'}</div>
                    <h2 className="mt-3 text-2xl font-black uppercase leading-tight text-white">{program.name}</h2>
                    <span className={cn(
                        'mt-3 inline-flex rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em]',
                        CATEGORY_CHIP_CLASS[category],
                    )}
                    >
                        {CATEGORY_LABEL[category]}
                    </span>
                </div>
            </header>

            <main className="mt-7 flex flex-col gap-5">
                {isActive && (
                    <section className="rounded-2xl border border-[#C8FF00]/30 bg-[#1C1C1C] p-4 shadow-[0_0_28px_rgba(200,255,0,0.08)]">
                        <SectionLabel neon>PROGRESS</SectionLabel>
                        <p className="mt-3 text-3xl font-black uppercase leading-none text-[#C8FF00]">
                            {isOngoingProgram(program) ? 'ONGOING' : `DAY ${currentDay} OF ${program.days}`}
                        </p>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                            <motion.div
                                className="h-full rounded-full bg-[#C8FF00]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-zinc-800 bg-[#141414] p-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">STREAK</p>
                                <p className="mt-2 text-sm font-black uppercase text-[#F97316]">🔥 {enrollment?.streak ?? 0} DAY STREAK</p>
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-[#141414] p-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">ETA</p>
                                <p className="mt-2 text-sm font-black uppercase text-white">{estimateCompletion(program, enrollment)}</p>
                            </div>
                        </div>
                    </section>
                )}

                <section className="rounded-2xl border border-zinc-800 bg-[#141414] p-4">
                    <SectionLabel>MISSION BRIEF</SectionLabel>
                    <p className="mt-3 text-sm font-semibold leading-6 text-zinc-400">{program.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#1C1C1C] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">
                            <CalendarDays className="h-3.5 w-3.5 text-[#C8FF00]" />
                            {getDurationLabel(program)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#1C1C1C] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">
                            <Clock className="h-3.5 w-3.5 text-[#C8FF00]" />
                            {to12h(preferredTime)}
                        </span>
                    </div>
                </section>

                <section>
                    <SectionLabel>DAILY REQUIREMENTS</SectionLabel>
                    <div className="mt-3 flex flex-col gap-3">
                        {program.dailyRequirements.map((requirement) => {
                            const checked = enrollment ? isRequirementComplete(enrollment.id, requirement) : false;
                            const time = getRequirementTime(program, requirement, preferredTime);
                            return (
                                <div
                                    key={requirement}
                                    className="flex min-h-16 items-center gap-3 rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-3 text-left"
                                >
                                    <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#C8FF00]">
                                        {to12h(time)}
                                    </span>
                                    <span className="min-w-0 flex-1 text-sm font-black leading-5 text-white">{requirement}</span>
                                    <Checkbox
                                        checked={checked}
                                        onCheckedChange={() => onRequirementToggle(program, requirement)}
                                        disabled={!isActive}
                                        className="h-6 w-6 rounded-md border-zinc-700 data-[state=checked]:border-[#C8FF00] data-[state=checked]:bg-[#C8FF00] data-[state=checked]:text-black"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </section>

                <button
                    type="button"
                    onClick={isActive ? onDeactivate : onDeploy}
                    className={cn(
                        'mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[11px] font-black uppercase tracking-[0.16em]',
                        isActive
                            ? 'border border-[#FF4444]/40 bg-[#FF4444]/10 text-[#FF4444]'
                            : 'bg-[#C8FF00] text-black',
                    )}
                >
                    {isActive ? (
                        'DEACTIVATE PROGRAM'
                    ) : (
                        <>
                            DEPLOY PROGRAM
                            <BadgeCheck className="h-4 w-4" />
                        </>
                    )}
                </button>
            </main>
        </motion.div>
    );
};
