import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { PillButton } from '@/components/ui/PillButton';
import {
    GOAL_OPTIONS,
    SUBCATEGORY_OPTIONS,
    getRecommendedPrograms,
    type OnboardingGoalId,
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

const ProgressDots = ({ step }: { step: number }) => (
    <div className="flex items-center justify-center gap-2">
        {[0, 1, 2, 3].map((item) => (
            <span
                key={item}
                className={cn(
                    'h-2.5 w-2.5 rounded-full bg-[#1C1C1C] transition-colors',
                    item === step && 'bg-[#C8FF00]',
                )}
            />
        ))}
    </div>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-[#141414] text-zinc-300"
        aria-label="Go back"
    >
        <ArrowLeft className="h-4 w-4" />
    </button>
);

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

    const toggleGoal = (goalId: OnboardingGoalId) => {
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
    };

    const toggleSubcategory = (subcategoryId: string) => {
        setSelectedSubcategories((current) => {
            const selected = current.includes(subcategoryId);
            toast[selected ? 'info' : 'success'](selected ? 'Focus removed.' : 'Focus selected.');
            return selected ? current.filter((id) => id !== subcategoryId) : [...current, subcategoryId];
        });
    };

    const toggleProgram = (programId: string) => {
        setActivatedPrograms((current) => {
            const selected = current.includes(programId);
            toast[selected ? 'info' : 'success'](selected ? 'Program skipped.' : 'Program queued.');
            return selected ? current.filter((id) => id !== programId) : [...current, programId];
        });
    };

    const continueFromGoals = () => {
        if (selectedGoals.length === 0) {
            toast.error('Select at least one goal.');
            return;
        }
        toast.success('Goals locked.');
        setStep(1);
    };

    const continueFromSubcategories = () => {
        toast.success('Focus areas locked.');
        setStep(2);
    };

    const completeSetup = async () => {
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
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] px-5 py-6 text-white">
            <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col">
                <ProgressDots step={step} />

                {step === 0 && (
                    <section className="flex flex-1 flex-col">
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
                                        <button
                                            key={goal.id}
                                            type="button"
                                            onClick={() => toggleGoal(goal.id)}
                                            className={cn(
                                                'relative min-h-[142px] rounded-xl border border-zinc-800 bg-[#141414] p-3 text-left transition-colors',
                                                selected && 'border-[#C8FF00] bg-[#1C1C1C] shadow-[0_0_20px_rgba(200,255,0,0.10)]',
                                            )}
                                        >
                                            <span className="text-2xl">{goal.emoji}</span>
                                            <span className="mt-3 block text-sm font-black uppercase leading-tight">
                                                {goal.title}
                                            </span>
                                            <span className="mt-2 block text-xs font-semibold leading-5 text-zinc-500">
                                                {goal.subtitle}
                                            </span>
                                            {selected && (
                                                <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[#C8FF00] text-black">
                                                    <Check className="h-4 w-4" />
                                                </span>
                                            )}
                                        </button>
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
                    </section>
                )}

                {step === 1 && (
                    <section className="flex flex-1 flex-col">
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
                                                        <button
                                                            key={subcategory.id}
                                                            type="button"
                                                            onClick={() => toggleSubcategory(subcategory.id)}
                                                            className={cn(
                                                                'rounded-full border border-zinc-800 bg-[#141414] px-4 py-2 text-xs font-black uppercase text-zinc-300',
                                                                selected && 'border-[#C8FF00] bg-[#C8FF00] text-black',
                                                            )}
                                                        >
                                                            {subcategory.label}
                                                        </button>
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
                    </section>
                )}

                {step === 2 && (
                    <section className="flex flex-1 flex-col">
                        <div className="mt-6 flex items-center justify-between">
                            <BackButton onClick={() => { toast.info('Back to focus areas.'); setStep(1); }} />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C8FF00]">RECOMMENDED SETUP</p>
                        </div>
                        <div className="flex-1 py-8">
                            <h1 className="text-3xl font-black uppercase leading-tight">Deploy your starter stack.</h1>
                            <p className="mt-3 text-sm font-semibold leading-6 text-zinc-500">
                                Activate what fits today. You can add more programs later.
                            </p>
                            <div className="mt-8 space-y-3">
                                {recommendedPrograms.map((program) => {
                                    const active = activatedPrograms.includes(program.id);
                                    return (
                                        <div key={program.id} className="rounded-xl border border-zinc-800 bg-[#141414] p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-base font-black uppercase">{program.name}</p>
                                                    <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">{program.description}</p>
                                                    <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-[#C8FF00]">{program.duration}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleProgram(program.id)}
                                                    className={cn(
                                                        'h-10 shrink-0 rounded-lg border border-[#C8FF00]/40 px-3 text-xs font-black uppercase text-[#C8FF00]',
                                                        active && 'bg-[#C8FF00] text-black',
                                                    )}
                                                >
                                                    {active ? 'ACTIVE' : 'ACTIVATE'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
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
                            Skip — I'll set up later
                        </button>
                        <PillButton
                            onClick={() => { toast.success('Setup choices saved.'); setStep(3); }}
                            className="h-13 w-full text-sm font-black uppercase"
                            style={ctaStyle}
                        >
                            CONTINUE →
                        </PillButton>
                    </section>
                )}

                {step === 3 && (
                    <section className="flex flex-1 flex-col">
                        <div className="mt-6 flex items-center justify-between">
                            <BackButton onClick={() => { toast.info('Back to setup.'); setStep(2); }} />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C8FF00]">DAILY OPS</p>
                        </div>
                        <div className="flex flex-1 flex-col justify-center py-8">
                            <h1 className="text-3xl font-black uppercase leading-tight">What time do you start your day?</h1>
                            <p className="mt-4 text-sm font-semibold leading-6 text-zinc-500">
                                This sets your Daily Ops schedule.
                            </p>
                            <div className="mt-8 max-h-72 overflow-y-auto rounded-xl border border-zinc-800 bg-[#141414] p-2">
                                {WAKE_TIMES.map((time) => {
                                    const selected = wakeTime === time;
                                    return (
                                        <button
                                            key={time}
                                            type="button"
                                            onClick={() => {
                                                setWakeTime(time);
                                                toast.success(`Wake time set to ${formatWakeTime(time)}.`);
                                            }}
                                            className={cn(
                                                'flex h-14 w-full items-center justify-between rounded-lg px-4 text-left text-lg font-black',
                                                selected ? 'bg-[#C8FF00] text-black' : 'text-white',
                                            )}
                                        >
                                            {formatWakeTime(time)}
                                            {selected && <Check className="h-5 w-5" />}
                                        </button>
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
                    </section>
                )}
            </div>
        </div>
    );
};
