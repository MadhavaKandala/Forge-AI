import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { MotivationCard as MotivationCardData, resolveMotivationContent } from '@/lib/motivationCards';

interface MotivationCardProps {
    card: MotivationCardData;
    streak: number;
    onDismiss: () => void;
}

export default function MotivationCard({ card, streak, onDismiss }: MotivationCardProps) {
    return (
        <motion.section
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="mb-6"
        >
            <div className="relative overflow-hidden rounded-xl border border-[#C8FF00]/30 bg-[#141414] p-4">
                <div className="absolute left-0 top-0 h-full w-1 bg-[#C8FF00]" />
                <div className="flex items-start justify-between gap-4 pl-2">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8FF00]">
                            {card.title}
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-white">
                            {resolveMotivationContent(card, streak)}
                        </p>
                        {card.author && (
                            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                                {card.author}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onDismiss}
                        aria-label="Dismiss daily motivation"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-[#1C1C1C] text-zinc-400 transition-colors hover:border-[#C8FF00]/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#C8FF00]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.section>
    );
}
