import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { PillButton } from '@/components/ui/PillButton';
import {
    GOAL_OPTIONS,
    SUBCATEGORY_OPTIONS,
    getRecommendedPrograms,
    type GoalOption,
    type OnboardingGoalId,
    type ProgramRecommendation,
    type SubcategoryOption,
} from '@/lib/onboarding';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useProgramStore } from '@/store/useProgramStore';

const ctaStyle = { backgroundColor: '#C8FF00', color: '#000000' };

const WAKE_TIMES = Array.from({ length: 7 }, (_, index) => {
    const hour = index + 4;
    return `${String(hour).padStart(2, '0')}:00`;
});

const formatWakeTime = (time: string) => {
    const [rawHour, rawMinute] = time.split(':').map(Number);
    const suffix = rawHour >= 12 ? 'PM' : 'AM';
    const hour = rawHour % 12 === 0 ? 12 : rawHour % 12;
    return `${hour}:${String(rawMinute).padStart(2, '0')} ${suffix}`;
};

const screenVariants = {
    enter: { opacity: 0, x: 24, filter: 'blur(6px)' },
    center: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -24, filter: 'blur(6px)' },
};

const listVariants = {
    enter: {},
    center: {
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.08,
        },
    },
};

const itemVariants = {
    enter: { opacity: 0, y: 14 },
    center: { opacity: 1, y: 0 },
};

