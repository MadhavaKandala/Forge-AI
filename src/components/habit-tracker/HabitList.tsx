import React from 'react';
import { Check, Clock, Plus } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';

export const HabitList = () => {
    const { habits, toggleHabit, updateHabitValue, selectedDate } = useHabitStore();

    // Only allow interaction if selectedDate is Today (or allow past editing)
    // For simplicity, we allow editing any date.

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const dateStr = formatDate(selectedDate);
    const isToday = formatDate(new Date()) === dateStr;

    return (
        <div className="w-full px-6 mb-8 flex-1">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Habits</h2>
                <button className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                {habits.map((habit) => {
                    const isCompleted = habit.completedDates.includes(dateStr);
                    const currentVal = habit.history[dateStr] || 0;

                    return (
                        <div
                            key={habit.id}
                            className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border ${isCompleted
                                    ? 'bg-[#dfff4f] border-[#dfff4f]'
                                    : 'bg-[#18181B] border-[#27272A] hover:border-zinc-700'
                                }`}
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4 flex-1 min-w-0"> {/* min-w-0 ensures truncation works */}
                                    <button
                                        onClick={() => toggleHabit(habit.id, selectedDate)}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isCompleted
                                                ? 'bg-black text-[#dfff4f]'
                                                : 'bg-[#27272A] text-zinc-500 group-hover:scale-105'
                                            }`}
                                    >
                                        {isCompleted ? <Check className="w-6 h-6 stroke-[3]" /> : <div className="w-4 h-4 rounded-full border-2 border-zinc-600"></div>}
                                    </button>

                                    <div className="flex-1 min-w-0 pr-2"> {/* Added padding right and min-w-0 */}
                                        <h3 className={`font-bold text-base truncate md:whitespace-normal md:overflow-visible ${isCompleted ? 'text-black' : 'text-white'}`}>
                                            {habit.title}
                                        </h3>
                                        <div className={`flex items-center gap-2 text-xs mt-0.5 ${isCompleted ? 'text-black/70' : 'text-zinc-500'}`}>
                                            {habit.type === 'timer' && <Clock className="w-3 h-3" />}
                                            <span>{habit.time}</span>
                                            {habit.goal && <span>• {currentVal}/{habit.goal} {habit.unit}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right pl-2">
                                    <div className={`text-2xl font-black ${isCompleted ? 'text-black' : 'text-white'}`}>
                                        {habit.streak}
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-black/60' : 'text-zinc-600'}`}>
                                        Streak
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar for Numeric/Timer Habits */}
                            {(habit.type === 'numeric' || habit.type === 'timer') && habit.goal && !isCompleted && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#27272A]">
                                    <div
                                        className="h-full bg-[#dfff4f] transition-all duration-500"
                                        style={{ width: `${Math.min((currentVal / habit.goal) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            )}

                            {/* Input for Numeric Updates */}
                            {(habit.type === 'numeric' || habit.type === 'timer') && !isCompleted && (
                                <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                                    <button
                                        className="text-xs font-bold text-zinc-500 hover:text-white px-2 py-1 rounded hover:bg-zinc-800"
                                        onClick={() => updateHabitValue(habit.id, selectedDate, Math.max(0, currentVal - (habit.type === 'timer' ? 5 : 100)))}
                                    >
                                        -
                                    </button>
                                    <span className="text-xs font-mono text-zinc-300">
                                        {currentVal} / {habit.goal}
                                    </span>
                                    <button
                                        className="text-xs font-bold text-[#dfff4f] hover:bg-zinc-800 px-2 py-1 rounded"
                                        onClick={() => updateHabitValue(habit.id, selectedDate, currentVal + (habit.type === 'timer' ? 20 : 500))} // +20min or +500ml
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {habits.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-[#27272A] rounded-3xl opacity-50">
                        <p className="text-zinc-500">No habits for this day</p>
                    </div>
                )}
            </div>
        </div>
    );
};
