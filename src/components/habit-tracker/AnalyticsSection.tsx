import React, { useState } from 'react';
import {
    Activity, TrendingUp, Calendar, Layout,
    Target, Zap, Rocket, ShieldCheck, ChevronRight,
    TrendingDown, Plus
} from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';

type TimePeriod = 'day' | 'week' | 'year';

export const AnalyticsSection = () => {
    const { habits, tasks, schedule, user, getDailyProgress } = useHabitStore();
    const [period, setPeriod] = useState<TimePeriod>('day');

    // Filter tasks based on period or matrix significance
    const dailyTasks = tasks.filter(t => t.status === 'today' || t.status === 'in_progress');
    const weeklyTasks = tasks.filter(t => t.status === 'this_week');
    const backlogTasks = tasks.filter(t => t.status === 'backlog');

    // Filter schedule for Tactical Focus
    const currentSchedule = schedule.filter(s => s.period === 'today').slice(0, 3);

    // Calculate habit consistency
    const habitCompletion = getDailyProgress(new Date());

    const MatrixCard = ({
        title,
        icon: Icon,
        tasks: quadrantTasks,
        items, // For schedule or habits
        metric,
        color,
        subtitle
    }: {
        title: string,
        icon: any,
        tasks?: any[],
        items?: { title: string, time?: string }[],
        metric?: string | number,
        color: string,
        subtitle: string
    }) => (
        <div className={cn(
            "relative overflow-hidden bg-[#18181B] border border-[#27272A] rounded-2xl p-4 flex flex-col h-[190px]",
            `hover:border-${color}/50 transition-all group`
        )}>
            <div className="flex items-center justify-between mb-3">
                <div className={cn("p-1.5 rounded-lg bg-zinc-800", `text-${color}`)}>
                    <Icon className="w-4 h-4" />
                </div>
                {metric !== undefined && (
                    <span className={cn("text-lg font-black tracking-tighter", `text-${color}`)}>{metric}</span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">{title}</h3>
                <p className="text-white text-xs font-bold truncate mb-3">{subtitle}</p>

                <div className="space-y-1.5 overflow-y-auto no-scrollbar max-h-[85px]">
                    {/* Render Tasks if provided */}
                    {quadrantTasks && quadrantTasks.length > 0 && quadrantTasks.slice(0, 2).map((t, i) => (
                        <div key={`task-${i}`} className="flex items-start gap-2">
                            <div className={cn("w-1 h-1 rounded-full mt-1.5 shrink-0", `bg-${color}`)} />
                            <span className="text-[10px] text-zinc-400 leading-tight line-clamp-2">{t.title}</span>
                        </div>
                    ))}

                    {/* Render custom items (Schedule/Habits) if provided */}
                    {items && items.length > 0 && items.map((item, i) => (
                        <div key={`item-${i}`} className="flex items-start gap-2">
                            <div className={cn("w-1 h-1 rounded-full mt-1.5 shrink-0", `bg-${color}`)} />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-300 leading-tight font-medium">{item.title}</span>
                                {item.time && <span className="text-[8px] text-zinc-500 uppercase">{item.time}</span>}
                            </div>
                        </div>
                    ))}

                    {(!quadrantTasks || quadrantTasks.length === 0) && (!items || items.length === 0) && (
                        <div className="text-[10px] text-zinc-600 italic">Clear horizon</div>
                    )}
                </div>
            </div>

            <button aria-label="Add specific data point" className="absolute bottom-2 right-2 p-1 rounded-full bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-3 h-3 text-zinc-400" />
            </button>
        </div>
    );

    return (
        <div className="w-full px-6 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Tabs */}
            <div className="flex items-center justify-between mb-8 mt-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-white tracking-tight">Executive Summary</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Strategic Overview</p>
                </div>
                <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
                    {(['day', 'week', 'year'] as TimePeriod[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                period === p ? "bg-primary text-black" : "text-zinc-500"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* The Strategic Matrix Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                {/* Q1: Tactical (Daily) */}
                <MatrixCard
                    title="Tactical Focus"
                    subtitle={period === 'day' ? "Current Execution" : "Action Steps"}
                    icon={Zap}
                    tasks={period === 'day' ? dailyTasks : []}
                    items={period === 'day' ? currentSchedule.map(s => ({ title: s.title, time: s.time })) : []}
                    metric={dailyTasks.length}
                    color="red-500"
                />

                {/* Q2: Strategic (Weekly) */}
                <MatrixCard
                    title="Strategic Build"
                    subtitle="Systemic Growth"
                    icon={Target}
                    tasks={weeklyTasks}
                    metric={weeklyTasks.length}
                    color="blue-500"
                />

                {/* Q3: Future Vision (Yearly) */}
                <MatrixCard
                    title="Future Vision"
                    subtitle="Vision / Long-Term"
                    icon={Rocket}
                    tasks={backlogTasks}
                    metric={backlogTasks.length}
                    color="purple-500"
                />

                {/* Q4: Systems & Logic (Habits) */}
                <MatrixCard
                    title="Mastery Logic"
                    subtitle="Habit Consistency"
                    icon={ShieldCheck}
                    metric={`${habitCompletion}%`}
                    items={habits.filter(h => h.streak > 5).slice(0, 2).map(h => ({ title: h.title, time: `${h.streak} day streak` }))}
                    color="emerald-500"
                />
            </div>

            {/* Long-term Performance Summary */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity className="w-32 h-32 text-primary" />
                </div>

                <h3 className="font-bold text-white mb-6 relative">Velocity Index</h3>

                <div className="grid grid-cols-2 gap-8 relative">
                    <div>
                        <div className="text-3xl font-black text-white tracking-tighter mb-1">
                            {user.level}
                            <span className="text-xs text-zinc-500 ml-2 font-bold uppercase tracking-widest">RANK</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1 rounded-full mt-2">
                            <div className="bg-primary h-full rounded-full w-[65%]" />
                        </div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">{user.xp} XP total earned</p>
                    </div>

                    <div className="flex flex-col justify-end items-end">
                        <div className="flex items-center gap-2 text-primary">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xl font-bold">12.4%</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-right">Weekly Progress Lift</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
