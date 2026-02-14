import React, { useState, useEffect, useRef } from 'react';
import { PomodoroTimer } from '../components/timer/PomodoroTimer';
import { Button } from '../components/ui/button';
import { Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { timerService } from '../services/timerService';
import { SessionType } from '../types/timer';

export const PomodoroPage: React.FC = () => {
    const navigate = useNavigate();

    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<SessionType>('work');
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Settings (Hardcoded for now, can be moved to context/store)
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

    const toggleTimer = async () => {
        if (!isActive) {
            // Start
            if (!sessionId) {
                // New session
                const newId = await timerService.startSession(undefined, undefined, mode, settings[mode] / 60);
                setSessionId(newId);
            }
            setIsActive(true);
        } else {
            // Pause
            setIsActive(false);
        }
    };

    const handleReset = async () => {
        setIsActive(false);
        setTimeLeft(settings[mode]);
        if (sessionId) {
            // Mark as interrupted?
            await timerService.completeSession(sessionId, true);
            setSessionId(null);
        }
    };

    const handleComplete = async () => {
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Play sound
        try {
            const audio = new Audio('/sounds/bell.mp3'); // Ensure this exists
            await audio.play();
        } catch (e) {
            console.error("Audio play failed", e);
        }

        if (sessionId) {
            await timerService.completeSession(sessionId, false);
            setSessionId(null);
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
                    <p className="text-2xl font-bold">45m</p>
                </div>
            </div>
        </div>
    );
};

export default PomodoroPage;
