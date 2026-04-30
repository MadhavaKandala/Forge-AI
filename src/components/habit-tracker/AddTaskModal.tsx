import React, { useEffect, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { TaskCategory, EisenhowerQuadrant } from '@/types/task';
import { X, Plus, Clock, Target, ShieldCheck, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';

interface AddTaskModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onTaskAdded?: () => void;
    trigger?: React.ReactNode;
    initialTitle?: string;
}

export const AddTaskModal = ({ isOpen: controlledIsOpen, onClose, onTaskAdded, trigger, initialTitle }: AddTaskModalProps) => {
    const { addTask } = useHabitStore();
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const handleClose = onClose || (() => setInternalIsOpen(false));

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<TaskCategory>('coding');
    const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>('q2');
    const [estimatedMinutes, setEstimatedMinutes] = useState<number>(25);
    const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
    const [newSubtask, setNewSubtask] = useState('');

    useEffect(() => {
        if (isOpen && initialTitle) {
            setTitle(initialTitle);
        }
    }, [isOpen, initialTitle]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            await addTask({
                title,
                description: description.trim() || undefined,
                category,
                quadrant,
                estimatedMinutes,
                scheduledDate,
                subtasks,
                isRecurring: false
            });
            toast.success("Mission Deployed Successfully");
        } catch (error) {
            toast.error("Failed to deploy mission");
            console.error(error);
        }

        // Reset
        setTitle('');
        setDescription('');
        setCategory('coding');
        setQuadrant('q2');
        setEstimatedMinutes(25);
        setScheduledDate(new Date().toISOString().split('T')[0]);
        setSubtasks([]);
        handleClose();
        if (onTaskAdded) onTaskAdded();
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, { id: Math.random().toString(36).substr(2, 9), title: newSubtask, completed: false }]);
            setNewSubtask('');
        }
    };

    const quadrants: { id: EisenhowerQuadrant; label: string; color: string }[] = [
        { id: 'q1', label: 'Urgent & Important', color: 'bg-red-500' },
        { id: 'q2', label: 'Strategic Build', color: 'bg-[#dfff4f]' },
        { id: 'q3', label: 'Urgent, Not Strategic', color: 'bg-orange-500' },
        { id: 'q4', label: 'Low Leverage', color: 'bg-zinc-500' },
    ];

    return (
        <>
            {trigger ? (
                <span className="flex items-center justify-center cursor-pointer" onClick={() => setInternalIsOpen(true)}>
                    {trigger}
                </span>
            ) : controlledIsOpen === undefined && (
                <button
                    onClick={() => setInternalIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-2xl bg-[#dfff4f] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
                >
                    <Plus className="h-7 w-7 transition-transform group-hover:rotate-90" />
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[110]">
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={handleClose}></div>
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-h-[90vh] overflow-y-auto bg-[#09090B] border border-[#27272A] w-full max-w-md rounded-[32px] p-6 animate-in zoom-in-95 duration-200 px-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">New Mission</h2>
                            <button onClick={handleClose} className="p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
                            <div>
                                <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1.5 ml-1">Objective Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Master Binary Trees"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#dfff4f] transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1.5 ml-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as TaskCategory)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="coding">Coding</option>
                                        <option value="gym">Gym</option>
                                        <option value="diet">Diet</option>
                                        <option value="academics">Academics</option>
                                        <option value="personal">Personal</option>
                                        <option value="devotional">Devotional</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1.5 ml-1">Estimate (Min)</label>
                                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3">
                                        <Clock className="w-3 h-3 text-zinc-600" />
                                        <input
                                            type="number"
                                            value={estimatedMinutes}
                                            onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 0)}
                                            className="w-full bg-transparent py-2.5 text-xs text-white focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Target Date</label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#dfff4f] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1.5 ml-1">Mission Brief</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detailed strategy notes..."
                                    rows={2}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-xs text-zinc-400 focus:outline-none focus:border-[#dfff4f] transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-2 ml-1">Priority Quadrant</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {quadrants.map((q) => (
                                        <button
                                            key={q.id}
                                            type="button"
                                            onClick={() => setQuadrant(q.id)}
                                            className={`p-3 rounded-2xl border text-left flex items-start gap-2 transition-all ${quadrant === q.id ? 'border-[#dfff4f] bg-[#dfff4f]/10' : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${q.color}`}></div>
                                            <p className={`text-[9px] font-bold leading-tight ${quadrant === q.id ? 'text-[#dfff4f]' : 'text-zinc-500'}`}>{q.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1.5 ml-1">Sub-Objectives</label>
                                <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto custom-scrollbar">
                                    {subtasks.map((st, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-800/50">
                                            <ShieldCheck className="w-3 h-3 text-[#dfff4f]" />
                                            <span className="text-[10px] text-zinc-300 font-medium">{st.title}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSubtask}
                                        onChange={(e) => setNewSubtask(e.target.value)}
                                        placeholder="Add checkpoint..."
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-[10px] text-white focus:outline-none focus:border-[#dfff4f] transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                    />
                                    <button
                                        type="button"
                                        onClick={addSubtask}
                                        className="p-2.5 bg-zinc-800 text-white rounded-xl active:scale-95 transition-transform hover:bg-zinc-700"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-[#dfff4f] text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[#dfff4f]/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Target className="w-5 h-5" />
                                    Deploy Mission
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
