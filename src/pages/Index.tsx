import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, ListChecks, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useHabitStore } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';

const toMinutes = (timeValue: string): number => {
  const parsed = timeValue.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!parsed) {
    return Number.POSITIVE_INFINITY;
  }

  const rawHour = Number(parsed[1]);
  const minutes = Number(parsed[2]);
  const suffix = parsed[3].toUpperCase();
  const normalizedHour = rawHour % 12 + (suffix === 'PM' ? 12 : 0);
  return normalizedHour * 60 + minutes;
};

const formatToday = (): string => new Date().toISOString().split('T')[0];

const Index = () => {
  const navigate = useNavigate();
  const {
    user,
    habits,
    tasks,
    schedule,
    initializeDefaults,
    completeHabit,
  } = useHabitStore();

  useEffect(() => {
    initializeDefaults();
  }, [initializeDefaults]);

  const today = formatToday();

  const todayHabits = useMemo(
    () => habits.filter((habit) => habit.type === 'checkbox'),
    [habits]
  );

  const completedHabitsCount = useMemo(
    () => todayHabits.filter((habit) => habit.completedDates.includes(today)).length,
    [today, todayHabits]
  );

  const completedTasksCount = useMemo(
    () => tasks.filter((task) => task.completed || task.status === 'completed').length,
    [tasks]
  );

  const sortedTimeline = useMemo(
    () =>
      [...schedule]
        .filter((item) => item.period === 'today')
        .sort((a, b) => toMinutes(a.time) - toMinutes(b.time)),
    [schedule]
  );

  const handleHabitTap = (habitId: string) => {
    const completedNow = completeHabit(habitId);
    if (completedNow) {
      toast.success('+10 XP');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      <header className="px-5 pt-6 pb-4">
        <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">Daily Command</p>
        <h1 className="text-2xl font-black mt-2">{user.name}</h1>
        <p className="text-zinc-400 text-sm mt-1">XP {user.xp}</p>
      </header>

      <section className="px-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center gap-2 text-zinc-300 text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-[#C8FF00]" />
            Habits
          </div>
          <p className="text-xl font-black mt-2">{completedHabitsCount}/{todayHabits.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center gap-2 text-zinc-300 text-xs uppercase tracking-wider">
            <Target className="w-4 h-4 text-[#C8FF00]" />
            Missions
          </div>
          <p className="text-xl font-black mt-2">{completedTasksCount}/{tasks.length}</p>
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Habit Checks</h2>
        <div className="mt-3 space-y-2">
          {todayHabits.map((habit) => {
            const isCompleted = habit.completedDates.includes(today);
            return (
              <button
                key={habit.id}
                type="button"
                onClick={() => handleHabitTap(habit.id)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 flex items-center justify-between text-left"
              >
                <div>
                  <p className={cn('font-semibold', isCompleted && 'line-through text-zinc-500')}>{habit.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">{habit.time}</p>
                </div>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-[#C8FF00]" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-600" />
                )}
              </button>
            );
          })}
          {todayHabits.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 text-zinc-500 text-sm">
              No habits available.
            </div>
          )}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Daily Ops</h2>
        <div className="mt-3 space-y-2">
          {sortedTimeline.map((item) => (
            <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{item.title}</p>
                <span className="text-xs text-zinc-500">{item.duration ?? 'Block'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                <Clock className="w-3.5 h-3.5" />
                {item.time}
              </div>
            </div>
          ))}
          {sortedTimeline.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 text-zinc-500 text-sm">
              No timeline items scheduled.
            </div>
          )}
        </div>
      </section>

      <div className="fixed bottom-6 left-0 w-full px-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate('/tasks')}
          className="rounded-full border border-zinc-700 bg-zinc-900 h-12 text-xs font-black tracking-[0.12em] flex items-center justify-center gap-2"
        >
          <ListChecks className="w-4 h-4" />
          MISSIONS
        </button>
        <button
          type="button"
          onClick={() => navigate('/schedule')}
          className="rounded-full border border-zinc-700 bg-zinc-900 h-12 text-xs font-black tracking-[0.12em] flex items-center justify-center gap-2"
        >
          <Clock className="w-4 h-4" />
          SCHEDULE
        </button>
      </div>
    </div>
  );
};

export default Index;
