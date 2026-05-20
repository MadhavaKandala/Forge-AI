import React from 'react';

interface SegmentedControlProps {
    activeView: 'today' | 'week' | 'month';
    onChange: (view: 'today' | 'week' | 'month') => void;
}

export const SegmentedControl = ({ activeView, onChange }: SegmentedControlProps) => {
    return (
        <div className="w-full px-6 mb-8">
            <div className="w-full p-1 bg-[#18181B] rounded-2xl flex items-center h-[52px]">
                <button
                    onClick={() => onChange('today')}
                    className={`flex-1 h-full rounded-xl text-sm font-bold transition-all ${activeView === 'today'
                            ? 'bg-[#dfff4f] text-black shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    Today
                </button>
                <button
                    onClick={() => onChange('week')}
                    className={`flex-1 h-full rounded-xl text-sm font-bold transition-all ${activeView === 'week'
                            ? 'bg-[#dfff4f] text-black shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    Week
                </button>
                <button
                    onClick={() => onChange('month')}
                    className={`flex-1 h-full rounded-xl text-sm font-bold transition-all ${activeView === 'month'
                            ? 'bg-[#dfff4f] text-black shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    Month
                </button>
            </div>
        </div>
    );
};
