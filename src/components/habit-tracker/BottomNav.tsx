import React, { useState } from 'react';
import { Home, Compass, MessageCircle, User } from 'lucide-react';

export const BottomNav = () => {
    const [active, setActive] = useState('hub');

    const navItems = [
        { id: 'hub', label: 'Hub', icon: Home },
        { id: 'explore', label: 'Explore', icon: Compass },
        { id: 'community', label: 'Community', icon: MessageCircle },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-[#27272A] px-6 py-4 pb-8 z-50">
            <div className="flex items-center justify-between max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActive(item.id)}
                            className="flex flex-col items-center gap-1.5 w-16"
                        >
                            <div className={`transition-all duration-300 ${isActive ? 'text-[#dfff4f] -translate-y-1' : 'text-zinc-500'}`}>
                                <Icon className="w-6 h-6" fill={isActive ? "currentColor" : "none"} strokeWidth={isActive ? 0 : 2} />
                            </div>
                            {isActive && (
                                <span className="w-1 h-1 rounded-full bg-[#dfff4f]"></span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
