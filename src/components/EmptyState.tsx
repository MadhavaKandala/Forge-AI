import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flame, Target, TrendingUp, Trophy, Sparkles, Zap } from 'lucide-react';

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
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        {/* Hero icon with glow */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="relative mx-auto mb-8"
        >
          <div className="w-28 h-28 rounded-3xl bg-gradient-flame flex items-center justify-center shadow-glow rotate-3">
            <motion.span 
              className="text-6xl"
              animate={{ 
                rotate: [-5, 5, -5],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔥
            </motion.span>
          </div>
          {/* Floating sparkles */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ y: [-2, 2, -2], rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
          <motion.div
            className="absolute -bottom-1 -left-3"
            animate={{ y: [2, -2, 2], rotate: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <Zap className="w-5 h-5 text-primary" />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold mb-4 tracking-tight"
        >
          Start Your{' '}
          <span className="text-gradient-flame">100-Day</span>{' '}
          Journey
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground max-w-md mx-auto mb-10 text-lg"
        >
          Build unstoppable habits with daily tracking, streak motivation, and milestone achievements.
        </motion.p>

        {/* Feature cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 mb-10 max-w-md w-full mx-auto"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="glass-card p-4 flex items-center gap-3 text-left"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.color}`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            size="lg" 
            onClick={onCreateChallenge}
            className="bg-gradient-flame hover:opacity-90 font-semibold px-8 h-14 text-lg shadow-glow rounded-xl gap-2"
          >
            <Flame className="w-5 h-5" />
            Create Your First Challenge
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Join thousands building better habits daily
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
