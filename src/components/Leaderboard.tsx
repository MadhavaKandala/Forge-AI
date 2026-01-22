import { useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Challenge, CATEGORY_CONFIG } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { Trophy, Flame, Target, TrendingUp, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  challenges: Challenge[];
}

export function Leaderboard({ challenges }: LeaderboardProps) {
  const { getStreak, getProgress, getBestStreak } = useChallenges();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      gsap.fromTo(
        listRef.current.children,
        { opacity: 0, x: -30 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5, 
          stagger: 0.08,
          ease: 'power3.out',
        }
      );
    }
  }, [challenges]);

  const rankings = useMemo(() => {
    const byStreak = [...challenges].sort((a, b) => getStreak(b) - getStreak(a));
    const byProgress = [...challenges].sort((a, b) => getProgress(b) - getProgress(a));
    const byDays = [...challenges].sort((a, b) => b.checkIns.length - a.checkIns.length);
    const byBestStreak = [...challenges].sort((a, b) => getBestStreak(b) - getBestStreak(a));

    return { byStreak, byProgress, byDays, byBestStreak };
  }, [challenges, getStreak, getProgress, getBestStreak]);

  const getMedal = (rank: number) => {
    if (rank === 0) return { icon: '🥇', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (rank === 1) return { icon: '🥈', color: 'text-gray-400', bg: 'bg-gray-400/10' };
    if (rank === 2) return { icon: '🥉', color: 'text-orange-600', bg: 'bg-orange-600/10' };
    return { icon: `#${rank + 1}`, color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  const RankingItem = ({ 
    challenge, 
    rank, 
    value, 
    suffix 
  }: { 
    challenge: Challenge; 
    rank: number; 
    value: number | string; 
    suffix: string;
  }) => {
    const medal = getMedal(rank);
    const config = CATEGORY_CONFIG[challenge.category];

    return (
      <div className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02]',
        rank < 3 ? medal.bg : 'bg-muted/30'
      )}>
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
          rank < 3 ? medal.bg : 'bg-muted'
        )}>
          {rank < 3 ? (
            <span className="text-lg">{medal.icon}</span>
          ) : (
            <span className={medal.color}>{rank + 1}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.emoji}</span>
            <p className="font-medium truncate">{challenge.name}</p>
          </div>
          <p className="text-xs text-muted-foreground">{config.label}</p>
        </div>

        <Badge variant={rank < 3 ? 'default' : 'secondary'} className={cn(
          'font-bold',
          rank === 0 && 'bg-gradient-fire'
        )}>
          {value} {suffix}
        </Badge>
      </div>
    );
  };

  if (challenges.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Start challenges to see your rankings!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          Personal Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="streak" className="space-y-4">
          <TabsList className="grid grid-cols-4 h-10">
            <TabsTrigger value="streak" className="text-xs gap-1">
              <Flame className="w-3 h-3" />
              Streak
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xs gap-1">
              <Target className="w-3 h-3" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="days" className="text-xs gap-1">
              <TrendingUp className="w-3 h-3" />
              Days
            </TabsTrigger>
            <TabsTrigger value="best" className="text-xs gap-1">
              <Medal className="w-3 h-3" />
              Best
            </TabsTrigger>
          </TabsList>

          <TabsContent value="streak">
            <div ref={listRef} className="space-y-2">
              {rankings.byStreak.map((c, i) => (
                <RankingItem 
                  key={c.id} 
                  challenge={c} 
                  rank={i} 
                  value={getStreak(c)} 
                  suffix="🔥"
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="space-y-2">
              {rankings.byProgress.map((c, i) => (
                <RankingItem 
                  key={c.id} 
                  challenge={c} 
                  rank={i} 
                  value={`${getProgress(c)}%`} 
                  suffix=""
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="days">
            <div className="space-y-2">
              {rankings.byDays.map((c, i) => (
                <RankingItem 
                  key={c.id} 
                  challenge={c} 
                  rank={i} 
                  value={c.checkIns.length} 
                  suffix="days"
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="best">
            <div className="space-y-2">
              {rankings.byBestStreak.map((c, i) => (
                <RankingItem 
                  key={c.id} 
                  challenge={c} 
                  rank={i} 
                  value={getBestStreak(c)} 
                  suffix="best"
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
