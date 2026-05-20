import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flame, Target, TrendingUp, Trophy, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  onCreateChallenge: () => void;
}

export function EmptyState({ onCreateChallenge }: EmptyStateProps) {
  const features = [
    { icon: Flame, text: 'Track daily streaks', color: 'text-orange-500 bg-orange-500/10' },
    { icon: Target, text: 'Set meaningful goals', color: 'text-blue-500 bg-blue-500/10' },
    { icon: TrendingUp, text: 'Visualize progress', color: 'text-green-500 bg-green-500/10' },
    { icon: Trophy, text: 'Unlock achievements', color: 'text-yellow-500 bg-yellow-500/10' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg mx-auto"
      >
        {/* Hero icon */}
        <div className="relative mx-auto mb-8">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center rotate-3 border-2 border-primary/20">
            <span className="text-5xl">🔥</span>
          </div>
          {/* Floating sparkles */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ y: [-2, 2, -2], rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
          Start Your <span className="text-primary">100-Day</span> Journey
        </h2>

        <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg">
          Build unstoppable habits with daily tracking, streak motivation, and milestone achievements.
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-3 mb-10 w-full">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-card border border-border/50 p-4 rounded-xl flex items-center gap-3 text-left shadow-sm"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', feature.color)}>
                <feature.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div>
          <Button
            size="lg"
            onClick={onCreateChallenge}
            className="font-semibold px-8 h-12 text-lg rounded-xl gap-2 hover:opacity-90 transition-opacity"
          >
            <Flame className="w-5 h-5" />
            Create Your First Challenge
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Join thousands building better habits daily
          </p>
        </div>
      </motion.div>
    </div>
  );
}
