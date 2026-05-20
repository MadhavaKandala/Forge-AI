import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Challenge, ACHIEVEMENTS, MOOD_CONFIG } from '@/types/challenge';
import { GlassCard } from '@/components/dashboard/GlassCard';
import { Badge } from '@/components/ui/badge';
import { HeatmapCalendar } from '@/components/HeatmapCalendar';
import { AchievementBadge } from '@/components/AchievementBadge';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Trophy,
  Calendar,
  Star,
  Sparkles,
} from 'lucide-react';

interface ChallengeDetailProgressProps {
  challenge: Challenge;
}

const MILESTONES = [
  { day: 1, label: 'Started', icon: '🚀', description: 'Your journey begins' },
  { day: 7, label: 'Week 1', icon: '🌱', description: 'First week complete' },
  { day: 14, label: 'Week 2', icon: '💪', description: 'Building momentum' },
  { day: 21, label: 'Habit Forming', icon: '🧠', description: 'New neural pathways' },
  { day: 30, label: 'Month 1', icon: '📅', description: 'One month strong' },
  { day: 50, label: 'Halfway', icon: '⚡', description: 'Past the midpoint' },
  { day: 75, label: 'Three Quarters', icon: '🏃', description: 'Sprint to finish' },
  { day: 100, label: 'Complete!', icon: '🏆', description: 'Challenge conquered' },
];

export function ChallengeDetailProgress({ challenge }: ChallengeDetailProgressProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const currentDay = challenge.checkIns.length;

  // Group check-ins by week
  const weeklyData = useMemo(() => {
    const weeks: { weekNum: number; days: (typeof challenge.checkIns[0] | null)[] }[] = [];
    const startDate = new Date(challenge.startDate);
    
    for (let week = 0; week < 15; week++) {
      const weekDays: (typeof challenge.checkIns[0] | null)[] = [];
      for (let day = 0; day < 7; day++) {
        const dayNum = week * 7 + day + 1;
        if (dayNum > 100) break;
        
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + dayNum - 1);
        const dateStr = targetDate.toISOString().split('T')[0];
        
        const checkIn = challenge.checkIns.find(ci => ci.date === dateStr);
        weekDays.push(checkIn || null);
      }
      if (weekDays.length > 0) {
        weeks.push({ weekNum: week + 1, days: weekDays });
      }
    }
    return weeks;
  }, [challenge]);

  useEffect(() => {
    if (timelineRef.current) {
      gsap.fromTo(
        timelineRef.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Milestone Timeline */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Milestone Timeline</h3>
            <p className="text-sm text-muted-foreground">Your journey to 100 days</p>
          </div>
        </div>
        
        <div ref={timelineRef} className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-border to-border" />
          
          {MILESTONES.map((milestone, index) => {
            const isCompleted = currentDay >= milestone.day;
            const isCurrent = currentDay >= milestone.day && 
              (index === MILESTONES.length - 1 || currentDay < MILESTONES[index + 1].day);
            
            return (
              <motion.div 
                key={milestone.day}
                className={`relative flex items-start gap-4 pb-6 last:pb-0 ${
                  !isCompleted ? 'opacity-40' : ''
                }`}
                whileHover={isCompleted ? { x: 4 } : {}}
              >
                {/* Icon */}
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                  isCompleted 
                    ? isCurrent 
                      ? 'bg-gradient-fire shadow-glow' 
                      : 'bg-green-500/20 border-2 border-green-500'
                    : 'glass border border-white/10'
                }`}>
                  {isCompleted ? (
                    <span className="text-sm">{milestone.icon}</span>
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold ${isCurrent ? 'text-primary' : ''}`}>
                      {milestone.label}
                    </span>
                    <Badge variant="outline" className="text-xs glass">
                      Day {milestone.day}
                    </Badge>
                    {isCurrent && (
                      <Badge className="bg-primary/20 text-primary border-0 text-xs gap-1">
                        <Flame className="w-3 h-3" />
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Achievements */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-semibold">Achievements</h3>
            <p className="text-sm text-muted-foreground">
              {ACHIEVEMENTS.filter(a => currentDay >= a.day).length} of {ACHIEVEMENTS.length} unlocked
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {ACHIEVEMENTS.map((achievement) => (
            <motion.div
              key={achievement.day}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <AchievementBadge
                achievement={achievement}
                unlocked={currentDay >= achievement.day}
                size="sm"
              />
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Activity Heatmap */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold">Activity Heatmap</h3>
            <p className="text-sm text-muted-foreground">Your check-in history</p>
          </div>
        </div>
        
        <HeatmapCalendar challenge={challenge} weeks={14} />
      </GlassCard>

      {/* Weekly Grid View */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">100 Days Grid</h3>
              <p className="text-sm text-muted-foreground">Visual progress tracker</p>
            </div>
          </div>
          <Badge variant="outline" className="glass">
            {currentDay}/100 days
          </Badge>
        </div>
        
        <div className="space-y-3">
          {weeklyData.slice(0, 10).map((week) => (
            <div key={week.weekNum} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-14 shrink-0 font-medium">
                Week {week.weekNum}
              </span>
              <div className="flex gap-1.5 flex-1">
                {week.days.map((checkIn, dayIndex) => {
                  const dayNum = (week.weekNum - 1) * 7 + dayIndex + 1;
                  const isCompleted = checkIn !== null;
                  const isFuture = dayNum > currentDay + 1;
                  const isToday = dayNum === currentDay + 1;
                  
                  return (
                    <motion.div
                      key={dayIndex}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs transition-all ${
                        isCompleted
                          ? 'bg-gradient-to-br from-green-500/30 to-green-500/10 text-green-500 border border-green-500/20'
                          : isToday
                          ? 'bg-primary/20 border-2 border-primary/50 animate-pulse'
                          : isFuture
                          ? 'bg-muted/20 text-muted-foreground/30 border border-white/5'
                          : 'bg-muted/50 text-muted-foreground border border-white/5'
                      }`}
                      title={isCompleted ? `Day ${dayNum} - ${checkIn?.notes || 'Completed'}` : `Day ${dayNum}`}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        dayNum <= 100 ? dayNum : ''
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
          {weeklyData.length > 10 && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              + {weeklyData.length - 10} more weeks
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
