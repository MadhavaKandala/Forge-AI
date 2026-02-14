import React from 'react';
import { useHabitStore, Task, EisenhowerQuadrant } from '@/store/useHabitStore';
import { AlertCircle, Clock, CheckCircle2, Trash2 } from 'lucide-react';

export const EisenhowerMatrix = () => {
    const { tasks, toggleTask, deleteTask } = useHabitStore();

    // Group tasks by quadrant
    const quadrants: Record<EisenhowerQuadrant, Task[]> = {
        q1: tasks.filter(t => t.quadrant === 'q1'),
        q2: tasks.filter(t => t.quadrant === 'q2'),
        q3: tasks.filter(t => t.quadrant === 'q3'),
        q4: tasks.filter(t => t.quadrant === 'q4'),
    };

    const quadrantConfig = {
        q1: { title: 'Do First', subtitle: 'Urgent & Important', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        q2: { title: 'Schedule', subtitle: 'Not Urgent & Important', color: 'text-[#dfff4f]', bg: 'bg-[#dfff4f]/10', border: 'border-[#dfff4f]/20' },
        q3: { title: 'Delegate', subtitle: 'Urgent & Not Important', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
        q4: { title: 'Eliminate', subtitle: 'Not Urgent & Not Important', color: 'text-zinc-500', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
    };

    return (
        <div className="w-full px-6 mb-8 mt-6">
            <h2 className="text-xl font-bold text-white mb-4">Priority Matrix</h2>
            <div className="grid grid-cols-2 gap-3">
                {Object.entries(quadrantConfig).map(([key, config]) => {
                    const qKey = key as EisenhowerQuadrant;
                    const qTasks = quadrants[qKey];

                    return (
                        <div key={key} className={`rounded-2xl border p-3 flex flex-col h-40 ${config.bg} ${config.border}`}>
                            <div className="mb-2">
                                <h3 className={`text-sm font-bold ${config.color}`}>{config.title}</h3>
                                <p className="text-[10px] text-zinc-400 opacity-80">{config.subtitle}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                                {qTasks.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-[10px] text-zinc-600 italic">Empty</p>
                                    </div>
                                ) : (
                                    qTasks.map(task => (
                                        <div key={task.id} className="bg-[#18181B]/80 rounded-lg p-2 border border-zinc-800 flex items-start justify-between group">
                                            <div className="flex items-start gap-2 max-w-[80%]">
                                                <button
                                                    onClick={() => toggleTask(task.id)}
                                                    className={`mt-0.5 w-3 h-3 rounded-full border flex-shrink-0 ${task.completed ? 'bg-green-500 border-green-500' : 'border-zinc-500'}`}
                                                />
                                                <span className={`text-xs text-white leading-tight ${task.completed ? 'line-through opacity-50' : ''}`}>
                                                    {task.title}
                                                </span>
                                            </div>
                                            <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-3 h-3 text-red-500" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
