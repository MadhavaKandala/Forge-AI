import { motion } from 'framer-motion';
import { Brain, Flame, Sparkles, Trophy, Zap } from 'lucide-react';
import { MoodHistoryEntry } from '@/store/useHabitStore';

interface MotivationStoriesProps {
    streak: number;
    mood: MoodHistoryEntry | null;
    onMoodTap: () => void;
}

const stories = [
    { id: 'quote', title: 'INTEL', icon: Sparkles, color: '#C8FF00' },
    { id: 'streak', title: 'STREAK', icon: Flame, color: '#FF4444' },
    { id: 'mood', title: 'MOOD', icon: Brain, color: '#F59E0B' },
    { id: 'win', title: 'WIN', icon: Trophy, color: '#22C55E' },
    { id: 'focus', title: 'FOCUS', icon: Zap, color: '#FFFFFF' },
];

export default function MotivationStories({ streak, mood, onMoodTap }: MotivationStoriesProps) {
    return (
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
                            onClick={story.id === 'mood' ? onMoodTap : undefined}
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
    );
}
