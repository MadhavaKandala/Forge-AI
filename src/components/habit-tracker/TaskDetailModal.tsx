import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority, TaskStatus, EisenhowerQuadrant } from '@/types/task';
import { useHabitStore } from '@/store/useHabitStore';
import {
    X, CheckCircle2, Clock, Target, ShieldCheck,
    AlignLeft, Hash, Trash2, Plus, ExternalLink,
    Paperclip, Tag, Save, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TaskDetailModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
    const { updateTask, deleteTask } = useHabitStore();
    const [localTask, setLocalTask] = useState<Task | null>(null);
    const [newSubtask, setNewSubtask] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (task) {
            setLocalTask({ ...task });
        }
    }, [task]);

    if (!isOpen || !localTask) return null;

    const handleSave = async () => {
        if (!localTask) return;
        setIsSaving(true);
        try {
            updateTask(localTask.id, localTask);
            toast.success("Mission data synchronized");
            onClose();
        } catch (error) {
            toast.error("Failed to save mission data");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        if (window.confirm("Abort mission? This will permanently delete all task data.")) {
            deleteTask(localTask.id);
            toast.success("Mission aborted");
            onClose();
        }
    };

    const toggleSubtask = (subtaskId: string) => {
        const updatedSubtasks = localTask.subtasks.map(sh =>
            sh.id === subtaskId ? { ...sh, completed: !sh.completed } : sh
        );
        setLocalTask({ ...localTask, subtasks: updatedSubtasks });
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            const newNode = {
                id: Math.random().toString(36).substr(2, 9),
                title: newSubtask,
                completed: false
            };
            setLocalTask({
                ...localTask,
                subtasks: [...localTask.subtasks, newNode]
            });
            setNewSubtask('');
        }
    };

    const removeSubtask = (subtaskId: string) => {
        setLocalTask({
            ...localTask,
            subtasks: localTask.subtasks.filter(s => s.id !== subtaskId)
        });
    };

    const priorityColors = {
        low: 'bg-blue-500/20 text-blue-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        high: 'bg-red-500/20 text-red-400'
    };

    const quadrants: { id: EisenhowerQuadrant; label: string; color: string }[] = [
        { id: 'q1', label: 'Urgent/Important', color: 'bg-red-500' },
        { id: 'q2', label: 'Strategic Build', color: 'bg-[#dfff4f]' },
        { id: 'q3', label: 'Urgent/Admin', color: 'bg-orange-500' },
        { id: 'q4', label: 'Low Leverage', color: 'bg-zinc-500' },
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-[#09090B] border border-[#27272A] w-full max-w-lg rounded-[32px] overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-zinc-900 flex items-start justify-between bg-zinc-900/20">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={cn("text-[10px] uppercase border-none px-2", priorityColors[localTask.priority])}>
                                {localTask.priority}
                            </Badge>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-1">
                                <Hash className="w-3 h-3" /> {localTask.category}
                            </span>
                        </div>
                        <input
                            value={localTask.title}
                            onChange={(e) => setLocalTask({ ...localTask, title: e.target.value })}
                            className="text-2xl font-black italic uppercase tracking-tighter bg-transparent border-none focus:outline-none w-full text-white"
                        />
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
                        <X className="w-4 h-4 text-zinc-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Time & Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/50 text-center">
                            <Clock className="w-4 h-4 text-zinc-500 mx-auto mb-2" />
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Estimate</p>
                            <input
                                type="number"
                                value={localTask.estimatedMinutes || 0}
                                onChange={(e) => setLocalTask({ ...localTask, estimatedMinutes: parseInt(e.target.value) || 0 })}
                                className="w-full bg-transparent text-center text-lg font-black text-white focus:outline-none"
                            />
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/50 text-center">
                            <Target className="w-4 h-4 text-[#dfff4f] mx-auto mb-2" />
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Status</p>
                            <p className="text-xs font-black uppercase text-[#dfff4f]">{localTask.status.replace('_', ' ')}</p>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/50 text-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-2" />
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Progress</p>
                            <p className="text-lg font-black text-white">
                                {localTask.subtasks.length > 0
                                    ? Math.round((localTask.subtasks.filter(s => s.completed).length / localTask.subtasks.length) * 100)
                                    : (localTask.completed ? 100 : 0)}%
                            </p>
                        </div>
                    </div>

                    {/* Description & Notes */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2 mb-3">
                                <AlignLeft className="w-3 h-3" /> Mission Brief
                            </label>
                            <textarea
                                value={localTask.description || ''}
                                onChange={(e) => setLocalTask({ ...localTask, description: e.target.value })}
                                placeholder="Describe the tactical objectives..."
                                className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-[#dfff4f] transition-colors min-h-[80px] resize-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2 mb-3">
                                <AlertCircle className="w-3 h-3" /> Intel / Notes
                            </label>
                            <textarea
                                value={localTask.notes || ''}
                                onChange={(e) => setLocalTask({ ...localTask, notes: e.target.value })}
                                placeholder="Additional research or requirements..."
                                className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-[#dfff4f] transition-colors min-h-[60px] resize-none"
                            />
                        </div>
                    </div>

                    {/* Sub-Objectives (Subtasks) */}
                    <div>
                        <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2 mb-4">
                            <ShieldCheck className="w-3 h-3" /> Sub-Objectives
                        </label>
                        <div className="space-y-2 mb-4">
                            {localTask.subtasks.map((st) => (
                                <div
                                    key={st.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer group",
                                        st.completed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                                    )}
                                    onClick={() => toggleSubtask(st.id)}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                        st.completed ? "bg-emerald-500 border-emerald-500" : "border-zinc-700"
                                    )}>
                                        {st.completed && <CheckCircle2 className="w-3 h-3 text-black" />}
                                    </div>
                                    <span className={cn(
                                        "text-sm flex-1",
                                        st.completed ? "text-zinc-500 line-through" : "text-white"
                                    )}>
                                        {st.title}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeSubtask(st.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-600 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                placeholder="Next objective..."
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#dfff4f] transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                            />
                            <button
                                type="button"
                                onClick={addSubtask}
                                className="px-4 bg-zinc-800 text-white rounded-xl active:scale-95 transition-transform"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-zinc-900/50 border-t border-zinc-900 flex gap-3">
                    <button
                        onClick={handleDelete}
                        className="p-4 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 py-4 bg-[#dfff4f] text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[#dfff4f]/10 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {isSaving ? "Syncing..." : "Sync Mission Data"}
                    </button>
                </div>
            </div>
        </div>
    );
};
