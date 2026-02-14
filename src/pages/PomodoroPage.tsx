import React, { useState, useEffect, useRef } from 'react';
import { PomodoroTimer } from '../components/timer/PomodoroTimer';
import { Button } from '../components/ui/button';
import { Settings, ArrowLeft, Zap, Trophy, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHabitStore } from '@/store/useHabitStore';

export const PomodoroPage: React.FC = () => {
    const navigate = useNavigate();
    const { logDeepWork } = useHabitStore();

    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'work' | 'short_break' | 'long_break'>('work');

    const settings = {
        work: 25 * 60,
        short_break: 5 * 60,
        long_break: 15 * 60
    };

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleComplete();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const handleReset = () => {
        setIsActive(false);
        setTimeLeft(settings[mode]);
    };

    const handleComplete = () => {
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Log session if it was a work session
        if (mode === 'work') {
            const minutesSpent = Math.floor(settings.work / 60);
            logDeepWork(minutesSpent);
        }

        // Auto-switch mode
        if (mode === 'work') {
            setMode('short_break');
            setTimeLeft(settings.short_break);
        } else {
            setMode('work');
            setTimeLeft(settings.work);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center selection:bg-[#dfff4f] selection:text-black">
            {/* Ambient Background Glow */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md px-6 py-8 flex-1 flex flex-col relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
                            <Zap className="w-5 h-5 text-[#dfff4f] fill-[#dfff4f]" /> DEEP WORK
                        </h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{mode.replace('_', ' ')} session</p>
                    </div>
                    <button className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400">
                        <Settings className="w-6 h-6" />
                    </button>
                </div>

                {/* Main Timer Display */}
                <div className="flex-1 flex flex-col items-center justify-center -mt-10">
                    <div className="relative group cursor-pointer" onClick={toggleTimer}>
                        {/* Glow intensity based on active state */}
                        <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-1000 ${isActive ? 'bg-[#dfff4f]/20 scale-110' : 'bg-zinc-500/5 scale-100'}`}></div>

                        <PomodoroTimer
                            timeLeft={timeLeft}
                            totalTime={settings[mode]}
                            isActive={isActive}
                            onToggle={toggleTimer}
                            onReset={handleReset}
                            mode={mode}
                        />

                        {/* Status Label Overlay */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#18181B] border border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-[#dfff4f] shadow-2xl">
                            {isActive ? 'Syncing Flow...' : 'Ready to Start'}
                        </div>
                    </div>
                </div>

                {/* Stats & Controls */}
                <div className="mt-auto pt-10 grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 text-center">
                        <Trophy className="w-4 h-4 mx-auto mb-2 text-[#dfff4f]" />
                        <p className="text-[10px] text-zinc-500 font-bold mb-1">XP EARNED</p>
                        <p className="text-lg font-bold">50</p>
                    </div>
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 text-center">
                        <Zap className="w-4 h-4 mx-auto mb-2 text-blue-500" />
                        <p className="text-[10px] text-zinc-500 font-bold mb-1">LEVEL UP</p>
                        <p className="text-lg font-bold">78%</p>
                    </div>
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 text-center">
                        <History className="w-4 h-4 mx-auto mb-2 text-purple-500" />
                        <p className="text-[10px] text-zinc-500 font-bold mb-1">STREAK</p>
                        <p className="text-lg font-bold">12d</p>
                    </div>
                </div>

                {/* Session Mode Selector */}
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#18181B] border border-[#27272A] rounded-2xl">
                    <button
                        onClick={() => { setMode('work'); setTimeLeft(settings.work); setIsActive(false); }}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'work' ? 'bg-[#dfff4f] text-black shadow-lg shadow-[#dfff4f]/20' : 'text-zinc-500'}`}
                    >
                        Work
                    </button>
                    <button
                        onClick={() => { setMode('short_break'); setTimeLeft(settings.short_break); setIsActive(false); }}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'short_break' ? 'bg-[#dfff4f] text-black shadow-lg shadow-[#dfff4f]/20' : 'text-zinc-500'}`}
                    >
                        Short
                    </button>
                    <button
                        onClick={() => { setMode('long_break'); setTimeLeft(settings.long_break); setIsActive(false); }}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'long_break' ? 'bg-[#dfff4f] text-black shadow-lg shadow-[#dfff4f]/20' : 'text-zinc-500'}`}
                    >
                        Long
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PomodoroPage;
