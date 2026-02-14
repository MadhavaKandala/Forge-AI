import React, { useEffect } from 'react';
import { ArrowRight, Trophy, Zap, Sunrise, ChevronRight } from 'lucide-react';
import { useProgramStore } from '../../store/useProgramStore';
import { useNavigate } from 'react-router-dom';

interface ProgramSectionProps {
    onSeeAll: () => void;
}

const gradientMap: Record<string, string> = {
    'leetcode_75': 'from-purple-600 to-blue-600',
    'gym_progress': 'from-red-600 to-orange-500',
    'gita_journey': 'from-amber-500 to-yellow-600',
    'nutrition_mastery': 'from-emerald-500 to-green-600',
    'academic_excellence': 'from-blue-500 to-indigo-600',
    'creative_skills': 'from-pink-500 to-rose-600',
    'productivity_master': 'from-cyan-500 to-teal-600',
};

export const ProgramSection = ({ onSeeAll }: ProgramSectionProps) => {
    const navigate = useNavigate();
    const { activePrograms, fetchActivePrograms } = useProgramStore();

    useEffect(() => {
        fetchActivePrograms();
    }, []);

    // Fallback static programs if no active ones
    const fallbackPrograms = [
        {
            id: 'demo1',
            name: "75 Hard",
            description: "Mental Toughness",
            icon: "🏆",
            programType: 'leetcode_75',
            completionPercentage: 0
        },
        {
            id: 'demo2',
            name: "Morning Routine",
            description: "Start Strong",
            icon: "🌅",
            programType: 'morning_routine',
            completionPercentage: 0
        },
        {
            id: 'demo3',
            name: "Productivity",
            description: "Get Things Done",
            icon: "⚡",
            programType: 'productivity_master',
            completionPercentage: 0
        }
    ];

    const displayPrograms = activePrograms.length > 0 ? activePrograms : fallbackPrograms;
    const isFallback = activePrograms.length === 0;

    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Active Programs</h2>
                <button
                    onClick={onSeeAll}
                    className="text-[#dfff4f] text-sm font-bold hover:underline"
                >
                    See all
                </button>
            </div>

            <div className="overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
                <div className="flex gap-4 w-max">
                    {displayPrograms.map((program, idx) => {
                        const gradient = gradientMap[program.programType] || 'from-purple-600 to-blue-600';

                        return (
                            <div
                                key={program.id}
                                className="w-[180px] h-[220px] p-4 bg-[#18181B] border border-[#27272A] rounded-2xl flex flex-col justify-between relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
                                onClick={() => {
                                    if (isFallback) {
                                        onSeeAll();
                                    } else {
                                        navigate(`/programs/${program.id}`);
                                    }
                                }}
                            >
                                <div className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-br ${gradient} opacity-80 z-0`}></div>

                                <div className="relative z-10 mt-6">
                                    <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center mb-3 text-2xl border border-white/10 shadow-lg">
                                        {program.icon}
                                    </div>

                                    <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-2">{program.name}</h3>
                                    <p className="text-zinc-400 text-xs line-clamp-1">{program.description || (program as any).category}</p>
                                </div>

                                <div className="relative z-10 mt-3 w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-white transition-all duration-1000"
                                        style={{ width: `${program.completionPercentage || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}

                    <div
                        className="w-[60px] h-[220px] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={onSeeAll}
                    >
                        <div className="w-12 h-12 rounded-full border border-dashed border-zinc-700 flex items-center justify-center bg-[#18181B]">
                            <ChevronRight className="text-zinc-500 w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
