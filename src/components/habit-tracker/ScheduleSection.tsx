import React from 'react';
import { Clock } from 'lucide-react';
import { useScheduleStore } from '@/store/useScheduleStore';

export const ScheduleSection = () => {
    const { schedules: schedule } = useScheduleStore();

    if (!schedule || schedule.length === 0) {
        return (
            <div className="w-full px-6 mb-8">
                <h2 className="text-lg font-bold text-white mb-4">Today's Schedule</h2>
                <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-2xl text-center text-zinc-500 text-sm">
                    No items scheduled for today.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Today's Schedule</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                {schedule.map((item) => (
                    <div key={item.id} className="min-w-[200px] p-4 bg-[#18181B] border border-[#27272A] rounded-2xl flex flex-col justify-between h-28 group hover:border-zinc-700 transition-colors">
                        <div>
                            <span
                                className="inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2"
                                style={{ backgroundColor: `${item.color}20`, color: item.color }}
                            >
                                {item.schedulable_type === 'habit' ? 'Habit' : 'Task'}
                            </span>
                            <h3 className="font-bold text-white text-sm line-clamp-1">
                                {item.title}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <Clock className="w-3 h-3" />
                            <span>{item.scheduled_time || 'All Day'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
