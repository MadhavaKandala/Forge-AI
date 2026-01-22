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
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface FitnessHubProps {
  challenges: Challenge[];
  onNavigateBack?: () => void;
}

// Mock data for demonstration
const MOCK_PERSONAL_RECORDS = [
  { id: 'mile', name: 'Fastest Mile', value: '6:42', unit: 'min', icon: '🏃', day: 45, isRecent: true },
  { id: 'pushups', name: 'Max Pushups', value: '52', unit: 'reps', icon: '💪', day: 38, isRecent: false },
  { id: 'session', name: 'Longest Session', value: '2h 15m', unit: '', icon: '⏱️', day: 67, isRecent: true },
  { id: 'bench', name: 'Max Bench', value: '185', unit: 'lbs', icon: '🏋️', day: 52, isRecent: false },
  { id: 'plank', name: 'Longest Plank', value: '4:30', unit: 'min', icon: '🧘', day: 29, isRecent: false },
  { id: 'squat', name: 'Max Squat', value: '225', unit: 'lbs', icon: '🦵', day: 61, isRecent: true },
];

const MOCK_PROGRESS_PHOTOS = [
  { id: '1', date: 'Day 1', url: '', weight: 185, bodyFat: 22 },
  { id: '2', date: 'Day 30', url: '', weight: 180, bodyFat: 20 },
  { id: '3', date: 'Day 60', url: '', weight: 175, bodyFat: 18 },
  { id: '4', date: 'Day 90', url: '', weight: 172, bodyFat: 16 },
];

const WORKOUT_BREAKDOWN = [
  { name: 'Running', value: 35, hours: 42, color: 'hsl(var(--primary))' },
  { name: 'Strength', value: 30, hours: 36, color: 'hsl(168, 76%, 36%)' },
  { name: 'Yoga', value: 20, hours: 24, color: 'hsl(280, 70%, 50%)' },
  { name: 'Cardio', value: 15, hours: 18, color: 'hsl(38, 92%, 50%)' },
];

const BODY_METRICS = {
  weight: { start: 185, current: 172, goal: 170, unit: 'lbs' },
  bodyFat: { start: 22, current: 16, goal: 15, unit: '%' },
  muscle: { start: 145, current: 152, goal: 155, unit: 'lbs' },
};

const WEEKLY_CONSISTENCY = [
  { day: 'Mon', percentage: 95, workouts: 12 },
  { day: 'Tue', percentage: 75, workouts: 9 },
  { day: 'Wed', percentage: 85, workouts: 10 },
  { day: 'Thu', percentage: 70, workouts: 8 },
  { day: 'Fri', percentage: 90, workouts: 11 },
  { day: 'Sat', percentage: 60, workouts: 7 },
  { day: 'Sun', percentage: 40, workouts: 5 },
];

