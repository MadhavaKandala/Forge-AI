import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, BarChart3, Trophy, User, Calendar, Code } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'today', label: 'Today', icon: Calendar },
  { id: 'challenges', label: 'Challenges', icon: Flame },
  { id: 'code-hub', label: 'Code', icon: Code },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
];

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Gradient blur background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-lg border-t border-border" />
      
      {/* Safe area padding for notched phones */}
      <div className="relative flex items-center justify-around px-2 pb-safe pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex flex-col items-center justify-center w-16 py-2 rounded-xl transition-all',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              
              {/* Flame glow effect for active */}
              {isActive && tab.id === 'challenges' && (
                <motion.div
                  className="absolute -top-1 w-8 h-8 bg-gradient-fire rounded-full blur-lg opacity-40"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <Icon 
                className={cn(
                  'w-5 h-5 relative z-10 transition-transform',
                  isActive && 'scale-110'
                )} 
              />
              <span className={cn(
                'text-[10px] mt-1 font-medium relative z-10',
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
