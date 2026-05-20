import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react'; // Search removed from header if SearchBar is separate
// Actually, design shows Bell and Avatar in header usually
import { useHabitStore } from '@/store/useHabitStore';
import { NotificationsModal } from './NotificationsModal';

export const Header = () => {
    const { user } = useHabitStore();
    const [showNotifications, setShowNotifications] = useState(false);

    // Date formatting
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <>
            <div className="w-full px-6 pt-6 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700">
                            <img
                                src={user.avatarUrl || "https://github.com/shadcn.png"}
                                alt="User"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Status Indicator */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#18181B] rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-[#dfff4f] rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-zinc-400">Good Morning,</h2>
                        <h1 className="text-lg font-black text-white">{user.name}</h1>
                    </div>
                </div>

                <button
                    onClick={() => setShowNotifications(true)}
                    className="w-10 h-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white hover:bg-[#27272A] transition-colors relative"
                >
                    <Bell className="w-5 h-5" />
                    <div className="absolute top-2 right-2.5 w-2 h-2 bg-[#dfff4f] rounded-full animate-pulse"></div>
                </button>
            </div>

            <NotificationsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </>
    );
};
