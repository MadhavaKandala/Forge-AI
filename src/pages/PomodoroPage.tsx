import React, { useEffect, useRef } from 'react';
import { PomodoroTimer } from '../components/timer/PomodoroTimer';
import { Button } from '../components/ui/button';
import { Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimerStore } from '../store/useTimerStore';

export const PomodoroPage: React.FC = () => {
    const navigate = useNavigate();

    // Global Store
    const {
        timeLeft,
        isActive,
        mode,
        settings,
        setTimeLeft,
        startSession,
        pauseSession,
        resetSession,
        completeSession,
        setMode,
        todayStats,
        fetchTodayStats
    } = useTimerStore();

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Fetch
    useEffect(() => {
        fetchTodayStats();
    }, []);

    // Timer Interval Logic
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleComplete();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft, setTimeLeft]);

    const toggleTimer = async () => {
        if (!isActive) {
            await startSession();
        } else {
            pauseSession();
        }
    };

    const handleReset = async () => {
        await resetSession();
    };

    const handleComplete = async () => {
        // Stop interval
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Play sound
        try {
            const audio = new Audio('/sounds/bell.mp3');
            await audio.play();
        } catch (e) {
            console.error("Audio play failed", e);
        }

        await completeSession();

        // Auto-switch mode logic
        if (mode === 'work') {
            setMode('short_break');
        } else {
            setMode('work');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-md h-screen flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Focus Session</h1>
                <Button variant="ghost" size="icon">
                    <Settings className="h-6 w-6" />
                </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <PomodoroTimer
                    timeLeft={timeLeft}
                    totalTime={settings[mode]}
                    isActive={isActive}
                    onToggle={toggleTimer}
                    onReset={handleReset}
                    mode={mode}
                />
            </div>

            <div className="mt-8 mb-12">
                <div className="bg-card/50 rounded-xl p-4 border text-center">
                    <p className="text-muted-foreground text-sm">Today's Focus</p>
                    <div className="flex justify-center gap-4 items-baseline">
                        <p className="text-2xl font-bold">{todayStats.minutes}m</p>
                        <p className="text-sm text-muted-foreground">({todayStats.count} sessions)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PomodoroPage;
