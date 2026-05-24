import React from 'react';
import { User, Settings, Bell, LogOut, ChevronRight, Shield, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useHabitStore } from '@/store/useHabitStore';

export const ProfileSection = () => {
    const { user, habits, updateUser, resetData } = useHabitStore();

    const menuItems = [
        { icon: User, label: 'Account Settings', onClick: () => { } },
        { icon: Shield, label: 'Privacy & Security', onClick: () => { } },
        { icon: HelpCircle, label: 'Help & Support', onClick: () => { } },
    ];

    return (
        <div className="w-full px-6 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">Profile</h2>
                <button aria-label="Settings" className="p-2 rounded-full bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Profile Card */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full border-2 border-[#dfff4f] p-1">
                    <img
                        src={user.avatarUrl || "https://github.com/shadcn.png"}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <input
                            type="text"
                            value={user.name}
                            onChange={(e) => updateUser({ name: e.target.value })}
                            className="bg-transparent text-white font-bold text-lg w-full focus:outline-none focus:border-b focus:border-[#dfff4f]"
                        />
                    </h3>
                    <p className="text-zinc-500 text-sm">Level {user.level} Challenger</p>
                    <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded bg-[#dfff4f]/10 text-[#dfff4f] text-[10px] font-bold border border-[#dfff4f]/20">PRO</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-bold border border-zinc-700">ver. 1.0</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{habits.length}</div>
                    <div className="text-xs text-zinc-500 mt-1">Active Habits</div>
                </div>
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{user.xp}</div>
                    <div className="text-xs text-zinc-500 mt-1">Total XP</div>
                </div>
            </div>

            {/* Menu */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-3xl overflow-hidden mb-6">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={item.onClick}
                        className={`w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-[#27272A]' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-zinc-200">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </button>
                ))}

                {/* Notifications Toggle */}
                <button
                    onClick={() => updateUser({ notificationsEnabled: !user.notificationsEnabled })}
                    className={`w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-t border-[#27272A]`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <Bell className="w-4 h-4" />
                        </div>
                        <div className="text-left w-full">
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <span className="text-sm font-medium text-zinc-200 block">Notifications</span>
                                    <span className="text-[10px] text-zinc-500 block">Pause all reminders</span>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${user.notificationsEnabled ? 'bg-[#dfff4f]' : 'bg-zinc-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${user.notificationsEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            <div className="space-y-3">
                {localStorage.getItem('habit-tracker-emergency-backup') && (
                    <button
                        onClick={() => {
                            const { restoreBackup } = useHabitStore.getState();
                            restoreBackup();
                        }}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-[#dfff4f]/10 text-[#dfff4f] font-bold border border-[#dfff4f]/20 rounded-2xl transition-all hover:bg-[#dfff4f]/20"
                    >
                        <Shield className="w-5 h-5" />
                        Restore Last Session
                    </button>
                )}

                <button
                    onClick={() => {
                        if (window.confirm("CRITICAL: This will reset all your habits, profile, and store data to defaults. Your missions (Tasks) in the database will remain safe. Proceed?")) {
                            resetData();
                            toast.success("System Restored to Defaults");
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2 p-4 text-red-500 font-bold hover:bg-red-500/10 rounded-2xl transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Reset Data (Debug)
                </button>

                {/* Build Info / Latest Commit */}
                <div className="pt-8 pb-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#dfff4f] animate-pulse"></span>
                        Build: 1.0.64
                        <span className="text-zinc-700">|</span>
                        Latest Intel: <span className="text-zinc-300">742a5d3</span>
                    </div>
                    <p className="mt-2 text-[9px] text-zinc-600 uppercase tracking-tighter font-black italic">
                        "Fix mission persistence and display issues..."
                    </p>
                </div>
            </div>
        </div>
    );
};
