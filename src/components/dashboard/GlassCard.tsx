import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'elevated' | 'accent' | 'neo';
  glow?: boolean;
  glowColor?: 'flame' | 'teal' | 'category' | 'purple';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  children?: React.ReactNode;
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
      <motion.div
        ref={ref}
        className={cn(
          // Base glass styles - refined for Awwwards look
          'relative overflow-hidden backdrop-blur-xl bg-background/40 border border-white/5 shadow-xl transition-all duration-300',
          'rounded-[24px]', // More modern curvature

          // Padding variants
          padding === 'none' && 'p-0',
          padding === 'sm' && 'p-3',
          padding === 'md' && 'p-5 sm:p-6',
          padding === 'lg' && 'p-6 sm:p-8',

          // Variant styles
          variant === 'default' && 'bg-gradient-to-br from-white/5 to-white/0',
          variant === 'elevated' && 'shadow-2xl bg-background/60 border-white/10',
          variant === 'accent' && 'border-primary/20 bg-primary/5',
          variant === 'neo' && 'bg-background/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border-white/5',

          // Glow effects - softer and more dispersed
          glow && glowColor === 'flame' && 'shadow-[0_8px_32px_rgba(249,115,22,0.15)] border-orange-500/20',
          glow && glowColor === 'teal' && 'shadow-[0_8px_32px_rgba(45,212,191,0.15)] border-teal-500/20',
          glow && glowColor === 'purple' && 'shadow-[0_8px_32px_rgba(168,85,247,0.15)] border-purple-500/20',

          // Interactive states
          interactive && 'hover:scale-[1.02] hover:shadow-2xl hover:bg-background/50 active:scale-[0.98] cursor-pointer',
          className
        )}
        {...props}
      >
        {/* Subtle noise texture or gradient overlay for premium feel */}
        {variant !== 'neo' && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        )}

        {/* Content Container */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
