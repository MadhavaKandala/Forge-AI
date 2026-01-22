import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Achievement } from '@/types/challenge';
import { Lock } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AchievementBadge({ achievement, unlocked, size = 'md', className }: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  };

  const labelSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <motion.div 
      className={cn('flex flex-col items-center gap-1', className)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className={cn(
        'rounded-full flex items-center justify-center transition-all',
        sizeClasses[size],
        unlocked 
          ? 'bg-gradient-fire shadow-glow' 
          : 'bg-muted border-2 border-dashed border-border'
      )}>
        {unlocked ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
          >
            {achievement.badge}
          </motion.span>
        ) : (
          <Lock className="w-1/3 h-1/3 text-muted-foreground" />
        )}
      </div>
      <div className="text-center">
        <p className={cn('font-medium', labelSizeClasses[size], !unlocked && 'text-muted-foreground')}>
          Day {achievement.day}
        </p>
        <p className={cn('text-muted-foreground', labelSizeClasses[size])}>
          {achievement.name}
        </p>
      </div>
    </motion.div>
  );
}
