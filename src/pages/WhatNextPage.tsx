import React, { useEffect } from 'react';
import { useSuggesterStore } from '@/store/useSuggesterStore';
import {
    Target,
    ChevronLeft,
    RefreshCcw,
    Zap,
    Flame,
    Clock,
    TrendingUp,
    Activity,
    Brain,
    CheckCircle2,
    Play,
    SkipForward,
    LayoutList,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const WhatNextPage = () => {
    const { currentSuggestion, isLoading, getSuggestion, lastCalculated, recordAction } = useSuggesterStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentSuggestion) {
            getSuggestion();
        }
    }, []);

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        getSuggestion();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <Brain className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Running Algorithm</h2>
                <p className="text-zinc-500 text-sm max-w-xs">Analyzing 24 data points including your energy, schedule, and momentum...</p>
            </div>
        );
    }

    if (!currentSuggestion || !currentSuggestion.nextAction) {
        return (
            <div className="min-h-screen bg-[#09090b] p-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 text-zinc-400">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back
                </Button>
                <div className="flex flex-col items-center justify-center pt-20 text-center">
                    <AlertCircle className="w-16 h-16 text-zinc-700 mb-6" />
                    <h2 className="text-xl font-black text-white mb-2 uppercase">No Actionable Tasks</h2>
                    <p className="text-zinc-500 max-w-xs mb-8">You're all caught up! Enjoy your free time or add new tasks to your list.</p>
                    <Button onClick={handleRefresh} className="bg-primary text-black font-black uppercase tracking-widest px-8">
                        <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </div>
            </div>
        );
    }

    const { nextAction, alternatives, reasoning, multiStepPlan } = currentSuggestion;

    const handleStartNow = () => {
        // Record the action and navigate to timer
        recordAction(nextAction.id, 'started');
        navigate('/pomodoro');
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white pb-32">
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-zinc-900 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Smart Suggestion
                        </h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all hover:rotate-180 duration-500"
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-8">
                {/* Context Overview */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl">
                        <div className="flex items-center gap-2 text-zinc-500 mb-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Available</span>
                        </div>
                        <p className="text-sm font-bold text-white">1h 26 min <span className="text-[10px] text-zinc-500">(before 4:30)</span></p>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl">
                        <div className="flex items-center gap-2 text-yellow-500 mb-1">
                            <Zap className="w-3 h-3" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Energy Level</span>
                        </div>
                        <p className="text-sm font-bold text-white flex items-center gap-1.5 capitalize">
                            Afternoon Peak <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        </p>
                    </div>
                </div>

                {/* Primary Suggestion - Large Card */}
                <div className="relative space-y-4 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Your Next Action</h3>
                    </div>

                    <div className="relative bg-gradient-to-b from-[#18181B] to-[#09090b] border border-primary/20 rounded-[2.5rem] p-8 overflow-hidden">
                        {/* Glow and Flourish */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] -mr-16 -mt-16 rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-[60px] -ml-8 -mb-8 rounded-full"></div>

                        <div className="relative space-y-6">
                            <div>
                                <h2 className="text-3xl font-black text-white leading-tight mb-4 tracking-tight">
                                    {nextAction.title}
                                </h2>

                                <div className="flex flex-wrap gap-3">
                                    <Badge variant="secondary" className="bg-zinc-800 border-zinc-700 text-zinc-300 font-black h-7 px-3 rounded-lg text-[10px] uppercase tracking-wider">
                                        <Clock className="w-3 h-3 mr-1.5" />
                                        {nextAction.estimatedMinutes || 30} mins
                                    </Badge>
                                    <Badge variant="secondary" className="bg-primary/10 border-primary/20 text-primary font-black h-7 px-3 rounded-lg text-[10px] uppercase tracking-wider">
                                        <TrendingUp className="w-3 h-3 mr-1.5" />
                                        Score: {nextAction.score}/100
                                    </Badge>
                                    <Badge variant="secondary" className="bg-zinc-800 border-zinc-700 text-zinc-300 font-black h-7 px-3 rounded-lg text-[10px] uppercase tracking-wider capitalize">
                                        {nextAction.category} Task
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-3 bg-zinc-900/30 backdrop-blur-md rounded-3xl p-5 border border-zinc-800/50">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-1">
                                    Why this? ✨
                                </h4>
                                <ul className="space-y-3">
                                    {reasoning.map((reason, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 ring-4 ring-primary/10" />
                                            <p className="text-xs text-zinc-300 font-medium leading-relaxed">{reason}</p>
                                        </li>
                                    ))}
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 ring-4 ring-orange-500/10" />
                                        <p className="text-xs text-zinc-300 font-medium leading-relaxed">Maintains your 8-day streak <Flame className="w-3 h-3 inline text-orange-500" /></p>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <Button onClick={handleStartNow} className="w-full bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest h-14 rounded-2xl text-xs shadow-2xl shadow-primary/20">
                                    <Play className="w-4 h-4 mr-2 fill-current" />
                                    Start Now
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="border-zinc-800 bg-transparent hover:bg-zinc-900 font-black uppercase tracking-widest h-12 rounded-2xl text-[10px] text-zinc-400">
                                        <SkipForward className="w-3.5 h-3.5 mr-2" /> Skip
                                    </Button>
                                    <Button variant="outline" className="border-zinc-800 bg-transparent hover:bg-zinc-900 font-black uppercase tracking-widest h-12 rounded-2xl text-[10px] text-zinc-400">
                                        <LayoutList className="w-3.5 h-3.5 mr-2" /> Other Options
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alternatives */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-zinc-600" />
                        Other Strong Options
                    </h3>
                    <div className="space-y-3">
                        {alternatives.map((alt, i) => (
                            <Card key={alt.id} className="bg-zinc-900/30 border-zinc-800 p-4 rounded-3xl flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">#{i + 2} Option</span>
                                        <Badge className="bg-zinc-800 text-zinc-400 text-[9px] h-5 rounded-md border-none">{alt.score}/100</Badge>
                                    </div>
                                    <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{alt.title}</h4>
                                    <p className="text-[10px] text-zinc-500 font-medium">({alt.estimatedMinutes || 30} min) - {alt.priority} priority</p>
                                </div>
                                <Button size="icon" variant="ghost" className="rounded-xl group-hover:bg-primary group-hover:text-black transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Algorithmic Day Plan */}
                <div className="bg-[#111113] border border-zinc-900 rounded-[2.5rem] p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full"></div>

                    <div className="relative space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                Optimized Day Plan
                            </h3>
                            <span className="text-[10px] font-black text-zinc-600">PROPOSED SEQUENCE</span>
                        </div>

                        <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800/50">
                            {multiStepPlan.map((step, i) => (
                                <div key={i} className="relative flex items-center gap-6 pl-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${i === 0 ? 'bg-primary border-primary text-black ring-4 ring-primary/10' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${i === 0 ? 'text-primary' : 'text-zinc-600'}`}>
                                                {step.time}
                                            </span>
                                            <span className="text-[10px] font-bold text-zinc-600">{step.duration}m</span>
                                        </div>
                                        <p className={`text-xs font-bold ${i === 0 ? 'text-white' : 'text-zinc-400'}`}>
                                            {step.task}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-zinc-900/50">
                            <p className="text-[10px] text-zinc-600 font-medium italic text-center">
                                Plan adapts in real-time based on your completion speed and energy output.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal Components Helper
const ArrowRight = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);

export default WhatNextPage;
