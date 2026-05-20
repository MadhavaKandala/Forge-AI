import React from 'react';
import { cn } from '@/lib/utils';

interface BlitzTimerProps {
    seconds: number;
    totalSeconds?: number;
    isFullScreen?: boolean;
    className?: string;
}

export const BlitzTimer: React.FC<BlitzTimerProps> = ({
    seconds,
    totalSeconds = 1,
    isFullScreen = false,
    className
}) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formatTime = (val: number) => val.toString().padStart(2, '0');

    const progress = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className={cn("relative flex flex-col items-center justify-center", className)}>
            {isFullScreen && (
                <svg className="absolute w-80 h-80 -rotate-90">
                    {/* Background Ring */}
                    <circle
                        cx="160"
                        cy="160"
                        r={radius}
                        fill="transparent"
                        stroke="#262626"
                        strokeWidth="8"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx="160"
                        cy="160"
                        r={radius}
                        fill="transparent"
                        stroke="url(#timer-gradient)"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
                        strokeLinecap="round"
                    />
                    <defs>
                        <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#dfff4f" />
                            <stop offset="100%" stopColor="#2fb58f" />
                        </linearGradient>
                    </defs>
                </svg>
            )}

            <div className={cn(
                "font-mono font-bold tracking-tighter text-white z-10",
                isFullScreen ? "text-6xl" : "text-4xl"
            )}>
                {hours > 0 && <span>{formatTime(hours)}:</span>}
                <span>{formatTime(minutes)}:</span>
                <span>{formatTime(remainingSeconds)}</span>
            </div>

            {!isFullScreen && (
                <div className="w-full h-1 bg-[#262626] rounded-full mt-4 relative overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#dfff4f] to-[#2fb58f] transition-all duration-500"
                        style={{ width: `${100 - progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};
