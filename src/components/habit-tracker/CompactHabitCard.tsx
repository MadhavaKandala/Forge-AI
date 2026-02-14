import React from 'react';
import { Check, Clock, TrendingUp } from 'lucide-react';
import { Habit } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';

interface CompactHabitCardProps {
    habit: Habit;
    isCompleted: boolean;
    onToggle: () => void;
    currentValue?: number;
}

export const CompactHabitCard: React.FC<CompactHabitCardProps> = ({
    habit,
    isCompleted,
    onToggle,
    currentValue = 0
}) => {
    return (
        <div
            className={cn(
                "group flex items-center gap-3 py-1.5 px-2 rounded-lg transition-all border border-transparent hover:bg-white/5",
                isCompleted && "opacity-60"
            )}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                className={cn(
                    "h-5 w-5 rounded flex items-center justify-center transition-all border shrink-0",
                    isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/30 hover:border-primary/50 bg-transparent"
                )}
            >
                {isCompleted && <Check className="h-3 w-3 stroke-[4]" />}
            </button>

            <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className={cn(
                    "text-sm font-medium truncate",
                    isCompleted && "line-through text-muted-foreground"
                )}>
                    {habit.title}
                </span>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground shrink-0">
                    {habit.time && <span>• {habit.time}</span>}
                    {habit.goal && (
                        <span className="font-mono">
                            • {currentValue}/{habit.goal}{habit.unit}
                        </span>
                    )}
                    {habit.streak > 0 && (
                        <div className="flex items-center gap-0.5 text-primary/80">
                            <TrendingUp className="h-2.5 w-2.5" />
                            <span>{habit.streak}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
