import React from 'react';
import { User, Settings, LogOut, ChevronRight, Edit2, Shield, Bell } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';

export const ProfileSection = () => {
    const { user, habits, updateUser, resetData } = useHabitStore();

    return (
        <div className="w-full px-6 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-xl font-bold text-white mb-6">Profile</h2>

            {/* User Card */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full border-2 border-[#dfff4f] p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800">
                        <img src={user.avatarUrl || "https://github.com/shadcn.png"} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{user.name}</h3>
                    <div className="text-[#dfff4f] text-sm font-medium mb-1">Level {user.level} Challenger</div>
                    <div className="text-zinc-500 text-xs">Joined January 2026</div>
                </div>
                <button className="ml-auto w-10 h-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                </button>
            </div>

            {/* Stats Summary */}
            <div className="flex gap-4 mb-8">
                <div className="flex-1 bg-[#18181B] rounded-2xl p-4 border border-[#27272A] text-center">
                    <div className="text-2xl font-bold text-white">{user.xp}</div>
                    <div className="text-xs text-zinc-500 uppercase font-bold mt-1">Total XP</div>
                </div>
                <div className="flex-1 bg-[#18181B] rounded-2xl p-4 border border-[#27272A] text-center">
                    <div className="text-2xl font-bold text-white">{habits.length}</div>
                    <div className="text-xs text-zinc-500 uppercase font-bold mt-1">Active Habits</div>
                </div>
                <div className="flex-1 bg-[#18181B] rounded-2xl p-4 border border-[#27272A] text-center">
                    <div className="text-2xl font-bold text-white">1</div>
                    <div className="text-xs text-zinc-500 uppercase font-bold mt-1">Badges</div>
                </div>
            </div>

            {/* Settings List */}
            <div className="flex flex-col gap-3">
                <div className="w-full bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden">
                    <button className="w-full flex items-center justify-between p-4 bg-[#18181B] hover:bg-zinc-800/50 transition-colors border-b border-[#27272A]">
                        <div className="flex items-center gap-3 w-full">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-zinc-500 block mb-1">Display Name</label>
                                <input
                                    type="text"
                                    value={user.name}
                                    onChange={(e) => updateUser({ name: e.target.value })}
                                    className="bg-transparent text-white font-bold text-sm w-full focus:outline-none focus:border-b focus:border-[#dfff4f] pb-1"
                                />
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => updateUser({ notificationsEnabled: !user.notificationsEnabled })}
                        className="w-full flex items-center justify-between p-4 bg-[#18181B] hover:bg-zinc-800/50 transition-colors border-b border-[#27272A]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#dfff4f]/10 text-[#dfff4f]">
                                <Bell className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-white">Notifications</span>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${user.notificationsEnabled ? 'bg-[#dfff4f]' : 'bg-zinc-700'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${user.notificationsEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                <Shield className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-white">Privacy & Security</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </button>
                </div>

                <button className="w-full p-4 bg-[#18181B] border border-[#27272A] rounded-2xl text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/30 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Log Out
                </button>

                <div className="text-center mt-6 text-xs text-zinc-600">
                    Version 1.0.2 • Build 240
                </div>
            </div>
        </div>
    );
};
