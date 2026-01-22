import { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { Challenge, ACHIEVEMENTS, MOOD_CONFIG } from '@/types/challenge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-primary" />
            Milestone Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={timelineRef} className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            {MILESTONES.map((milestone, index) => {
              const isCompleted = currentDay >= milestone.day;
              const isCurrent = currentDay >= milestone.day && 
                (index === MILESTONES.length - 1 || currentDay < MILESTONES[index + 1].day);
              
              return (
                <div 
                  key={milestone.day}
                  className={`relative flex items-start gap-4 pb-6 last:pb-0 ${
                    !isCompleted ? 'opacity-50' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                    isCompleted 
                      ? isCurrent 
                        ? 'bg-gradient-fire shadow-glow' 
                        : 'bg-green-500/20 border-2 border-green-500'
                      : 'bg-muted border-2 border-border'
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
                      <span className="font-semibold">{milestone.label}</span>
                      <Badge variant="outline" className="text-xs">
                        Day {milestone.day}
                      </Badge>
                      {isCurrent && (
                        <Badge className="bg-primary/20 text-primary border-0 text-xs">
                          <Flame className="w-3 h-3 mr-1" />
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {ACHIEVEMENTS.map((achievement) => (
              <AchievementBadge
                key={achievement.day}
                achievement={achievement}
                unlocked={currentDay >= achievement.day}
                size="sm"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-secondary" />
            Activity Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HeatmapCalendar challenge={challenge} weeks={14} />
        </CardContent>
      </Card>

      {/* Weekly Grid View */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">100 Days Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {weeklyData.slice(0, 10).map((week) => (
              <div key={week.weekNum} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12 shrink-0">
                  Week {week.weekNum}
                </span>
                <div className="flex gap-1 flex-1">
                  {week.days.map((checkIn, dayIndex) => {
                    const dayNum = (week.weekNum - 1) * 7 + dayIndex + 1;
                    const isCompleted = checkIn !== null;
                    const isFuture = dayNum > currentDay + 1;
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs transition-all ${
                          isCompleted
                            ? checkIn?.mood 
                              ? MOOD_CONFIG[checkIn.mood]?.color?.replace('text-', 'bg-') + '/20'
                              : 'bg-green-500/20 text-green-500'
                            : isFuture
                            ? 'bg-muted/30 text-muted-foreground/30'
                            : 'bg-muted text-muted-foreground'
                        }`}
                        title={isCompleted ? `Day ${dayNum} - ${checkIn?.notes || 'Completed'}` : `Day ${dayNum}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        ) : (
                          dayNum <= 100 ? dayNum : ''
                        )}
                      </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
