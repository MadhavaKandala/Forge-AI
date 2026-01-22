import { useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Challenge, ChallengeCategory, CATEGORY_CONFIG } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Flame, 
  Award,
  Clock,
  BarChart3,
  PieChartIcon,
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

interface AnalyticsDashboardProps {
  challenges: Challenge[];
}

export function AnalyticsDashboard({ challenges }: AnalyticsDashboardProps) {
  const { getStreak, getBestStreak, getProgress } = useChallenges();
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.children,
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    }
  }, []);

  // Calculate weekly check-ins
  const weeklyData = useMemo(() => {
    const today = new Date();
    const weeks = [];
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(today, i * 7));
      const weekEnd = endOfWeek(subDays(today, i * 7));
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      let checkIns = 0;
      challenges.forEach(challenge => {
        challenge.checkIns.forEach(ci => {
          const ciDate = parseISO(ci.date);
          if (days.some(d => isSameDay(d, ciDate))) {
            checkIns++;
          }
        });
      });

      weeks.push({
        week: format(weekStart, 'MMM d'),
        checkIns,
        target: challenges.length * 7,
      });
    }
    
    return weeks;
  }, [challenges]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const counts: Record<ChallengeCategory, number> = {
      coding: 0,
      fitness: 0,
      reading: 0,
      learning: 0,
      productivity: 0,
      creativity: 0,
      health: 0,
      other: 0,
    };

    challenges.forEach(c => counts[c.category]++);

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        name: CATEGORY_CONFIG[category as ChallengeCategory].label,
        value: count,
        emoji: CATEGORY_CONFIG[category as ChallengeCategory].emoji,
        color: `hsl(var(--${CATEGORY_CONFIG[category as ChallengeCategory].color}))`,
      }));
  }, [challenges]);

  // Day of week analysis
  const dayOfWeekData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);

    challenges.forEach(challenge => {
      challenge.checkIns.forEach(ci => {
        const dayIndex = parseISO(ci.date).getDay();
        counts[dayIndex]++;
      });
    });

    return days.map((day, i) => ({
      day,
      checkIns: counts[i],
    }));
  }, [challenges]);

  // Stats
  const stats = useMemo(() => {
    const totalCheckIns = challenges.reduce((sum, c) => sum + c.checkIns.length, 0);
    const bestStreak = Math.max(...challenges.map(c => getBestStreak(c)), 0);
    const avgProgress = challenges.length > 0 
      ? Math.round(challenges.reduce((sum, c) => sum + getProgress(c), 0) / challenges.length)
      : 0;
    const currentStreaks = challenges.reduce((sum, c) => sum + getStreak(c), 0);

    // Best day of week
    const dayCounts = dayOfWeekData.map(d => d.checkIns);
    const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const bestDay = dayOfWeekData[bestDayIndex]?.day || 'N/A';

    // Consistency score (last 30 days)
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });
    
    let activeDays = 0;
    last30Days.forEach(day => {
      const hasCheckIn = challenges.some(c => 
        c.checkIns.some(ci => isSameDay(parseISO(ci.date), day))
      );
      if (hasCheckIn) activeDays++;
    });
    const consistencyScore = Math.round((activeDays / 30) * 100);

    return {
      totalCheckIns,
      bestStreak,
      avgProgress,
      currentStreaks,
      bestDay,
      consistencyScore,
    };
  }, [challenges, getBestStreak, getProgress, getStreak, dayOfWeekData]);

  const COLORS = [
    'hsl(24, 95%, 53%)',
    'hsl(168, 76%, 36%)',
    'hsl(38, 92%, 50%)',
    'hsl(280, 80%, 55%)',
    'hsl(340, 75%, 55%)',
    'hsl(200, 70%, 50%)',
    'hsl(120, 60%, 45%)',
    'hsl(45, 90%, 55%)',
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div ref={cardsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <Flame className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{stats.currentStreaks}</p>
            <p className="text-xs text-muted-foreground">Active Streaks</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto text-accent mb-2" />
            <p className="text-2xl font-bold">{stats.bestStreak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto text-secondary mb-2" />
            <p className="text-2xl font-bold">{stats.totalCheckIns}</p>
            <p className="text-xs text-muted-foreground">Total Check-ins</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{stats.avgProgress}%</p>
            <p className="text-xs text-muted-foreground">Avg Progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{stats.bestDay}</p>
            <p className="text-xs text-muted-foreground">Best Day</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats.consistencyScore}%</p>
            <p className="text-xs text-muted-foreground">Consistency</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              Weekly Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorCheckIns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="checkIns" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#colorCheckIns)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Day of Week */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-secondary" />
              Best Days to Check In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dayOfWeekData}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="checkIns" 
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {categoryData.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChartIcon className="w-5 h-5 text-accent" />
                Challenge Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center">
                  {categoryData.map((cat, i) => (
                    <Badge 
                      key={cat.name}
                      variant="outline"
                      className="gap-1"
                      style={{ borderColor: COLORS[i % COLORS.length] }}
                    >
                      {cat.emoji} {cat.name} ({cat.value})
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
