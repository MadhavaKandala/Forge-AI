import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Flame, Zap } from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import { Challenge } from '@/types/challenge';
import forgeLogo from '@/assets/forge-logo.png';

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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border pt-safe">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={forgeLogo} alt="Forge AI" className="w-10 h-10 rounded-xl" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">FORGE AI</h1>
              <p className="text-[11px] text-muted-foreground">Command Center</p>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick stats */}
            {challengeCount > 0 && (
              <div className="flex items-center gap-2">
                {/* Stats (Desktop) */}
                <div className="hidden md:flex items-center gap-2">
                  {totalStreak > 0 && (
                    <Badge variant="secondary" className="gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-0 font-semibold">
                      🔥 {totalStreak}
                    </Badge>
                  )}
                  {totalCheckIns > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="w-3 h-3" />
                      {totalCheckIns} check-ins
                    </Badge>
                  )}
                </div>

                {/* Condensed Streak (Mobile) */}
                <div className="md:hidden flex items-center">
                  {totalStreak > 0 && (
                    <Badge variant="secondary" className="gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-0 font-semibold px-2">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      {totalStreak}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Create button */}
            {challengeCount > 0 && (
              <Button
                onClick={onCreateChallenge}
                size="sm"
                className="gap-1 font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Challenge</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
