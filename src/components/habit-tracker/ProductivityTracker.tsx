import React, { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { CheckCircle2, Circle, Plus, Zap } from 'lucide-react';
import { AddTaskModal } from './AddTaskModal';
import { cn } from '@/lib/utils';

export const ProductivityTracker = () => {
    const { tasks, toggleTask } = useHabitStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const bigTask = tasks.find(t => t.size === 'big');
    const mediumTasks = tasks.filter(t => t.size === 'medium');
    const smallTasks = tasks.filter(t => t.size === 'small');

    const renderTaskRow = (task: any, color: string) => (
        <div key={task.id} className="flex items-center gap-3 py-1.5 group">
            <button
                onClick={() => toggleTask(task.id)}
                className={cn(
                    "transition-all duration-300 transform active:scale-90",
                    task.completed ? "text-primary" : "text-zinc-600 group-hover:text-zinc-400"
                )}
            >
                {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 stroke-[2px]" />}
            </button>
            <div className={cn("flex-1 min-w-0", task.completed && "opacity-40 italic")}>
                <p className={cn(
                    "text-sm font-semibold tracking-tight truncate",
                    task.completed && "line-through"
                )}>
                    {task.title}
                </p>
            </div>
            {task.size === 'big' && !task.completed && (
                <Zap className="w-3 h-3 text-primary fill-primary shrink-0 animate-pulse" />
            )}
        </div>
    );

    return (
        <div className="w-full px-6 mb-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Focus 1-3-5</h2>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-primary hover:text-primary/80 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4">
                {/* 1 Big Task */}
                <div className="bg-zinc-900/30 rounded-xl border-l-[3px] border-red-500/50 p-2">
                    <div className="flex items-center justify-between mb-1 px-1">
                        <span className="text-[10px] font-black text-red-500/70 uppercase tracking-tighter">01 / Critical</span>
                    </div>
                    {bigTask ? renderTaskRow(bigTask, 'red-500') : <p className="text-[10px] text-zinc-600 italic px-1">No critical focus</p>}
                </div>

                {/* 3 Medium Tasks */}
                <div className="bg-zinc-900/30 rounded-xl border-l-[3px] border-orange-500/50 p-2">
                    <div className="flex items-center justify-between mb-1 px-1">
                        <span className="text-[10px] font-black text-orange-500/70 uppercase tracking-tighter">03 / Supporting</span>
                    </div>
                    <div className="divide-y divide-zinc-800/30">
                        {mediumTasks.length > 0 ? mediumTasks.map(t => renderTaskRow(t, 'orange-500')) : <p className="text-[10px] text-zinc-600 italic px-1">Queue empty</p>}
                    </div>
                </div>

                {/* 5 Small Tasks */}
                <div className="bg-zinc-900/30 rounded-xl border-l-[3px] border-emerald-500/50 p-2">
                    <div className="flex items-center justify-between mb-1 px-1">
                        <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-tighter">05 / Micro wins</span>
                    </div>
                    <div className="divide-y divide-zinc-800/30">
                        {smallTasks.length > 0 ? smallTasks.map(t => renderTaskRow(t, 'emerald-500')) : <p className="text-[10px] text-zinc-600 italic px-1">No micro tasks</p>}
                    </div>
                </div>
            </div>

            <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};
