import { useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Challenge } from '@/types/challenge';
import { GlassCard } from '@/components/dashboard/GlassCard';
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
  Sparkles,
} from 'lucide-react';
import { parseISO, getDay, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

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
      .sort((a, b) => b.localeCompare(a));
    
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

  const metricCards = [
    {
      label: 'Burnout Risk',
      value: insights.burnoutRisk,
      icon: AlertTriangle,
      color: insights.burnoutRisk === 'High' ? 'text-red-500' :
             insights.burnoutRisk === 'Medium' ? 'text-yellow-500' : 'text-green-500',
      bgColor: insights.burnoutRisk === 'High' ? 'from-red-500/20 to-red-500/5' :
               insights.burnoutRisk === 'Medium' ? 'from-yellow-500/20 to-yellow-500/5' : 'from-green-500/20 to-green-500/5',
      glow: insights.burnoutRisk === 'High',
    },
    {
      label: 'Productivity Index',
      value: insights.productivityIndex,
      icon: Zap,
      color: 'text-primary',
      bgColor: 'from-primary/20 to-primary/5',
      glow: true,
    },
    {
      label: '30-Day Consistency',
      value: `${insights.consistencyScore}%`,
      icon: Target,
      color: 'text-secondary',
      bgColor: 'from-secondary/20 to-secondary/5',
      glow: false,
    },
    {
      label: 'Best Day',
      value: insights.bestDay,
      icon: Calendar,
      color: 'text-muted-foreground',
      bgColor: 'from-muted to-muted/50',
      glow: false,
    },
  ];

  return (
    <div ref={cardsRef} className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.label}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <GlassCard 
              className={`bg-gradient-to-br ${metric.bgColor} ${metric.glow ? 'shadow-glow' : ''}`}
              padding="sm"
            >
              <div className="text-center">
                <metric.icon className={`w-5 h-5 mx-auto mb-2 ${metric.color}`} />
                <p className="text-lg font-bold font-display">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Weekly Trend Chart */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Weekly Activity Trend</h3>
            <p className="text-sm text-muted-foreground">Last 6 weeks performance</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={insights.weeklyTrend}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(var(--primary))" 
              fill="url(#colorCount)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Day of Week Distribution */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold">Check-ins by Day of Week</h3>
            <p className="text-sm text-muted-foreground">Find your most productive days</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={insights.dayData}>
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--secondary))"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Code-Specific Insights */}
      {isCodeChallenge && (
        <>
          {/* Language Breakdown */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">Language Distribution</h3>
                <p className="text-sm text-muted-foreground">Hours spent per language (mock data)</p>
              </div>
            </div>
            
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
              <div className="space-y-3 w-full md:w-auto">
                {MOCK_CODE_INSIGHTS.languages.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: lang.color }}
                    />
                    <span className="text-sm flex-1">{lang.name}</span>
                    <Badge variant="outline" className="glass text-xs">
                      {lang.hours}h
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Problem Difficulty */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Problem Difficulty Distribution</h3>
                <p className="text-sm text-muted-foreground">Breakdown of completed challenges (mock data)</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {MOCK_CODE_INSIGHTS.difficulties.map((diff) => {
                const total = MOCK_CODE_INSIGHTS.difficulties.reduce((sum, d) => sum + d.count, 0);
                const percentage = Math.round((diff.count / total) * 100);
                return (
                  <div key={diff.name} className="space-y-2">
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
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ backgroundColor: diff.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Weekly Hours */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Weekly Coding Hours</h3>
                <p className="text-sm text-muted-foreground">Time invested per week</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={MOCK_CODE_INSIGHTS.weeklyHours}>
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                  formatter={(value) => [`${value} hours`, 'Coding Time']}
                />
                <Bar 
                  dataKey="hours" 
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </>
      )}

      {/* Insights Summary */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="relative flex items-start gap-4">
          <motion.div 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              AI Insights
              <Badge className="bg-primary/20 text-primary border-0 text-xs">Beta</Badge>
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insights.burnoutRisk === 'High' 
                ? "Your recent activity has dropped. Consider taking smaller steps or adjusting your goals to maintain momentum. Remember, consistency matters more than intensity."
                : insights.consistencyScore >= 80
                ? "Excellent consistency! You're building strong habits that will last. Your dedication is paying off—keep up the amazing work! 🎉"
                : `You're most productive on ${insights.bestDay}s. Consider scheduling your most important work on those days to maximize your progress.`
              }
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
