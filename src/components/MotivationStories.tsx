import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Flame, Sparkles, Trophy, X, Zap } from 'lucide-react';
import { MoodHistoryEntry } from '@/store/useHabitStore';

interface MotivationStoriesProps {
    streak: number;
    mood: MoodHistoryEntry | null;
    onMoodTap: () => void;
}

const stories = [
    { id: 'quote', title: 'INTEL', body: 'You do not need a perfect day. You need one clean action.', icon: Sparkles, color: '#C8FF00' },
    { id: 'streak', title: 'STREAK', body: 'Protect the chain. Small wins still count.', icon: Flame, color: '#FF4444' },
    { id: 'mood', title: 'MOOD', body: 'Name the state. Then choose the next move.', icon: Brain, color: '#F59E0B' },
    { id: 'win', title: 'WIN', body: 'Before sleeping, make today visible with one completed op.', icon: Trophy, color: '#22C55E' },
    { id: 'focus', title: 'FOCUS', body: 'Put the hardest meaningful task in front of you.', icon: Zap, color: '#FFFFFF' },
];

export default function MotivationStories({ streak, mood, onMoodTap }: MotivationStoriesProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const activeStory = activeIndex === null ? null : stories[activeIndex];
    const ActiveStoryIcon = activeStory?.icon;

    useEffect(() => {
        if (activeIndex === null) return undefined;
        const timer = window.setTimeout(() => {
            setActiveIndex((current) => {
                if (current === null) return null;
                return current >= stories.length - 1 ? null : current + 1;
            });
        }, 4200);
        return () => window.clearTimeout(timer);
    }, [activeIndex]);

    return (
        <>
            <section className="mt-6 -mx-5 overflow-x-auto px-5 pb-1">
                <div className="flex gap-3">
                    {stories.map((story, index) => {
                        const Icon = story.icon;
                        const caption = story.id === 'streak'
                            ? `${streak}D`
                            : story.id === 'mood'
                                ? mood?.mood.replace('_', ' ').slice(0, 8) ?? 'CHECK'
                                : story.title;

                        return (
                            <motion.button
                                key={story.id}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className="w-[72px] shrink-0 text-center"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                            >
                            <span
                                className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 bg-[#141414]"
                                style={{ borderColor: story.color, boxShadow: `0 0 22px ${story.color}33` }}
                            >
                                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#1C1C1C]">
                                    <Icon className="h-5 w-5" style={{ color: story.color }} />
                                </span>
                            </span>
                            <span className="mt-2 block truncate text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">
                                {caption}
                            </span>
                            </motion.button>
                        );
                    })}
                </div>
            </section>

            <AnimatePresence>
                {activeStory && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-[#0A0A0A]/95 px-5 pb-8 pt-10 text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="mx-auto flex min-h-full max-w-md flex-col">
                            <div className="mb-6 flex gap-1">
                                {stories.map((story, index) => (
                                    <div key={story.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                                        {index === activeIndex && (
                                            <motion.div
                                                className="h-full rounded-full bg-[#C8FF00]"
                                                initial={{ width: '0%' }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 4.2, ease: 'linear' }}
                                            />
                                        )}
                                        {activeIndex !== null && index < activeIndex && <div className="h-full bg-[#C8FF00]" />}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveIndex(null)}
                                className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-[#1C1C1C]"
                                aria-label="Close story"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveIndex((activeIndex ?? 0) >= stories.length - 1 ? null : (activeIndex ?? 0) + 1)}
                                className="mt-8 flex flex-1 flex-col justify-end rounded-[32px] border border-zinc-800 p-6 text-left"
                                style={{ background: `linear-gradient(160deg, ${activeStory.color}33, #141414 42%, #0A0A0A)` }}
                            >
                                {ActiveStoryIcon && <ActiveStoryIcon className="h-12 w-12" style={{ color: activeStory.color }} />}
                                <h2 className="mt-6 text-4xl font-black uppercase leading-none">{activeStory.title}</h2>
                                <p className="mt-4 text-lg font-bold leading-7 text-zinc-300">{activeStory.body}</p>
                                {activeStory.id === 'mood' && (
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setActiveIndex(null);
                                            onMoodTap();
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                setActiveIndex(null);
                                                onMoodTap();
                                            }
                                        }}
                                        className="mt-8 grid h-12 place-items-center rounded-xl bg-[#C8FF00] text-xs font-black uppercase tracking-[0.18em] text-black"
                                    >
                                        Open Mood Check
                                    </span>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
