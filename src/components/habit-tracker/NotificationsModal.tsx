import React from 'react';
import { Bell, X, Calendar } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { format } from 'date-fns';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
    const { schedule } = useHabitStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#18181B] border border-[#27272A] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#dfff4f]/10 flex items-center justify-center text-[#dfff4f]">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Notifications</h2>
                            <p className="text-xs text-zinc-400">Your scheduled reminders</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#27272A] rounded-full text-zinc-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {schedule.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No scheduled reminders yet</p>
                        </div>
                    ) : (
                        schedule.map((item) => (
                            <div key={item.id} className="bg-[#27272A]/50 rounded-xl p-4 border border-[#27272A] flex items-start gap-3">
                                <div className="mt-1">
                                    <Calendar className="w-4 h-4 text-[#dfff4f]" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                    <p className="text-xs text-zinc-400 mt-0.5">{item.time}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span
                                            className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 border border-[#dfff4f]/20 text-zinc-300"
                                        >
                                            {item.tag || 'General'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#27272A]">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-[#dfff4f] text-black font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
