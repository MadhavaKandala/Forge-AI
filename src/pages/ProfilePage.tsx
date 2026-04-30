import { Bell, LogOut, Shield, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useHabitStore } from '@/store/useHabitStore';
import { useUserStore } from '@/store/useUserStore';

export default function ProfilePage() {
    const habitUser = useHabitStore((s) => s.user);
    const profileUser = useUserStore((s) => s.user);
    const logout = useAppStore((s) => s.logout);
    const name = profileUser?.display_name || profileUser?.name || habitUser.name;
    const xp = habitUser.xp ?? profileUser?.total_xp ?? 0;

    return (
        <div className="min-h-screen bg-[#0A0A0A] px-6 pb-28 pt-8 text-white">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">PROFILE</p>
            <h1 className="mt-2 text-3xl font-black">{name}</h1>
            <p className="mt-1 text-sm font-bold text-[#C8FF00]">{xp} XP</p>

            <section className="mt-8 rounded-xl border border-zinc-800 bg-[#1C1C1C] p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#141414] text-[#C8FF00]">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.14em]">Operator</p>
                        <p className="text-sm text-zinc-500">Single-user Forge AI profile</p>
                    </div>
                </div>
            </section>

            <section className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#141414] p-4">
                    <Bell className="h-5 w-5 text-[#C8FF00]" />
                    <div>
                        <p className="text-sm font-bold">Reminders</p>
                        <p className="text-xs text-zinc-500">{habitUser.notificationsEnabled ? 'Enabled' : 'Configure in onboarding'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#141414] p-4">
                    <Shield className="h-5 w-5 text-[#C8FF00]" />
                    <div>
                        <p className="text-sm font-bold">Local Data</p>
                        <p className="text-xs text-zinc-500">Zustand persisted on device</p>
                    </div>
                </div>
            </section>

            <button
                type="button"
                onClick={logout}
                className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#FF4444]/40 bg-[#141414] text-xs font-black uppercase tracking-[0.16em] text-[#FF4444]"
            >
                <LogOut className="h-4 w-4" />
                LOG OUT
            </button>
        </div>
    );
}
