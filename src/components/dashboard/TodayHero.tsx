import { useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Challenge, CATEGORY_CONFIG } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from './GlassCard';
import { WeeklySparkline } from './WeeklySparkline';
import { Clock, Sparkles, CheckCircle2, Flame, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
    if (hour < 5) return 'Good night'; // Late night grinder
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
        containerRef.current.querySelectorAll('.stagger-in'),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out'
        }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="space-y-4 md:space-y-6">
      {/* Main Hero Card */}
      <GlassCard
        variant="elevated"
        padding="lg"
        className="stagger-in relative overflow-hidden group"
      >
        {/* Dynamic Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/40 to-secondary/10 opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 md:gap-3 mb-1">
              <Badge variant="outline" className="rounded-full px-2 py-0.5 md:px-3 md:py-1 border-white/10 bg-white/5 backdrop-blur-md text-[10px] md:text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {format(new Date(), 'MMMM d, yyyy')}
              </Badge>
              {combinedStreak > 0 && (
                <div className="flex items-center gap-1.5 text-orange-500 font-bold text-xs md:text-sm animate-pulse-slow">
                  <Flame className="w-3.5 h-3.5 md:w-4 md:h-4 fill-orange-500" />
                  <span>{combinedStreak} Day Streak</span>
                </div>
              )}
            </div>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 pb-1 md:pb-2">
              {greeting}
            </h2>

            <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
              {allDone
                ? "You've crushed all your goals for today. Time to recharge! ⚡"
                : `You have ${pending.length} challenges waiting for you. Let's get to work.`}
            </p>
          </div>

          {!allDone && (
            <div className="w-full md:w-auto min-w-[200px] space-y-2 md:space-y-3 bg-white/5 p-3 md:p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-white/80">Daily Progress</span>
                <span className="font-mono text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5 md:h-2" indicatorClassName="bg-gradient-to-r from-primary to-secondary" />
              <div className="flex text-xs text-muted-foreground justify-between">
                <span>{completed.length} Completed</span>
                <span>{totalActive} Total</span>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Next Up / Actions */}
        <GlassCard padding="md" className="stagger-in flex flex-col justify-between h-full min-h-[140px] md:min-h-[160px]">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Up Next
            </h3>
            {pending.length > 0 && (
              <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                {pending.length} Remaining
              </Badge>
            )}
          </div>

          <div className="space-y-2 md:space-y-3">
            {pending.length > 0 ? (
              pending.slice(0, 2).map((challenge) => {
                const config = CATEGORY_CONFIG[challenge.category];
                return (
                  <motion.div
                    key={challenge.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                    onClick={() => onQuickCheckIn?.(challenge.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg md:text-xl filter drop-shadow-lg">{config.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground/90 group-hover:text-primary transition-colors truncate">{challenge.name}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">Day {challenge.checkIns.length + 1}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 md:h-8 md:w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </Button>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 mx-auto text-green-500/50 mb-2" />
                <p>All caught up!</p>
              </div>
            )}

            {pending.length > 2 && (
              <p className="text-[10px] md:text-xs text-center text-muted-foreground mt-1 md:mt-2">
                +{pending.length - 2} more challenges
              </p>
            )}
          </div>
        </GlassCard>

        {/* Weekly Trend */}
        <GlassCard padding="md" className="stagger-in h-full min-h-[140px] md:min-h-[160px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
              Weekly Velocity
            </h3>
          </div>
          <div className="h-[80px] md:h-[100px] w-full mt-2">
            <WeeklySparkline challenges={challenges} height={80} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
