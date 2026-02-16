import React from 'react';
import { Home, BarChart2, Users, User, LayoutGrid, Layout, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
    const navItems = [
        { id: 'hub', icon: Home, label: 'Hub' },
        { id: 'tasks', icon: Layout, label: 'Tasks' },
        { id: 'voice', icon: Mic, label: 'Voice' },
        { id: 'analytics', icon: BarChart2, label: 'Stats' },
        { id: 'program', icon: LayoutGrid, label: 'Program' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-[#09090b]/90 backdrop-blur-lg border-t border-[#27272A] px-4 py-4 flex items-center justify-between z-40 pb-safe">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className="group flex flex-col items-center gap-1 relative flex-1"
                >
                    <div className={`p-2 rounded-xl transition-all duration-300 ${activeTab === item.id
                        ? 'bg-primary text-black translate-y-[-4px] shadow-[0_4px_12px_rgba(223,255,79,0.3)]'
                        : 'text-zinc-500 hover:text-zinc-300'
                        }`}>
                        <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    </div>
                    <span className={cn(
                        "text-[8px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity",
                        activeTab === item.id && "opacity-100 text-primary"
                    )}>
                        {item.label}
                    </span>
                    {/* Active Dot */}
                    {activeTab === item.id && (
                        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"></div>
                    )}
                </button>
            ))}
        </div>
    );
};
