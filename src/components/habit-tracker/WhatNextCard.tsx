import React, { useEffect } from 'react';
import { useSuggesterStore } from '@/store/useSuggesterStore';
import { Target, ArrowRight, Zap, Flame, Clock, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WhatNextCard = () => {
    const { currentSuggestion, isLoading, getSuggestion } = useSuggesterStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentSuggestion) {
            getSuggestion();
        }
    }, [currentSuggestion, getSuggestion]);

    if (isLoading) {
        return (
            <div className="w-full px-6 mb-6">
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 animate-pulse">
                    <div className="h-4 w-1/3 bg-zinc-800 rounded mb-4"></div>
                    <div className="h-8 w-2/3 bg-zinc-800 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-zinc-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (!currentSuggestion || !currentSuggestion.nextAction) {
        return (
            <div className="w-full px-6 mb-8 group cursor-pointer" onClick={() => navigate('/tasks')}>
                <div className="relative bg-[#18181B] border border-dashed border-zinc-800 rounded-3xl p-6 overflow-hidden transition-all duration-300 hover:border-primary/50">
                    <div className="relative flex flex-col items-center text-center gap-3">
                        <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                            <Target className="w-5 h-5 text-zinc-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">No Active Missions</h3>
                            <p className="text-[10px] text-zinc-500 font-medium max-w-[200px]">Add a mission to activate your intelligent next-step recommendation.</p>
                        </div>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary pt-1">
                            Go to Mission Control
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { nextAction, reasoning } = currentSuggestion;

    return (
        <div className="w-full px-6 mb-8 group cursor-pointer" onClick={() => navigate('/what-next')}>
            <div className="relative bg-[#09090b] border border-[#27272A] rounded-3xl p-6 overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(223,255,79,0.1)]">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>

                <div className="relative flex flex-col gap-5">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/20 p-2 rounded-xl">
                                    <Target className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                    Recommended Action
                                </span>
                            </div>
                            {currentSuggestion.context?.isCurrentlyInBreak && (
                                <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest mt-1 ml-1 animate-pulse">
                                    <Coffee className="w-3 h-3" />
                                    Lunch & Break Block
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
                            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-[10px] font-bold text-zinc-300">
                                Optimization Active
                            </span>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-white leading-tight mb-2 group-hover:text-primary transition-colors">
                            {nextAction.title}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-zinc-400">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-medium">{nextAction.estimatedMinutes || 30} mins</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${nextAction.priority === 'high' ? 'bg-red-500' :
                                    nextAction.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`} />
                                <span className="text-[11px] font-medium uppercase tracking-wider">{nextAction.priority} Priority</span>
                            </div>
                            {nextAction.category && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-medium px-2 py-0.5 bg-zinc-800 rounded-md capitalize">
                                        {nextAction.category}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {reasoning.slice(0, 2).map((reason, i) => (
                            <div key={i} className="flex items-start gap-2 text-zinc-500">
                                <div className="mt-1 w-1 h-1 rounded-full bg-primary/40"></div>
                                <p className="text-[11px] font-medium leading-relaxed italic">
                                    {reason}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                        <div className="flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase tracking-wider">
                            <Flame className="w-3.5 h-3.5" />
                            8-day streak🔥
                        </div>
                        <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                            Complete Suggestion
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
