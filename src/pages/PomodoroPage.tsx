import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimerStore, SessionType } from '@/store/useTimerStore';
import { useHabitStore } from '@/store/useHabitStore';
import { PomodoroTimer } from '../components/timer/PomodoroTimer';
import { Settings, ArrowLeft, Zap, Trophy, History as HistoryIcon, X, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const PomodoroPage: React.FC = () => {
    const navigate = useNavigate();
    const [isFocusMode, setIsFocusMode] = useState(false);
    const {
        timeLeft,
        initialTime,
        isActive,
        mode,
        tick,
        startSession,
        pauseSession,
        resetSession,
        setMode,
        todayStats,
        history,
        fetchTodayStats,
        fetchHistory
    } = useTimerStore();

    useEffect(() => {
        fetchTodayStats();
        fetchHistory();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                tick();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, tick]);

    const toggleTimer = () => {
        if (isActive) {
            pauseSession();
        } else {
            startSession();
        }
    };

    const handleModeChange = (newMode: SessionType) => {
        setMode(newMode);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center selection:bg-[#dfff4f] selection:text-black">
            {/* Ambient Background Glow */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md px-6 py-8 flex-1 flex flex-col relative z-10 overflow-y-auto pb-24">
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
                    <button
                        className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400"
                        onClick={() => toast.success('Settings coming soon')}
                    >
                        <Settings className="w-6 h-6" />
                    </button>
                </div>

                {/* Main Timer Display */}
                <div className="flex flex-col items-center justify-center mb-12">
                    <div className="relative group cursor-pointer" onClick={toggleTimer}>
                        {/* Glow intensity based on active state */}
                        <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-1000 ${isActive ? 'bg-[#dfff4f]/20 scale-110' : 'bg-zinc-500/5 scale-100'}`}></div>

                        <PomodoroTimer
                            timeLeft={timeLeft}
                            totalTime={initialTime}
                            isActive={isActive}
                            onToggle={toggleTimer}
                            onReset={resetSession}
                            mode={mode}
                        />

                        {/* Status Label Overlay */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#18181B] border border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-[#dfff4f] shadow-2xl">
                            {isActive ? 'Syncing Flow...' : 'Ready to Start'}
                        </div>
                    </div>
                </div>

                {/* Session Mode Selector */}
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#18181B] border border-[#27272A] rounded-2xl mb-8">
                    <button
                        onClick={() => handleModeChange('work')}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'work' ? 'bg-[#dfff4f] text-black shadow-lg shadow-[#dfff4f]/20' : 'text-zinc-500'}`}
                    >
                        Work
                    </button>
                    <button
                        onClick={() => handleModeChange('short_break')}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'short_break' ? 'bg-[#dfff4f] text-black shadow-lg shadow-[#dfff4f]/20' : 'text-zinc-500'}`}
                    >
                        Short
                    </button>
                    <button
                        onClick={() => handleModeChange('long_break')}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'long_break' ? 'bg-[#dfff4f] text-black shadow-lg shadow-[#dfff4f]/20' : 'text-zinc-500'}`}
                    >
                        Long
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 text-center">
                        <Trophy className="w-4 h-4 mx-auto mb-2 text-[#dfff4f]" />
                        <p className="text-[10px] text-zinc-500 font-bold mb-1 uppercase">Sessions</p>
                        <p className="text-lg font-bold">{todayStats.count}</p>
                    </div>
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 text-center">
                        <Zap className="w-4 h-4 mx-auto mb-2 text-blue-500" />
                        <p className="text-[10px] text-zinc-500 font-bold mb-1 uppercase">Minutes</p>
                        <p className="text-lg font-bold">{todayStats.minutes}</p>
                    </div>
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 text-center">
                        <HistoryIcon className="w-4 h-4 mx-auto mb-2 text-purple-500" />
                        <p className="text-[10px] text-zinc-500 font-bold mb-1 uppercase">Streak</p>
                        <p className="text-lg font-bold">12d</p>
                    </div>
                </div>

                {/* Focus Mode Trigger */}
                {isActive && (
                    <button
                        onClick={() => setIsFocusMode(true)}
                        className="w-full mb-8 py-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center gap-3 group hover:border-purple-500/60 transition-all"
                    >
                        <EyeOff className="w-5 h-5 text-purple-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-purple-100">Enter Focus Mode</span>
                    </button>
                )}

                {/* Session History */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 px-1">Recent Sessions</h3>
                    {history.length > 0 ? (
                        <div className="space-y-2">
                            {history.slice(0, 5).map((session) => (
                                <div key={session.id} className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${session.was_completed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></div>
                                        <div>
                                            <p className="text-sm font-bold uppercase tracking-tight">{session.session_type} Session</p>
                                            <p className="text-[10px] text-zinc-500 font-medium">{format(new Date(session.started_at), 'HH:mm')} • {session.duration_minutes} min</p>
                                        </div>
                                    </div>
                                    {session.xp_earned > 0 && (
                                        <div className="px-2 py-1 bg-[#dfff4f]/10 border border-[#dfff4f]/20 rounded-lg">
                                            <p className="text-[10px] font-black text-[#dfff4f]">+{session.xp_earned} XP</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#18181B] border border-[#27272A] border-dashed rounded-3xl p-8 text-center">
                            <HistoryIcon className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">No sessions logged today</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Focus Mode Overlay */}
            <AnimatePresence>
                {isFocusMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
                    >
                        <div className="absolute top-10 right-10">
                            <button
                                onClick={() => setIsFocusMode(false)}
                                className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="text-center space-y-12">
                            <div className="space-y-2">
                                <h2 className="text-zinc-500 font-black uppercase tracking-[0.2em] text-sm">Deep Work in Progress</h2>
                                <h3 className="text-[#dfff4f] font-black uppercase text-xs tracking-widest">Digital Silence Active</h3>
                            </div>

                            <div className="scale-150 transform">
                                <PomodoroTimer
                                    timeLeft={timeLeft}
                                    totalTime={initialTime}
                                    isActive={isActive}
                                    onToggle={toggleTimer}
                                    onReset={resetSession}
                                    mode={mode}
                                />
                            </div>

                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-loose">
                                Your notifications are suppressed. <br /> Stay in the zone.
                            </p>
                        </div>

                        {/* Animated pulses */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <motion.div
                                animate={{ scale: [1, 1.5], opacity: [0.1, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-zinc-800 rounded-full"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PomodoroPage;
