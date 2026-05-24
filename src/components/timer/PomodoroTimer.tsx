import React from 'react';
import { cn } from '../../lib/utils';
import { Play, Pause, SkipForward, Square } from 'lucide-react';
import { Button } from '../ui/button';

interface PomodoroTimerProps {
    timeLeft: number; // in seconds
    totalTime: number; // in seconds
    isActive: boolean;
    onToggle: () => void;
    onReset: () => void;
    onSkip?: () => void;
    mode: 'work' | 'short_break' | 'long_break';
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
    timeLeft,
    totalTime,
    isActive,
    onToggle,
    onReset,
    onSkip,
    mode
}) => {
    const progress = (timeLeft / totalTime) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const modeColors = {
        work: 'text-red-500 stroke-red-500',
        short_break: 'text-green-500 stroke-green-500',
        long_break: 'text-blue-500 stroke-blue-500'
    };

    const modeText = {
        work: 'Focus Time',
        short_break: 'Short Break',
        long_break: 'Long Break'
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-8">
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-muted/20"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        fill="transparent"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 120}
                        strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                        strokeLinecap="round"
                        className={cn("transition-all duration-500 ease-linear", modeColors[mode])}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-2">
                        {modeText[mode]}
                    </span>
                    <span className="text-6xl font-bold font-mono tracking-tighter">
                        {formattedTime}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full border-2"
                    onClick={onToggle}
                    aria-label={isActive ? "Pause timer" : "Start timer"}
                >
                    {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                </Button>

                {isActive && (
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={onReset}
                        aria-label="Reset timer"
                    >
                        <Square className="h-4 w-4 fill-current" />
                    </Button>
                )}

                {onSkip && !isActive && timeLeft !== totalTime && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={onSkip}
                        aria-label="Skip to next"
                    >
                        <SkipForward className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    );
};
