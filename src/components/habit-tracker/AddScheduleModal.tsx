import React, { useState } from 'react';
import { useHabitStore, TimeBlock } from '@/store/useHabitStore';
import { X, Clock, Calendar, Tag } from 'lucide-react';

export const AddScheduleModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { addScheduleItem } = useHabitStore();
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('09:00 AM');
    const [duration, setDuration] = useState('1h');
    const [block, setBlock] = useState<TimeBlock>('morning');
    const [color, setColor] = useState('#3b82f6');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        addScheduleItem({
            title,
            time,
            duration,
            block,
            color,
            period: 'today'
        });

        setTitle('');
        onClose();
    };

    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-[#18181B] border border-[#27272A] w-full max-w-sm rounded-[32px] p-6 relative z-10 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-blue-500">Plan Segment</h2>
                    <button onClick={onClose} className="p-2 rounded-full bg-zinc-900 border border-zinc-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-2">Segment Title</label>
                        <input
                            autoFocus
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Focus Sprint"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-2">Start Time</label>
                            <input
                                type="text"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                placeholder="09:00 AM"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-xs text-white"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-2">Duration</label>
                            <input
                                type="text"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="1.5h"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-xs text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-2">Visual Color</label>
                        <div className="flex justify-between">
                            {colors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-4 transition-transform ${color === c ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/10 active:scale-95 transition-transform"
                    >
                        Lock In Schedule
                    </button>
                </form>
            </div>
        </div>
    );
};
