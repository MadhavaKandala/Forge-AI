import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  glowColor?: 'cyan' | 'pink' | 'purple' | 'gold' | 'emerald';
  progress?: number;
  children?: ReactNode;
  onClick?: () => void;
  delay?: number;
}

const glowClasses = {
  cyan: 'border-neon-cyan/30 hover:glow-cyan',
  pink: 'border-neon-pink/30 hover:glow-pink',
  purple: 'border-neon-purple/30 hover:glow-purple',
  gold: 'border-neon-gold/30 hover:glow-gold',
  emerald: 'border-neon-emerald/30 hover:glow-emerald',
};

const iconBgClasses = {
  cyan: 'bg-neon-cyan/10 text-neon-cyan',
  pink: 'bg-neon-pink/10 text-neon-pink',
  purple: 'bg-neon-purple/10 text-neon-purple',
  gold: 'bg-neon-gold/10 text-neon-gold',
  emerald: 'bg-neon-emerald/10 text-neon-emerald',
};

const progressClasses = {
  cyan: 'bg-neon-cyan',
  pink: 'bg-neon-pink',
  purple: 'bg-neon-purple',
  gold: 'bg-neon-gold',
  emerald: 'bg-neon-emerald',
};

export function QuickStatCard({
  title,
  value,
  subtitle,
  icon,
  glowColor = 'cyan',
  progress,
  children,
  onClick,
  delay = 0,
}: QuickStatCardProps) {
  return (
    <motion.div
      className={cn(
        'glass-card p-4 md:p-5 border-2 cursor-pointer transition-all hover-lift',
        glowClasses[glowColor]
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl', iconBgClasses[glowColor])}>
          {icon}
        </div>
        <span className="text-xs text-foreground-muted font-medium uppercase tracking-wider">
          {title}
        </span>
      </div>

      {/* Value */}
      <div className="mb-2">
        <motion.p 
          className="stat-number-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          {value}
        </motion.p>
        {subtitle && (
          <p className="text-sm text-foreground-tertiary mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-foreground-muted">Progress</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', progressClasses[glowColor])}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
              style={{
                boxShadow: `0 0 10px currentColor`,
              }}
            />
          </div>
        </div>
      )}

      {/* Custom children content */}
      {children}
    </motion.div>
  );
}
