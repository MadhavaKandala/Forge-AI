import React from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { CheckCircle2, Circle } from 'lucide-react';

export const ProductivityTracker = () => {
    const { tasks, toggleTask } = useHabitStore();

    // 1-3-5 Rule Logic
    const bigTask = tasks.find(t => t.size === 'big');
    const mediumTasks = tasks.filter(t => t.size === 'medium');
    const smallTasks = tasks.filter(t => t.size === 'small');

    const renderTaskRow = (task: any) => (
        <div key={task.id} className="flex items-center justify-between py-2 border-b border-[#27272A] last:border-0 group">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => toggleTask(task.id)}
                    className={`transition-colors ${task.completed ? 'text-[#dfff4f]' : 'text-zinc-600 group-hover:text-zinc-400'}`}
                >
                    {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                <div className={task.completed ? 'opacity-50 line-through' : ''}>
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    {task.subtasks.length > 0 && (
                        <p className="text-[10px] text-zinc-500">
                            {task.subtasks.filter((st: any) => st.completed).length}/{task.subtasks.length} subtasks
                        </p>
                    )}
                </div>
            </div>
            {task.size === 'big' && !task.completed && (
                <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-bold uppercase">
                    Focus
                </span>
            )}
        </div>
    );

    const calculateProgress = (taskList: any[]) => {
        if (taskList.length === 0) return 0;
        return (taskList.filter(t => t.completed).length / taskList.length) * 100;
    };

    return (
        <div className="w-full px-6 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Daily Targets (1-3-5)</h2>
                <div className="text-right">
                    <span className="text-xs font-bold text-[#dfff4f]">
                        {tasks.filter(t => t.completed).length}/{tasks.length} Done
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                {/* 1 Big Task */}
                <div className="bg-[#18181B] border border-l-4 border-[#27272A] border-l-red-500 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">1 Big Task</h3>
                    {bigTask ? renderTaskRow(bigTask) : <p className="text-sm text-zinc-600 italic">No big task set</p>}
                </div>

                {/* 3 Medium Tasks */}
                <div className="bg-[#18181B] border border-l-4 border-[#27272A] border-l-orange-500 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">3 Medium Tasks</h3>
                        <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${calculateProgress(mediumTasks)}%` }}></div>
                        </div>
                    </div>
                    <div>
                        {mediumTasks.length > 0 ? mediumTasks.map(renderTaskRow) : <p className="text-sm text-zinc-600 italic">No medium tasks</p>}
                    </div>
                </div>

                {/* 5 Small Tasks */}
                <div className="bg-[#18181B] border border-l-4 border-[#27272A] border-l-green-500 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">5 Small Tasks</h3>
                        <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${calculateProgress(smallTasks)}%` }}></div>
                        </div>
                    </div>
                    <div>
                        {smallTasks.length > 0 ? smallTasks.map(renderTaskRow) : <p className="text-sm text-zinc-600 italic">No small tasks</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};
