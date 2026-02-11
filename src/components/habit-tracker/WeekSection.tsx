import React from 'react';

const weekDays = [
    { day: 'M', active: false, status: 'completed' },
    { day: 'T', active: false, status: 'completed' },
    { day: 'W', active: false, status: 'completed' },
    { day: 'T', active: false, status: 'partial' },
    { day: 'F', active: false, status: 'missed' },
    { day: 'S', active: true, status: 'today' },
    { day: 'S', active: false, status: 'future' },
];

export const WeekSection = () => {
    return (
        <div className="w-full px-6 mb-8">
            <div className="w-full p-5 bg-[#18181B] border border-[#27272A] rounded-3xl">
                <div className="flex items-center gap-2 mb-6">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">This week</span>
                    </div>

                    <div className="ml-auto flex flex-col items-end">
                        <span className="text-2xl font-bold text-[#dfff4f]">86%</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Complete</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {weekDays.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${item.status === 'completed' ? 'bg-[#dfff4f] border-[#dfff4f] text-black shadow-[0_0_10px_rgba(223,255,79,0.3)]' :
                                        item.status === 'today' ? 'bg-white border-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]' :
                                            item.status === 'partial' ? 'bg-transparent border-[#dfff4f] text-zinc-500' :
                                                'bg-transparent border-[#27272A] text-zinc-700'
                                    }`}
                            >
                                {/* Circle Content could be Check icon but design implies solid/empty state */}
                            </div>
                            <span className={`text-xs font-bold font-mono ${item.status === 'today' ? 'text-white' : 'text-zinc-600'}`}>
                                {item.day}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
