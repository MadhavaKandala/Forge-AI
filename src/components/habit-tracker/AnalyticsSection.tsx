import React, { useEffect, useState } from 'react';
import { BarChart, Activity, TrendingUp, Calendar, Clock, Target } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { useUserStore } from '@/store/useUserStore';
import { analyticsService, CategoryTimeData } from '@/services/analyticsService';
import { TimeBreakdownChart } from '@/components/analytics/TimeBreakdownChart';
import { startOfWeek, endOfWeek, format, subDays } from 'date-fns';

export const AnalyticsSection = () => {
    const { habits } = useHabitStore();
    const { user } = useUserStore();
    const [timeBreakdown, setTimeBreakdown] = useState<CategoryTimeData[]>([]);
    const [punctuality, setPunctuality] = useState({ estimated: 0, actual: 0 });

    useEffect(() => {
        const loadData = async () => {
            const start = subDays(new Date(), 7).toISOString();
            const end = new Date().toISOString();

            const breakdown = await analyticsService.getTimeBreakdown(start, end);
            setTimeBreakdown(breakdown);

            const punct = await analyticsService.getPunctualityStats();
            setPunctuality(punct);
        };
        loadData();
    }, []);

    // Calculate Weekly Data (Legacy Habit Data)
    const today = new Date();
    const currentDay = today.getDay(); // 0-6
    const startOfWeekDate = new Date(today);
    startOfWeekDate.setDate(today.getDate() - currentDay); // Sunday

    const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeekDate);
        d.setDate(startOfWeekDate.getDate() + i);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // S, M, T...
        const dateStr = d.toISOString().split('T')[0];

        // Calculate "Percent of Habits Completed" for this day
        // To be accurate, we need to know what habits were *active* on that day.
        // For simplicity, we assume current habits were active.
        const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
        const total = habits.length || 1;
        const value = Math.round((completedCount / total) * 100);

        return { day: dayStr, value };
    });

    const completedToday = habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length;
    const totalHabits = habits.length;
    const rate = Math.round((completedToday / totalHabits) * 100) || 0;

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
                    <div className="text-2xl font-bold text-white">84%</div>
                    <div className="text-xs text-[#dfff4f] mt-1">+2% this week</div>
                </div>
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-zinc-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Completion</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{rate}%</div>
                    <div className="text-xs text-zinc-500 mt-1">Today's Rate</div>
                </div>
            </div>

            {/* Time Breakdown */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-3xl p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">Time Breakdown</h3>
                    <div className="flex gap-2">
                        <span className="text-xs text-zinc-400">Last 7 Days</span>
                    </div>
                </div>
                <TimeBreakdownChart data={timeBreakdown} />
            </div>

            {/* Punctuality */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-3xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-[#dfff4f]" />
                    <h3 className="font-bold text-white">Punctuality</h3>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-zinc-400 text-xs uppercase mb-1">Estimated vs Actual</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{punctuality.actual}h</span>
                            <span className="text-sm text-zinc-500">/ {punctuality.estimated}h est.</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-400">Accuracy</p>
                        <p className={`text-xl font-bold ${punctuality.estimated > 0 && Math.abs(punctuality.actual - punctuality.estimated) < punctuality.estimated * 0.1 ? 'text-green-500' : 'text-yellow-500'}`}>
                            {punctuality.estimated > 0 ? Math.round((punctuality.actual / punctuality.estimated) * 100) : 0}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Weekly Performance (Habits) */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-3xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-white">Weekly Habits</h3>
                </div>

                <div className="flex items-end justify-between h-40 gap-2">
                    {weeklyData.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                            <div
                                className="w-full bg-[#27272A] rounded-t-lg relative overflow-hidden transition-all duration-500 group-hover:bg-[#323235]"
                                style={{ height: `${d.value}%` }}
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
                    <div className="text-3xl font-bold">12</div>
                    <div className="text-sm font-medium opacity-80">Keep it up, {user?.name || 'Champ'}!</div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center">
                    <span className="font-bold text-lg">🔥</span>
                </div>
            </div>
        </div>
    );
};
