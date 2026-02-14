import React, { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { Clock, Plus, Trash2, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { AddScheduleModal } from './AddScheduleModal';

export const ScheduleSection = () => {
    const { schedule, removeScheduleItem } = useHabitStore();
    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredSchedule = schedule.filter(item => item.period === period);

    return (
        <div className="w-full px-6 mb-12">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Daily Ops</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1">Strategic Segments</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-blue-500 hover:bg-black transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Time Slots */}
            <div className="space-y-3">
                {filteredSchedule.length === 0 ? (
                    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-10 text-center">
                        <Calendar className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-sm text-zinc-600 font-medium">No tactical movements planned</p>
                    </div>
                ) : (
                    filteredSchedule.map((item) => (
                        <div
                            key={item.id}
                            className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-4 flex items-center justify-between group hover:border-zinc-700 transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-zinc-800/50 border border-zinc-800 flex flex-col items-center justify-center min-w-[60px]">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase">{item.time.split(' ')[1]}</span>
                                    <span className="text-sm font-black text-white">{item.time.split(' ')[0]}</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight italic">{item.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-[10px] text-zinc-500 font-bold">{item.duration} • {item.block?.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeScheduleItem(item.id)}
                                className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <AddScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};
