import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { shallow } from 'zustand/react';
import { useHabitStore } from '@/store/useHabitStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useProgramStore } from '@/store/useProgramStore';
import { cn } from '@/lib/utils';

const formatToday = (): string => new Date().toISOString().split('T')[0];

const timeToMinutes = (t: string): number => {
  const match = t.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
  if (!match) return 1440;
  const h = parseInt(match[1]) % 12;
  const m = parseInt(match[2]);
  const offset = match[3]?.toUpperCase() === 'PM' ? 12 : 0;
  return (h + offset) * 60 + m;
};

export default function HomePage() {
  const navigate = useNavigate();
  const {
    user,
    habits,
    schedule,
    completeHabit,
    initializeDefaults,
  } = useHabitStore(
    (s) => ({
      user: s.user,
      habits: s.habits,
      schedule: s.schedule,
      completeHabit: s.completeHabit,
      initializeDefaults: s.initializeDefaults,
    }),
    shallow
  );

  const { tasks } = useTaskStore((s) => ({ tasks: s.tasks }), shallow);
  const { activePrograms } = useProgramStore((s) => ({ activePrograms: s.activePrograms }), shallow);

  useEffect(() => {
    initializeDefaults();
  }, [initializeDefaults]);

  const today = formatToday();

  // Daily Ops - habits scheduled for today, sorted by time
  const todayHabits = useMemo(
    () =>
      habits
        .filter((h) => h.type === 'checkbox')
        .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)),
    [habits]
  );

  const completedTodayCount = useMemo(
    () => todayHabits.filter((h) => h.completedDates.includes(today)).length,
    [todayHabits, today]
  );

  // Priority matrix - group tasks by quadrant
  const missionsByQuadrant = useMemo(() => {
    const q1 = tasks.filter((t) => t.quadrant === 'q1' && t.status !== 'completed').slice(0, 3);
    const q2 = tasks.filter((t) => t.quadrant === 'q2' && t.status !== 'completed').slice(0, 3);
    const q3 = tasks.filter((t) => t.quadrant === 'q3' && t.status !== 'completed').slice(0, 3);
    const q4 = tasks.filter((t) => t.quadrant === 'q4' && t.status !== 'completed').slice(0, 3);
    return { q1, q2, q3, q4 };
  }, [tasks]);

  // Memoize sorted schedule
  const sortedSchedule = useMemo(
    () =>
      schedule
        .filter((s) => s.period === 'today')
        .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)),
    [schedule]
  );

  const handleHabitTap = useCallback((habitId: string) => {
    const isNowCompleted = completeHabit(habitId);
    if (isNowCompleted) {
      toast.success('+10 XP');
    }
  }, [completeHabit]);

  const quadrantLabels = {
    q1: { label: 'URGENT & IMPORTANT', color: 'bg-red-500/20 border-red-500/50' },
    q2: { label: 'STRATEGIC BUILD', color: 'bg-blue-500/20 border-blue-500/50' },
    q3: { label: 'DELEGATE', color: 'bg-yellow-500/20 border-yellow-500/50' },
    q4: { label: 'ELIMINATE', color: 'bg-gray-500/20 border-gray-500/50' },
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-40">
      {/* Header */}
      <header className="px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">COMMAND CENTER</p>
        <h1 className="text-4xl font-black mt-2">{user.name}</h1>
        <p className="text-sm text-zinc-400 mt-2">Level {user.level} • {user.xp} XP</p>
      </header>

      {/* Program Status Bar */}
      {activePrograms.length > 0 && (
        <div className="px-6 mb-6 space-y-2">
          {activePrograms.map((prog) => {
            const progress = prog.currentDay && prog.totalDays ? (prog.currentDay / prog.totalDays) * 100 : 0;
            return (
              <div key={prog.id} className="rounded-xl border border-zinc-800 bg-[#1C1C1C] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#C8FF00]">{prog.title}</span>
                  <span className="text-xs text-zinc-400">Day {prog.currentDay}/{prog.totalDays}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#C8FF00] to-[#22C55E] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Priority Matrix */}
      <section className="px-6 mb-8">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">PRIORITY MATRIX</h2>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(missionsByQuadrant) as Array<[keyof typeof missionsByQuadrant, any]>).map(([quadrant, missions]) => (
            <div
              key={quadrant}
              className={cn(
                'rounded-xl border p-3 min-h-[140px] flex flex-col',
                quadrantLabels[quadrant].color
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase">{quadrantLabels[quadrant].label}</span>
                <span className="text-lg font-black">{missions.length}</span>
              </div>
              <div className="text-xs space-y-1 flex-1">
                {missions.map((m) => (
                  <p key={m.id} className="line-clamp-1">{m.title}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Habits */}
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">DAILY HABITS</h2>
          <span className="text-xs font-mono text-zinc-400">
            {completedTodayCount}/{todayHabits.length} COMPLETED
          </span>
        </div>
        <div className="space-y-2">
          {todayHabits.map((habit) => {
            const isCompleted = habit.completedDates.includes(today);
            return (
              <button
                key={habit.id}
                type="button"
                onClick={() => handleHabitTap(habit.id)}
                className={cn(
                  'w-full rounded-xl border border-zinc-800 bg-[#1C1C1C] p-3 flex items-center justify-between text-left transition-all',
                  isCompleted && 'opacity-50 bg-[#141414]'
                )}
              >
                <div>
                  <p className={cn('font-semibold text-sm', isCompleted && 'line-through text-zinc-500')}>
                    {habit.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">{habit.time}</p>
                </div>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-600" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Daily Ops Timeline */}
      <section className="px-6 mb-8">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">TACTICAL FOCUS</h2>
        <div className="space-y-2">
          {sortedSchedule.map((item) => (
            <div key={item.id} className="rounded-xl border border-zinc-800 bg-[#1C1C1C] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                    <Clock className="w-3 h-3" />
                    {item.time} • {item.duration || 'TBD'}
                  </div>
                </div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#0A0A0A] to-transparent px-6 py-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/tasks')}
          className="rounded-lg border border-zinc-700 bg-[#1C1C1C] h-12 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          MISSIONS
        </button>
        <button
          onClick={() => navigate('/schedule')}
          className="rounded-lg border border-[#C8FF00] bg-[#C8FF00] h-12 font-black text-xs text-black uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Clock className="w-4 h-4" />
          SCHEDULE
        </button>
      </div>
    </div>
  );
}
