import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Challenge, CATEGORY_CONFIG } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ProgressRing } from '@/components/ProgressRing';
import { ChallengeDetailToday } from './ChallengeDetailToday';
import { ChallengeDetailProgress } from './ChallengeDetailProgress';
import { ChallengeDetailEvidence } from './ChallengeDetailEvidence';
import { ChallengeDetailInsights } from './ChallengeDetailInsights';
import { ChallengeDetailCommunity } from './ChallengeDetailCommunity';
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  Image, 
  BarChart3, 
  Users,
  Flame,
  Target,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

interface ChallengeDetailPageProps {
  challenge: Challenge;
  onBack: () => void;
  onCheckIn: (notes?: string, link?: string) => void;
}

export function ChallengeDetailPage({ challenge, onBack, onCheckIn }: ChallengeDetailPageProps) {
  const [activeTab, setActiveTab] = useState('today');
  const { getStreak, getBestStreak, getProgress, hasCheckedInToday, getDaysRemaining } = useChallenges();
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const streak = getStreak(challenge);
  const bestStreak = getBestStreak(challenge);
  const progress = getProgress(challenge);
  const checkedIn = hasCheckedInToday(challenge.id);
  const daysRemaining = getDaysRemaining(challenge);
  const categoryConfig = CATEGORY_CONFIG[challenge.category];

  // GSAP entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, []);

  const tabs = [
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'evidence', label: 'Evidence', icon: Image },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'community', label: 'Community', icon: Users },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div ref={headerRef} className="container max-w-4xl mx-auto px-4 py-4">
          {/* Back button & Category */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <CategoryBadge category={challenge.category} />
          </div>

          {/* Challenge Title & Quick Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Progress Ring */}
            <div className="shrink-0 hidden sm:block">
              <ProgressRing progress={progress} size={80} strokeWidth={6}>
                <span className="text-lg font-bold">{progress}%</span>
              </ProgressRing>
            </div>

            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{categoryConfig.emoji}</span>
                <h1 className="text-xl sm:text-2xl font-display font-bold truncate">
                  {challenge.name}
                </h1>
              </div>
              {challenge.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {challenge.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Started {format(new Date(challenge.startDate), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {daysRemaining} days left
                </span>
              </div>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Flame className="w-4 h-4" />
                <span>{streak} streak</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                <Target className="w-4 h-4" />
                <span>Day {challenge.checkIns.length}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tab List */}
          <TabsList className="hidden sm:grid w-full grid-cols-5 h-12">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Mobile Tab List */}
          <div className="sm:hidden overflow-x-auto -mx-4 px-4">
            <TabsList className="inline-flex w-auto h-10 p-1">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="flex items-center gap-1.5 px-3"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-xs">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="today" className="mt-0">
            <ChallengeDetailToday 
              challenge={challenge}
              streak={streak}
              bestStreak={bestStreak}
              progress={progress}
              checkedIn={checkedIn}
              onCheckIn={onCheckIn}
            />
          </TabsContent>

          <TabsContent value="progress" className="mt-0">
            <ChallengeDetailProgress challenge={challenge} />
          </TabsContent>

          <TabsContent value="evidence" className="mt-0">
            <ChallengeDetailEvidence challenge={challenge} />
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <ChallengeDetailInsights challenge={challenge} />
          </TabsContent>

          <TabsContent value="community" className="mt-0">
            <ChallengeDetailCommunity challenge={challenge} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
