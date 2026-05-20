import React, { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { Task } from '@/types/task';
import { CheckCircle2, Circle, Plus, Zap, ShieldCheck } from 'lucide-react';
import { AddTaskModal } from './AddTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { cn } from '@/lib/utils';

export const ProductivityTracker = () => {
    const { tasks, toggleTask } = useHabitStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const bigTask = tasks.find(t => t.size === 'big');
    const mediumTasks = tasks.filter(t => t.size === 'medium');
    const smallTasks = tasks.filter(t => t.size === 'small');

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailOpen(true);
    };

    const renderTaskRow = (task: Task) => {
        const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
        const totalSubtasks = task.subtasks?.length || 0;

        return (
            <div
                key={task.id}
                className="flex items-center gap-3 py-2 group cursor-pointer hover:bg-zinc-900/40 px-2 rounded-lg transition-colors"
                onClick={() => handleTaskClick(task)}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                    }}
                    className={cn(
                        "transition-all duration-300 transform active:scale-90 shrink-0",
                        task.completed ? "text-emerald-500" : "text-zinc-600 group-hover:text-zinc-400"
                    )}
                >
                    {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 stroke-[2px]" />}
                </button>
                <div className={cn("flex-1 min-w-0", task.completed && "opacity-40")}>
                    <p className={cn(
                        "text-sm font-bold tracking-tight truncate",
                        task.completed ? "line-through text-zinc-500" : "text-white"
                    )}>
                        {task.title}
                    </p>
                    {totalSubtasks > 0 && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-zinc-600" />
                            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden max-w-[60px]">
                                <div
                                    className="h-full bg-[#dfff4f] transition-all duration-500"
                                    style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                                />
                            </div>
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">
                                {completedSubtasks}/{totalSubtasks}
                            </span>
                        </div>
                    )}
                </div>
                {task.size === 'big' && !task.completed && (
                    <Zap className="w-3.5 h-3.5 text-[#dfff4f] fill-[#dfff4f] shrink-0 animate-pulse" />
                )}
            </div>
        );
    };

    return (
        <div className="w-full px-6 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Missions 1-3-5</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[#dfff4f] hover:bg-zinc-800 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="grid gap-4">
                {/* 1 Big Task */}
                <div className="bg-zinc-900/20 rounded-2xl border border-zinc-900 p-2 border-l-[4px] border-l-red-500/50">
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest px-2 mb-1 block">Elite Mission</span>
                    {bigTask ? renderTaskRow(bigTask) : <p className="text-[10px] text-zinc-600 italic px-2 py-1">No critical focus</p>}
                </div>

                {/* 3 Medium Tasks */}
                <div className="bg-zinc-900/20 rounded-2xl border border-zinc-900 p-2 border-l-[4px] border-l-orange-500/50">
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest px-2 mb-1 block">High Impact</span>
                    <div className="space-y-1">
                        {mediumTasks.length > 0 ? mediumTasks.map(t => renderTaskRow(t)) : <p className="text-[10px] text-zinc-600 italic px-2 py-1">Strategic queue empty</p>}
                    </div>
                </div>

                {/* 5 Small Tasks */}
                <div className="bg-zinc-900/20 rounded-2xl border border-zinc-900 p-2 border-l-[4px] border-l-emerald-500/50">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-2 mb-1 block">Tactical Wins</span>
                    <div className="space-y-1">
                        {smallTasks.length > 0 ? smallTasks.map(t => renderTaskRow(t)) : <p className="text-[10px] text-zinc-600 italic px-2 py-1">No micro tasks</p>}
                    </div>
                </div>
            </div>

            <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

            <TaskDetailModal
                task={selectedTask}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />
        </div>
    );
};
