import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function StreakBadge({ streak, size = 'md', showLabel = true, className }: StreakBadgeProps) {
  const getFlameColor = () => {
    if (streak >= 50) return 'from-streak-hot via-accent to-streak-legendary';
    if (streak >= 21) return 'from-streak-start via-streak-mid to-streak-hot';
    if (streak >= 7) return 'from-streak-start to-streak-mid';
    return 'from-primary to-accent';
  };

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (streak === 0) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <span className={cn('opacity-40', sizeClasses[size])}>🔥</span>
        {showLabel && (
          <span className={cn('text-muted-foreground font-medium', labelSizeClasses[size])}>
            No streak
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      className={cn('flex items-center gap-1.5', className)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <motion.span 
        className={cn(sizeClasses[size], 'drop-shadow-lg')}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        🔥
      </motion.span>
      <span className={cn(
        'font-bold bg-gradient-to-r bg-clip-text text-transparent',
        getFlameColor(),
        labelSizeClasses[size]
      )}>
        {streak} day{streak !== 1 ? 's' : ''}
      </span>
    </motion.div>
  );
}
