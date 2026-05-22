import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PillButton } from '@/components/ui/PillButton';
import { useAppStore } from '@/store/useAppStore';
import { useProgramStore } from '@/store/useProgramStore';
import { cn } from '@/lib/utils';

const ctaStyle = { backgroundColor: '#C8FF00', color: '#000000' };

const PROGRAM_OPTIONS = [
    { id: 'leetcode_75', label: 'LeetCode 75', icon: '⚡' },
    { id: 'gym_progress', label: 'Gym Protocol', icon: '💪' },
    { id: 'leetcode_150', label: 'Placement Prep', icon: '📚' },
    { id: 'dsa_sheet', label: 'DSA Sheet', icon: '🎯' },
    { id: 'core_subjects', label: 'Core Subjects', icon: '🏆' },
];

const STUDY_WINDOWS = [
    { id: 'morning', label: 'MORNING', detail: '6 AM - 12 PM', time: '06:00' },
    { id: 'afternoon', label: 'AFTERNOON', detail: '12 PM - 6 PM', time: '12:00' },
    { id: 'night', label: 'NIGHT', detail: '8 PM - 2 AM', time: '20:00' },
];

export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const appUser = useAppStore((s) => s.user);
    const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
    const enrollInProgram = useProgramStore((s) => s.enrollInProgram);
    const [step, setStep] = useState(0);
    const [name, setName] = useState(() => appUser?.name ?? '');
    const [goal, setGoal] = useState('all');
    const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
    const [wakeTime, setWakeTime] = useState('05:30');
    const [studyWindow, setStudyWindow] = useState(STUDY_WINDOWS[0].id);
    const [isDeploying, setIsDeploying] = useState(false);

    const selectedStudyTime = useMemo(
        () => STUDY_WINDOWS.find((item) => item.id === studyWindow)?.time ?? '06:00',
        [studyWindow],
    );

    const toggleProgram = (programId: string) => {
        setSelectedPrograms((current) => (
            current.includes(programId)
                ? current.filter((id) => id !== programId)
                : [...current, programId]
        ));
    };

    const deploySchedule = async () => {
        if (!name.trim()) {
            toast.error('Enter your name before deployment.');
            setStep(0);
            return;
        }

        setIsDeploying(true);
        try {
            for (const programId of selectedPrograms) {
                await enrollInProgram(programId, selectedStudyTime);
            }
            toast.success('Schedule deployed.');
            setStep(3); // Move to the "HERE IS HOW FORGE AI WORKS" screen
        } finally {
            setIsDeploying(false);
        }
    };

    const handleCompleteOnboarding = () => {
        setOnboardingComplete();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] px-6 py-8 text-white">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col">
                <div className="mb-8 flex gap-2">
                    {[0, 1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className={cn('h-1 flex-1 rounded-full bg-[#1C1C1C]', item <= step && 'bg-[#C8FF00]')}
                        />
                    ))}
                </div>

                {step === 0 && (
                    <section className="flex flex-1 flex-col">
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C8FF00]">FORGE AI</p>
                            <h1 className="mt-4 text-4xl font-black uppercase leading-tight">Built for people who are building themselves.</h1>
                            <div className="mt-10 space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Your name</label>
                                <Input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className="h-13 border-zinc-800 bg-[#141414] text-lg font-bold text-white focus-visible:ring-[#C8FF00]"
                                />
                            </div>
                            <div className="mt-8 space-y-3">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">What are you working towards?</p>
                                {[
                                    ['placement', 'Placement / Job hunting'],
                                    ['consistency', 'Building consistency'],
                                    ['fitness', 'Getting fit'],
                                    ['all', 'All of the above'],
                                ].map(([id, label]) => (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setGoal(id)}
                                        className={cn(
                                            'flex h-13 w-full items-center justify-between rounded-lg border border-zinc-800 bg-[#141414] px-4 text-left text-sm font-black uppercase',
                                            goal === id && 'border-[#C8FF00] text-[#C8FF00]',
                                        )}
                                    >
                                        {label}
                                        {goal === id && <Check className="h-4 w-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <PillButton
                            onClick={() => {
                                if (!name.trim()) {
                                    toast.error('Enter your name.');
                                    return;
                                }
                                setStep(1);
                            }}
                            className="mt-8 h-13 w-full text-sm font-black uppercase"
                            style={ctaStyle}
                        >
                            BEGIN
                        </PillButton>
                    </section>
                )}

                {step === 1 && (
                    <section className="flex flex-1 flex-col">
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C8FF00]">Activate Programs</p>
                            <h1 className="mt-4 text-3xl font-black uppercase leading-tight">Choose curated routines.</h1>
                            <p className="mt-3 text-sm font-bold leading-6 text-zinc-500">Structure your life in seconds. Pick a stack and Forge deploys the daily ops.</p>
                            <div className="mt-8 grid grid-cols-2 gap-3">
                                {PROGRAM_OPTIONS.map((program) => {
                                    const active = selectedPrograms.includes(program.id);
                                    return (
                                        <button
                                            key={program.id}
                                            type="button"
                                            onClick={() => toggleProgram(program.id)}
                                            className={cn(
                                                'min-h-28 rounded-xl border border-zinc-800 bg-[#141414] p-4 text-left',
                                                active && 'border-[#C8FF00] bg-[#1C1C1C]',
                                            )}
                                        >
                                            <span className="text-2xl">{program.icon}</span>
                                            <span className="mt-3 block text-sm font-black uppercase leading-tight">{program.label}</span>
                                            {active && <Check className="mt-3 h-4 w-4 text-[#C8FF00]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <PillButton
                            onClick={() => setStep(2)}
                            className="mt-8 h-13 w-full text-sm font-black uppercase"
                            style={ctaStyle}
                        >
                            CONTINUE
                        </PillButton>
                    </section>
                )}

                {step === 2 && (
                    <section className="flex flex-1 flex-col">
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C8FF00]">Daily Ops</p>
                            <h1 className="mt-4 text-3xl font-black uppercase leading-tight">When do you start your day?</h1>
                            <div className="mt-10 space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Wake up time</label>
                                <Input
                                    type="time"
                                    value={wakeTime}
                                    onChange={(event) => setWakeTime(event.target.value)}
                                    className="h-13 border-zinc-800 bg-[#141414] text-lg font-bold text-white focus-visible:ring-[#C8FF00]"
                                />
                            </div>
                            <div className="mt-8 space-y-3">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">When do you study/code?</p>
                                {STUDY_WINDOWS.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setStudyWindow(item.id)}
                                        className={cn(
                                            'flex h-14 w-full items-center justify-between rounded-lg border border-zinc-800 bg-[#141414] px-4 text-left',
                                            studyWindow === item.id && 'border-[#C8FF00]',
                                        )}
                                    >
                                        <span>
                                            <span className="block text-sm font-black">{item.label}</span>
                                            <span className="text-xs font-bold text-zinc-500">{item.detail}</span>
                                        </span>
                                        {studyWindow === item.id && <Check className="h-4 w-4 text-[#C8FF00]" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <PillButton
                            onClick={() => { void deploySchedule(); }}
                            disabled={isDeploying}
                            className="mt-8 h-13 w-full text-sm font-black uppercase disabled:opacity-50"
                            style={ctaStyle}
                        >
                            {isDeploying ? 'DEPLOYING' : 'DEPLOY MY SCHEDULE'}
                        </PillButton>
                    </section>
                )}

                {step === 3 && (
                    <section className="flex flex-1 flex-col">
                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C8FF00] text-center">Operation Brief</p>
                            <h1 className="mt-4 text-3xl font-black uppercase leading-tight text-center">Here is how Forge AI works</h1>

                            <div className="mt-10 space-y-6">
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl mt-1">🎯</span>
                                    <div>
                                        <p className="text-sm font-black uppercase">Activate a Program</p>
                                        <p className="text-xs font-bold text-zinc-500 mt-1 leading-relaxed">your day gets scheduled automatically</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl mt-1">✅</span>
                                    <div>
                                        <p className="text-sm font-black uppercase">Complete Daily Habits</p>
                                        <p className="text-xs font-bold text-zinc-500 mt-1 leading-relaxed">earn XP and build streaks</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl mt-1">⚡</span>
                                    <div>
                                        <p className="text-sm font-black uppercase">Deploy Missions</p>
                                        <p className="text-xs font-bold text-zinc-500 mt-1 leading-relaxed">track your goals on the Kanban board</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <PillButton
                            onClick={handleCompleteOnboarding}
                            className="mt-8 h-13 w-full text-sm font-black uppercase shadow-[0_0_15px_rgba(200,255,0,0.5)]"
                            style={ctaStyle}
                        >
                            GOT IT. LET'S GO.
                        </PillButton>
                    </section>
                )}
            </div>
        </div>
    );
};
