import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, BarChart3, User, Calendar, Code, Dumbbell, Trophy } from 'lucide-react';

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glass background with blur */}
      <div className="absolute inset-0 glass-nav" />
      
      {/* Safe area padding for notched phones */}
      <div className="relative flex items-center justify-around px-1 pb-safe pt-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex flex-col items-center justify-center min-w-[56px] py-2 px-2 rounded-xl transition-all',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {/* Active indicator background */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-1 bg-primary/10 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              
              {/* Glow effect for challenges tab when active */}
              {isActive && tab.id === 'challenges' && (
                <motion.div
                  className="absolute top-0 w-10 h-10 bg-primary rounded-full blur-xl opacity-30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              )}
              
              <Icon 
                className={cn(
                  'w-5 h-5 relative z-10 transition-all duration-200',
                  isActive && 'scale-110'
                )} 
              />
              <span className={cn(
                'text-[10px] mt-0.5 font-medium relative z-10 transition-all',
                isActive && 'font-semibold'
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
