import React, { useEffect } from 'react';
import { ArrowRight, Trophy, Zap, Sunrise, ChevronRight } from 'lucide-react';
import { useProgramStore } from '../../store/useProgramStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ProgramSectionProps {
    onSeeAll: () => void;
}

const gradientMap: Record<string, string> = {
    'leetcode_75': 'from-purple-600/20 to-blue-600/20',
    'gym_progress': 'from-red-600/20 to-orange-500/20',
    'gita_journey': 'from-amber-500/20 to-yellow-600/20',
    'nutrition_mastery': 'from-emerald-500/20 to-green-600/20',
    'academic_excellence': 'from-blue-500/20 to-indigo-600/20',
    'creative_skills': 'from-pink-500/20 to-rose-600/20',
    'productivity_master': 'from-cyan-500/20 to-teal-600/20',
};

export const ProgramSection = ({ onSeeAll }: ProgramSectionProps) => {
    const navigate = useNavigate();
    const { activePrograms, fetchActivePrograms } = useProgramStore();

    useEffect(() => {
        fetchActivePrograms();
    }, []);

    const fallbackPrograms = [
        { id: 'demo1', name: "75 Hard", icon: "🏆", programType: 'leetcode_75', completionPercentage: 0 },
        { id: 'demo2', name: "Morning", icon: "🌅", programType: 'morning_routine', completionPercentage: 0 },
        { id: 'demo3', name: "Prod", icon: "⚡", programType: 'productivity_master', completionPercentage: 0 }
    ];

    const displayPrograms = activePrograms.length > 0 ? activePrograms : fallbackPrograms;
    const isFallback = activePrograms.length === 0;

    return (
        <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-3 px-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Live Programs</h2>
                <button
                    onClick={onSeeAll}
                    className="text-[#dfff4f] text-[10px] font-bold uppercase tracking-wider hover:underline"
                >
                    View All
                </button>
            </div>

            <div className="overflow-x-auto no-scrollbar px-6">
                <div className="flex gap-3 w-max">
                    {displayPrograms.map((program) => {
                        const gradient = gradientMap[program.programType] || 'from-purple-600/20 to-blue-600/20';

                        return (
                            <div
                                key={program.id}
                                className={cn(
                                    "flex items-center gap-3 p-2 bg-[#18181B] border border-[#27272A] rounded-xl cursor-pointer active:scale-95 transition-all w-[140px]",
                                    `bg-gradient-to-br ${gradient}`
                                )}
                                onClick={() => {
                                    if (isFallback) {
                                        onSeeAll();
                                    } else {
                                        navigate(`/programs/${program.id}`);
                                    }
                                }}
                            >
                                <span className="text-xl shrink-0">{program.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-xs truncate uppercase tracking-tighter">{program.name}</h3>
                                    <div className="w-full bg-zinc-800 h-1 rounded-full mt-1 overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${program.completionPercentage || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
