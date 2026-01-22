import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flame, Target, TrendingUp, Trophy } from 'lucide-react';

interface EmptyStateProps {
  onCreateChallenge: () => void;
}

export function EmptyState({ onCreateChallenge }: EmptyStateProps) {
  const features = [
    { icon: Flame, text: 'Track daily streaks' },
    { icon: Target, text: 'Set meaningful goals' },
    { icon: TrendingUp, text: 'Visualize progress' },
    { icon: Trophy, text: 'Unlock achievements' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-24 h-24 rounded-full bg-gradient-fire flex items-center justify-center mb-6 shadow-glow"
      >
        <span className="text-5xl">🔥</span>
      </motion.div>

      <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
        Start Your 100-Day Journey
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Build unstoppable habits with daily tracking, streak motivation, and milestone achievements.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm w-full">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <feature.icon className="w-4 h-4 text-primary" />
            <span>{feature.text}</span>
          </motion.div>
        ))}
      </div>

      <Button 
        size="lg" 
        onClick={onCreateChallenge}
        className="bg-gradient-fire hover:opacity-90 font-semibold px-8 shadow-glow"
      >
        🔥 Create Your First Challenge
      </Button>
    </motion.div>
  );
}
