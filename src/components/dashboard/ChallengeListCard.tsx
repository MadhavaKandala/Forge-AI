import { motion } from 'framer-motion';
import { Challenge, CATEGORY_CONFIG } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { GlassCard } from './GlassCard';
import { StreakPill } from './StreakPill';
import { CheckCircle2, ChevronRight, Trophy, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChallengeListCardProps {
  challenge: Challenge;
  onViewDetails: () => void;
  onCheckIn: () => void;
}

export function ChallengeListCard({ 
  challenge, 
  onViewDetails, 
  onCheckIn 
}: ChallengeListCardProps) {
  const { getStreak, getProgress, hasCheckedInToday } = useChallenges();
  
  const streak = getStreak(challenge);
  const progress = getProgress(challenge);
  const checkedIn = hasCheckedInToday(challenge.id);
  const isCompleted = challenge.status === 'completed';
  const isUrgent = streak >= 7 && !checkedIn && !isCompleted;
  const config = CATEGORY_CONFIG[challenge.category];

  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <GlassCard 
        interactive
        padding="md"
        className={cn(
          'flex items-center gap-3 sm:gap-4 group',
          isUrgent && 'ring-1 ring-destructive/40 bg-destructive/5',
        )}
        onClick={onViewDetails}
      >
        {/* Category accent strip */}
        <div 
          className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        
        {/* Category icon */}
        <div 
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ml-2',
            'transition-transform group-hover:scale-110'
          )}
          style={{ backgroundColor: `${config.color}15` }}
        >
          {config.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">{challenge.name}</p>
            {isCompleted && (
              <Trophy className="w-4 h-4 text-accent shrink-0" />
            )}
            {isUrgent && (
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">
              Day {challenge.checkIns.length}/100
            </span>
            {streak > 0 && (
              <StreakPill count={streak} size="sm" animated={false} />
            )}
          </div>
        </div>

        {/* Progress bar (hidden on small screens) */}
        <div className="w-20 hidden sm:block">
          <Progress value={progress} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground text-right mt-1">
            {progress}%
          </p>
        </div>

        {/* Action */}
        {!isCompleted ? (
          <Button
            size="sm"
            variant={checkedIn ? 'secondary' : 'default'}
            className={cn(
              'shrink-0 gap-1',
              !checkedIn && 'bg-gradient-flame hover:opacity-90 shadow-glow',
              checkedIn && 'bg-secondary/20'
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (!checkedIn) onCheckIn();
            }}
            disabled={checkedIn}
          >
            {checkedIn ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Done</span>
              </>
            ) : (
              <span>Check In</span>
            )}
          </Button>
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </GlassCard>
    </motion.div>
  );
}
