import { useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Challenge, ChallengeCategory } from '@/types/challenge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  AreaChart,
  Area,
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  Clock,
  Calendar,
  Target,
  Flame,
  Brain,
} from 'lucide-react';
import { format, parseISO, getDay, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

interface ChallengeDetailInsightsProps {
  challenge: Challenge;
}

// Mock data for code-specific insights
const MOCK_CODE_INSIGHTS = {
  languages: [
    { name: 'TypeScript', hours: 45, color: '#3178c6' },
    { name: 'Python', hours: 30, color: '#3776ab' },
    { name: 'JavaScript', hours: 15, color: '#f7df1e' },
    { name: 'Go', hours: 10, color: '#00add8' },
  ],
  difficulties: [
    { name: 'Easy', count: 25, color: 'hsl(142, 76%, 36%)' },
    { name: 'Medium', count: 18, color: 'hsl(38, 92%, 50%)' },
    { name: 'Hard', count: 7, color: 'hsl(0, 84%, 60%)' },
  ],
  weeklyHours: [
    { week: 'W1', hours: 12 },
    { week: 'W2', hours: 15 },
    { week: 'W3', hours: 10 },
    { week: 'W4', hours: 18 },
    { week: 'W5', hours: 14 },
    { week: 'W6', hours: 20 },
  ],
};

export function ChallengeDetailInsights({ challenge }: ChallengeDetailInsightsProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const isCodeChallenge = challenge.category === 'coding';

  // Calculate real insights from check-in data
  const insights = useMemo(() => {
    const checkIns = challenge.checkIns;
    const today = new Date();
    const last30Days = eachDayOfInterval({
      start: subDays(today, 29),
      end: today,
    });

    // Day of week distribution
    const dayDistribution = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    checkIns.forEach(ci => {
      const dayIndex = getDay(parseISO(ci.date));
      dayDistribution[dayIndex]++;
    });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayData = dayNames.map((name, i) => ({ day: name, count: dayDistribution[i] }));
    const bestDayIndex = dayDistribution.indexOf(Math.max(...dayDistribution));
    const bestDay = dayNames[bestDayIndex];

    // Consistency score (last 30 days)
    let activeDays = 0;
    last30Days.forEach(day => {
      const hasCheckIn = checkIns.some(ci => isSameDay(parseISO(ci.date), day));
      if (hasCheckIn) activeDays++;
    });
    const consistencyScore = Math.round((activeDays / 30) * 100);

    // Burnout risk calculation
    const last7CheckIns = checkIns.slice(-7);
    const recentConsistency = last7CheckIns.length / 7;
    const burnoutRisk = recentConsistency < 0.5 ? 'High' : recentConsistency < 0.7 ? 'Medium' : 'Low';

    // Productivity index (based on streak and consistency)
    const currentStreak = checkIns.length > 0 ? 
      calculateCurrentStreak(checkIns) : 0;
    const productivityIndex = Math.min(100, Math.round(
      (consistencyScore * 0.4) + (currentStreak * 2) + (checkIns.length * 0.3)
    ));

    // Weekly trend
    const weeklyTrend: { week: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const weekStart = subDays(today, (i + 1) * 7);
      const weekEnd = subDays(today, i * 7);
      const weekCheckIns = checkIns.filter(ci => {
        const date = parseISO(ci.date);
        return date >= weekStart && date <= weekEnd;
      }).length;
      weeklyTrend.push({ week: `W${6-i}`, count: weekCheckIns });
    }

    return {
      dayData,
      bestDay,
      consistencyScore,
      burnoutRisk,
      productivityIndex,
      weeklyTrend,
      totalDays: checkIns.length,
      avgPerWeek: Math.round(checkIns.length / Math.max(1, Math.ceil(checkIns.length / 7))),
    };
  }, [challenge.checkIns]);

  function calculateCurrentStreak(checkIns: typeof challenge.checkIns): number {
    if (checkIns.length === 0) return 0;
    const sortedDates = [...checkIns]
      .map(ci => ci.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;
    
    let streak = 1;
    let currentDate = new Date(sortedDates[0]);
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      
      if (sortedDates[i] === prevDateStr) {
        streak++;
        currentDate = new Date(sortedDates[i]);
      } else {
        break;
      }
    }
    return streak;
  }

  useEffect(() => {
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div ref={cardsRef} className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className={insights.burnoutRisk === 'High' ? 'border-red-500/50' : ''}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className={`w-5 h-5 mx-auto mb-2 ${
              insights.burnoutRisk === 'High' ? 'text-red-500' :
              insights.burnoutRisk === 'Medium' ? 'text-yellow-500' : 'text-green-500'
            }`} />
            <p className="text-lg font-bold">{insights.burnoutRisk}</p>
            <p className="text-xs text-muted-foreground">Burnout Risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-lg font-bold">{insights.productivityIndex}</p>
            <p className="text-xs text-muted-foreground">Productivity Index</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-5 h-5 mx-auto mb-2 text-secondary" />
            <p className="text-lg font-bold">{insights.consistencyScore}%</p>
            <p className="text-xs text-muted-foreground">30-Day Consistency</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-lg font-bold">{insights.bestDay}</p>
            <p className="text-xs text-muted-foreground">Best Day</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Weekly Activity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={insights.weeklyTrend}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                fill="url(#colorCount)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Day of Week Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-secondary" />
            Check-ins by Day of Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={insights.dayData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--secondary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Code-Specific Insights */}
      {isCodeChallenge && (
        <>
          {/* Language Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="w-5 h-5 text-purple-500" />
                Language Distribution
              </CardTitle>
              <CardDescription>Hours spent per language (mock data)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={MOCK_CODE_INSIGHTS.languages}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="hours"
                    >
                      {MOCK_CODE_INSIGHTS.languages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 w-full md:w-auto">
                  {MOCK_CODE_INSIGHTS.languages.map((lang) => (
                    <div key={lang.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className="text-sm flex-1">{lang.name}</span>
                      <span className="text-sm text-muted-foreground">{lang.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Problem Difficulty */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Problem Difficulty Distribution</CardTitle>
              <CardDescription>Breakdown of completed challenges (mock data)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_CODE_INSIGHTS.difficulties.map((diff) => {
                  const total = MOCK_CODE_INSIGHTS.difficulties.reduce((sum, d) => sum + d.count, 0);
                  const percentage = Math.round((diff.count / total) * 100);
                  return (
                    <div key={diff.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: diff.color }}
                          />
                          {diff.name}
                        </span>
                        <span className="text-muted-foreground">
                          {diff.count} ({percentage}%)
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                        style={{ 
                          ['--progress-background' as string]: diff.color 
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Hours Heatmap */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary" />
                Weekly Coding Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={MOCK_CODE_INSIGHTS.weeklyHours}>
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value} hours`, 'Coding Time']}
                  />
                  <Bar 
                    dataKey="hours" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Insights Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium mb-1">AI Insights</h4>
              <p className="text-sm text-muted-foreground">
                {insights.burnoutRisk === 'High' 
                  ? "Your recent activity has dropped. Consider taking smaller steps or adjusting your goals to maintain momentum."
                  : insights.consistencyScore >= 80
                  ? "Excellent consistency! You're building strong habits. Keep up the great work!"
                  : `You're most productive on ${insights.bestDay}s. Consider scheduling your most important work on those days.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
