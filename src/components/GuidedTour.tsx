import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

export interface TourStep {
    targetId: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
    steps: TourStep[];
    onComplete: () => void;
    storageKey: string;
}

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const HIGHLIGHT_PADDING = 6;
const TOOLTIP_WIDTH = 300;
const TOOLTIP_GAP = 16;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function GuidedTour({ steps, onComplete, storageKey }: GuidedTourProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<Rect | null>(null);

    const currentStep = steps[currentIndex];
    const totalSteps = steps.length;

    const updateTargetRect = useCallback(() => {
        if (!currentStep || typeof document === 'undefined') {
            setTargetRect(null);
            return;
        }

        const target = document.getElementById(currentStep.targetId);
        if (!target) {
            setTargetRect(null);
            return;
        }

        const rect = target.getBoundingClientRect();
        setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        });
    }, [currentStep]);

    useEffect(() => {
        if (!currentStep || typeof window === 'undefined' || typeof document === 'undefined') return undefined;

        const target = document.getElementById(currentStep.targetId);
        target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

        const initialTimer = window.setTimeout(updateTargetRect, 260);
        const retryTimer = window.setTimeout(updateTargetRect, 700);

        window.addEventListener('resize', updateTargetRect);
        window.addEventListener('scroll', updateTargetRect, true);

        updateTargetRect();

        return () => {
            window.clearTimeout(initialTimer);
            window.clearTimeout(retryTimer);
            window.removeEventListener('resize', updateTargetRect);
            window.removeEventListener('scroll', updateTargetRect, true);
        };
    }, [currentStep, updateTargetRect]);

    const tooltipStyle = useMemo(() => {
        if (typeof window === 'undefined' || !targetRect) {
            return {
                left: 20,
                top: 120,
                width: `calc(100vw - 40px)`,
                maxWidth: TOOLTIP_WIDTH,
            };
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const width = Math.min(TOOLTIP_WIDTH, viewportWidth - 32);
        const centerX = targetRect.left + targetRect.width / 2;
        const centerY = targetRect.top + targetRect.height / 2;
        let left = centerX - width / 2;
        let top = targetRect.top + targetRect.height + TOOLTIP_GAP;

        if (currentStep.position === 'top') {
            top = targetRect.top - 190;
        }

        if (currentStep.position === 'left') {
            left = targetRect.left - width - TOOLTIP_GAP;
            top = centerY - 95;
        }

        if (currentStep.position === 'right') {
            left = targetRect.left + targetRect.width + TOOLTIP_GAP;
            top = centerY - 95;
        }

        left = clamp(left, 16, viewportWidth - width - 16);
        top = clamp(top, 20, viewportHeight - 220);

        return { left, top, width };
    }, [currentStep, targetRect]);

    const completeTour = useCallback(() => {
        onComplete();
    }, [onComplete]);

    const handleNext = useCallback(() => {
        if (currentIndex >= totalSteps - 1) {
            completeTour();
            return;
        }

        setCurrentIndex((index) => index + 1);
    }, [completeTour, currentIndex, totalSteps]);

    if (!currentStep || totalSteps === 0) return null;

    return (
        <div className="fixed inset-0 z-[1000] pointer-events-none" data-tour-key={storageKey}>
            {!targetRect && <div className="absolute inset-0 bg-black/85" />}

            {targetRect && (
                <motion.div
                    className="absolute rounded-2xl border-2 border-[#C8FF00] bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.85),0_0_28px_rgba(200,255,0,0.45)]"
                    animate={{
                        top: targetRect.top - HIGHLIGHT_PADDING,
                        left: targetRect.left - HIGHLIGHT_PADDING,
                        width: targetRect.width + HIGHLIGHT_PADDING * 2,
                        height: targetRect.height + HIGHLIGHT_PADDING * 2,
                    }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                />
            )}

            <motion.div
                key={`${storageKey}-${currentIndex}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="pointer-events-auto fixed rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-4 text-white shadow-[0_22px_80px_rgba(0,0,0,0.65)]"
                style={tooltipStyle}
            >
                <div className="flex items-start justify-between gap-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8FF00]">{currentStep.title}</p>
                    <p className="shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                        {currentIndex + 1} of {totalSteps}
                    </p>
                </div>

                <p className="mt-3 text-sm font-semibold leading-6 text-zinc-300">{currentStep.description}</p>

                <div className="mt-5 flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={completeTour}
                        className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500"
                    >
                        SKIP
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="h-10 rounded-lg bg-[#C8FF00] px-5 text-[11px] font-black uppercase tracking-[0.16em] text-black"
                    >
                        {currentIndex === totalSteps - 1 ? 'DONE' : 'NEXT'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
