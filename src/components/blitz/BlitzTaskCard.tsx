import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, MoreVertical, Rocket, Trash2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PillButton } from '@/components/ui/PillButton';

interface BlitzTaskCardProps {
    taskId: string;
    title: string;
    estimateMinutes: number;
    takenMinutes?: number;
    subtasksSummary?: string;
    listColor?: string;
    listInitial?: string;
    status: string;
    onStartBlitz?: () => void;
    onDelete?: () => void;
    onToggleDone?: () => void;
}

export const BlitzTaskCard: React.FC<BlitzTaskCardProps> = ({
    taskId,
    title,
    estimateMinutes,
    takenMinutes = 0,
    subtasksSummary,
    listColor = '#dfff4f',
    listInitial = 'T',
    status,
    onStartBlitz,
    onDelete,
    onToggleDone
}) => {
    const isCompleted = status === 'done' || status === 'completed';
    const [isSwiped, setIsSwiped] = useState(false);

    // Simple swipe simulation for demonstration
    const touchEndRef = React.useRef<((e: TouchEvent) => void) | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        const startX = e.touches[0].clientX;
        const handleTouchEnd = (ee: TouchEvent) => {
            const endX = ee.changedTouches[0].clientX;
            if (startX - endX > 50) setIsSwiped(true);
            if (endX - startX > 50) setIsSwiped(false);
            document.removeEventListener('touchend', handleTouchEnd);
            touchEndRef.current = null;
        };
        touchEndRef.current = handleTouchEnd;
        document.addEventListener('touchend', handleTouchEnd);
    };

    React.useEffect(() => {
        return () => {
            if (touchEndRef.current) {
                document.removeEventListener('touchend', touchEndRef.current);
            }
        };
    }, []);


    return (
        <div className="relative overflow-hidden rounded-xl mb-3">
            {/* Action Buttons (Swipe Background) */}
            <div className="absolute inset-0 flex justify-end gap-1">
                <div
                    onClick={() => onStartBlitz?.()}
                    className="w-20 bg-gradient-to-br from-purple-600 to-indigo-700 flex flex-col items-center justify-center cursor-pointer"
                >
                    <Rocket className="text-white w-6 h-6 mb-1" />
                </div>
                <div
                    onClick={() => onDelete?.()}
                    className="w-20 bg-destructive flex flex-col items-center justify-center cursor-pointer"
                >
                    <Trash2 className="text-white w-6 h-6 mb-1" />
                </div>
            </div>

            {/* Main Content Card */}
            <div
                className={cn(
                    "relative z-10 bg-[#1a1a1a] p-4 border border-[#262626] rounded-xl transition-transform duration-300",
                    isSwiped ? "-translate-x-40" : "translate-x-0"
                )}
                onTouchStart={handleTouchStart}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                        <button onClick={() => onToggleDone?.()} className="mt-1">
                            {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                            ) : (
                                <Circle className="w-5 h-5 text-[#262626]" />
                            )}
                        </button>

                        <div className="flex-1">
                            <h3 className={cn(
                                "text-[16px] font-medium leading-tight",
                                isCompleted && "line-through text-muted-foreground"
                            )}>
                                {title}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-[12px] text-muted-foreground">{estimateMinutes}min</span>
                                {subtasksSummary && (
                                    <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                                        <ChevronRight className="w-3 h-3" />
                                        <span>{subtasksSummary}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-bold text-sm"
                        style={{ backgroundColor: listColor }}
                    >
                        {listInitial}
                    </div>
                </div>
            </div>
        </div>
    );
};
