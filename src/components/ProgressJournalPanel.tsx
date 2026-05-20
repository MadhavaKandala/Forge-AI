import { Flame, PenLine } from 'lucide-react';
import { MoodHistoryEntry } from '@/store/useHabitStore';
import { MOOD_CONTENT } from '@/lib/moodContent';

interface ProgressJournalPanelProps {
    streak: number;
    completedToday: number;
    totalToday: number;
    mood: MoodHistoryEntry | null;
    onMoodTap: () => void;
    onJournalOpen: () => void;
    onProgressOpen: () => void;
}

const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
});

export default function ProgressJournalPanel({ streak, completedToday, totalToday, mood, onMoodTap, onJournalOpen, onProgressOpen }: ProgressJournalPanelProps) {
    const moodContent = mood ? MOOD_CONTENT[mood.mood] : null;
    const ratio = totalToday > 0 ? completedToday / totalToday : 0;
    const statusColor = ratio >= 1 ? '#22C55E' : ratio > 0 ? '#FACC15' : '#FF4444';

    return (
        <section className="mt-7 grid grid-cols-1 gap-4">
            <button
                type="button"
                onClick={onJournalOpen}
                className="rounded-[28px] border border-zinc-800 bg-[#1C1C1C] p-4 text-left"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FACC15]">Daily Journal</p>
                        <h2 className="mt-2 text-xl font-black uppercase text-white">Keep a Daily Journal</h2>
                        <p className="mt-1 text-xs font-bold text-zinc-500">Reset your mind. Reconnect with yourself.</p>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#FACC15] text-black">
                        <PenLine className="h-5 w-5" />
                    </span>
                </div>
                <div className="mt-5 rounded-2xl border border-zinc-800 bg-[#0A0A0A] p-4">
                    <p className="text-xs font-black text-zinc-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <div className="mt-3 rounded-xl bg-[#141414] p-3">
                        <p className="text-sm font-black text-white">{moodContent?.label ?? 'How are you showing up today?'}</p>
                        <p className="mt-1 text-xs font-bold text-zinc-500">{moodContent?.message ?? 'Open your journal, choose a mood, name the reason, and leave one honest note.'}</p>
                    </div>
                </div>
                <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                        event.stopPropagation();
                        onMoodTap();
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onMoodTap();
                        }
                    }}
                    className="mt-3 inline-flex h-9 items-center rounded-lg bg-[#FACC15] px-3 text-[10px] font-black uppercase tracking-[0.14em] text-black"
                >
                    Mood Check
                </span>
            </button>

            <button type="button" onClick={onProgressOpen} className="rounded-[28px] border border-zinc-800 bg-[#1C1C1C] p-4 text-left">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22C55E]">Track Progress</p>
                        <h2 className="mt-2 text-xl font-black uppercase text-white">Visualize the Journey</h2>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-full text-black" style={{ backgroundColor: statusColor }}>
                        <Flame className="h-5 w-5" />
                    </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-[#141414] p-3">
                        <p className="text-[10px] font-black uppercase text-zinc-500">Streak</p>
                        <p className="mt-2 text-2xl font-black text-white">{streak}</p>
                    </div>
                    <div className="rounded-2xl bg-[#141414] p-3">
                        <p className="text-[10px] font-black uppercase text-zinc-500">Today</p>
                        <p className="mt-2 text-2xl font-black text-white">{completedToday}/{totalToday}</p>
                    </div>
                    <div className="rounded-2xl bg-[#141414] p-3">
                        <p className="text-[10px] font-black uppercase text-zinc-500">XP</p>
                        <p className="mt-2 text-2xl font-black text-[#C8FF00]">+{completedToday * 10}</p>
                    </div>
                </div>
                <div className="mt-5 grid grid-cols-7 gap-2">
                    {lastSevenDays.map((date, index) => {
                        const active = index < Math.min(completedToday + 1, 7);
                        return (
                            <span key={date.toISOString()} className="text-center">
                                <span className="block text-[9px] font-black uppercase text-zinc-600">
                                    {date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}
                                </span>
                                <span className={`mt-2 grid h-8 place-items-center rounded-full text-[10px] font-black ${active ? 'text-black' : 'bg-[#141414] text-zinc-600'}`} style={active ? { backgroundColor: statusColor } : undefined}>
                                    {date.getDate()}
                                </span>
                            </span>
                        );
                    })}
                </div>
            </button>
        </section>
    );
}
