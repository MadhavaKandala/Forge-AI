import { useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Challenge, CATEGORY_CONFIG, ChallengeCategory } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Flame, 
  Trophy, 
  Target, 
  TrendingUp, 
  Plus,
  Filter,
  ArrowUpDown,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface AllChallengesDashboardProps {
  challenges: Challenge[];
  onViewDetails: (challenge: Challenge) => void;
  onCheckIn: (challengeId: string) => void;
  onCreateChallenge: () => void;
}

type SortOption = 'streak' | 'progress' | 'recent' | 'name';
type FilterOption = 'all' | ChallengeCategory;

export function AllChallengesDashboard({ 
  challenges, 
  onViewDetails,
  onCheckIn,
  onCreateChallenge 
}: AllChallengesDashboardProps) {
  const { getStreak, getProgress, hasCheckedInToday, getBestStreak } = useChallenges();
  const [sortBy, setSortBy] = useState<SortOption>('streak');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const statsRef = useRef<HTMLDivElement>(null);

  // GSAP animation
  useEffect(() => {
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.children,
        { opacity: 0, y: 20, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5, 
          stagger: 0.1,
          ease: 'power3.out' 
        }
      );
    }
  }, []);

  // Calculate aggregate stats
  const stats = useMemo(() => {
    const active = challenges.filter(c => c.status === 'active');
    const completed = challenges.filter(c => c.status === 'completed');
    const todayPending = active.filter(c => !hasCheckedInToday(c.id));
    const todayDone = active.filter(c => hasCheckedInToday(c.id));
    
    const allStreaks = challenges.map(c => getStreak(c));
    const longestStreak = Math.max(...allStreaks, 0);
    const combinedStreak = allStreaks.reduce((sum, s) => sum + s, 0);
    
    const avgProgress = challenges.length > 0
      ? Math.round(challenges.reduce((sum, c) => sum + getProgress(c), 0) / challenges.length)
      : 0;

    // Weekly consistency (check-ins this week / expected)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    let weeklyCheckIns = 0;
    challenges.forEach(c => {
      c.checkIns.forEach(ci => {
        if (new Date(ci.date) >= weekStart) weeklyCheckIns++;
      });
    });
    const expectedWeekly = active.length * (now.getDay() + 1);
    const weeklyConsistency = expectedWeekly > 0 
      ? Math.min(100, Math.round((weeklyCheckIns / expectedWeekly) * 100))
      : 0;

    return {
      totalActive: active.length,
      totalCompleted: completed.length,
      todayPending: todayPending.length,
      todayDone: todayDone.length,
      longestStreak,
      combinedStreak,
      avgProgress,
      weeklyConsistency,
    };
  }, [challenges, getStreak, getProgress, hasCheckedInToday]);

  // Filter and sort challenges
  const displayedChallenges = useMemo(() => {
    let filtered = [...challenges];
    
    // Filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(c => c.category === filterBy);
    }
    
    // Sort
    switch (sortBy) {
      case 'streak':
        filtered.sort((a, b) => getStreak(b) - getStreak(a));
        break;
      case 'progress':
        filtered.sort((a, b) => getProgress(b) - getProgress(a));
        break;
      case 'recent':
        filtered.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    return filtered;
  }, [challenges, filterBy, sortBy, getStreak, getProgress]);

  const summaryCards = [
    { 
      label: 'Active', 
      value: stats.totalActive, 
      icon: Flame, 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      label: 'Today Done', 
      value: `${stats.todayDone}/${stats.totalActive}`, 
      icon: CheckCircle2, 
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    { 
      label: 'Best Streak', 
      value: stats.longestStreak, 
      icon: TrendingUp, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    { 
      label: 'Weekly', 
      value: `${stats.weeklyConsistency}%`, 
      icon: Calendar, 
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border-none shadow-card">
            <CardContent className="p-4">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-2', card.bgColor)}>
                <card.icon className={cn('w-5 h-5', card.color)} />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                {filterBy === 'all' ? 'All' : CATEGORY_CONFIG[filterBy].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterBy('all')}>
                All Categories
              </DropdownMenuItem>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <DropdownMenuItem 
                  key={key} 
                  onClick={() => setFilterBy(key as ChallengeCategory)}
                >
                  {config.emoji} {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('streak')}>
                By Streak
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('progress')}>
                By Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('recent')}>
                Most Recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                By Name
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button onClick={onCreateChallenge} className="bg-gradient-fire hover:opacity-90 gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Challenge</span>
        </Button>
      </div>

      {/* Challenge List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>All Challenges ({displayedChallenges.length})</span>
            {stats.totalCompleted > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Trophy className="w-3 h-3" />
                {stats.totalCompleted} completed
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="divide-y">
              {displayedChallenges.map((challenge) => {
                const config = CATEGORY_CONFIG[challenge.category];
                const streak = getStreak(challenge);
                const progress = getProgress(challenge);
                const checkedIn = hasCheckedInToday(challenge.id);
                const isCompleted = challenge.status === 'completed';

                return (
                  <motion.div
                    key={challenge.id}
                    className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onViewDetails(challenge)}
                    whileHover={{ x: 4 }}
                  >
                    {/* Category icon */}
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      {config.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{challenge.name}</p>
                        {isCompleted && (
                          <Trophy className="w-4 h-4 text-accent shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>Day {challenge.checkIns.length}/100</span>
                        {streak > 0 && (
                          <span className="flex items-center gap-1">
                            {streak}🔥
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-24 hidden sm:block">
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right mt-1">{progress}%</p>
                    </div>

                    {/* Action */}
                    {!isCompleted && (
                      <Button
                        size="sm"
                        variant={checkedIn ? 'secondary' : 'default'}
                        className={cn(
                          'shrink-0',
                          !checkedIn && 'bg-gradient-fire hover:opacity-90'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!checkedIn) onCheckIn(challenge.id);
                        }}
                        disabled={checkedIn}
                      >
                        {checkedIn ? '✓ Done' : 'Check In'}
                      </Button>
                    )}
                  </motion.div>
                );
              })}

              {displayedChallenges.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No challenges found</p>
                  <Button 
                    onClick={onCreateChallenge} 
                    variant="link" 
                    className="mt-2"
                  >
                    Create your first challenge
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
