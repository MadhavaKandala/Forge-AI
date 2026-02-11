import React from 'react';
import { X, Bell, Calendar, Clock } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NotificationsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const NotificationsModal = ({ open, onOpenChange }: NotificationsModalProps) => {
    const { schedule } = useHabitStore();

    // Sort by time (simple string sort for now, ideally parse dates)
    const sortedSchedule = [...schedule].sort((a, b) => a.time.localeCompare(b.time));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#18181B] border-[#27272A] text-white max-w-md w-[90%] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Bell className="w-5 h-5 text-[#dfff4f]" />
                        Upcoming Reminders
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                    {sortedSchedule.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No reminders scheduled.</p>
                        </div>
                    ) : (
                        sortedSchedule.map((item) => (
                            <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-black/40 border border-[#27272A] hover:border-zinc-700 transition-colors">
                                <div className="w-1 h-12 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-base">{item.title}</h4>
                                        <span className="text-xs font-mono text-[#dfff4f] bg-[#dfff4f]/10 px-2 py-0.5 rounded">
                                            {item.time}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2 text-zinc-400 text-xs">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{item.duration}</span>
                                        </div>
                                        {item.period === 'today' && (
                                            <span className="text-[10px] uppercase border border-zinc-800 px-1.5 rounded text-zinc-500">
                                                Today
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
