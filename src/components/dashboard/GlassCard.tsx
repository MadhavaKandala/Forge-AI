import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'accent';
  glow?: boolean;
  glowColor?: 'flame' | 'teal' | 'category';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    variant = 'default', 
    glow = false,
    glowColor = 'flame',
    padding = 'md',
    interactive = false,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass styles
          'glass-card',
          // Padding variants
          padding === 'none' && 'p-0',
          padding === 'sm' && 'p-3',
          padding === 'md' && 'p-4 sm:p-5',
          padding === 'lg' && 'p-5 sm:p-6',
          // Variant styles
          variant === 'elevated' && 'shadow-elevated',
          variant === 'accent' && 'border-primary/20',
          // Glow effects
          glow && glowColor === 'flame' && 'shadow-glow',
          glow && glowColor === 'teal' && 'shadow-glow-teal',
          // Interactive states
          interactive && 'hover-lift press-scale cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
