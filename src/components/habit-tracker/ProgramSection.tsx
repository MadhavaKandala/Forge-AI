import React from 'react';
import { ArrowRight, Trophy, Zap, Sunrise } from 'lucide-react';

const programs = [
    {
        title: "75 Hard",
        subtitle: "Mental Toughness",
        icon: <Trophy className="w-6 h-6 text-white" />,
        gradient: "from-purple-600 to-blue-600",
        progress: 75
    },
    {
        title: "Morning Routine",
        subtitle: "Start Strong",
        icon: <Sunrise className="w-6 h-6 text-white" />,
        gradient: "from-red-600 to-orange-500",
        progress: 30
    },
    {
        title: "Productivity",
        subtitle: "Get Things Done",
        icon: <Zap className="w-6 h-6 text-white" />,
        gradient: "from-green-500 to-emerald-700",
        progress: 45
    }
];

export const ProgramSection = () => {
    return (
        <div className="w-full pl-6 mb-24 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-between mb-4 pr-6">
                <h2 className="text-lg font-bold text-white">Active Programs</h2>
                <button className="text-[#dfff4f] text-sm font-bold">See all</button>
            </div>

            <div className="flex gap-4 w-max pr-6">
                {programs.map((program, idx) => (
                    <div key={idx} className="w-[180px] p-4 bg-[#18181B] border border-[#27272A] rounded-2xl flex flex-col justify-between h-[200px] relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-br ${program.gradient} opacity-80 z-0`}></div>

                        <div className="relative z-10 mt-8">
                            <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center mb-3">
                                {program.icon}
                            </div>

                            <h3 className="text-white font-bold text-lg leading-tight mb-1">{program.title}</h3>
                            <p className="text-zinc-400 text-xs">{program.subtitle}</p>
                        </div>

                        <div className="relative z-10 mt-3 w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-white" style={{ width: `${program.progress}%` }}></div>
                        </div>
                    </div>
                ))}

                <div className="w-[60px] h-[200px] flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border border-dashed border-zinc-700 flex items-center justify-center">
                        <ArrowRight className="text-zinc-500 w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};
