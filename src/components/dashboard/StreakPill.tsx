import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakPillProps {
  count: number;
  variant?: 'flame' | 'ice' | 'subtle';
  size?: 'sm' | 'md';
  animated?: boolean;
  showIcon?: boolean;
}

export function StreakPill({
  count,
  variant = 'flame',
  size = 'sm',
  animated = true,
  showIcon = true,
}: StreakPillProps) {
  // Determine if this is a milestone
  const isMilestone = [7, 14, 21, 30, 50, 75, 100].includes(count);

  if (count === 0) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 text-muted-foreground',
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}>
        0 days
      </span>
    );
  }

  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full',
        // Size variants
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        // Color variants
        variant === 'flame' && 'bg-gradient-to-r from-primary/15 to-accent/15 text-primary',
        variant === 'ice' && 'bg-secondary/15 text-secondary',
        variant === 'subtle' && 'bg-muted text-muted-foreground',
        // Milestone glow
        isMilestone && variant === 'flame' && 'shadow-glow ring-1 ring-primary/30',
      )}
      initial={animated ? { scale: 0.8 } : false}
      animate={animated ? { scale: 1 } : false}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      {showIcon && (
        <motion.span
          animate={animated && count >= 7 ? { 
            scale: [1, 1.2, 1],
          } : undefined}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
        >
          {variant === 'flame' ? '🔥' : variant === 'ice' ? '❄️' : ''}
        </motion.span>
      )}
      <span className="stat-number">{count}</span>
      {size === 'md' && <span className="font-normal opacity-75">days</span>}
    </motion.div>
  );
}
