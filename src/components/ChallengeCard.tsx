import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Challenge } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { StreakBadge } from './StreakBadge';
import { CategoryBadge } from './CategoryBadge';
import { ProgressRing } from './ProgressRing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Check, ChevronRight, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface ChallengeCardProps {
  challenge: Challenge;
  onViewDetails: (challenge: Challenge) => void;
  onCheckIn: (challengeId: string) => void;
}

export function ChallengeCard({ challenge, onViewDetails, onCheckIn }: ChallengeCardProps) {
  const { getStreak, getProgress, hasCheckedInToday, getDaysRemaining } = useChallenges();
  
  const streak = getStreak(challenge);
  const progress = getProgress(challenge);
  const checkedIn = hasCheckedInToday(challenge.id);
  const daysRemaining = getDaysRemaining(challenge);
  const daysSinceStart = differenceInDays(new Date(), new Date(challenge.startDate));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={challenge.category} size="sm" />
                <span className="text-xs text-muted-foreground">
                  Day {Math.min(challenge.checkIns.length, 100)}/100
                </span>
              </div>
              <h3 className="font-display font-bold text-lg leading-tight truncate">
                {challenge.name}
              </h3>
              {challenge.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {challenge.description}
                </p>
              )}
            </div>
            <ProgressRing progress={progress} size={64} strokeWidth={5}>
              <span className="text-sm font-bold">{progress}%</span>
            </ProgressRing>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats row */}
          <div className="flex items-center justify-between text-sm">
            <StreakBadge streak={streak} size="sm" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{daysRemaining} days left</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => onCheckIn(challenge.id)}
              disabled={checkedIn}
              className={cn(
                'flex-1 font-semibold transition-all',
                checkedIn 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-gradient-fire hover:opacity-90'
              )}
            >
              {checkedIn ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Done for today!
                </>
              ) : (
                <>
                  🔥 Check In
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onViewDetails(challenge)}
              className="shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
