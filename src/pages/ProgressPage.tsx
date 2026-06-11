import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Target, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import ForgePet from '@/components/ForgePet';
import { useHabitStore } from '@/store/useHabitStore';
import { getProgressStats, getStatusColor } from '@/lib/progress';

export default function ProgressPage() {
    const navigate = useNavigate();
    const habits = useHabitStore((s) => s.habits);
    const tasks = useHabitStore((s) => s.tasks);
    const stats = useMemo(() => getProgressStats(habits, tasks), [habits, tasks]);
    const statusColor = getStatusColor(stats.status);

    return (
        <main className="min-h-screen bg-[#0A0A0A] px-5 pb-28 pt-14 pt-safe text-white">
            <header className="flex items-center gap-3">
                <button type="button" onClick={() => navigate(-1)} className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-800 bg-[#141414]">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#22C55E]">Track Progress</p>
                    <h1 className="text-2xl font-black uppercase">Visualize Journey</h1>
                </div>
            </header>

            <section className="mt-6 rounded-[30px] border border-zinc-800 bg-[#1C1C1C] p-5">
                <ForgePet status={stats.status} size="lg" />
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#0A0A0A]">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: statusColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.totalToday ? (stats.completedToday / stats.totalToday) * 100 : 0}%` }}
                    />
                </div>
            </section>

            <section className="mt-5 grid grid-cols-3 gap-3">
                {[
                    { label: 'Current', value: stats.currentStreak, icon: Flame },
                    { label: 'Longest', value: stats.longestStreak, icon: Trophy },
                    { label: 'Total Done', value: stats.totalCompleted, icon: Target },
                ].map((item) => {
                    const Icon = item.icon;
                    return (
                        <article key={item.label} className="rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-3">
                            <Icon className="h-4 w-4 text-[#C8FF00]" />
                            <p className="mt-4 text-2xl font-black">{item.value}</p>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">{item.label}</p>
                        </article>
                    );
                })}
            </section>

            <section className="mt-6 rounded-[30px] border border-zinc-800 bg-[#1C1C1C] p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black uppercase">30-Day Map</h2>
                        <p className="mt-1 text-xs font-bold text-zinc-500">Green complete. Yellow partial. Red missed.</p>
                    </div>
                    <span className="rounded-full px-3 py-1 text-[10px] font-black text-black" style={{ backgroundColor: statusColor }}>
                        {stats.completedToday}/{stats.totalToday}
                    </span>
                </div>
                <div className="mt-5 grid grid-cols-10 gap-2">
                    {stats.last30.map((day, index) => (
                        <motion.div
                            key={day.date}
                            className="grid aspect-square place-items-center rounded-xl text-[10px] font-black text-black"
                            style={{ backgroundColor: getStatusColor(day.status) }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.01 }}
                            title={`${day.completed}/${day.total}`}
                        >
                            {day.day}
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="mt-6 rounded-[30px] border border-zinc-800 bg-[#1C1C1C] p-4">
                <h2 className="text-lg font-black uppercase">Signal</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-zinc-500">
                    {stats.status === 'strong'
                        ? 'Today is green. Protect the pattern and stop before you burn out.'
                        : stats.status === 'steady'
                            ? 'Today is yellow. One more small completion can turn the day around.'
                            : 'Today is red. Do the easiest routine step now and restart the chain.'}
                </p>
            </section>
        </main>
    );
}
