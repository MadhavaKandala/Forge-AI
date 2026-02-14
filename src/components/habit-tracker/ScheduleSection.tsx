import React, { useState } from 'react';
import { Calendar, Clock, MoreHorizontal, Bell } from 'lucide-react';
import { useHabitStore, ScheduleItem } from '@/store/useHabitStore';
import { LocalNotifications } from '@capacitor/local-notifications';
import { format, parse, set } from 'date-fns';

export const ScheduleSection = () => {
    const { schedule, removeScheduleItem } = useHabitStore();
    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

    // Filter items based on selected period
    const filteredSchedule = schedule.filter(item => item.period === period);

    const handleNotification = async (item: ScheduleItem) => {
        // Schedule a notification for this item
        // Parse time string '7:00 AM' to Date object for today
        try {
            const timeParts = item.time.match(/(\d+):(\d+) (AM|PM)/);
            if (!timeParts) return; // Simple check, handling complex dates needs more logic

            const hours = parseInt(timeParts[1]);
            const minutes = parseInt(timeParts[2]);
            const ampm = timeParts[3];

            let date = new Date();
            let h = hours;
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;

            date.setHours(h, minutes, 0, 0);

            // If time passed, schedule for tomorrow (demo logic)
            if (date < new Date()) {
                date.setDate(date.getDate() + 1);
            }

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: item.title,
                        body: `Time for ${item.title} (${item.duration})`,
                        id: parseInt(item.id) || Math.floor(Math.random() * 100000),
                        schedule: { at: date },
                        sound: 'beep.wav',
                        attachments: [],
                        actionTypeId: '',
                        extra: null
                    }
                ]
            });
            alert(`Reminder set for ${format(date, 'h:mm a')}`);
        } catch (e) {
            console.error(e);
            alert("Could not set reminder");
        }
    };

    return (
        <div className="w-full px-6 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Schedule</h2>
                <div className="flex bg-[#18181B] rounded-full p-1 border border-[#27272A]">
                    {(['today', 'week', 'month'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${period === p
                                ? 'bg-[#dfff4f] text-black shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filteredSchedule.length === 0 ? (
                    <div className="text-zinc-500 text-sm italic py-4 text-center border border-dashed border-zinc-800 rounded-2xl">
                        No activities for {period}
                    </div>
                ) : (
                    filteredSchedule.map((item) => (
                        <div key={item.id} className="group relative bg-[#18181B] border border-[#27272A] rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#27272A] border border-zinc-700">
                                    <span className="text-xs font-bold text-zinc-400">{item.time.split(' ')[0]}</span>
                                    <span className="text-[10px] text-zinc-600 font-bold">{item.time.split(' ')[1]}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {item.duration}
                                        </span>
                                        {item.tag && (
                                            <span style={{ color: item.color, borderColor: item.color }} className="text-[10px] px-1.5 py-0.5 rounded border border-opacity-30 bg-opacity-10 bg-[currentColor]">
                                                {item.tag}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleNotification(item)}
                                    className="p-2 rounded-full text-zinc-600 hover:text-[#dfff4f] hover:bg-zinc-800 transition-colors"
                                >
                                    <Bell className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-full text-zinc-600 hover:text-white hover:bg-zinc-800 transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Stylized left border based on color */}
                            <div style={{ backgroundColor: item.color }} className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"></div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
