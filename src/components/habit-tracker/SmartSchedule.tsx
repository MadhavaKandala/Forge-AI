import React, { useEffect, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { Clock, Briefcase, Coffee, Sun, Moon, Bus, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SmartSchedule = () => {
    const { schedule } = useHabitStore();
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    // Time Block Detection Logic
    const hour = currentTime.getHours();

    let currentBlock = 'Free Time';
    let blockIcon = <Sun className="w-4 h-4" />;
    let blockColor = 'text-green-500';
    let suggestion = 'Relax or Plan';
    let actionType: 'pomodoro' | 'habit' | 'none' = 'none';

    // Based on user's real schedule
    if (hour >= 6 && hour < 8) {
        currentBlock = 'Morning Routine';
        blockIcon = <Sun className="w-4 h-4" />;
        blockColor = 'text-yellow-500';
        suggestion = 'Meditation & Breakfast';
        actionType = 'habit';
    } else if (hour >= 8 && hour < 9) {
        currentBlock = 'Bus Commute';
        blockIcon = <Bus className="w-4 h-4" />;
        blockColor = 'text-orange-500';
        suggestion = 'Read Gita/Book (30m)';
        actionType = 'habit';
    } else if (hour >= 9 && hour < 12) { // 9:30 - 12:30 class
        currentBlock = 'Full Stack Class';
        blockIcon = <Briefcase className="w-4 h-4" />;
        blockColor = 'text-blue-500';
        suggestion = 'Focus on Learning (No Tasks)';
        actionType = 'none';
    } else if (hour === 12 || (hour === 13 && currentTime.getMinutes() < 30)) {
        currentBlock = 'Lunch Break';
        blockIcon = <Coffee className="w-4 h-4" />;
        blockColor = 'text-zinc-400';
        suggestion = 'Eat & Socialize';
        actionType = 'none';
    } else if ((hour === 13 && currentTime.getMinutes() >= 30) || (hour >= 14 && hour < 16)) {
        currentBlock = 'CP Class';
        blockIcon = <Briefcase className="w-4 h-4" />;
        blockColor = 'text-purple-500';
        suggestion = 'Coding / LeetCode';
        actionType = 'pomodoro';
    } else if (hour === 16 && currentTime.getMinutes() < 30) {
        currentBlock = 'Social Time';
        blockColor = 'text-pink-500';
        actionType = 'none';
    } else if ((hour === 16 && currentTime.getMinutes() >= 30) || (hour === 17)) {
        currentBlock = 'Bus Home';
        blockIcon = <Bus className="w-4 h-4" />;
        blockColor = 'text-orange-500';
        suggestion = 'Reading / Audio';
        actionType = 'habit';
    } else if (hour >= 18 && hour < 21) { // 6:30 PM starts peak
        if (hour === 18 && currentTime.getMinutes() < 30) {
            currentBlock = 'Freshen Up';
            actionType = 'none';
        } else {
            currentBlock = 'PEAK TIME';
            blockIcon = <Moon className="w-4 h-4" />;
            blockColor = 'text-red-500';
            suggestion = 'Deep Work / Big Task';
            actionType = 'pomodoro';
        }
    } else if (hour >= 21) {
        currentBlock = 'Evening Routine';
        blockIcon = <Moon className="w-4 h-4" />;
        blockColor = 'text-indigo-500';
        suggestion = 'Dinner & Planning';
        actionType = 'habit';
    }

    const handleAction = () => {
        if (actionType === 'pomodoro') {
            navigate('/pomodoro');
        } else if (actionType === 'habit') {
            // Can scroll to habit list or do nothing for now
            const habitList = document.getElementById('habit-checklist');
            habitList?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div className="w-full px-6 mb-8">
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 relative overflow-hidden group hover:border-zinc-700 transition-colors">
                {/* Active Indicator Glow */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-${blockColor.replace('text-', '')}/10 to-transparent blur-xl`}></div>

                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Current Block</p>
                        <h2 className={`text-xl font-black ${blockColor} flex items-center gap-2`}>
                            {blockIcon} {currentBlock}
                        </h2>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-mono font-bold text-white tracking-tighter">{formatTime(currentTime)}</p>
                    </div>
                </div>

                {/* Suggestion Box */}
                <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-zinc-400 font-black mb-0.5 tracking-widest uppercase">SMART SUGGESTION</p>
                        <p className="text-sm text-white font-medium">{suggestion}</p>
                    </div>
                    {actionType !== 'none' && (
                        <button
                            onClick={handleAction}
                            className="bg-[#dfff4f] text-black text-xs font-black px-4 py-2 rounded-xl hover:bg-[#ccee3e] transition-all flex items-center gap-2 shadow-lg shadow-[#dfff4f]/10"
                        >
                            <Play className="w-3 h-3 fill-black" /> START
                        </button>
                    )}
                </div>

                {/* Vertical Timeline Preview (Mini) */}
                <div className="mt-4 flex gap-1 h-1 w-full bg-[#27272A] rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-[10%]" title="Morning"></div>
                    <div className="h-full bg-orange-500 w-[10%]" title="Commute"></div>
                    <div className="h-full bg-blue-500 w-[25%]" title="College"></div>
                    <div className="h-full bg-purple-500 w-[20%]" title="Deep Work"></div>
                    <div className="h-full bg-orange-500 w-[10%]" title="Commute"></div>
                    <div className="h-full bg-red-500 w-[25%]" title="Peak Time"></div>
                </div>
            </div>
        </div>
    );
};
