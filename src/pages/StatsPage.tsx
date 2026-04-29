import React, { useMemo, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { TrendingUp, Target, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const getLevelInfo = (xp: number) => {
  const levels = [
    { threshold: 0, level: 1, title: 'RECRUIT' },
    { threshold: 1000, level: 2, title: 'OPERATIVE' },
    { threshold: 3000, level: 3, title: 'AGENT' },
    { threshold: 6000, level: 4, title: 'COMMANDER' },
    { threshold: 10000, level: 5, title: 'ELITE' },
  ];
  
  const info = levels.reduceRight((acc, cur) => (xp >= cur.threshold ? cur : acc), levels[0]);
  return info;
};

export default function StatsPage() {
  const { user, tasks, habits } = useHabitStore();
  const [dateFilter, setDateFilter] = useState<'day' | 'week' | 'year'>('day');

  const today = new Date().toISOString().split('T')[0];

  // Tactical Focus - urgent & important tasks in progress today
  const tacticalCount = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (t.status === 'today' || t.status === 'in_progress') &&
          (t.quadrant === 'q1')
      ).length,
    [tasks]
  );

  // Strategic Build - tasks in q2 (important but not urgent)
  const strategicCount = useMemo(
    () => tasks.filter((t) => t.quadrant === 'q2' && t.status !== 'completed').length,
    [tasks]
  );

  // Future Vision - tasks in q3 (urgent but not important)
  const futureCount = useMemo(
    () => tasks.filter((t) => t.quadrant === 'q3' && t.status !== 'completed').length,
    [tasks]
  );

  // Mastery Logic - daily habit completion %
  const completedHabitsToday = useMemo(
    () => habits.filter((h) => h.completedDates.includes(today)).length,
    [habits, today]
  );

  const masteryLogic = useMemo(
    () => (habits.length > 0 ? Math.round((completedHabitsToday / habits.length) * 100) : 0),
    [completedHabitsToday, habits]
  );

  // Velocity Index - total XP and level
  const velocityXP = user?.xp ?? 0;
  const levelInfo = getLevelInfo(velocityXP);

  // Filter missions by date range
  const filteredTaskCount = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (dateFilter === 'day') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (dateFilter === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (dateFilter === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
    }

    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      return taskDate >= startDate && taskDate <= endDate && t.status !== 'completed';
    }).length;
  }, [tasks, dateFilter]);

  const statCards = [
    {
      label: 'TACTICAL FOCUS',
      value: tacticalCount,
      sublabel: 'Urgent & Important',
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/30',
    },
    {
      label: 'STRATEGIC BUILD',
      value: strategicCount,
      sublabel: 'Important, Non-Urgent',
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/30',
    },
    {
      label: 'FUTURE VISION',
      value: futureCount,
      sublabel: 'Delegatable',
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/30',
    },
    {
      label: 'MASTERY LOGIC',
      value: `${masteryLogic}%`,
      sublabel: 'Daily Completion',
      icon: Zap,
      color: 'text-[#C8FF00]',
      bgColor: 'bg-[#C8FF00]/10 border-[#C8FF00]/30',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-6 border-b border-zinc-800">
        <h1 className="text-3xl font-black">INTEL DASHBOARD</h1>
        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-[0.15em]">Real-time Stats & Analytics</p>
      </header>

      {/* Velocity Index Card */}
      <div className="m-6 rounded-xl border border-zinc-800 bg-gradient-to-br from-[#1C1C1C] to-[#141414] p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase text-zinc-500 font-bold">VELOCITY INDEX</p>
            <div className="mt-3">
              <p className="text-4xl font-black">{levelInfo.title}</p>
              <p className="text-lg text-[#C8FF00] font-black mt-1">Level {levelInfo.level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black">{velocityXP}</p>
            <p className="text-xs text-zinc-500 uppercase">Total XP</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4 w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#C8FF00] to-[#22C55E]"
            style={{ width: `${(velocityXP % 5000) / 50}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          {velocityXP % 5000} / 5000 XP to next level
        </p>
      </div>

      {/* Stats Grid */}
      <div className="px-6 mb-8 space-y-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={cn('rounded-xl border p-4 flex items-start justify-between', card.bgColor)}
            >
              <div>
                <p className="text-xs uppercase font-black text-zinc-400">{card.label}</p>
                <p className="text-3xl font-black mt-2">{card.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{card.sublabel}</p>
              </div>
              <Icon className={cn('w-6 h-6', card.color)} />
            </div>
          );
        })}
      </div>

      {/* Date Filter & Mission Count */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs uppercase font-bold text-zinc-500">FILTER MISSIONS BY</p>
        </div>
        <div className="flex gap-2 mb-4">
          {['day', 'week', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setDateFilter(period as 'day' | 'week' | 'year')}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all',
                dateFilter === period
                  ? 'bg-[#C8FF00] text-black'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              )}
            >
              {period === 'day' ? 'TODAY' : period === 'week' ? 'THIS WEEK' : 'THIS YEAR'}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4">
          <p className="text-xs uppercase text-zinc-500 font-bold">Active Missions</p>
          <p className="text-2xl font-black mt-2">{filteredTaskCount}</p>
          <p className="text-xs text-zinc-400 mt-1">
            {dateFilter === 'day'
              ? 'due today'
              : dateFilter === 'week'
              ? 'due this week'
              : 'due this year'}
          </p>
        </div>
      </div>

      {/* Habit Tracker Summary */}
      <div className="px-6 mb-8">
        <p className="text-xs uppercase font-bold text-zinc-500 mb-4">DAILY HABITS</p>
        <div className="rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Completed Today</span>
            <span className="text-lg font-black">{completedHabitsToday}/{habits.length}</span>
          </div>
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C8FF00] to-[#22C55E]"
              style={{ width: `${habits.length > 0 ? (completedHabitsToday / habits.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task Summary */}
      <div className="px-6 mb-8">
        <p className="text-xs uppercase font-bold text-zinc-500 mb-4">MISSION BREAKDOWN</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4">
            <p className="text-xs text-zinc-500">Total Missions</p>
            <p className="text-2xl font-black mt-2">{tasks.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4">
            <p className="text-xs text-zinc-500">Completed</p>
            <p className="text-2xl font-black mt-2 text-[#22C55E]">
              {tasks.filter((t) => t.status === 'completed').length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4">
            <p className="text-xs text-zinc-500">In Progress</p>
            <p className="text-2xl font-black mt-2">{tasks.filter((t) => t.status === 'in_progress').length}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4">
            <p className="text-xs text-zinc-500">Backlog</p>
            <p className="text-2xl font-black mt-2">{tasks.filter((t) => t.status === 'backlog').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
