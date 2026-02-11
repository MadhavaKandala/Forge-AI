import React, { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';

interface TimerInputProps {
    value: number; // in minutes
    onChange: (val: number) => void;
}

export const TimerInput = ({ value, onChange }: TimerInputProps) => {
    const [isRunning, setIsRunning] = useState(false);
    const [seconds, setSeconds] = useState(value * 60);

    const onChangeRef = React.useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        // Sync local state if external value changes significantly (e.g. date change)
        if (!isRunning && Math.abs(seconds - value * 60) > 60) {
            setSeconds(value * 60);
        }
    }, [value, isRunning]); // Removed seconds to avoid loop

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds((s) => {
                    const newSeconds = s + 1;
                    if (newSeconds % 10 === 0) {
                        onChangeRef.current(Math.floor(newSeconds / 60));
                    }
                    return newSeconds;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

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
        <button
            onClick={toggleTimer}
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isRunning
                ? 'border-orange-500 text-orange-500 bg-orange-500/10'
                : 'border-zinc-700 bg-[#27272A] text-zinc-500 hover:border-zinc-600'
                }`}
        >
            {isRunning ? (
                <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20"></div>
                    <Pause className="w-5 h-5 fill-current" />
                </div>
            ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
        </button>
    );
};
