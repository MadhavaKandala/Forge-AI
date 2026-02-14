import React from 'react';
import { Plus, Code, Dumbbell, Utensils, Heart, GraduationCap, Coffee, BookOpen } from 'lucide-react';
import { useHabitStore, Category } from '@/store/useHabitStore';
import { CompactHabitCard } from './CompactHabitCard';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
    coding: <Code className="w-4 h-4" />,
    gym: <Dumbbell className="w-4 h-4" />,
    diet: <Utensils className="w-4 h-4" />,
    devotional: <BookOpen className="w-4 h-4" />,
    academics: <GraduationCap className="w-4 h-4" />,
    personal: <Heart className="w-4 h-4" />,
    breaks: <Coffee className="w-4 h-4" />
};

export const HabitList = () => {
    const { habits, toggleHabit, selectedDate } = useHabitStore();

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const dateStr = formatDate(selectedDate);

    const categories: Category[] = ['coding', 'gym', 'diet', 'devotional', 'academics', 'personal', 'breaks'];

    return (
        <div className="w-full px-4 mb-8 flex-1">
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-white">Daily Habits</h2>
                    <p className="text-xs text-muted-foreground">{habits.length} habits tracked</p>
                </div>
                <button className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-6">
                {categories.map((cat) => {
                    const categoryHabits = habits.filter(h => h.category === cat);
                    if (categoryHabits.length === 0) return null;

                    const completedCount = categoryHabits.filter(h => h.completedDates.includes(dateStr)).length;

                    return (
                        <div key={cat} className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                        {CATEGORY_ICONS[cat]}
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                                        {cat}
                                    </h3>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-500">
                                    {completedCount}/{categoryHabits.length}
                                </span>
                            </div>

                            <div className="bg-card/30 rounded-2xl border p-1 space-y-0.5">
                                {categoryHabits.map((habit) => (
                                    <CompactHabitCard
                                        key={habit.id}
                                        habit={habit}
                                        isCompleted={habit.completedDates.includes(dateStr)}
                                        onToggle={() => toggleHabit(habit.id, selectedDate)}
                                        currentValue={habit.history[dateStr]}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {habits.length === 0 && (
                <div className="text-center py-10 border border-dashed rounded-3xl opacity-50">
                    <p className="text-zinc-500">No habits configured</p>
                </div>
            )}
        </div>
    );
};
