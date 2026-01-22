import { useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Challenge, CATEGORY_CONFIG } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Target,
  Zap,
  Award,
  CalendarCheck,
} from 'lucide-react';
import { format, parseISO, differenceInDays, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

interface SmartInsightsProps {
  challenges: Challenge[];
}

interface Insight {
  type: 'success' | 'warning' | 'tip' | 'milestone';
  icon: React.ElementType;
  title: string;
  description: string;
  priority: number;
}

export function SmartInsights({ challenges }: SmartInsightsProps) {
  const { getStreak, getBestStreak, hasCheckedInToday, getDaysRemaining } = useChallenges();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, scale: 0.95, y: 20 },
        { 
          opacity: 1, 
          scale: 1,
          y: 0, 
          duration: 0.5, 
          stagger: 0.1,
          ease: 'back.out(1.2)',
        }
      );
    }
  }, [challenges]);

  const insights = useMemo(() => {
    const result: Insight[] = [];

    challenges.forEach(challenge => {
      const streak = getStreak(challenge);
      const bestStreak = getBestStreak(challenge);
      const checkedIn = hasCheckedInToday(challenge.id);
      const daysRemaining = getDaysRemaining(challenge);
      const progress = Math.round((challenge.checkIns.length / 100) * 100);
      const config = CATEGORY_CONFIG[challenge.category];

      // Streak warning
      if (!checkedIn && streak > 0) {
        result.push({
          type: 'warning',
          icon: AlertTriangle,
          title: `Don't break your ${streak}-day streak!`,
          description: `Check in to ${challenge.name} before midnight to keep your streak alive! 🔥`,
          priority: 10,
        });
      }

      // About to beat best streak
      if (streak === bestStreak && streak > 0 && checkedIn) {
        result.push({
          type: 'success',
          icon: TrendingUp,
          title: 'New personal best incoming!',
          description: `You're at your best streak of ${streak} days in ${challenge.name}. Keep going!`,
          priority: 8,
        });
      }

      // Milestone approaching
      const milestones = [7, 14, 21, 30, 50, 75, 100];
      const nextMilestone = milestones.find(m => m > challenge.checkIns.length);
      if (nextMilestone && nextMilestone - challenge.checkIns.length <= 3) {
        result.push({
          type: 'milestone',
          icon: Award,
          title: `${nextMilestone - challenge.checkIns.length} days until Day ${nextMilestone}!`,
          description: `You're about to unlock a new achievement in ${challenge.name}!`,
          priority: 7,
        });
      }

      // Check consistency for burnout detection
      const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date(),
      });
      const last7CheckIns = last7Days.filter(day =>
        challenge.checkIns.some(ci => isSameDay(parseISO(ci.date), day))
      ).length;

      if (last7CheckIns >= 7 && streak >= 14) {
        result.push({
          type: 'tip',
          icon: Lightbulb,
          title: 'Amazing consistency!',
          description: `14+ days strong in ${challenge.name}! Remember to celebrate your wins.`,
          priority: 5,
        });
      }

      // Low activity warning
      if (last7CheckIns <= 2 && challenge.checkIns.length > 7) {
        result.push({
          type: 'warning',
          icon: AlertTriangle,
          title: 'Activity dropping?',
          description: `Only ${last7CheckIns} check-ins this week for ${challenge.name}. Small steps count!`,
          priority: 6,
        });
      }

      // Almost complete!
      if (progress >= 90 && progress < 100) {
        result.push({
          type: 'success',
          icon: Target,
          title: 'Almost there! 🎯',
          description: `${100 - challenge.checkIns.length} days left to complete ${challenge.name}!`,
          priority: 9,
        });
      }
    });

    // General insights
    const totalActiveStreaks = challenges.filter(c => getStreak(c) > 0).length;
    if (totalActiveStreaks === challenges.length && challenges.length > 1) {
      result.push({
        type: 'success',
        icon: Zap,
        title: 'All challenges on fire!',
        description: `You have active streaks in all ${challenges.length} challenges. Unstoppable!`,
        priority: 9,
      });
    }

    // Best day analysis
    const dayCounts = new Array(7).fill(0);
    challenges.forEach(c => {
      c.checkIns.forEach(ci => {
        dayCounts[parseISO(ci.date).getDay()]++;
      });
    });
    const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();

    if (today === bestDayIndex && dayCounts[bestDayIndex] > 5) {
      result.push({
        type: 'tip',
        icon: CalendarCheck,
        title: `${days[bestDayIndex]} is your power day!`,
        description: `You're most consistent on ${days[bestDayIndex]}s. Make today count!`,
        priority: 4,
      });
    }

    // Sort by priority and return top 5
    return result.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }, [challenges, getStreak, getBestStreak, hasCheckedInToday, getDaysRemaining]);

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Lightbulb className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Insights will appear as you make progress!</p>
        </CardContent>
      </Card>
    );
  }

  const getAlertVariant = (type: Insight['type']) => {
    switch (type) {
      case 'warning': return 'destructive';
      default: return 'default';
    }
  };

  const getIconColor = (type: Insight['type']) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-destructive';
      case 'tip': return 'text-blue-500';
      case 'milestone': return 'text-accent';
      default: return 'text-primary';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="w-5 h-5 text-accent" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="space-y-3">
          {insights.map((insight, i) => (
            <Alert key={i} variant={getAlertVariant(insight.type)}>
              <insight.icon className={`w-4 h-4 ${getIconColor(insight.type)}`} />
              <AlertTitle className="text-sm font-semibold">{insight.title}</AlertTitle>
              <AlertDescription className="text-xs">
                {insight.description}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
