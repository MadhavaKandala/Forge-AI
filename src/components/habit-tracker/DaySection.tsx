import { TrendingUp } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { useUserStore } from '@/store/useUserStore';

export const DaySection = () => {
    const { habits } = useHabitStore();
    const { user } = useUserStore();

    // Changing to: Max Habit Streak using current_streak
    const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.current_streak)) : 0;

    return (
        <div className="w-full px-6 mb-8 mt-6">
            <h2 className="text-xl font-bold text-white mb-4">Today</h2>
            <div className="flex gap-4">
                {/* Streak Card */}
                <div className="flex-1 bg-[#dfff4f] rounded-3xl p-5 flex flex-col justify-between h-40 shadow-[0_0_20px_rgba(223,255,79,0.2)]">
                    <div>
                        <span className="text-4xl font-black text-black tracking-tight">{maxStreak}</span>
                        <p className="text-black font-bold text-sm mt-1">Day streak</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-black/70">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold font-mono">Personal best!</span>
                    </div>
                </div>

                {/* Points Card */}
                <div className="flex-1 bg-[#18181B] border border-[#27272A] rounded-3xl p-5 flex flex-col justify-between h-40">
                    <div>
                        <span className="text-4xl font-black text-white tracking-tight">{user?.total_xp || 0}</span>
                        <p className="text-zinc-400 font-bold text-sm mt-1">Points earned</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#dfff4f]">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold font-mono">Level {user?.level || 1}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