export function FitnessHub({ challenges, onNavigateBack }: FitnessHubProps) {
  const { getStreak, getProgress } = useChallenges();
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Filter fitness challenges
  const fitnessChallenges = useMemo(() => {
    return challenges.filter(c => c.category === 'fitness');
  }, [challenges]);

  // Calculate stats from real challenge data
  const stats = useMemo(() => {
    const totalCheckIns = fitnessChallenges.reduce((sum, c) => sum + c.checkIns.length, 0);
    let totalDays = 0;
    fitnessChallenges.forEach((c) => {
      const startDate = new Date(c.startDate);
      const now = new Date();
      totalDays += Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    });
    
    return {
      workoutsDone: totalCheckIns > 0 ? totalCheckIns : 67,
      caloriesBurned: totalCheckIns > 0 ? totalCheckIns * 450 : 30150,
      daysMissed: Math.max(0, totalDays - totalCheckIns) || 8,
    };
  }, [fitnessChallenges]);

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
                {MOCK_PERSONAL_RECORDS.map((pr) => (
                  <div 
                    key={pr.id}
                    className={`p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                      pr.isRecent 
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
                    <p className="text-[10px] text-muted-foreground mt-1">Day {pr.day}</p>
                  </div>
                ))}
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
                      <div className="aspect-[3/4] rounded-lg bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center">
                        <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">{MOCK_PROGRESS_PHOTOS[0].date}</p>
                        <p className="text-sm font-medium mt-1">{MOCK_PROGRESS_PHOTOS[0].weight} lbs</p>
                      </div>
                      
                      {/* Current Photo */}
                      <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 flex flex-col items-center justify-center">
                        <Camera className="w-8 h-8 text-primary mb-2" />
                        <p className="text-xs text-muted-foreground">{MOCK_PROGRESS_PHOTOS[photoIndex + 1]?.date || 'Current'}</p>
                        <p className="text-sm font-medium mt-1">{MOCK_PROGRESS_PHOTOS[photoIndex + 1]?.weight || BODY_METRICS.weight.current} lbs</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="shrink-0"
                      onClick={() => setPhotoIndex(Math.min(MOCK_PROGRESS_PHOTOS.length - 2, photoIndex + 1))}
                      disabled={photoIndex >= MOCK_PROGRESS_PHOTOS.length - 2}
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
                      <TrendingDown className="w-3 h-3 text-green-500" />
                      -{BODY_METRICS.weight.start - BODY_METRICS.weight.current} lbs
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Body Fat</p>
                    <p className="font-bold flex items-center justify-center gap-1">
                      <TrendingDown className="w-3 h-3 text-green-500" />
                      -{BODY_METRICS.bodyFat.start - BODY_METRICS.bodyFat.current}%
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Muscle</p>
                    <p className="font-bold flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      +{BODY_METRICS.muscle.current - BODY_METRICS.muscle.start} lbs
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <Camera className="w-4 h-4" />
                  Add Progress Photo
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
                    <span className="text-muted-foreground">{BODY_METRICS.weight.start}</span>
                    <span>→</span>
                    <span className="font-bold text-primary">{BODY_METRICS.weight.current}</span>
                    <span className="text-muted-foreground">/ {BODY_METRICS.weight.goal} {BODY_METRICS.weight.unit}</span>
                  </div>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${((BODY_METRICS.weight.start - BODY_METRICS.weight.current) / (BODY_METRICS.weight.start - BODY_METRICS.weight.goal)) * 100}%` 
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
                    <span className="text-muted-foreground">{BODY_METRICS.bodyFat.start}%</span>
                    <span>→</span>
                    <span className="font-bold text-primary">{BODY_METRICS.bodyFat.current}%</span>
                    <span className="text-muted-foreground">/ {BODY_METRICS.bodyFat.goal}%</span>
                  </div>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${((BODY_METRICS.bodyFat.start - BODY_METRICS.bodyFat.current) / (BODY_METRICS.bodyFat.start - BODY_METRICS.bodyFat.goal)) * 100}%` 
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
                    <span className="text-muted-foreground">{BODY_METRICS.muscle.start}</span>
                    <span>→</span>
                    <span className="font-bold text-primary">{BODY_METRICS.muscle.current}</span>
                    <span className="text-muted-foreground">/ {BODY_METRICS.muscle.goal} {BODY_METRICS.muscle.unit}</span>
                  </div>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${((BODY_METRICS.muscle.current - BODY_METRICS.muscle.start) / (BODY_METRICS.muscle.goal - BODY_METRICS.muscle.start)) * 100}%` 
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
                    data={WORKOUT_BREAKDOWN}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {WORKOUT_BREAKDOWN.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {WORKOUT_BREAKDOWN.map((workout) => (
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
                {WEEKLY_CONSISTENCY.map((day) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-medium text-muted-foreground">{day.day}</span>
                    <div className="flex-1 h-6 rounded-full bg-muted/50 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          day.percentage >= 80 ? 'bg-green-500' :
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
                Best days: <span className="text-primary font-medium">Monday & Friday</span>
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
    </div>
  );
}
