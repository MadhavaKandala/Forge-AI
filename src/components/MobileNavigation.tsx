import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, BarChart3, User, Calendar, Trophy } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'today', label: 'Today', icon: Calendar },
  { id: 'challenges', label: 'All', icon: Flame },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
  { id: 'leaderboard', label: 'Rank', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User },
];

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe bg-card border-t border-border">
      <div className="flex items-center justify-between px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 h-[60px] pb-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Active indicator line at top */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute top-0 w-8 h-1 bg-primary rounded-b-full"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                />
              )}

              <Icon
                strokeWidth={isActive ? 2.5 : 2}
                className={cn(
                  'w-6 h-6 mb-1 transition-transform duration-200',
                  isActive ? 'scale-110' : 'scale-100'
                )}
              />
              <span className="text-[10px] font-medium leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
