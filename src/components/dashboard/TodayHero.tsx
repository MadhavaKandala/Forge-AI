import { useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Challenge, CATEGORY_CONFIG } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from './GlassCard';
import { WeeklySparkline } from './WeeklySparkline';
import { Clock, Sparkles, CheckCircle2, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TodayHeroProps {
  challenges: Challenge[];
  onQuickCheckIn?: (challengeId: string) => void;
}

export function TodayHero({ challenges, onQuickCheckIn }: TodayHeroProps) {
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
  const { pending, completed, totalActive, progress } = useMemo(() => {
    const active = challenges.filter(c => c.status === 'active');
    const pendingList = active.filter(c => !hasCheckedInToday(c.id));
    const completedList = active.filter(c => hasCheckedInToday(c.id));
    const progressPercent = active.length > 0 
      ? Math.round((completedList.length / active.length) * 100) 
      : 0;

    return {
      pending: pendingList,
      completed: completedList,
      totalActive: active.length,
      progress: progressPercent,
    };
  }, [challenges, hasCheckedInToday]);

  const allDone = pending.length === 0 && totalActive > 0;

  // Combined streak (sum of all active streaks)
  const combinedStreak = useMemo(() => {
    return challenges
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + getStreak(c), 0);
  }, [challenges, getStreak]);

  // GSAP entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.animate-in'),
        { opacity: 0, y: 15 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.08, 
          ease: 'power3.out' 
        }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Main Hero Card */}
      <GlassCard 
        variant="elevated" 
        padding="lg"
        className="animate-in relative overflow-hidden"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {greeting}! 👋
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
            </div>
            
            {/* Stats badges */}
            <div className="flex items-center gap-2">
              {combinedStreak > 0 && (
                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
                  <Flame className="w-3 h-3" />
                  {combinedStreak}
                </Badge>
              )}
              {!allDone && pending.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {pending.length} to go
                </Badge>
              )}
            </div>
          </div>

          {/* Progress section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today's progress</span>
              <span className="font-semibold stat-number">{completed.length}/{totalActive}</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-2.5" />
              {/* Glow effect on progress */}
              {progress > 0 && progress < 100 && (
                <motion.div
                  className="absolute top-0 h-2.5 bg-primary/30 rounded-full blur-sm"
                  style={{ width: `${progress}%` }}
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </div>

          {/* All done celebration */}
          <AnimatePresence>
            {allDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 text-center"
              >
                <Sparkles className="w-6 h-6 mx-auto text-secondary mb-2" />
                <p className="font-semibold text-secondary">All done for today!</p>
                <p className="text-sm text-muted-foreground">Great job keeping your streaks alive 🔥</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Weekly Sparkline */}
      <GlassCard padding="md" className="animate-in">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            This Week
          </span>
          <span className="text-xs text-muted-foreground">
            {completed.length}/{totalActive} today
          </span>
        </div>
        <WeeklySparkline challenges={challenges} />
      </GlassCard>

      {/* Quick Action Pills (challenges needing check-in) */}
      {pending.length > 0 && pending.length <= 4 && (
        <div className="animate-in flex flex-wrap gap-2">
          {pending.slice(0, 4).map((challenge) => {
            const config = CATEGORY_CONFIG[challenge.category];
            return (
              <motion.button
                key={challenge.id}
                onClick={() => onQuickCheckIn?.(challenge.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl',
                  'glass hover-lift press-scale',
                  'text-sm font-medium'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{config.emoji}</span>
                <span className="truncate max-w-[120px]">{challenge.name}</span>
                <span className="text-xs text-muted-foreground">
                  Day {challenge.checkIns.length + 1}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
