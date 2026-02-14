import React from 'react';
import { BarChart, Activity, TrendingUp, Calendar } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';

export const AnalyticsSection = () => {
    const { habits, user, getDailyProgress } = useHabitStore();

    // Calculate Weekly Data
    const today = new Date();
    const currentDay = today.getDay(); // 0-6
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // Sunday

    const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // S, M, T...

        // Use the store selector to get consistent progress calculation for each day
        const value = getDailyProgress(d);

        return { day: dayStr, value };
    });

    const completedToday = getDailyProgress(new Date());

    // Calculate Perfect Days
    // A perfect day is one where progress was 100%
    const allCompletedDates = new Set<string>();
    habits.forEach(h => h.completedDates.forEach(d => allCompletedDates.add(d)));

    let perfectDaysCount = 0;
    allCompletedDates.forEach(dateStr => {
        const habitsForDay = habits.length; // Assuming constant number of habits for simplicity
        if (habitsForDay === 0) return;

        const completedOnThatDay = habits.filter(h => h.completedDates.includes(dateStr)).length;
        if (completedOnThatDay === habitsForDay) {
            perfectDaysCount++;
        }
    });

    return (
        <div className="w-full px-6 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-xl font-bold text-white mb-6">Analytics</h2>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-zinc-400">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Consistency</span>
                    </div>
                    {/* Mock consistency for now or calculate (completed / total possible since start) */}
                    <div className="text-2xl font-bold text-white">84%</div>
                    <div className="text-xs text-[#dfff4f] mt-1">+2% this week</div>
                </div>
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-zinc-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Completion</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{completedToday}%</div>
                    <div className="text-xs text-zinc-500 mt-1">Today's Rate</div>
                </div>
            </div>

            {/* Weekly Chart */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-3xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-white">Weekly Performance</h3>
                    <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#dfff4f]"></span>
                        <span className="text-xs text-zinc-400">Habits</span>
                    </div>
                </div>

                <div className="flex items-end justify-between h-40 gap-2">
                    {weeklyData.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                            <div
                                className="w-full bg-[#27272A] rounded-t-lg relative overflow-hidden transition-all duration-500 group-hover:bg-[#323235]"
                                style={{ height: `${Math.max(d.value, 5)}%` }} // Min height 5% for visuals
                            >
                                <div className="absolute bottom-0 left-0 w-full bg-[#dfff4f] opacity-20 h-full"></div>
                                <div
                                    className="absolute bottom-0 left-0 w-full bg-[#dfff4f] transition-all duration-1000 delay-100"
                                    style={{ height: `${d.value}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-bold text-zinc-500">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Perfect Days */}
            <div className="bg-[#dfff4f] rounded-2xl p-5 text-black flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1 opacity-80">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Perfect Days</span>
                    </div>
                    <div className="text-3xl font-bold">{perfectDaysCount}</div>
                    <div className="text-sm font-medium opacity-80">Keep it up, {user.name}!</div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center">
                    <span className="font-bold text-lg">🔥</span>
                </div>
            </div>
        </div>
    );
};
