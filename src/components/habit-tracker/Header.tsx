import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { NotificationsModal } from './NotificationsModal';

export const Header = () => {
    const { user } = useUserStore();
    const [showNotifications, setShowNotifications] = useState(false);

    // Dynamic Date
    const today = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = today.toLocaleDateString('en-GB', dateOptions);

    return (
        <>
            <div className="flex items-center justify-between w-full h-[60px] px-6">
                <div className="flex flex-col">
                    <span className="text-zinc-400 text-sm font-medium">{dateStr}</span>
                    <h1 className="text-2xl font-bold text-white">Hello, {user?.name || 'Guest'}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowNotifications(true)}
                        className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center relative hover:bg-zinc-800 transition-colors"
                    >
                        <Bell className="w-5 h-5 text-white" />
                        <div className="absolute top-2 right-2.5 w-2 h-2 bg-[#dfff4f] rounded-full"></div>
                    </button>
                    <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center overflow-hidden">
                        <img src={user?.avatar_url || "https://github.com/shadcn.png"} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            <NotificationsModal open={showNotifications} onOpenChange={setShowNotifications} />
        </>
    );
};
