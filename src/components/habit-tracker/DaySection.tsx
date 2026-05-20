import React from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';

export const DaySection = () => {
    const { user, habits } = useHabitStore();

    // Calculate Streak based on consecutive days of ANY habit completion
    const getOverallStreak = () => {
        const allCompletedDates = [...new Set(habits.flatMap(h => h.completedDates))].sort().reverse();
        if (allCompletedDates.length === 0) return 0;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (allCompletedDates[0] !== today && allCompletedDates[0] !== yesterday) return 0;

        let streak = 0;
        let currentDate = new Date(allCompletedDates[0]);

        for (const dateStr of allCompletedDates) {
            const date = new Date(dateStr);
            const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                streak++;
                currentDate = date;
            } else {
                break;
            }
        }
        return streak;
    };

    const displayStreak = getOverallStreak();

    return (
        <div className="w-full px-6 mb-6">
            <div className="flex gap-3">
                {/* Streak Card */}
                <div className="flex-1 bg-primary rounded-2xl p-3 flex items-center justify-between shadow-lg shadow-primary/20">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-primary-foreground leading-none">{displayStreak}</span>
                        <p className="text-primary-foreground/70 font-bold text-[10px] uppercase tracking-tighter mt-0.5">Day Streak</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-primary-foreground/40 shrink-0" />
                </div>

                {/* Points Card */}
                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between shadow-inner">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white leading-none">{user.xp}</span>
                        <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-tighter mt-0.5">Total XP</p>
                    </div>
                    <Award className="w-5 h-5 text-primary/40 shrink-0" />
                </div>
            </div>
        </div>
    );
};
