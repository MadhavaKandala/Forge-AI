import React, { useEffect, useState } from 'react';
import { useProgramStore } from '../store/useProgramStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Trophy, Flame, Star, Play, Pause, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { getCurrentPhase, difficultyStars, type ProgramTemplate } from '../services/programService';

const gradientMap: Record<string, string> = {
    'leetcode_75': 'from-purple-600 to-blue-600',
    'gym_progress': 'from-red-600 to-orange-500',
    'gita_journey': 'from-amber-500 to-yellow-600',
    'nutrition_mastery': 'from-emerald-500 to-green-600',
    'academic_excellence': 'from-blue-500 to-indigo-600',
    'creative_skills': 'from-pink-500 to-rose-600',
    'productivity_master': 'from-cyan-500 to-teal-600',
};

export const ProgramsPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        activePrograms,
        availablePrograms,
        completedPrograms,
        fetchAll,
        startProgram,
        isLoading,
    } = useProgramStore();

    const [confirmStart, setConfirmStart] = useState<ProgramTemplate | null>(null);
    const [startingType, setStartingType] = useState<string | null>(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const handleStart = async (template: ProgramTemplate) => {
        setStartingType(template.type);
        const result = await startProgram(template.type);
        setStartingType(null);
        setConfirmStart(null);
        if (result) {
            navigate(`/programs/${result.id}`);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-md pb-32 min-h-screen bg-black">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-white">Programs</h1>
            </div>

            {/* Active Programs */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#dfff4f] animate-pulse"></div>
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Active Programs ({activePrograms.length})</h2>
                </div>

                {activePrograms.length === 0 ? (
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-8 text-center">
                        <Sparkles className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400 text-sm mb-1">No active programs yet</p>
                        <p className="text-zinc-600 text-xs">Start a program below to begin your journey</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activePrograms.map(program => {
                            const gradient = gradientMap[program.programType] || 'from-purple-600 to-blue-600';
                            const phase = getCurrentPhase(program.currentDay, program.phases || []);
                            const progress = program.completionPercentage || 0;

                            return (
                                <div
                                    key={program.id}
                                    className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 relative overflow-hidden cursor-pointer active:scale-[0.99] transition-all"
                                    onClick={() => navigate(`/programs/${program.id}`)}
                                >
                                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`}></div>

                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{program.icon}</span>
                                            <div>
                                                <h3 className="font-bold text-white">{program.name}</h3>
                                                <p className="text-xs text-zinc-500">{phase?.name || program.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono bg-[#27272A] text-zinc-300 px-2.5 py-1 rounded-lg">
                                                Day {program.currentDay}/{program.totalDays}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-zinc-600" />
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <Progress value={progress} className="h-2 bg-[#27272A]" />
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-zinc-500">{Math.round(progress)}% complete</span>
                                        <span className="text-xs text-[#dfff4f] font-semibold">{program.xpEarned} XP earned</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Suggested Programs */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Suggested Programs ({availablePrograms.length})</h2>
                </div>

                <div className="space-y-3">
                    {availablePrograms.map(template => {
                        const gradient = gradientMap[template.type] || 'from-purple-600 to-blue-600';
                        const isStarting = startingType === template.type;

                        return (
                            <div key={template.type} className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden">
                                {/* Gradient top bar */}
                                <div className={`h-1.5 bg-gradient-to-r ${gradient}`}></div>

                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className="text-2xl">{template.icon}</span>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white mb-0.5">{template.name}</h3>
                                                <div className="flex items-center gap-3 text-xs text-zinc-500">
                                                    <span className="flex items-center gap-1">
                                                        <Flame className="w-3 h-3 text-orange-500" />
                                                        {template.days} Days
                                                    </span>
                                                    <span>{difficultyStars(template.difficulty)}</span>
                                                    <span className="text-[#dfff4f]">{template.totalXpPotential.toLocaleString()} XP</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            className="bg-[#dfff4f] text-black font-bold hover:bg-[#ccee3e] rounded-xl px-4"
                                            disabled={isStarting}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirmStart(template);
                                            }}
                                        >
                                            {isStarting ? (
                                                <span className="animate-pulse">Starting...</span>
                                            ) : (
                                                <>
                                                    <Play className="w-3 h-3 mr-1" />
                                                    Start
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{template.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Completed Programs */}
            {completedPrograms.length > 0 && (
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Completed ({completedPrograms.length})</h2>
                    </div>

                    <div className="space-y-3">
                        {completedPrograms.map(program => (
                            <div
                                key={program.id}
                                className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 opacity-80 cursor-pointer"
                                onClick={() => navigate(`/programs/${program.id}`)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{program.icon}</span>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white text-sm">{program.name}</h3>
                                        <p className="text-xs text-green-400">{program.xpEarned} XP earned ✅</p>
                                    </div>
                                    <span className="text-xs text-zinc-500">{program.totalDays} days</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Confirmation Modal */}
            {confirmStart && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmStart(null)}>
                    <div
                        className="w-full max-w-md bg-[#18181B] border border-[#27272A] rounded-3xl p-6 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-6"></div>

                        <div className="text-center mb-6">
                            <span className="text-5xl mb-4 block">{confirmStart.icon}</span>
                            <h2 className="text-xl font-bold text-white mb-2">Start {confirmStart.name}?</h2>
                            <p className="text-sm text-zinc-400 mb-4">{confirmStart.description}</p>

                            <div className="flex justify-center gap-6 text-xs text-zinc-500 mb-4">
                                <div className="flex flex-col items-center gap-1">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span>{confirmStart.days} Days</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <Star className="w-4 h-4 text-amber-400" />
                                    <span>{difficultyStars(confirmStart.difficulty)}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <Trophy className="w-4 h-4 text-[#dfff4f]" />
                                    <span>{confirmStart.totalXpPotential.toLocaleString()} XP</span>
                                </div>
                            </div>

                            <div className="bg-[#0a0a0a] rounded-xl p-3 mb-4 text-left">
                                <p className="text-xs text-zinc-500 font-semibold mb-2">DAILY REQUIREMENTS</p>
                                {confirmStart.dailyRequirements.map((req, i) => (
                                    <p key={i} className="text-xs text-zinc-300 mb-1">☐ {req}</p>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-zinc-700 text-zinc-400 rounded-xl"
                                onClick={() => setConfirmStart(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-[#dfff4f] text-black font-bold hover:bg-[#ccee3e] rounded-xl"
                                onClick={() => handleStart(confirmStart)}
                                disabled={!!startingType}
                            >
                                {startingType ? 'Starting...' : '🚀 Start Program'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramsPage;
