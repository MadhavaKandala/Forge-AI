import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Flame, Zap } from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import { Challenge } from '@/types/challenge';

interface HeaderProps {
  onCreateChallenge: () => void;
  challengeCount: number;
  challenges?: Challenge[];
}

export function Header({ onCreateChallenge, challengeCount, challenges = [] }: HeaderProps) {
  const { getStreak } = useChallenges();
  
  // Calculate total streak
  const totalStreak = challenges
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + getStreak(c), 0);

  // Calculate total check-ins
  const totalCheckIns = challenges.reduce((sum, c) => sum + c.checkIns.length, 0);

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-border/50 pt-safe">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-flame flex items-center justify-center shadow-glow">
                <Flame className="w-5 h-5 text-white" />
              </div>
              {/* Animated glow */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-flame opacity-40 blur-lg -z-10"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">100 Days</h1>
              <p className="text-[11px] text-muted-foreground">Challenge Tracker</p>
            </div>
          </motion.div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick stats (desktop only) */}
            {challengeCount > 0 && (
              <div className="hidden md:flex items-center gap-2">
                {totalStreak > 0 && (
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-0 font-semibold">
                    🔥 {totalStreak}
                  </Badge>
                )}
                {totalCheckIns > 0 && (
                  <Badge variant="secondary" className="gap-1 bg-secondary/10 text-secondary border-0">
                    <Zap className="w-3 h-3" />
                    {totalCheckIns} check-ins
                  </Badge>
                )}
              </div>
            )}

            {/* Create button */}
            {challengeCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button 
                  onClick={onCreateChallenge}
                  size="sm"
                  className="bg-gradient-flame hover:opacity-90 font-semibold shadow-glow gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Challenge</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
