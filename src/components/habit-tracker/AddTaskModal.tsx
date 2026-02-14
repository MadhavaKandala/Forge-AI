import React, { useState } from 'react';
import { useHabitStore, EisenhowerQuadrant } from '@/store/useHabitStore';
import { Button } from '@/components/ui/button';
import { X, Plus, Clock, Target, ShieldCheck } from 'lucide-react';

export const AddTaskModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { addTask } = useHabitStore();
    const [title, setTitle] = useState('');
    const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>('q1');
    const [subtasks, setSubtasks] = useState<{ title: string }[]>([]);
    const [newSubtask, setNewSubtask] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        addTask({
            title,
            quadrant,
            subtasks
        });

        // Reset
        setTitle('');
        setQuadrant('q1');
        setSubtasks([]);
        onClose();
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, { title: newSubtask }]);
            setNewSubtask('');
        }
    };

    const quadrants: { id: EisenhowerQuadrant; label: string; color: string }[] = [
        { id: 'q1', label: 'Urgent & Important', color: 'bg-red-500' },
        { id: 'q2', label: 'Important, Not Urgent', color: 'bg-[#dfff4f]' },
        { id: 'q3', label: 'Urgent, Not Important', color: 'bg-orange-500' },
        { id: 'q4', label: 'Not Urgent or Important', color: 'bg-zinc-500' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-[#18181B] border border-[#27272A] w-full max-w-sm rounded-[32px] p-6 relative z-10 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter">New Mission</h2>
                    <button onClick={onClose} className="p-2 rounded-full bg-zinc-900 border border-zinc-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-2">Objective Title</label>
                        <input
                            autoFocus
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Master Binary Trees"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#dfff4f] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-2">Priority Quadrant</label>
                        <div className="grid grid-cols-2 gap-2">
                            {quadrants.map((q) => (
                                <button
                                    key={q.id}
                                    type="button"
                                    onClick={() => setQuadrant(q.id)}
                                    className={`p-3 rounded-2xl border text-left flex items-start gap-2 transition-all ${quadrant === q.id ? 'border-[#dfff4f] bg-[#dfff4f]/10' : 'border-zinc-800 bg-zinc-900/50'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${q.color}`}></div>
                                    <div>
                                        <p className={`text-[10px] font-bold leading-tight ${quadrant === q.id ? 'text-[#dfff4f]' : 'text-zinc-400'}`}>{q.label}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-[9px] text-zinc-600 mt-2 italic">* 1-3-5 size will be auto-calculated based on priority.</p>
                    </div>

                    <div>
                        <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-2">Subtasks (Optional)</label>
                        <div className="space-y-2 mb-3 max-h-24 overflow-y-auto custom-scrollbar">
                            {subtasks.map((st, i) => (
                                <div key={i} className="flex items-center gap-2 bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/50">
                                    <ShieldCheck className="w-3 h-3 text-zinc-600" />
                                    <span className="text-xs text-white">{st.title}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                placeholder="Add subtask..."
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                            />
                            <button
                                type="button"
                                onClick={addSubtask}
                                className="p-2 bg-zinc-800 text-white rounded-xl active:scale-95 transition-transform"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-[#dfff4f] text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[#dfff4f]/10 active:scale-95 transition-transform"
                    >
                        Deploy Mission
                    </button>
                </form>
            </div>
        </div>
    );
};