const ProgressDots = React.memo(({ step }: { step: number }) => (
    <div className="flex items-center justify-center gap-2">
        {[0, 1, 2, 3].map((item) => (
            <motion.span
                key={item}
                layout
                animate={{
                    width: item === step ? 28 : 10,
                    backgroundColor: item === step ? '#C8FF00' : '#1C1C1C',
                    opacity: item <= step ? 1 : 0.58,
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                className="h-2.5 rounded-full"
            />
        ))}
    </div>
));

ProgressDots.displayName = 'ProgressDots';

const BackButton = React.memo(({ onClick }: { onClick: () => void }) => (
    <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.94 }}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-[#141414] text-zinc-300"
        aria-label="Go back"
    >
        <ArrowLeft className="h-4 w-4" />
    </motion.button>
));

BackButton.displayName = 'BackButton';

const GoalCard = React.memo(({
    goal,
    selected,
    onToggle,
}: {
    goal: GoalOption;
    selected: boolean;
    onToggle: (goalId: OnboardingGoalId) => void;
}) => (
    <motion.button
        type="button"
        onClick={() => onToggle(goal.id)}
        whileTap={{ scale: 0.96 }}
        animate={{
            scale: selected ? 1.015 : 1,
            boxShadow: selected ? '0 0 24px rgba(200,255,0,0.14)' : '0 0 0 rgba(0,0,0,0)',
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        aria-pressed={selected}
        className={cn(
            'relative min-h-[142px] rounded-xl border border-zinc-800 bg-[#141414] p-3 text-left transition-colors',
            selected && 'border-[#C8FF00] bg-[#1C1C1C]',
        )}
    >
        <span className="text-2xl">{goal.emoji}</span>
        <span className="mt-3 block text-sm font-black uppercase leading-tight">
            {goal.title}
        </span>
        <span className="mt-2 block text-xs font-semibold leading-5 text-zinc-500">
            {goal.subtitle}
        </span>
        <motion.span
            animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.75 }}
            transition={{ type: 'spring', stiffness: 520, damping: 24 }}
            className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[#C8FF00] text-black"
        >
            <Check className="h-4 w-4" />
        </motion.span>
    </motion.button>
));

GoalCard.displayName = 'GoalCard';

const SubcategoryChip = React.memo(({
    subcategory,
    selected,
    onToggle,
}: {
    subcategory: SubcategoryOption;
    selected: boolean;
    onToggle: (subcategoryId: string) => void;
}) => (
    <motion.button
        type="button"
        onClick={() => onToggle(subcategory.id)}
        whileTap={{ scale: 0.95 }}
        animate={{
            backgroundColor: selected ? '#C8FF00' : '#141414',
            color: selected ? '#000000' : '#D4D4D8',
            borderColor: selected ? '#C8FF00' : '#27272A',
        }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        aria-pressed={selected}
        className="rounded-full border px-4 py-2 text-xs font-black uppercase"
    >
        {subcategory.label}
    </motion.button>
));

SubcategoryChip.displayName = 'SubcategoryChip';

const ProgramCard = React.memo(({
    program,
    active,
    onToggle,
}: {
    program: ProgramRecommendation;
    active: boolean;
    onToggle: (programId: string) => void;
}) => (
    <motion.div
        variants={itemVariants}
        layout
        className={cn(
            'rounded-xl border bg-[#141414] p-4 transition-colors',
            active ? 'border-[#C8FF00] shadow-[0_0_24px_rgba(200,255,0,0.10)]' : 'border-zinc-800',
        )}
    >
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-base font-black uppercase">{program.name}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">{program.description}</p>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-[#C8FF00]">{program.duration}</p>
            </div>
            <motion.button
                type="button"
                onClick={() => onToggle(program.id)}
                whileTap={{ scale: 0.94 }}
                className={cn(
                    'h-10 shrink-0 rounded-lg border border-[#C8FF00]/40 px-3 text-xs font-black uppercase text-[#C8FF00]',
                    active && 'bg-[#C8FF00] text-black',
                )}
            >
                {active ? 'ACTIVE' : 'ACTIVATE'}
            </motion.button>
        </div>
    </motion.div>
));

ProgramCard.displayName = 'ProgramCard';

const WakeTimeOption = React.memo(({
    time,
    selected,
    onSelect,
}: {
    time: string;
    selected: boolean;
    onSelect: (time: string) => void;
}) => (
    <motion.button
        key={time}
        type="button"
        onClick={() => onSelect(time)}
        whileTap={{ scale: 0.98 }}
        animate={{
            backgroundColor: selected ? '#C8FF00' : '#141414',
            color: selected ? '#000000' : '#FFFFFF',
            borderColor: selected ? '#C8FF00' : '#27272A',
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        aria-pressed={selected}
        className="flex h-14 w-full snap-center items-center justify-between rounded-lg border px-4 text-left text-lg font-black"
    >
        {formatWakeTime(time)}
        <motion.span
            animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.75 }}
            transition={{ type: 'spring', stiffness: 520, damping: 24 }}
            className="grid h-6 w-6 place-items-center"
        >
            <Check className="h-5 w-5" />
        </motion.span>
    </motion.button>
));

WakeTimeOption.displayName = 'WakeTimeOption';

export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const completeOnboarding = useAppStore((s) => s.completeOnboarding);
    const enrollInProgram = useProgramStore((s) => s.enrollInProgram);
    const [step, setStep] = useState(0);
    const [selectedGoals, setSelectedGoals] = useState<OnboardingGoalId[]>([]);
    const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
    const [activatedPrograms, setActivatedPrograms] = useState<string[]>([]);
    const [wakeTime, setWakeTime] = useState('06:00');
    const [isCompleting, setIsCompleting] = useState(false);

    const recommendedPrograms = useMemo(
        () => getRecommendedPrograms(selectedGoals, selectedSubcategories),
        [selectedGoals, selectedSubcategories],
    );

    const toggleGoal = useCallback((goalId: OnboardingGoalId) => {
        setSelectedGoals((current) => {
            const selected = current.includes(goalId);
            const next = selected ? current.filter((id) => id !== goalId) : [...current, goalId];
            toast[selected ? 'info' : 'success'](selected ? 'Goal removed.' : 'Goal selected.');
            if (selected) {
                const allowedSubcategories = new Set(
                    next.flatMap((id) => SUBCATEGORY_OPTIONS[id].map((item) => item.id)),
                );
                setSelectedSubcategories((subcategories) => (
                    subcategories.filter((id) => allowedSubcategories.has(id))
                ));
            }
            return next;
        });
    }, []);

    const toggleSubcategory = useCallback((subcategoryId: string) => {
        setSelectedSubcategories((current) => {
            const selected = current.includes(subcategoryId);
            toast[selected ? 'info' : 'success'](selected ? 'Focus removed.' : 'Focus selected.');
            return selected ? current.filter((id) => id !== subcategoryId) : [...current, subcategoryId];
        });
    }, []);

    const toggleProgram = useCallback((programId: string) => {
        setActivatedPrograms((current) => {
            const selected = current.includes(programId);
            toast[selected ? 'info' : 'success'](selected ? 'Program skipped.' : 'Program queued.');
            return selected ? current.filter((id) => id !== programId) : [...current, programId];
        });
    }, []);

    const selectWakeTime = useCallback((time: string) => {
        setWakeTime(time);
        toast.success(`Wake time set to ${formatWakeTime(time)}.`);
    }, []);

    const continueFromGoals = useCallback(() => {
        if (selectedGoals.length === 0) {
            toast.error('Select at least one goal.');
            return;
        }
        toast.success('Goals locked.');
        setStep(1);
    }, [selectedGoals.length]);

    const continueFromSubcategories = useCallback(() => {
        toast.success('Focus areas locked.');
        setStep(2);
    }, []);

    const completeSetup = useCallback(async () => {
        setIsCompleting(true);
        try {
            for (const programId of activatedPrograms) {
                await enrollInProgram(programId, wakeTime);
            }
            completeOnboarding({
                userGoals: selectedGoals,
                userSubcategories: selectedSubcategories,
                wakeTime,
            });
            toast.success('Personal OS deployed.');
            navigate('/', { replace: true });
        } finally {
            setIsCompleting(false);
        }
    }, [activatedPrograms, completeOnboarding, enrollInProgram, navigate, selectedGoals, selectedSubcategories, wakeTime]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] px-5 py-6 text-white">
            <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col">
                <ProgressDots step={step} />

                <AnimatePresence mode="wait" initial={false}>
                {step === 0 && (
                    <motion.section
                        key="goals"
                        variants={screenVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="flex flex-1 flex-col"
                    >
                        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                            <p className="text-4xl font-black uppercase tracking-[0.16em] text-[#C8FF00] drop-shadow-[0_0_18px_rgba(200,255,0,0.35)]">
                                FORGE AI
                            </p>
                            <p className="mt-4 text-sm font-semibold text-zinc-400">
                                Let's build your personal operating system.
                            </p>
                            <h1 className="mt-10 text-xl font-black uppercase tracking-[0.08em]">
                                What are you here to work on?
                            </h1>
                            <div className="mt-6 grid w-full grid-cols-2 gap-3">
                                {GOAL_OPTIONS.map((goal) => {
                                    const selected = selectedGoals.includes(goal.id);
                                    return (
                                        <GoalCard
                                            key={goal.id}
                                            goal={goal}
                                            selected={selected}
                                            onToggle={toggleGoal}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <PillButton
                            onClick={continueFromGoals}
                            className="h-13 w-full text-sm font-black uppercase"
                            style={ctaStyle}
                        >
                            CONTINUE →
                        </PillButton>
                    </motion.section>
                )}

                {step === 1 && (
                    <motion.section
                        key="focus"
                        variants={screenVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="flex flex-1 flex-col"
                    >
                        <div className="mt-6 flex items-center justify-between">
                            <BackButton onClick={() => { toast.info('Back to goals.'); setStep(0); }} />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C8FF00]">FOCUS AREAS</p>
                        </div>
                        <div className="flex-1 py-8">
                            <h1 className="text-3xl font-black uppercase leading-tight">Choose your tactical lanes.</h1>
                            <p className="mt-3 text-sm font-semibold leading-6 text-zinc-500">
                                Pick anything that applies. Forge will shape the recommended setup around this.
                            </p>
                            <div className="mt-8 space-y-7">
                                {selectedGoals.map((goalId) => {
                                    const goal = GOAL_OPTIONS.find((item) => item.id === goalId);
                                    return (
                                        <div key={goalId}>
                                            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                                                {goal?.emoji} {goal?.title}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {SUBCATEGORY_OPTIONS[goalId].map((subcategory) => {
                                                    const selected = selectedSubcategories.includes(subcategory.id);
                                                    return (
                                                        <SubcategoryChip
                                                            key={subcategory.id}
                                                            subcategory={subcategory}
                                                            selected={selected}
                                                            onToggle={toggleSubcategory}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <PillButton
                            onClick={continueFromSubcategories}
                            className="h-13 w-full text-sm font-black uppercase"
                            style={ctaStyle}
                        >
                            CONTINUE →
                        </PillButton>
                    </motion.section>
                )}

                {step === 2 && (
                    <motion.section
                        key="programs"
                        variants={screenVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="flex flex-1 flex-col"
                    >
                        <div className="mt-6 flex items-center justify-between">
                            <BackButton onClick={() => { toast.info('Back to focus areas.'); setStep(1); }} />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C8FF00]">RECOMMENDED SETUP</p>
                        </div>
                        <div className="flex-1 py-8">
                            <h1 className="text-3xl font-black uppercase leading-tight">Deploy your starter stack.</h1>
                            <p className="mt-3 text-sm font-semibold leading-6 text-zinc-500">
                                Activate what fits today. You can add more programs later.
                            </p>
                            <motion.div className="mt-8 space-y-3" variants={listVariants}>
                                {recommendedPrograms.map((program) => {
                                    const active = activatedPrograms.includes(program.id);
                                    return (
                                        <ProgramCard
                                            key={program.id}
                                            program={program}
                                            active={active}
                                            onToggle={toggleProgram}
                                        />
                                    );
                                })}
                            </motion.div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                toast.info("Programs skipped. You can set up later.");
                                setActivatedPrograms([]);
                                setStep(3);
                            }}
                            className="mb-4 text-sm font-bold text-zinc-500"
                        >
                            SKIP - SET UP LATER
                        </button>
                        <PillButton
                            onClick={() => { toast.success('Setup choices saved.'); setStep(3); }}
                            className="h-13 w-full text-sm font-black uppercase"
                            style={ctaStyle}
                        >
                            CONTINUE →
                        </PillButton>
                    </motion.section>
                )}

                {step === 3 && (
                    <motion.section
                        key="wake-time"
                        variants={screenVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="flex flex-1 flex-col"
                    >
                        <div className="mt-6 flex items-center justify-between">
                            <BackButton onClick={() => { toast.info('Back to setup.'); setStep(2); }} />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C8FF00]">DAILY OPS</p>
                        </div>
                        <div className="flex flex-1 flex-col justify-center py-8">
                            <h1 className="text-3xl font-black uppercase leading-tight">What time do you start your day?</h1>
                            <p className="mt-4 text-sm font-semibold leading-6 text-zinc-500">
                                This sets your Daily Ops schedule.
                            </p>
                            <div className="mt-8 max-h-72 snap-y snap-mandatory space-y-2 overflow-y-auto rounded-xl border border-zinc-800 bg-[#141414] p-2">
                                {WAKE_TIMES.map((time) => {
                                    const selected = wakeTime === time;
                                    return (
                                        <WakeTimeOption
                                            key={time}
                                            time={time}
                                            selected={selected}
                                            onSelect={selectWakeTime}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <PillButton
                            onClick={() => { void completeSetup(); }}
                            disabled={isCompleting}
                            className="h-13 w-full text-sm font-black uppercase disabled:opacity-50"
                            style={ctaStyle}
                        >
                            {isCompleting ? 'DEPLOYING' : "LET'S GO →"}
                        </PillButton>
                    </motion.section>
                )}
                </AnimatePresence>
            </div>
        </div>
    );
};
