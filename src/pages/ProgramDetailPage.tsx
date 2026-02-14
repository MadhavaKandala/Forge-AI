import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgramStore } from '../store/useProgramStore';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
    ArrowLeft, Pause, Play, CheckCircle2, Trophy,
    Flame, ChevronRight, Clock, Target, Sparkles
} from 'lucide-react';
import { getCurrentPhase, difficultyStars } from '../services/programService';

const gradientMap: Record<string, string> = {
    'leetcode_75': 'from-purple-600 to-blue-600',
    'gym_progress': 'from-red-600 to-orange-500',
    'gita_journey': 'from-amber-500 to-yellow-600',
    'nutrition_mastery': 'from-emerald-500 to-green-600',
    'academic_excellence': 'from-blue-500 to-indigo-600',
    'creative_skills': 'from-pink-500 to-rose-600',
    'productivity_master': 'from-cyan-500 to-teal-600',
};

export const ProgramDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        selectedProgram: program,
        selectedProgramDays: days,
        selectedProgramMilestones: milestones,
        selectProgram,
        clearSelectedProgram,
        completeDailyRequirement,
        pauseProgram,
        resumeProgram,
        isLoading,
    } = useProgramStore();

    useEffect(() => {
        if (id) selectProgram(id);
        return () => clearSelectedProgram();
    }, [id]);

    if (isLoading || !program) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-pulse text-zinc-500">Loading program...</div>
            </div>
        );
    }

    const gradient = gradientMap[program.programType] || 'from-purple-600 to-blue-600';
    const phase = getCurrentPhase(program.currentDay, program.phases || []);
    const progress = program.completionPercentage || 0;
    const completedDays = days.filter(d => d.isCompleted).length;

    // Parse daily requirements
    let dailyRequirements: string[] = [];
    try {
        const raw = (program as any).dailyRequirements;
        if (typeof raw === 'string') {
            dailyRequirements = JSON.parse(raw);
        } else if (Array.isArray(raw)) {
            dailyRequirements = raw;
        }
    } catch { /* ignore */ }

    // Check if today is already completed
    const todayCompleted = days.some(d => d.dayNumber === program.currentDay && d.isCompleted);

    const handleComplete = async () => {
        if (id) await completeDailyRequirement(id);
    };

    const handlePauseResume = async () => {
        if (!id) return;
        if (program.status === 'active') {
            await pauseProgram(id);
        } else if (program.status === 'paused') {
            await resumeProgram(id);
        }
        selectProgram(id);
    };

    return (
        <div className="min-h-screen bg-black text-white max-w-md mx-auto md:border-x md:border-[#27272A] pb-12">
            {/* Hero Banner */}
            <div className={`relative bg-gradient-to-br ${gradient} p-6 pt-12 pb-8`}>
                <button
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>

                <div className="mt-6 text-center">
                    <span className="text-5xl mb-3 block">{program.icon}</span>
                    <h1 className="text-2xl font-bold mb-1">{program.name}</h1>
                    <p className="text-white/70 text-sm">{program.description}</p>
                </div>
            </div>

            {/* Progress Section */}
            <div className="px-6 -mt-4 relative z-10">
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <span className="text-3xl font-bold text-white">Day {program.currentDay}</span>
                            <span className="text-zinc-500 text-sm"> / {program.totalDays}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-[#dfff4f] font-bold text-lg">{Math.round(progress)}%</div>
                            <div className="text-zinc-500 text-xs">Complete</div>
                        </div>
                    </div>

                    <Progress value={progress} className="h-3 bg-[#27272A] mb-3" />

                    <div className="flex justify-between text-xs text-zinc-500">
                        <span>{completedDays} days completed</span>
                        <span>{program.totalDays - program.currentDay} days remaining</span>
                    </div>
                </div>
            </div>

            {/* Current Phase */}
            {phase && (
                <div className="px-6 mt-4">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-[#dfff4f]" />
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Current Phase</h3>
                        </div>
                        <h4 className="font-bold text-white text-lg mb-1">{phase.name}</h4>
                        <p className="text-xs text-zinc-500 mb-2">{phase.description}</p>
                        <div className="flex items-center gap-4 text-xs text-zinc-400">
                            <span>Days {phase.startDay}–{phase.endDay}</span>
                            <span className="text-[#dfff4f]">+{phase.xpPerDay} XP/day</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Today's Requirements */}
            <div className="px-6 mt-4">
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-[#dfff4f]" />
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Today's Requirements</h3>
                    </div>

                    {dailyRequirements.length > 0 ? (
                        <div className="space-y-2.5 mb-4">
                            {dailyRequirements.map((req, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-colors ${todayCompleted
                                        ? 'border-[#dfff4f] bg-[#dfff4f]'
                                        : 'border-zinc-600'
                                        }`}>
                                        {todayCompleted && (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                                        )}
                                    </div>
                                    <span className={`text-sm ${todayCompleted ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                                        {req}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 mb-4">Complete today's program requirements to earn XP</p>
                    )}

                    {program.status === 'active' && !todayCompleted && (
                        <Button
                            className="w-full bg-[#dfff4f] text-black font-bold hover:bg-[#ccee3e] rounded-xl h-12 text-base"
                            onClick={handleComplete}
                        >
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Complete Day {program.currentDay}
                        </Button>
                    )}

                    {todayCompleted && (
                        <div className="bg-[#dfff4f]/10 border border-[#dfff4f]/20 rounded-xl p-3 text-center">
                            <Sparkles className="w-5 h-5 text-[#dfff4f] mx-auto mb-1" />
                            <p className="text-sm text-[#dfff4f] font-semibold">Day completed! 🎉</p>
                            <p className="text-xs text-zinc-500 mt-0.5">+{phase?.xpPerDay || 50} XP earned</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="px-6 mt-4">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 text-center">
                        <Trophy className="w-5 h-5 text-[#dfff4f] mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{program.xpEarned}</div>
                        <div className="text-[10px] text-zinc-500">XP Earned</div>
                    </div>
                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 text-center">
                        <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{completedDays}</div>
                        <div className="text-[10px] text-zinc-500">Days Done</div>
                    </div>
                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 text-center">
                        <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{program.totalDays - program.currentDay}</div>
                        <div className="text-[10px] text-zinc-500">Days Left</div>
                    </div>
                </div>
            </div>

            {/* Milestones */}
            {milestones.length > 0 && (
                <div className="px-6 mt-4">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Milestones</h3>
                        <div className="space-y-3">
                            {milestones.map((milestone: any, i: number) => (
                                <div key={milestone.id} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${milestone.isCompleted
                                        ? 'bg-[#dfff4f] text-black'
                                        : program.currentDay >= milestone.dayNumber
                                            ? 'bg-zinc-700 text-zinc-300'
                                            : 'bg-[#27272A] text-zinc-600'
                                        }`}>
                                        {milestone.isCompleted ? '✓' : i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold ${milestone.isCompleted ? 'text-[#dfff4f]' : 'text-white'}`}>
                                            {milestone.milestoneName}
                                        </p>
                                        <p className="text-xs text-zinc-500">Day {milestone.dayNumber} • +{milestone.xpReward} XP</p>
                                    </div>
                                    {milestone.isCompleted && (
                                        <CheckCircle2 className="w-5 h-5 text-[#dfff4f]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Phases Overview */}
            {program.phases && program.phases.length > 0 && (
                <div className="px-6 mt-4">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Program Phases</h3>
                        <div className="space-y-3">
                            {program.phases.map((p, i) => {
                                const isCurrent = phase && p.name === phase.name;
                                const isComplete = program.currentDay > p.endDay;

                                return (
                                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${isCurrent ? 'bg-[#dfff4f]/10 border border-[#dfff4f]/20' : ''
                                        }`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isComplete
                                            ? 'bg-green-500/20 text-green-400'
                                            : isCurrent
                                                ? 'bg-[#dfff4f]/20 text-[#dfff4f]'
                                                : 'bg-[#27272A] text-zinc-600'
                                            }`}>
                                            {isComplete ? '✓' : i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${isComplete ? 'text-green-400' : isCurrent ? 'text-[#dfff4f]' : 'text-zinc-400'
                                                }`}>{p.name}</p>
                                            <p className="text-xs text-zinc-600">Days {p.startDay}–{p.endDay} • +{p.xpPerDay} XP/day</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="px-6 mt-6 space-y-3">
                {program.status === 'active' && (
                    <Button
                        variant="outline"
                        className="w-full border-zinc-700 text-zinc-400 rounded-xl h-11"
                        onClick={handlePauseResume}
                    >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Program
                    </Button>
                )}

                {program.status === 'paused' && (
                    <Button
                        className="w-full bg-[#dfff4f] text-black font-bold hover:bg-[#ccee3e] rounded-xl h-11"
                        onClick={handlePauseResume}
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Resume Program
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ProgramDetailPage;
