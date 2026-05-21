import { BarChart3, Home, Target, User, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tabs = [
    { label: 'HOME', path: '/', icon: Home },
    { label: 'MISSIONS', path: '/tasks', icon: Zap },
    { label: 'PROGRAMS', path: '/programs', icon: Target },
    { label: 'STATS', path: '/stats', icon: BarChart3 },
    { label: 'PROFILE', path: '/profile', icon: User },
];

export default function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-zinc-800 bg-[#141414]">
            <div className="grid h-full grid-cols-5">
                {tabs.map((tab) => {
                    const Icon = tab.icon;

                    return (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            end={tab.path === '/'}
                            className={({ isActive }) =>
                                cn(
                                    'flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase tracking-[0.08em] transition-colors',
                                    isActive ? 'text-[#C8FF00]' : 'text-[#555555]'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_6px_#C8FF00]')} />
                                    <span>{tab.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
