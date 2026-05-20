import React from 'react';
import { useHabitStore } from '@/store/useHabitStore';

export const WeekStrip = () => {
    const { selectedDate, setSelectedDate, habits } = useHabitStore();

    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // Start from Sunday

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="w-full px-6 mb-6">
            <div className="flex items-center justify-between bg-[#18181B] border border-[#27272A] rounded-2xl p-4">
                {weekDays.map((date, index) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isToday = dateStr === today.toISOString().split('T')[0];
                    const isSelected = dateStr === selectedDate.toISOString().split('T')[0];
                    const habitsDone = habits.filter(h => h.completedDates.includes(dateStr)).length;
                    const hasActivity = habitsDone > 0;
                    const isPerfect = habitsDone === habits.length && habits.length > 0;

                    return (
                        <button
                            key={index}
                            onClick={() => setSelectedDate(date)}
                            className={`flex flex-col items-center gap-2 group relative`}
                        >
                            <span className={`text-[10px] font-bold ${isToday ? 'text-[#dfff4f]' : 'text-zinc-500'}`}>
                                {days[index]}
                            </span>

                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                ${isSelected ? 'bg-white text-black scale-110' : 'bg-black text-white border border-zinc-800'}
                                ${isToday && !isSelected ? 'border-[#dfff4f] text-[#dfff4f]' : ''}
                            `}>
                                {date.getDate()}
                            </div>

                            {/* Dot Indicator */}
                            {hasActivity && (
                                <div className={`absolute -bottom-2 w-1 h-1 rounded-full ${isPerfect ? 'bg-[#dfff4f]' : 'bg-zinc-600'}`}></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
