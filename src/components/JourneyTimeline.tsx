import { useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Challenge, ACHIEVEMENTS } from '@/types/challenge';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { Check, Lock, Flame, Star } from 'lucide-react';

interface JourneyTimelineProps {
  challenge: Challenge;
}

export function JourneyTimeline({ challenge }: JourneyTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const currentDay = challenge.checkIns.length;
  
  // Define journey milestones based on achievements
  const milestones = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => {
      const isUnlocked = currentDay >= achievement.day;
      const isCurrent = currentDay > 0 && 
        achievement.day <= currentDay && 
        (ACHIEVEMENTS.find(a => a.day > currentDay)?.day ?? 101) > achievement.day;
      const daysAway = achievement.day - currentDay;
      
      // Find the check-in date for unlocked milestones
      const unlockedDate = isUnlocked && challenge.checkIns[achievement.day - 1]
        ? challenge.checkIns[achievement.day - 1].createdAt
        : undefined;

      return {
        ...achievement,
        isUnlocked,
        isCurrent,
        daysAway: daysAway > 0 ? daysAway : 0,
        unlockedDate,
      };
    });
  }, [challenge, currentDay]);

  // GSAP animation
  useEffect(() => {
    if (timelineRef.current) {
      const items = timelineRef.current.querySelectorAll('.timeline-item');
      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.4, 
          stagger: 0.08,
          ease: 'power3.out',
        }
      );
    }
  }, []);

  // Calculate progress between milestones
  const progressPercent = useMemo(() => {
    const nextMilestone = milestones.find(m => !m.isUnlocked);
    const prevMilestone = [...milestones].reverse().find(m => m.isUnlocked);
    
    if (!nextMilestone) return 100;
    if (!prevMilestone) return (currentDay / nextMilestone.day) * 100;
    
    const range = nextMilestone.day - prevMilestone.day;
    const progress = currentDay - prevMilestone.day;
    return ((prevMilestone.day / 100) * 100) + ((progress / range) * (100 / milestones.length));
  }, [milestones, currentDay]);

  return (
    <div className="relative">
      {/* Current day indicator */}
      <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-gradient-fire/10 border border-primary/20">
        <div className="w-12 h-12 rounded-full bg-gradient-fire flex items-center justify-center shadow-glow">
          <Flame className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-lg">Day {currentDay}</p>
          <p className="text-sm text-muted-foreground">
            {currentDay === 0 
              ? 'Start your journey!' 
              : currentDay === 100 
                ? '🎉 Challenge complete!' 
                : `${100 - currentDay} days to go`}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="relative pl-6">
        {/* Progress line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-muted" />
        <motion.div 
          className="absolute left-[11px] top-2 w-0.5 bg-gradient-fire"
          initial={{ height: 0 }}
          animate={{ height: `${progressPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Milestone items */}
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div 
              key={milestone.day}
              className={cn(
                'timeline-item relative flex gap-4',
                !milestone.isUnlocked && 'opacity-50'
              )}
            >
              {/* Node */}
              <div className={cn(
                'absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all',
                milestone.isUnlocked 
                  ? 'bg-gradient-fire border-primary text-white shadow-glow' 
                  : 'bg-background border-muted-foreground/30'
              )}>
                {milestone.isUnlocked ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Lock className="w-2.5 h-2.5" />
                )}
              </div>

              {/* Content */}
              <div className={cn(
                'flex-1 p-4 rounded-xl border transition-all',
                milestone.isUnlocked 
                  ? 'bg-card border-border shadow-sm' 
                  : 'bg-muted/30 border-border/50'
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{milestone.badge}</span>
                    <div>
                      <p className="font-semibold">{milestone.name}</p>
                      <p className="text-xs text-muted-foreground">Day {milestone.day}</p>
                    </div>
                  </div>
                  
                  {milestone.isUnlocked && milestone.unlockedDate && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(milestone.unlockedDate), 'MMM d')}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mt-2">
                  {milestone.description}
                </p>

                {!milestone.isUnlocked && milestone.daysAway > 0 && (
                  <p className="text-xs text-primary mt-2 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {milestone.daysAway} day{milestone.daysAway !== 1 ? 's' : ''} away
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
