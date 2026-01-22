import { useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Challenge, ACHIEVEMENTS, CATEGORY_CONFIG } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { 
  User, 
  Calendar, 
  Flame, 
  Target, 
  Trophy,
  Award,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';

interface ProfileCardProps {
  challenges: Challenge[];
}

export function ProfileCard({ challenges }: ProfileCardProps) {
  const { getBestStreak, getProgress } = useChallenges();
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.children,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.08,
          ease: 'power3.out',
        }
      );
    }
  }, []);

  const stats = useMemo(() => {
    const totalChallenges = challenges.length;
    const completedChallenges = challenges.filter(c => c.status === 'completed').length;
    const totalDays = challenges.reduce((sum, c) => sum + c.checkIns.length, 0);
    const longestStreak = Math.max(...challenges.map(c => getBestStreak(c)), 0);
    const avgProgress = totalChallenges > 0
      ? Math.round(challenges.reduce((sum, c) => sum + getProgress(c), 0) / totalChallenges)
      : 0;
    const completionRate = totalChallenges > 0 
      ? Math.round((completedChallenges / totalChallenges) * 100) 
      : 0;

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    challenges.forEach(c => {
      categoryBreakdown[c.category] = (categoryBreakdown[c.category] || 0) + 1;
    });

    // Achievements unlocked
    const achievementsUnlocked = challenges.reduce((total, c) => {
      return total + ACHIEVEMENTS.filter(a => c.checkIns.length >= a.day).length;
    }, 0);

    return {
      totalChallenges,
      completedChallenges,
      totalDays,
      longestStreak,
      avgProgress,
      completionRate,
      categoryBreakdown,
      achievementsUnlocked,
    };
  }, [challenges, getBestStreak, getProgress]);

  const joinDate = useMemo(() => {
    if (challenges.length === 0) return 'Today';
    const earliest = challenges.reduce((min, c) => 
      new Date(c.createdAt) < new Date(min) ? c.createdAt : min
    , challenges[0].createdAt);
    return format(new Date(earliest), 'MMM yyyy');
  }, [challenges]);

  // Calculate level based on total days
  const level = Math.floor(stats.totalDays / 25) + 1;
  const levelProgress = (stats.totalDays % 25) / 25 * 100;
  const xpToNextLevel = 25 - (stats.totalDays % 25);

  return (
    <Card className="overflow-hidden">
      {/* Header with gradient */}
      <div className="h-20 bg-gradient-fire relative">
        <div className="absolute -bottom-10 left-6">
          <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
            <AvatarImage src="" alt="Profile" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-bold">
              🔥
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardContent className="pt-14 space-y-6">
        {/* Name & Level */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-bold">Challenger</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Joined {joinDate}
            </p>
          </div>
          <Badge className="bg-gradient-fire text-white font-bold text-sm px-3 py-1">
            Level {level}
          </Badge>
        </div>

        {/* Level Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Level Progress</span>
            <span>{xpToNextLevel} days to Level {level + 1}</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Trophy className="w-5 h-5 mx-auto text-accent mb-1" />
            <p className="text-xl font-bold">{stats.totalChallenges}</p>
            <p className="text-xs text-muted-foreground">Challenges</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Flame className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold">{stats.longestStreak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Target className="w-5 h-5 mx-auto text-secondary mb-1" />
            <p className="text-xl font-bold">{stats.totalDays}</p>
            <p className="text-xs text-muted-foreground">Total Days</p>
          </div>
        </div>

        {/* Achievement Showcase */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold flex items-center gap-1">
              <Award className="w-4 h-4 text-accent" />
              Achievements
            </h4>
            <span className="text-xs text-muted-foreground">
              {stats.achievementsUnlocked} unlocked
            </span>
          </div>
          <div className="flex gap-1">
            {ACHIEVEMENTS.slice(0, 7).map((achievement, i) => {
              const unlocked = challenges.some(c => c.checkIns.length >= achievement.day);
              return (
                <div
                  key={achievement.day}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    unlocked 
                      ? 'bg-gradient-fire shadow-glow' 
                      : 'bg-muted opacity-40'
                  }`}
                  title={`${achievement.name} - Day ${achievement.day}`}
                >
                  {unlocked ? achievement.badge : '🔒'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories */}
        {Object.keys(stats.categoryBreakdown).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-1">
              <Star className="w-4 h-4 text-accent" />
              Categories
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.categoryBreakdown).map(([cat, count]) => {
                const config = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
                return (
                  <Badge key={cat} variant="secondary" className="gap-1">
                    {config.emoji} {config.label} ({count})
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Completion Rate */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20">
          <span className="text-sm font-medium">Completion Rate</span>
          <span className="font-bold text-secondary">{stats.completionRate}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
