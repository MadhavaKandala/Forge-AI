import React from 'react';
import { Check, Flame } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { NumericInput } from './NumericInput';
import { TimerInput } from './TimerInput';

export const HabitList = () => {
    const { habits, toggleHabit, updateHabitValue, selectedDate } = useHabitStore();

    const dateStr = selectedDate.toISOString().split('T')[0];

    const getHabitStatus = (habitId: string) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return { completed: false, streak: 0, value: 0 };

        return {
            completed: habit.completedDates.includes(dateStr),
            streak: habit.current_streak, // Updated
            value: habit.history[dateStr] || 0
        };
    };

    return (
        <div className="w-full px-6 mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">Today's Habits</h2>
                    <div className="flex items-center gap-1.5 ml-2">
                        <div className="w-2 h-2 rounded-full bg-[#dfff4f] shadow-[0_0_8px_rgba(223,255,79,0.5)]"></div>
                        <span className="text-xs text-zinc-400 font-medium">
                            {habits.filter(h => h.completedDates.includes(selectedDate.toISOString().split('T')[0])).length} of {habits.length} done
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {habits.map((habit) => {
                    const { completed, streak, value } = getHabitStatus(habit.id);

                    // Helper to get goal/unit based on type
                    let goal = 0;
                    let unit = '';
                    if (habit.habit_type === 'counter') {
                        goal = habit.counter_goal || 0;
                        unit = habit.counter_unit || '';
                    } else if (habit.habit_type === 'duration') {
                        goal = habit.duration_goal_minutes || 0;
                        unit = 'mins';
                    } else if (habit.habit_type === 'progress') {
                        goal = habit.progress_goal || 0;
                        unit = habit.progress_unit || '';
                    }

                    return (
                        <div key={habit.id} className="w-full p-4 bg-[#18181B] border border-[#27272A] rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-colors">
                            <div className="flex items-center gap-4 w-full">

                                {/* Control based on Type */}
                                {habit.habit_type === 'completion' && (
                                    <button
                                        onClick={() => toggleHabit(habit.id, selectedDate)}
                                        className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${completed
                                            ? 'bg-[#dfff4f] text-black shadow-[0_0_15px_rgba(223,255,79,0.3)]'
                                            : 'bg-[#18181B] border-2 border-zinc-700 text-transparent hover:border-zinc-500'
                                            }`}
                                    >
                                        <Check className="w-6 h-6" />
                                    </button>
                                )}

                                {(habit.habit_type === 'counter' || habit.habit_type === 'progress') && (
                                    <div className="flex-shrink-0">
                                        {completed ? (
                                            <button
                                                className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-all bg-[#dfff4f] text-black shadow-[0_0_15px_rgba(223,255,79,0.3)]"
                                                onClick={() => toggleHabit(habit.id, selectedDate)}
                                            >
                                                <Check className="w-6 h-6" />
                                            </button>
                                        ) : (
                                            <NumericInput
                                                value={value}
                                                goal={goal}
                                                unit={unit}
                                                step={unit === 'ml' ? 500 : 1}
                                                onChange={(val) => updateHabitValue(habit.id, selectedDate, val)}
                                            />
                                        )}
                                    </div>
                                )}

                                {habit.habit_type === 'duration' && ( // 'duration' maps to 'timer' UI roughly
                                    <div className="flex-shrink-0">
                                        <TimerInput
                                            value={value}
                                            onChange={(val) => updateHabitValue(habit.id, selectedDate, val)}
                                        />
                                    </div>
                                )}


                                <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                                    <span className="text-base font-bold text-white transition-all whitespace-normal break-words leading-tight">
                                        {habit.name}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <div className="flex flex-wrap items-center gap-1 text-zinc-500 text-xs font-mono whitespace-normal break-words">
                                            {completed ? (
                                                <span>{/* TODO: Implement completed_at time logic */} Done for today</span>
                                            ) : (
                                                <>
                                                    {habit.habit_type === 'duration' ? (
                                                        <span className="whitespace-nowrap">
                                                            {Math.floor(value / 60)}h {value % 60}m done
                                                        </span>
                                                    ) : (
                                                        habit.reminder_time && <span className="whitespace-nowrap">{habit.reminder_time}</span>
                                                    )}
                                                    {habit.habit_type === 'duration' && value > 0 && (
                                                        <>
                                                            <span className="text-zinc-600">•</span>
                                                            <span className="text-orange-500 font-bold whitespace-nowrap">In progress</span>
                                                            <span className="text-zinc-600">•</span>
                                                            <span className="text-orange-500 whitespace-nowrap">{(goal || 0) - value} min left</span>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
