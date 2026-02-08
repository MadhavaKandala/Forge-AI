import { useEffect, useRef, useMemo, useState } from 'react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Challenge } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import {
  Dumbbell,
  Flame,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Camera,
  Heart,
  Timer,
  Zap,
  Award,
  ChevronLeft,
  ChevronRight,
  Scale,
  Footprints,
  Activity,
  Plus, // Add Plus icon
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { FitnessRecord, BodyMetric } from '@/types/challenge';

interface FitnessHubProps {
  challenges: Challenge[];
  onNavigateBack?: () => void;
}

export function FitnessHub({ challenges, onNavigateBack }: FitnessHubProps) {
  const { getStreak, getProgress, userProfile, updateUserProfile } = useChallenges();
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [metricsDialogOpen, setMetricsDialogOpen] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);

  // Local state for editing
  const [editMetrics, setEditMetrics] = useState(userProfile.fitness.metrics);
  const [newRecord, setNewRecord] = useState<Partial<FitnessRecord>>({ name: '', value: '', unit: '', icon: '🏆' });

  // Filter fitness challenges
  const fitnessChallenges = useMemo(() => {
    return challenges.filter(c => c.category === 'fitness');
  }, [challenges]);

  // Calculate stats from real challenge data
  const stats = useMemo(() => {
    const totalCheckIns = fitnessChallenges.reduce((sum, c) => sum + c.checkIns.length, 0);
    let totalDays = 0;

    // Calculate total possible check-in days since start of each challenge
    fitnessChallenges.forEach((c) => {
      const startDate = new Date(c.startDate);
      const now = new Date();
      // Difference in days
      const days = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      totalDays += days;
    });

    return {
      workoutsDone: totalCheckIns,
      // Rough estimate: 300 calories per workout on average
      caloriesBurned: totalCheckIns * 300,
      daysMissed: Math.max(0, totalDays - totalCheckIns),
    };
  }, [fitnessChallenges]);

  // Calculate weekly consistency from real data
  const weeklyConsistency = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);
    let totalWorkouts = 0;

    fitnessChallenges.forEach(c => {
      c.checkIns.forEach(ci => {
        const date = parseISO(ci.date);
        counts[date.getDay()]++;
        totalWorkouts++;
      });
    });

    const maxCount = Math.max(...counts, 1); // Avoid division by zero

    return days.map((day, i) => ({
      day,
      workouts: counts[i],
      percentage: totalWorkouts > 0 ? Math.round((counts[i] / maxCount) * 100) : 0
    }));
  }, [fitnessChallenges]);

  // Calculate workout breakdown based on challenge names/descriptions
  const workoutBreakdown = useMemo(() => {
    const categories: Record<string, { value: number, hours: number, color: string }> = {
      'Running': { value: 0, hours: 0, color: 'hsl(var(--primary))' },
      'Strength': { value: 0, hours: 0, color: 'hsl(168, 76%, 36%)' },
      'Yoga': { value: 0, hours: 0, color: 'hsl(280, 70%, 50%)' },
      'Cardio': { value: 0, hours: 0, color: 'hsl(38, 92%, 50%)' },
    };

    fitnessChallenges.forEach(c => {
      const name = c.name.toLowerCase();
      let type = 'Cardio'; // Default
      if (name.includes('run') || name.includes('jog')) type = 'Running';
      else if (name.includes('lift') || name.includes('strength') || name.includes('pushup')) type = 'Strength';
      else if (name.includes('yoga') || name.includes('stretch')) type = 'Yoga';

      // Each check-in is roughly 1 hour for estimation
      categories[type].value += c.checkIns.length;
      categories[type].hours += c.checkIns.length;
    });

    return Object.entries(categories)
      .filter(([_, data]) => data.value > 0)
      .map(([name, data]) => ({ name, ...data }));
  }, [fitnessChallenges]);

  const handleMetricsSave = () => {
    updateUserProfile({
      fitness: {
        ...userProfile.fitness,
        metrics: editMetrics
      }
    });
    setMetricsDialogOpen(false);
  };

  const handleRecordSave = () => {
    if (!newRecord.name || !newRecord.value) return;

    const record: FitnessRecord = {
      id: crypto.randomUUID(),
      name: newRecord.name,
      value: newRecord.value,
      unit: newRecord.unit || '',
      icon: newRecord.icon || '🏆',
      date: new Date().toISOString(),
      isRecent: true
    };

    updateUserProfile({
      fitness: {
        ...userProfile.fitness,
        records: [...userProfile.fitness.records, record]
      }
    });
    setNewRecord({ name: '', value: '', unit: '', icon: '🏆' });
    setRecordDialogOpen(false);
  };

  // GSAP entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }

    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.children,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.2)',
          delay: 0.2
        }
      );
    }
  }, []);

  const getMetricChange = (start: number, current: number) => {
    const change = current - start;
    return {
      value: Math.abs(change),
      isPositive: change > 0,
      isNegative: change < 0,
    };
  };

  const chartConfig = {
    running: { label: 'Running', color: 'hsl(var(--primary))' },
    strength: { label: 'Strength', color: 'hsl(168, 76%, 36%)' },
    yoga: { label: 'Yoga', color: 'hsl(280, 70%, 50%)' },
    cardio: { label: 'Cardio', color: 'hsl(38, 92%, 50%)' },
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">Fitness Hub</h1>
            <p className="text-sm text-muted-foreground">Your fitness journey dashboard</p>
          </div>
        </div>
        {onNavigateBack && (
          <Button variant="outline" onClick={onNavigateBack} className="w-full sm:w-auto">
            ← Back to Challenges
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div ref={statsRef} className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-green-500 mb-2" />
            <p className="text-xl sm:text-2xl font-bold">{stats.workoutsDone}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Workouts Done</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-orange-500 mb-2" />
            <p className="text-xl sm:text-2xl font-bold">{(stats.caloriesBurned / 1000).toFixed(1)}k</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Calories Burned</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-red-500 mb-2" />
            <p className="text-xl sm:text-2xl font-bold">{stats.daysMissed}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Days Missed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Records */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Personal Records
              </CardTitle>
              <CardDescription>Your all-time bests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {userProfile.fitness.records.length > 0 ? (
                  userProfile.fitness.records.map((pr) => (
                    <div
                      key={pr.id}
                      className={`p-3 rounded-lg border transition-all hover:scale-[1.02] ${pr.isRecent
                          ? 'bg-yellow-500/5 border-yellow-500/30 ring-1 ring-yellow-500/20'
                          : 'bg-muted/50 border-border/50'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{pr.icon}</span>
                        {pr.isRecent && (
                          <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                            NEW PR!
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg font-bold">
                        {pr.value}
                        {pr.unit && <span className="text-xs text-muted-foreground ml-1">{pr.unit}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{pr.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(parseISO(pr.date), 'MMM d')}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                    No personal records yet.
                  </div>
                )}

                {/* Add Record Button */}
                <div
                  className="p-3 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[100px]"
                  onClick={() => setRecordDialogOpen(true)}
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">Add Record</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Photos */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Camera className="w-5 h-5 text-purple-500" />
                Progress Photos
              </CardTitle>
              <CardDescription>Visual transformation journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Photo Slider */}
                <div className="relative">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => setPhotoIndex(Math.max(0, photoIndex - 1))}
                      disabled={photoIndex === 0}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                      {/* Before Photo */}
                      <div className="aspect-[3/4] rounded-lg bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden group">
                        <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">Start</p>
                        <p className="text-sm font-medium mt-1">{userProfile.fitness.metrics.weight.start > 0 ? `${userProfile.fitness.metrics.weight.start} lbs` : 'No data'}</p>
                      </div>

                      {/* Current/Latest Photo - Placeholder for now as we don't have real photo upload yet */}
                      <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 flex flex-col items-center justify-center">
                        <Camera className="w-8 h-8 text-primary mb-2" />
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="text-sm font-medium mt-1">{userProfile.fitness.metrics.weight.current > 0 ? `${userProfile.fitness.metrics.weight.current} lbs` : 'No data'}</p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      disabled
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Metrics Change */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="font-bold flex items-center justify-center gap-1">
                      {userProfile.fitness.metrics.weight.current < userProfile.fitness.metrics.weight.start ? <TrendingDown className="w-3 h-3 text-green-500" /> : <TrendingUp className="w-3 h-3 text-red-500" />}
                      {Math.abs(userProfile.fitness.metrics.weight.start - userProfile.fitness.metrics.weight.current)} lbs
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Body Fat</p>
                    <p className="font-bold flex items-center justify-center gap-1">
                      {userProfile.fitness.metrics.bodyFat.current < userProfile.fitness.metrics.bodyFat.start ? <TrendingDown className="w-3 h-3 text-green-500" /> : <TrendingUp className="w-3 h-3 text-red-500" />}
                      {Math.abs(userProfile.fitness.metrics.bodyFat.start - userProfile.fitness.metrics.bodyFat.current)}%
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Muscle</p>
                    <p className="font-bold flex items-center justify-center gap-1">
                      {userProfile.fitness.metrics.muscle.current > userProfile.fitness.metrics.muscle.start ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-muted-foreground" />}
                      {Math.abs(userProfile.fitness.metrics.muscle.current - userProfile.fitness.metrics.muscle.start)} lbs
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2" onClick={() => setMetricsDialogOpen(true)}>
                  <Scale className="w-4 h-4" />
                  Update Body Metrics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Body Metrics Trend */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-blue-500" />
                Body Metrics Trend
              </CardTitle>
              <CardDescription>Track your transformation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Weight */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Weight</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{userProfile.fitness.metrics.weight.start}</span>
                    <span>→</span>
                    <span className="font-bold text-primary">{userProfile.fitness.metrics.weight.current}</span>
                    <span className="text-muted-foreground">/ {userProfile.fitness.metrics.weight.goal} {userProfile.fitness.metrics.weight.unit}</span>
                  </div>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((userProfile.fitness.metrics.weight.start - userProfile.fitness.metrics.weight.current) / (userProfile.fitness.metrics.weight.start - userProfile.fitness.metrics.weight.goal || 1)) * 100))}%`
                    }}
                  />
                </div>
              </div>

              {/* Body Fat */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Body Fat</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{userProfile.fitness.metrics.bodyFat.start}%</span>
                    <span>→</span>
                    <span className="font-bold text-primary">{userProfile.fitness.metrics.bodyFat.current}%</span>
                    <span className="text-muted-foreground">/ {userProfile.fitness.metrics.bodyFat.goal}%</span>
                  </div>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((userProfile.fitness.metrics.bodyFat.start - userProfile.fitness.metrics.bodyFat.current) / (userProfile.fitness.metrics.bodyFat.start - userProfile.fitness.metrics.bodyFat.goal || 1)) * 100))}%`
                    }}
                  />
                </div>
              </div>

              {/* Muscle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Muscle Mass</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{userProfile.fitness.metrics.muscle.start}</span>
                    <span>→</span>
                    <span className="font-bold text-primary">{userProfile.fitness.metrics.muscle.current}</span>
                    <span className="text-muted-foreground">/ {userProfile.fitness.metrics.muscle.goal} {userProfile.fitness.metrics.muscle.unit}</span>
                  </div>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((userProfile.fitness.metrics.muscle.current - userProfile.fitness.metrics.muscle.start) / (userProfile.fitness.metrics.muscle.goal - userProfile.fitness.metrics.muscle.start || 1)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Workout Breakdown */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-yellow-500" />
                Workout Breakdown
              </CardTitle>
              <CardDescription>Activity distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[180px] w-full">
                <PieChart>
                  <Pie
                    data={workoutBreakdown.length > 0 ? workoutBreakdown : [{ name: 'No Data', value: 1, color: 'hsl(var(--muted))' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(workoutBreakdown.length > 0 ? workoutBreakdown : [{ name: 'No Data', value: 1, color: 'hsl(var(--muted))' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>

              <div className="grid grid-cols-2 gap-2 mt-4">
                {workoutBreakdown.map((workout) => (
                  <div key={workout.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: workout.color }}
                    />
                    <span className="truncate">{workout.name}</span>
                    <span className="text-muted-foreground ml-auto">{workout.hours}h</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Most Consistent Days */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-green-500" />
                Consistency By Day
              </CardTitle>
              <CardDescription>Best workout days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weeklyConsistency.map((day) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-medium text-muted-foreground">{day.day}</span>
                    <div className="flex-1 h-6 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${day.percentage >= 80 ? 'bg-green-500' :
                            day.percentage >= 60 ? 'bg-yellow-500' :
                              'bg-red-500/70'
                          }`}
                        style={{ width: `${day.percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-xs text-right text-muted-foreground">{day.percentage}%</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Sync your workouts to see consistency
              </p>
            </CardContent>
          </Card>

          {/* Your Fitness Challenges */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="w-5 h-5 text-primary" />
                Your Challenges
              </CardTitle>
              <CardDescription>Active fitness goals</CardDescription>
            </CardHeader>
            <CardContent>
              {fitnessChallenges.length > 0 ? (
                <div className="space-y-3">
                  {fitnessChallenges.slice(0, 3).map((challenge) => {
                    const progress = getProgress(challenge) * 100;
                    const streak = getStreak(challenge);
                    return (
                      <div
                        key={challenge.id}
                        className="p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium truncate">{challenge.name}</span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            🔥 {streak}
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Day {challenge.checkIns.length} of 100
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Dumbbell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No active fitness challenges</p>
                  <Button variant="outline" size="sm">
                    Start One Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Metrics Dialog */}
      <Dialog open={metricsDialogOpen} onOpenChange={setMetricsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Body Metrics</DialogTitle>
            <DialogDescription>Track your physical progress</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium text-muted-foreground mb-1">
              <div>Start</div>
              <div>Current</div>
              <div>Goal</div>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label>Weight ({editMetrics.weight.unit})</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={editMetrics.weight.start}
                  onChange={(e) => setEditMetrics({ ...editMetrics, weight: { ...editMetrics.weight, start: parseFloat(e.target.value) } })}
                />
                <Input
                  type="number"
                  value={editMetrics.weight.current}
                  onChange={(e) => setEditMetrics({ ...editMetrics, weight: { ...editMetrics.weight, current: parseFloat(e.target.value) } })}
                />
                <Input
                  type="number"
                  value={editMetrics.weight.goal}
                  onChange={(e) => setEditMetrics({ ...editMetrics, weight: { ...editMetrics.weight, goal: parseFloat(e.target.value) } })}
                />
              </div>
            </div>

            {/* Body Fat */}
            <div className="space-y-2">
              <Label>Body Fat (%)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={editMetrics.bodyFat.start}
                  onChange={(e) => setEditMetrics({ ...editMetrics, bodyFat: { ...editMetrics.bodyFat, start: parseFloat(e.target.value) } })}
                />
                <Input
                  type="number"
                  value={editMetrics.bodyFat.current}
                  onChange={(e) => setEditMetrics({ ...editMetrics, bodyFat: { ...editMetrics.bodyFat, current: parseFloat(e.target.value) } })}
                />
                <Input
                  type="number"
                  value={editMetrics.bodyFat.goal}
                  onChange={(e) => setEditMetrics({ ...editMetrics, bodyFat: { ...editMetrics.bodyFat, goal: parseFloat(e.target.value) } })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMetricsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMetricsSave}>Save Updates</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Record Dialog */}
      <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Add Personal Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Record Name</Label>
              <Input
                placeholder="e.g. Max Bench Press"
                value={newRecord.name}
                onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  placeholder="e.g. 225"
                  value={newRecord.value}
                  onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  placeholder="e.g. lbs"
                  value={newRecord.unit}
                  onChange={(e) => setNewRecord({ ...newRecord, unit: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Icon Emoji</Label>
              <Input
                placeholder="🏆"
                value={newRecord.icon}
                onChange={(e) => setNewRecord({ ...newRecord, icon: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleRecordSave} disabled={!newRecord.name || !newRecord.value}>Add PR</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
