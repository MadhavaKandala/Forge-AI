import { motion } from 'framer-motion';
import { MOOD_CONTENT, MOOD_ORDER, MoodKey } from '@/lib/moodContent';
import { cn } from '@/lib/utils';

interface MoodCheckProps {
    onSelect: (mood: MoodKey) => void;
}

export default function MoodCheck({ onSelect }: MoodCheckProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0A0A0A] text-white"
        >
            <div className="flex min-h-screen flex-col px-6 py-10">
                <motion.header
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.28 }}
                    className="mb-8"
                >
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#C8FF00]">DAILY INTEL</p>
                    <h2 className="mt-3 text-4xl font-black leading-tight">How are you showing up today?</h2>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                        Pick the honest state. Forge will adjust today&apos;s ops.
                    </p>
                </motion.header>

                <div className="grid flex-1 content-start gap-3">
                    {MOOD_ORDER.map((mood, index) => {
                        const content = MOOD_CONTENT[mood];

                        return (
                            <motion.button
                                key={mood}
                                type="button"
                                initial={{ y: 16, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.24, delay: 0.04 * index }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelect(mood)}
                                className={cn(
                                    'w-full rounded-xl border border-zinc-800 bg-[#141414] p-4 text-left transition-all',
                                    'hover:border-[#C8FF00]/70 hover:bg-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#C8FF00]'
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1C1C1C] text-2xl">
                                        {content.emoji}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black uppercase tracking-[0.16em]">{content.label}</p>
                                        <p className="mt-1 text-sm text-zinc-400">{content.message}</p>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
