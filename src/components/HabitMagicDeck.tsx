import { motion } from 'framer-motion';
import { BookOpen, ChartNoAxesColumnIncreasing, Clock, PenLine } from 'lucide-react';

const cards = [
    {
        title: 'Two-Minute Rule',
        body: 'Start with the smallest version. One page. One set. One problem.',
        icon: Clock,
        bg: '#F4E8FF',
        accent: '#C084FC',
    },
    {
        title: 'Daily Journal',
        body: 'Reset your mind, name the emotion, then deploy one clean action.',
        icon: PenLine,
        bg: '#FFF4CC',
        accent: '#FACC15',
    },
    {
        title: 'Progress Graph',
        body: 'Watch streaks compound. Small wins become visible proof.',
        icon: ChartNoAxesColumnIncreasing,
        bg: '#E8FBEF',
        accent: '#22C55E',
    },
    {
        title: 'Reader Mode',
        body: 'Five minutes today is better than a perfect plan tomorrow.',
        icon: BookOpen,
        bg: '#FFE8E2',
        accent: '#FB7185',
    },
    {
        title: 'Tiny Reset',
        body: 'When the day gets messy, clean one surface and restart.',
        icon: PenLine,
        bg: '#E8F4FF',
        accent: '#38BDF8',
    },
    {
        title: 'Win Chain',
        body: 'Finish one easy task first. Momentum is a real resource.',
        icon: ChartNoAxesColumnIncreasing,
        bg: '#E8FBEF',
        accent: '#22C55E',
    },
];

export default function HabitMagicDeck() {
    return (
        <section className="mt-7">
            <div className="mb-4">
                <h2 className="text-xl font-black uppercase leading-tight text-white">Habit Magic</h2>
                <p className="mt-1 text-xs font-bold text-zinc-500">Small methods that make discipline easier.</p>
            </div>
            <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.article
                            key={card.title}
                            className="min-h-[214px] w-[168px] shrink-0 rounded-[28px] p-4 text-[#111111]"
                            style={{ backgroundColor: card.bg }}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Forge Intel</span>
                                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/80" style={{ color: card.accent }}>
                                    <Icon className="h-5 w-5" />
                                </span>
                            </div>
                            <h3 className="mt-7 text-2xl font-black uppercase leading-[1.05]">{card.title}</h3>
                            <p className="mt-4 text-xs font-bold leading-5 text-[#202020]/70">{card.body}</p>
                            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/70">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: card.accent }}
                                    initial={{ width: '24%' }}
                                    whileInView={{ width: `${58 + index * 10}%` }}
                                    viewport={{ once: true }}
                                />
                            </div>
                        </motion.article>
                    );
                })}
            </div>
        </section>
    );
}
