import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface FloatingCTAProps {
  label: string;
  icon?: ReactNode;
  variant?: 'flame' | 'teal' | 'category';
  disabled?: boolean;
  loading?: boolean;
  completed?: boolean;
  completedLabel?: string;
  onClick?: () => void;
  className?: string;
}

export function FloatingCTA({
  label,
  icon,
  variant = 'flame',
  disabled = false,
  loading = false,
  completed = false,
  completedLabel = '✓ Done!',
  onClick,
  className,
}: FloatingCTAProps) {
  const isInteractive = !disabled && !loading && !completed;

  return (
    <motion.div
      className={cn(
        'fixed bottom-20 md:bottom-6 left-4 right-4 z-40',
        'max-w-lg mx-auto',
        className
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.button
        onClick={onClick}
        disabled={!isInteractive}
        className={cn(
          'w-full py-4 px-6 rounded-2xl font-semibold text-base',
          'flex items-center justify-center gap-2',
          'transition-all duration-200',
          // Gradient backgrounds
          variant === 'flame' && !completed && 'bg-gradient-flame text-white',
          variant === 'teal' && !completed && 'bg-gradient-teal text-white',
          completed && 'bg-secondary text-secondary-foreground',
          // States
          isInteractive && 'shadow-glow hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
          disabled && 'opacity-50 cursor-not-allowed',
          loading && 'cursor-wait',
        )}
        whileTap={isInteractive ? { scale: 0.98 } : undefined}
      >
        {/* Pulsing glow effect when not completed */}
        {!completed && !disabled && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-flame opacity-50 blur-xl -z-10"
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </motion.div>
          ) : completed ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>{completedLabel}</span>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              {icon}
              <span>{label}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
