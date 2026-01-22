import { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Challenge } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import {
  Code,
  Flame,
  Clock,
  Target,
  Github,
  ExternalLink,
  Trophy,
  BookOpen,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Calendar,
  TrendingUp,
  Coffee,
} from 'lucide-react';

interface CodeHubProps {
  challenges: Challenge[];
  onNavigateBack?: () => void;
}

// Mock data for demonstration
const MOCK_CODING_PROFILE = {
  bestTimeToCode: '9:00 PM - 11:00 PM',
  bestTimeIcon: '🌙',
  languages: [
    { name: 'TypeScript', percentage: 45, color: 'hsl(var(--primary))' },
    { name: 'Python', percentage: 30, color: 'hsl(168, 76%, 36%)' },
    { name: 'JavaScript', percentage: 15, color: 'hsl(38, 92%, 50%)' },
    { name: 'Go', percentage: 10, color: 'hsl(200, 70%, 50%)' },
  ],
  avgSessionDuration: '1h 45m',
  totalHoursCoded: 156,
};

const MOCK_GITHUB_DATA = {
  username: 'your-username',
  commits: 342,
  pullRequests: 28,
  contributions: 856,
  streak: 12,
  topRepos: [
    { name: '100-days-of-code', stars: 24, language: 'TypeScript' },
    { name: 'react-challenge-app', stars: 12, language: 'JavaScript' },
    { name: 'python-ml-projects', stars: 8, language: 'Python' },
  ],
};

const DAILY_CHALLENGES = [
  {
    id: '1',
    title: 'Build a Custom Hook',
    difficulty: 'Medium',
    category: 'React',
    description: 'Create a useLocalStorage hook that syncs state with browser storage.',
    estimatedTime: '30 min',
    xp: 50,
  },
  {
    id: '2',
    title: 'API Rate Limiter',
    difficulty: 'Hard',
    category: 'Backend',
    description: 'Implement a rate limiting middleware using the token bucket algorithm.',
    estimatedTime: '45 min',
    xp: 75,
  },
  {
    id: '3',
    title: 'CSS Grid Layout',
    difficulty: 'Easy',
    category: 'CSS',
    description: 'Create a responsive dashboard layout using CSS Grid.',
    estimatedTime: '20 min',
    xp: 30,
  },
];

const LEARNING_PATH = [
  { id: 'html', name: 'HTML/CSS', status: 'completed', progress: 100, icon: '🎨' },
  { id: 'js', name: 'JavaScript', status: 'completed', progress: 100, icon: '⚡' },
  { id: 'react', name: 'React', status: 'in-progress', progress: 65, icon: '⚛️' },
  { id: 'backend', name: 'Backend', status: 'locked', progress: 0, icon: '🔧' },
  { id: 'deploy', name: 'Deploy', status: 'locked', progress: 0, icon: '🚀' },
];

export function CodeHub({ challenges, onNavigateBack }: CodeHubProps) {
  const { getStreak, getProgress } = useChallenges();
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Filter coding challenges
  const codingChallenges = useMemo(() => {
    return challenges.filter(c => c.category === 'coding');
  }, [challenges]);

  // Calculate stats from real challenge data
  const stats = useMemo(() => {
    const activeChallenges = codingChallenges.filter(c => c.status === 'active').length;
    const currentStreak = codingChallenges.reduce((max, c) => Math.max(max, getStreak(c)), 0);
    const totalCheckIns = codingChallenges.reduce((sum, c) => sum + c.checkIns.length, 0);
    
    return {
      activeChallenges,
      currentStreak,
      problemsSolved: totalCheckIns > 0 ? totalCheckIns : 47, // Mock if no data
    };
  }, [codingChallenges, getStreak]);

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow">
            <Code className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">Code Hub</h1>
            <p className="text-sm text-muted-foreground">Your coding journey dashboard</p>
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
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-glow transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-primary mb-2" />
            <p className="text-xl sm:text-2xl font-bold">{stats.activeChallenges}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Active Challenges</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 hover:shadow-glow transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-orange-500 mb-2" />
            <p className="text-xl sm:text-2xl font-bold">{stats.currentStreak}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:shadow-glow transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-green-500 mb-2" />
            <p className="text-xl sm:text-2xl font-bold">{stats.problemsSolved}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Problems Solved</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your Coding Profile */}
          <Card className="hover:shadow-card transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coffee className="w-5 h-5 text-primary" />
                Your Coding Profile
              </CardTitle>
              <CardDescription>Insights based on your check-in patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Best Time & Duration Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Best Time to Code</span>
                  </div>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    {MOCK_CODING_PROFILE.bestTimeIcon} {MOCK_CODING_PROFILE.bestTimeToCode}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Avg Session</span>
                  </div>
                  <p className="text-sm font-semibold">{MOCK_CODING_PROFILE.avgSessionDuration}</p>
                </div>
              </div>

              {/* Language Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Most Used Languages</span>
                  <span className="text-xs text-muted-foreground">
                    {MOCK_CODING_PROFILE.totalHoursCoded}h total
                  </span>
                </div>
                <div className="space-y-3">
                  {MOCK_CODING_PROFILE.languages.map((lang) => (
                    <div key={lang.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span>{lang.name}</span>
                        <span className="text-muted-foreground">{lang.percentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${lang.percentage}%`,
                            backgroundColor: lang.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Code Challenge */}
          <Card className="hover:shadow-card transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-yellow-500" />
                Daily Code Challenge
              </CardTitle>
              <CardDescription>Complete challenges to earn XP and level up</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DAILY_CHALLENGES.slice(0, 2).map((challenge, index) => (
                <div 
                  key={challenge.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium text-sm">{challenge.title}</h4>
                        <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {challenge.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {challenge.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {challenge.estimatedTime}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Trophy className="w-3 h-3" />
                          +{challenge.xp} XP
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground">
                      Start <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2">
                View All Challenges
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* GitHub Integration */}
          <Card className="hover:shadow-card transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Github className="w-5 h-5" />
                GitHub Activity
              </CardTitle>
              <CardDescription>Connect to sync your commits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mock GitHub Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-primary">{MOCK_GITHUB_DATA.commits}</p>
                  <p className="text-[10px] text-muted-foreground">Commits</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-green-500">{MOCK_GITHUB_DATA.pullRequests}</p>
                  <p className="text-[10px] text-muted-foreground">Pull Requests</p>
                </div>
              </div>

              {/* Top Repos */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Top Repositories</p>
                <div className="space-y-2">
                  {MOCK_GITHUB_DATA.topRepos.map((repo) => (
                    <div key={repo.name} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <Code className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{repo.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        <span>⭐ {repo.stars}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2">
                <Github className="w-4 h-4" />
                Connect GitHub
                <ExternalLink className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>

          {/* Learning Path Progress */}
          <Card className="hover:shadow-card transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-secondary" />
                Learning Path
              </CardTitle>
              <CardDescription>Your journey to full-stack</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {LEARNING_PATH.map((stage, index) => (
                  <div 
                    key={stage.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      stage.status === 'completed' 
                        ? 'bg-green-500/5 border-green-500/20' 
                        : stage.status === 'in-progress'
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-muted/30 border-border/50 opacity-60'
                    }`}
                  >
                    <div className="text-xl shrink-0">{stage.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{stage.name}</span>
                        {stage.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        ) : stage.status === 'locked' ? (
                          <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <span className="text-xs text-primary shrink-0">{stage.progress}%</span>
                        )}
                      </div>
                      {stage.status === 'in-progress' && (
                        <Progress value={stage.progress} className="h-1.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Next milestone */}
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Next:</span>
                  <span className="font-medium">Complete React Basics</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
