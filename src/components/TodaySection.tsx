import { useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Challenge } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, CheckCircle2, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/types/challenge';

interface TodaySectionProps {
  challenges: Challenge[];
  onCheckIn: (challengeId: string) => void;
}

export function TodaySection({ challenges, onCheckIn }: TodaySectionProps) {
  const { hasCheckedInToday, getStreak } = useChallenges();
  const containerRef = useRef<HTMLDivElement>(null);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Categorize challenges
  const { pending, completed, urgent } = useMemo(() => {
    const active = challenges.filter(c => c.status === 'active');
    const pendingList: Challenge[] = [];
    const completedList: Challenge[] = [];
    const urgentList: Challenge[] = [];

    active.forEach(challenge => {
      const checkedIn = hasCheckedInToday(challenge.id);
      const streak = getStreak(challenge);
      
      if (checkedIn) {
        completedList.push(challenge);
      } else if (streak >= 7) {
        // High streak at risk = urgent
        urgentList.push(challenge);
      } else {
        pendingList.push(challenge);
      }
    });

    // Sort urgent by streak (highest first)
    urgentList.sort((a, b) => getStreak(b) - getStreak(a));

    return { 
      pending: pendingList, 
      completed: completedList, 
      urgent: urgentList 
    };
  }, [challenges, hasCheckedInToday, getStreak]);

  const allDone = pending.length === 0 && urgent.length === 0;
  const totalActive = pending.length + urgent.length + completed.length;
  const progressPercent = totalActive > 0 ? (completed.length / totalActive) * 100 : 0;

  // GSAP entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Header Card */}
      <Card className="overflow-hidden border-none shadow-card bg-gradient-to-br from-card to-card/80">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-display font-bold">
                {greeting}! 👋
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
            </div>
            {!allDone && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                {pending.length + urgent.length} to go
              </Badge>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today's progress</span>
              <span className="font-semibold">{completed.length}/{totalActive}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {allDone && totalActive > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 rounded-xl bg-gradient-fire/10 border border-primary/20 text-center"
            >
              <Sparkles className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="font-semibold text-primary">All done for today!</p>
              <p className="text-sm text-muted-foreground">Great job keeping your streaks alive 🔥</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Urgent challenges (high streak at risk) */}
      {urgent.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-destructive flex items-center gap-2 px-1">
            <AlertTriangle className="w-4 h-4" />
            Streak at risk!
          </h3>
          <div className="space-y-2">
            {urgent.map((challenge) => (
              <ChallengeQuickCard
                key={challenge.id}
                challenge={challenge}
                streak={getStreak(challenge)}
                onCheckIn={() => onCheckIn(challenge.id)}
                isUrgent
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending challenges */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 px-1">
            <Flame className="w-4 h-4" />
            Ready to check in
          </h3>
          <div className="space-y-2">
            {pending.map((challenge) => (
              <ChallengeQuickCard
                key={challenge.id}
                challenge={challenge}
                streak={getStreak(challenge)}
                onCheckIn={() => onCheckIn(challenge.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed today */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 px-1">
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            Done today ({completed.length})
          </h3>
          <div className="space-y-2 opacity-70">
            {completed.slice(0, 3).map((challenge) => (
              <ChallengeQuickCard
                key={challenge.id}
                challenge={challenge}
                streak={getStreak(challenge)}
                isDone
              />
            ))}
            {completed.length > 3 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                +{completed.length - 3} more completed
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ChallengeQuickCardProps {
  challenge: Challenge;
  streak: number;
  onCheckIn?: () => void;
  isUrgent?: boolean;
  isDone?: boolean;
}

function ChallengeQuickCard({ 
  challenge, 
  streak, 
  onCheckIn, 
  isUrgent,
  isDone 
}: ChallengeQuickCardProps) {
  const config = CATEGORY_CONFIG[challenge.category];

  return (
    <motion.div
      whileHover={{ scale: isDone ? 1 : 1.01 }}
      whileTap={{ scale: isDone ? 1 : 0.99 }}
    >
      <Card className={cn(
        'transition-all',
        isUrgent && 'border-destructive/50 bg-destructive/5',
        isDone && 'bg-muted/30'
      )}>
        <CardContent className="p-4 flex items-center gap-3">
          {/* Category emoji */}
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0',
            isUrgent ? 'bg-destructive/10' : 'bg-muted'
          )}>
            {config.emoji}
          </div>

          {/* Challenge info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{challenge.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Day {challenge.checkIns.length + (isDone ? 0 : 1)}/100</span>
              {streak > 0 && (
                <>
                  <span>•</span>
                  <span className={cn(
                    'flex items-center gap-1',
                    isUrgent && 'text-destructive font-semibold'
                  )}>
                    {streak}🔥
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action button */}
          {!isDone && onCheckIn && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onCheckIn();
              }}
              size="sm"
              className={cn(
                'shrink-0',
                isUrgent 
                  ? 'bg-destructive hover:bg-destructive/90' 
                  : 'bg-gradient-fire hover:opacity-90'
              )}
            >
              Check In
            </Button>
          )}

          {isDone && (
            <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
