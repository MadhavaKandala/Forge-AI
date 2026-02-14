import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AddHabitModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const HABIT_TYPES = [
    { value: 'completion', label: '✅ Yes/No', desc: 'Simple check-off' },
    { value: 'counter', label: '🔢 Counter', desc: 'Track a number' },
    { value: 'duration', label: '⏱️ Duration', desc: 'Track time spent' },
];

const CATEGORIES = ['health', 'fitness', 'learning', 'mindfulness', 'productivity', 'social', 'creative', 'other'];

const FREQUENCIES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Custom' },
];

export const AddHabitModal = ({ open, onOpenChange }: AddHabitModalProps) => {
    const { addHabit } = useHabitStore();

    const [name, setName] = useState('');
    const [habitType, setHabitType] = useState('completion');
    const [category, setCategory] = useState('health');
    const [frequency, setFrequency] = useState('daily');
    const [reminderTime, setReminderTime] = useState('');
    const [counterGoal, setCounterGoal] = useState(1);
    const [counterUnit, setCounterUnit] = useState('times');
    const [durationGoal, setDurationGoal] = useState(30);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setIsSubmitting(true);

        try {
            await addHabit({
                name: name.trim(),
                habit_type: habitType as any,
                category,
                recurrence_pattern: frequency,
                difficulty: 'medium' as any,
                reminder_time: reminderTime || undefined,
                ...(habitType === 'counter' ? { counter_goal: counterGoal, counter_unit: counterUnit } : {}),
                ...(habitType === 'duration' ? { duration_goal_minutes: durationGoal } : {}),
            });

            // Reset form
            setName('');
            setHabitType('completion');
            setCategory('health');
            setFrequency('daily');
            setReminderTime('');
            setCounterGoal(1);
            setCounterUnit('times');
            setDurationGoal(30);
            onOpenChange(false);
        } catch (err) {
            console.error('Failed to add habit:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#18181B] border-[#27272A] text-white max-w-md w-[90%] rounded-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Plus className="w-5 h-5 text-[#dfff4f]" />
                        New Habit
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-5 mt-4">
                    {/* Habit Name */}
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-bold mb-2 block">Habit Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Drink 8 glasses of water"
                            className="w-full bg-black/40 border border-[#27272A] rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#dfff4f] transition-colors"
                        />
                    </div>

                    {/* Habit Type */}
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-bold mb-2 block">Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {HABIT_TYPES.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setHabitType(t.value)}
                                    className={`p-3 rounded-xl text-center border transition-all ${habitType === t.value
                                        ? 'bg-[#dfff4f]/10 border-[#dfff4f] text-white'
                                        : 'bg-black/20 border-[#27272A] text-zinc-400 hover:border-zinc-600'
                                        }`}
                                >
                                    <div className="text-lg mb-1">{t.label.split(' ')[0]}</div>
                                    <div className="text-[10px] font-bold uppercase">{t.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Counter Goal */}
                    {habitType === 'counter' && (
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs text-zinc-400 uppercase font-bold mb-2 block">Goal</label>
                                <input
                                    type="number"
                                    value={counterGoal}
                                    onChange={(e) => setCounterGoal(Number(e.target.value))}
                                    min={1}
                                    className="w-full bg-black/40 border border-[#27272A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#dfff4f] transition-colors"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-zinc-400 uppercase font-bold mb-2 block">Unit</label>
                                <input
                                    type="text"
                                    value={counterUnit}
                                    onChange={(e) => setCounterUnit(e.target.value)}
                                    placeholder="e.g. glasses, pages"
                                    className="w-full bg-black/40 border border-[#27272A] rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#dfff4f] transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {/* Duration Goal */}
                    {habitType === 'duration' && (
                        <div>
                            <label className="text-xs text-zinc-400 uppercase font-bold mb-2 block">Duration (minutes)</label>
                            <input
                                type="number"
                                value={durationGoal}
                                onChange={(e) => setDurationGoal(Number(e.target.value))}
                                min={1}
                                className="w-full bg-black/40 border border-[#27272A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#dfff4f] transition-colors"
                            />
                        </div>
                    )}

                    {/* Category */}
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-bold mb-2 block">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${category === c
                                        ? 'bg-[#dfff4f] text-black'
                                        : 'bg-black/20 border border-[#27272A] text-zinc-400 hover:border-zinc-600'
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-bold mb-2 block">Frequency</label>
                        <div className="flex gap-2">
                            {FREQUENCIES.map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => setFrequency(f.value)}
                                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${frequency === f.value
                                        ? 'bg-[#dfff4f]/10 border border-[#dfff4f] text-white'
                                        : 'bg-black/20 border border-[#27272A] text-zinc-400 hover:border-zinc-600'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reminder Time */}
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-bold mb-2 block">Reminder (optional)</label>
                        <input
                            type="time"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="w-full bg-black/40 border border-[#27272A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#dfff4f] transition-colors"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim() || isSubmitting}
                        className="w-full py-3 bg-[#dfff4f] text-black font-bold rounded-xl text-sm hover:bg-[#d4f53f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Habit'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
