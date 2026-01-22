import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowingStatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'flame' | 'teal' | 'category';
  glowing?: boolean;
  size?: 'sm' | 'md' | 'lg';
  categoryColor?: string;
}

export function GlowingStatCard({
  value,
  label,
  icon,
  variant = 'default',
  glowing = false,
  size = 'md',
  categoryColor,
}: GlowingStatCardProps) {
  const getBackgroundColor = () => {
    if (categoryColor) return categoryColor;
    switch (variant) {
      case 'flame': return 'bg-primary/10';
      case 'teal': return 'bg-secondary/10';
      default: return 'bg-muted';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'flame': return 'text-primary';
      case 'teal': return 'text-secondary';
      default: return 'text-foreground-muted';
    }
  };

  return (
    <motion.div
      className={cn(
        'glass-card relative overflow-hidden',
        size === 'sm' && 'p-3',
        size === 'md' && 'p-4',
        size === 'lg' && 'p-5',
        glowing && variant === 'flame' && 'shadow-glow',
        glowing && variant === 'teal' && 'shadow-glow-teal',
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Glowing background effect */}
      {glowing && (
        <motion.div
          className={cn(
            'absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-40',
            variant === 'flame' && 'bg-primary',
            variant === 'teal' && 'bg-secondary',
          )}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Icon */}
      {icon && (
        <div 
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center mb-2',
            getBackgroundColor()
          )}
          style={categoryColor ? { backgroundColor: categoryColor } : undefined}
        >
          <div className={getIconColor()}>
            {icon}
          </div>
        </div>
      )}

      {/* Value */}
      <p className={cn(
        'stat-number relative z-10',
        size === 'sm' && 'text-xl',
        size === 'md' && 'text-2xl',
        size === 'lg' && 'text-3xl',
      )}>
        {value}
      </p>

      {/* Label */}
      <p className={cn(
        'text-muted-foreground relative z-10',
        size === 'sm' && 'text-[10px]',
        size === 'md' && 'text-xs',
        size === 'lg' && 'text-sm',
      )}>
        {label}
      </p>
    </motion.div>
  );
}
