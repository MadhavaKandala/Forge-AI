import React, { useState } from 'react';
import { Plus, X, Check, Bell } from 'lucide-react';
import { useHabitStore, ScheduleItem } from '@/store/useHabitStore';
import { LocalNotifications } from '@capacitor/local-notifications';

export const ScheduleSection = () => {
    const { schedule, addScheduleItem } = useHabitStore();
    const [activePeriod, setActivePeriod] = useState<'today' | 'week' | 'month'>('today');
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState<Partial<ScheduleItem>>({
        title: '',
        time: '',
        color: '#dfff4f',
        period: 'today'
    });

    const filteredSchedule = schedule.filter(item => item.period === activePeriod);

    const scheduleNotification = async (item: Partial<ScheduleItem>) => {
        // Basic notification logic - requires proper date parsing for real scheduling
        // For demo, we just schedule it 5 seconds from now or based on a mock time
        try {
            const hasPermission = await LocalNotifications.checkPermissions();
            if (hasPermission.display !== 'granted') {
                const req = await LocalNotifications.requestPermissions();
                if (req.display !== 'granted') return;
            }

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: "Activity Reminder",
                        body: `Time for ${item.title}`,
                        id: Math.floor(Math.random() * 10000),
                        schedule: { at: new Date(Date.now() + 1000 * 5) }, // Demo: 5s later
                        sound: undefined,
                        attachments: undefined,
                        actionTypeId: "",
                        extra: null
                    }
                ]
            });
            console.log("Notification scheduled");
        } catch (e) {
            console.error("Notification error", e);
        }
    };

    const handleAdd = async () => {
        if (newItem.title && newItem.time) {
            addScheduleItem(newItem as Omit<ScheduleItem, 'id'>);
            await scheduleNotification(newItem);
            setNewItem({ title: '', time: '', color: '#dfff4f', period: 'today' });
            setIsAdding(false);
        }
    };

    return (
        <div className="w-full px-6 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Schedule</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#27272A] rounded-xl hover:bg-[#323235] transition-colors"
                >
                    {isAdding ? <X className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                    <span className="text-xs font-bold text-white">{isAdding ? 'Cancel' : 'Add'}</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-[#18181B] rounded-xl mb-4 border border-[#27272A]">
                {(['today', 'week', 'month'] as const).map((period) => (
                    <button
                        key={period}
                        onClick={() => setActivePeriod(period)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${activePeriod === period
                            ? 'bg-[#dfff4f] text-black shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        {period}
                    </button>
                ))}
            </div>

            {isAdding && (
                <div className="mb-4 p-4 bg-[#18181B] border border-[#27272A] rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <input
                        type="text"
                        placeholder="Title (e.g. Morning Run)"
                        className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white mb-2 focus:outline-none focus:border-[#dfff4f]"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    />
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Time (e.g. 7:00 AM)"
                            className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#dfff4f]"
                            value={newItem.time}
                            onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                        />
                        <select
                            className="bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#dfff4f]"
                            value={newItem.period}
                            onChange={(e) => setNewItem({ ...newItem, period: e.target.value as any })}
                        >
                            <option value="today">Today</option>
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                        </select>
                    </div>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Duration (e.g. 45 min)"
                            className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#dfff4f]"
                            value={newItem.duration || ''}
                            onChange={(e) => setNewItem({ ...newItem, duration: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Tag (e.g. Fitness)"
                            className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#dfff4f]"
                            value={newItem.tag || ''}
                            onChange={(e) => setNewItem({ ...newItem, tag: e.target.value })}
                        />
                        <input
                            type="color"
                            className="w-10 h-10 rounded-lg bg-black border border-zinc-800 cursor-pointer"
                            value={newItem.color}
                            onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={!newItem.title || !newItem.time}
                        className="w-full py-2 bg-[#dfff4f] hover:bg-[#ccee3e] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Bell className="w-4 h-4" />
                        Save & Notify
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {filteredSchedule.length === 0 && (
                    <div className="text-center py-8 text-zinc-500 text-sm italic">
                        No schedule for this period.
                    </div>
                )}
                {filteredSchedule.map((item) => (
                    <div key={item.id} className="w-full bg-[#18181B] border border-[#27272A] rounded-2xl flex overflow-hidden min-h-[90px]">
                        <div className="w-1.5 min-h-full" style={{ backgroundColor: item.color }}></div>
                        <div className="flex-1 p-4 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold font-mono" style={{ color: item.color }}>{item.time}</span>
                                {item.period !== activePeriod && (
                                    <span className="text-[10px] text-zinc-600 uppercase border border-zinc-800 px-1.5 rounded">{item.period}</span>
                                )}
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                                <span>{item.duration}</span>
                                {item.tag && (
                                    <>
                                        <span>•</span>
                                        <span>{item.tag}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
