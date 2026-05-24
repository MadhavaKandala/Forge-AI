import React, { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';

interface TimerInputProps {
    value: number; // in minutes
    onChange: (val: number) => void;
}

export const TimerInput = ({ value, onChange }: TimerInputProps) => {
    const [isRunning, setIsRunning] = useState(false);
    const [seconds, setSeconds] = useState(value * 60);

    useEffect(() => {
        // Sync local state if external value changes significantly (e.g. date change)
        if (!isRunning && Math.abs(seconds - value * 60) > 60) {
            setSeconds(value * 60);
        }
    }, [value]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds((s) => {
                    const newSeconds = s + 1;
                    // Save every minute (approx) to avoid too many writes? 
                    // Or just save on pause. Let's save every 10s for safety?
                    // Actually, parent onChange is likely expensive (store update). 
                    // Let's update parent only on pause or stop, or periodically.
                    return newSeconds;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    // Effect to sync back to parent periodically if running
    useEffect(() => {
        if (isRunning && seconds % 10 === 0) { // Update store every 10s
            onChange(Math.floor(seconds / 60));
        }
    }, [seconds, isRunning, onChange]);

    const toggleTimer = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isRunning) {
            // Pausing, sync final value
            onChange(Math.floor(seconds / 60));
        }
        setIsRunning(!isRunning);
    };

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <div className="w-20 text-center">
                <span className={`font-mono font-bold text-lg ${isRunning ? 'text-[#dfff4f]' : 'text-white'}`}>
                    {formatTime(seconds)}
                </span>
            </div>

            <button
                aria-label={isRunning ? "Pause timer" : "Start timer"}
                onClick={toggleTimer}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${isRunning ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-[#dfff4f]/10 text-[#dfff4f] hover:bg-[#dfff4f]/20'
                    }`}
            >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
        </div>
    );
};
