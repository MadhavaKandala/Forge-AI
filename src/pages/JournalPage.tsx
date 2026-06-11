import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { MOOD_CONTENT, MOOD_ORDER, type MoodKey } from '@/lib/moodContent';
import ForgePet from '@/components/ForgePet';
import { getProgressStats } from '@/lib/progress';
import { cn } from '@/lib/utils';

const feelings = ['Brave', 'Excited', 'Relaxed', 'Clear', 'Tired', 'Restless'];
const reasons = ['Love', 'Exercise', 'Finance', 'College', 'Family', 'Progress'];

export default function JournalPage() {
    const navigate = useNavigate();
    const habits = useHabitStore((s) => s.habits);
    const tasks = useHabitStore((s) => s.tasks);
    const todayMood = useHabitStore((s) => s.todayMood);
    const setTodayMood = useHabitStore((s) => s.setTodayMood);
    const addJournalEntry = useHabitStore((s) => s.addJournalEntry);
    const journalEntries = useHabitStore((s) => s.journalEntries);
    const today = new Date().toISOString().split('T')[0];
    const existingEntry = journalEntries.find((entry) => entry.date === today);
    const [mood, setMood] = useState<MoodKey>(todayMood?.date === today ? todayMood.mood : 'locked_in');
    const [selectedFeelings, setSelectedFeelings] = useState<string[]>(existingEntry?.feelings ?? []);
    const [selectedReasons, setSelectedReasons] = useState<string[]>(existingEntry?.reasons ?? []);
    const [note, setNote] = useState(existingEntry?.note ?? '');
    const stats = useMemo(() => getProgressStats(habits, tasks), [habits, tasks]);

    const toggle = (value: string, values: string[], setter: (next: string[]) => void) => {
        setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
    };

    const save = () => {
        setTodayMood(mood);
        addJournalEntry({
            date: today,
            mood,
            feelings: selectedFeelings,
            reasons: selectedReasons,
            note: note.trim(),
        });
    };

    return (
        <main className="min-h-screen bg-[#0A0A0A] px-5 pb-28 pt-14 pt-safe text-white">
            <header className="flex items-center gap-3">
                <button type="button" onClick={() => navigate(-1)} className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-800 bg-[#141414]">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#FACC15]">Daily Journal</p>
                    <h1 className="text-2xl font-black uppercase">Reset Your Mind</h1>
                </div>
            </header>

            <section className="mt-6 rounded-[30px] border border-zinc-800 bg-[#1C1C1C] p-4">
                <ForgePet status={stats.status} />
            </section>

            <section className="mt-6 rounded-[32px] bg-[#FFF4CC] p-5 text-[#171717] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                <p className="text-center text-sm font-black">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                <div className="mt-5 rounded-2xl bg-white/75 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8A6A00]">Today's mood</p>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                        {MOOD_ORDER.map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setMood(item)}
                                className={cn(
                                    'flex items-center justify-between rounded-xl border bg-white/70 px-3 py-2 text-left',
                                    mood === item ? 'border-[#C8FF00]' : 'border-transparent',
                                )}
                            >
                                <span>
                                    <span className="block text-sm font-black">{MOOD_CONTENT[item].label}</span>
                                    <span className="text-[11px] font-bold text-[#171717]/55">{MOOD_CONTENT[item].message}</span>
                                </span>
                                {mood === item && <Check className="h-4 w-4" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8A6A00]">Today I'm feeling...</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {feelings.map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => toggle(item, selectedFeelings, setSelectedFeelings)}
                                className={cn('rounded-full px-3 py-2 text-xs font-black', selectedFeelings.includes(item) ? 'bg-[#FACC15]' : 'bg-white/70')}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8A6A00]">I feel this way because of...</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {reasons.map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => toggle(item, selectedReasons, setSelectedReasons)}
                                className={cn('rounded-full px-3 py-2 text-xs font-black', selectedReasons.includes(item) ? 'bg-[#C8FF00]' : 'bg-white/70')}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                <label className="mt-5 block">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#8A6A00]">Scratch paper</span>
                    <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Write one honest line. No performance. Just truth."
                        className="mt-2 min-h-52 w-full resize-none rounded-2xl border border-[#E9D982] bg-[#FFFBE5] p-4 text-lg leading-8 text-[#292211] outline-none"
                        style={{ fontFamily: 'Segoe Print, Comic Sans MS, cursive' }}
                    />
                </label>
            </section>

            <button
                type="button"
                onClick={save}
                className="mt-5 h-12 w-full rounded-xl bg-[#C8FF00] text-xs font-black uppercase tracking-[0.18em] text-black"
            >
                Save Journal
            </button>
        </main>
    );
}
