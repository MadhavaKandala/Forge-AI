import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgramStore } from '../store/useProgramStore';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
    ArrowLeft, Pause, Play, CheckCircle2, Trophy,
    Flame, Clock, Target, Sparkles
} from 'lucide-react';
import { getCurrentPhase } from '../services/programService';
import { cn } from '@/lib/utils';

const gradientMap: Record<string, string> = {
    'leetcode_75': 'from-purple-600/30 to-blue-600/30',
    'gym_progress': 'from-red-600/30 to-orange-500/30',
    'gita_journey': 'from-amber-500/30 to-yellow-600/30',
    'nutrition_mastery': 'from-emerald-500/30 to-green-600/30',
    'academic_excellence': 'from-blue-500/30 to-indigo-600/30',
    'creative_skills': 'from-pink-500/30 to-rose-600/30',
    'productivity_master': 'from-cyan-500/30 to-teal-600/30',
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

    const gradient = gradientMap[program.programType] || 'from-purple-600/30 to-blue-600/30';
    const phase = getCurrentPhase(program.currentDay, program.phases || []);
    const progress = program.completionPercentage || 0;
    const completedDays = days.filter(d => d.isCompleted).length;

    let dailyRequirements: string[] = [];
    try {
        const raw = (program as any).dailyRequirements;
        if (typeof raw === 'string') {
            dailyRequirements = JSON.parse(raw);
        } else if (Array.isArray(raw)) {
            dailyRequirements = raw;
        }
    } catch { /* ignore */ }

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
        <div className="min-h-screen bg-black text-white max-w-md mx-auto md:border-x md:border-[#27272A] pb-8">
            {/* Compact Header */}
            <div className={cn("relative p-4 pt-6 border-b bg-gradient-to-br", gradient)}>
                <button
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center mb-4"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4 text-white" />
                </button>

                <div className="flex items-center gap-4">
                    <span className="text-4xl">{program.icon}</span>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold truncate uppercase tracking-tight">{program.name}</h1>
                        <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Day {program.currentDay} of {program.totalDays}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats & Progress */}
            <div className="px-4 py-4 space-y-4">
                <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-3">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Overall Progress</span>
                        <span className="text-primary font-bold text-sm tracking-tighter uppercase">{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-[#27272A]" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-2 text-center">
                        <Trophy className="w-3.5 h-3.5 text-primary mx-auto mb-1 opacity-50" />
                        <div className="text-sm font-bold">{program.xpEarned}</div>
                        <div className="text-[8px] text-zinc-600 uppercase font-black">XP Earned</div>
                    </div>
                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-2 text-center">
                        <Flame className="w-3.5 h-3.5 text-orange-500 mx-auto mb-1 opacity-50" />
                        <div className="text-sm font-bold">{completedDays}</div>
                        <div className="text-[8px] text-zinc-600 uppercase font-black">Days Done</div>
                    </div>
                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-2 text-center">
                        <Clock className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1 opacity-50" />
                        <div className="text-sm font-bold">{program.totalDays - program.currentDay}</div>
                        <div className="text-[8px] text-zinc-600 uppercase font-black">Days Left</div>
                    </div>
                </div>

                {/* Today's Mission Card */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Today's Mission</h3>
                    </div>

                    <div className="space-y-2 mb-4">
                        {dailyRequirements.map((req, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <CheckCircle2 className={cn(
                                    "w-3.5 h-3.5 mt-0.5 shrink-0",
                                    todayCompleted ? "text-primary" : "text-zinc-700"
                                )} />
                                <span className={cn(
                                    "text-xs leading-snug",
                                    todayCompleted ? "text-zinc-500 line-through" : "text-zinc-200"
                                )}>
                                    {req}
                                </span>
                            </div>
                        ))}
                    </div>

                    {!todayCompleted ? (
                        <Button
                            className="w-full bg-primary text-black font-bold h-9 text-xs uppercase tracking-wider"
                            onClick={handleComplete}
                        >
                            Complete Day {program.currentDay}
                        </Button>
                    ) : (
                        <div className="flex items-center justify-center gap-2 py-2 text-primary font-bold text-xs uppercase">
                            <Sparkles className="w-4 h-4" />
                            Mission Accomplished
                        </div>
                    )}
                </div>

                {/* Vertical Timeline for Phases */}
                <div className="pt-4">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 px-1">Phase Roadmap</h3>
                    <div className="space-y-1">
                        {program.phases?.map((p, i) => {
                            const isCurrent = phase && p.name === phase.name;
                            const isComplete = program.currentDay > p.endDay;

                            return (
                                <div key={i} className={cn(
                                    "flex items-center gap-3 p-2 rounded-lg border border-transparent",
                                    isCurrent && "bg-white/5 border-white/10"
                                )}>
                                    <div className={cn(
                                        "w-6 h-6 rounded flex items-center justify-center text-[10px] font-black",
                                        isComplete ? "bg-primary text-black" : isCurrent ? "bg-white text-black" : "bg-zinc-800 text-zinc-500"
                                    )}>
                                        {isComplete ? "✓" : i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={cn(
                                                "text-xs font-bold uppercase truncate",
                                                isComplete ? "text-zinc-500" : "text-zinc-200"
                                            )}>{p.name}</p>
                                            <span className="text-[8px] font-mono text-zinc-600">D{p.startDay}-{p.endDay}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Control Actions */}
                <div className="pt-4 flex gap-2">
                    {program.status === 'active' ? (
                        <Button
                            variant="outline"
                            className="flex-1 border-zinc-800 text-zinc-500 hover:text-white h-9 text-xs uppercase"
                            onClick={handlePauseResume}
                        >
                            <Pause className="w-3 h-3 mr-2" />
                            Pause
                        </Button>
                    ) : (
                        <Button
                            className="flex-1 bg-primary text-black h-9 text-xs uppercase font-bold"
                            onClick={handlePauseResume}
                        >
                            <Play className="w-3 h-3 mr-2" />
                            Resume
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        className="text-zinc-600 hover:text-white h-9 text-xs uppercase"
                        onClick={() => navigate(-1)}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProgramDetailPage;
