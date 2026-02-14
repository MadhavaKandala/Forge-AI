import React from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';

export const DaySection = () => {
    const { user, habits } = useHabitStore();

    // Calculate Streak based on highest habit streak
    const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

    return (
        <div className="w-full px-6 mb-6">
            <div className="flex gap-3">
                {/* Streak Card */}
                <div className="flex-1 bg-primary rounded-2xl p-3 flex items-center justify-between shadow-lg shadow-primary/20">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-primary-foreground leading-none">{maxStreak}</span>
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
