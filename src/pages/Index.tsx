import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { useChallenges } from '@/hooks/useChallenges';
import { Challenge, ACHIEVEMENTS, CATEGORY_CONFIG } from '@/types/challenge';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { CreateChallengeDialog } from '@/components/CreateChallengeDialog';
import { CategorySpecificCheckIn } from '@/components/CheckIn';
import { ChallengeDetails } from '@/components/ChallengeDetails';
import { QuoteCard } from '@/components/QuoteCard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { Leaderboard } from '@/components/Leaderboard';
import { SmartInsights } from '@/components/SmartInsights';
import { ProfileCard } from '@/components/ProfileCard';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { ChallengeSummary } from '@/components/ChallengeSummary';
import { MobileNavigation } from '@/components/MobileNavigation';
import { InstallPrompt } from '@/components/InstallPrompt';
import { CodeHub } from '@/components/Hubs/CodeHub';
import { FitnessHub } from '@/components/Hubs/FitnessHub';
import { ChallengeDetailPage } from '@/components/ChallengeDetail';

// New dashboard components
import { 
  TodayHero, 
  GlassCard, 
  GlowingStatCard, 
  ChallengeListCard, 
  FloatingCTA 
} from '@/components/dashboard';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  Trophy, 
  BarChart3, 
  User, 
  Settings, 
  Calendar, 
  Code, 
  Dumbbell,
  Plus,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const Index = () => {
  const {
    challenges,
    activeChallenges,
    completedChallenges,
    isLoaded,
    createChallenge,
    deleteChallenge,
    checkIn,
    updateChallenge,
    hasCheckedInToday,
    getStreak,
    getProgress,
    getBestStreak,
  } = useChallenges();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<typeof ACHIEVEMENTS[number] | null>(null);
  const [activeTab, setActiveTab] = useState('today');
  const [viewingChallengeDetail, setViewingChallengeDetail] = useState<Challenge | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const totalChallenges = activeChallenges.length + completedChallenges.length;

  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    const active = activeChallenges;
    const pendingToday = active.filter(c => !hasCheckedInToday(c.id));
    const doneToday = active.filter(c => hasCheckedInToday(c.id));
    const urgentChallenges = pendingToday.filter(c => getStreak(c) >= 7);
    
    const bestStreak = Math.max(...challenges.map(c => getBestStreak(c)), 0);
    const totalCheckIns = challenges.reduce((sum, c) => sum + c.checkIns.length, 0);
    const avgProgress = challenges.length > 0
      ? Math.round(challenges.reduce((sum, c) => sum + getProgress(c), 0) / challenges.length)
      : 0;

    return {
      active: active.length,
      pendingToday: pendingToday.length,
      doneToday: doneToday.length,
      urgentChallenges,
      bestStreak,
      totalCheckIns,
      avgProgress,
      allDoneToday: pendingToday.length === 0 && active.length > 0,
    };
  }, [challenges, activeChallenges, hasCheckedInToday, getStreak, getBestStreak, getProgress]);

  // GSAP entrance animation
  useEffect(() => {
    if (isLoaded && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [isLoaded]);

  const handleViewDetails = (challenge: Challenge) => {
    setViewingChallengeDetail(challenge);
  };

  const handleDetailPageCheckIn = (notes?: string, link?: string) => {
    if (viewingChallengeDetail) {
      const newDayCount = viewingChallengeDetail.checkIns.length + 1;
      const milestone = ACHIEVEMENTS.find(a => a.day === newDayCount);
      
      if (milestone) {
        setUnlockedAchievement(milestone);
        setTimeout(() => setCelebrationOpen(true), 500);
      }

      if (newDayCount === 100) {
        updateChallenge(viewingChallengeDetail.id, { status: 'completed' });
        setTimeout(() => {
          setSelectedChallenge({ ...viewingChallengeDetail, checkIns: [...viewingChallengeDetail.checkIns, { id: '', date: '', createdAt: '' }] });
          setSummaryOpen(true);
        }, 1500);
      }
      
      checkIn(viewingChallengeDetail.id, notes, link);
      const updatedChallenge = challenges.find(c => c.id === viewingChallengeDetail.id);
      if (updatedChallenge) {
        setViewingChallengeDetail(updatedChallenge);
      }
    }
  };

  const handleCheckInClick = (challengeId: string) => {
    const challenge = activeChallenges.find(c => c.id === challengeId);
    if (challenge) {
      setSelectedChallenge(challenge);
      setCheckInDialogOpen(true);
    }
  };

  const handleCheckIn = (notes?: string, link?: string) => {
    if (selectedChallenge) {
      const newDayCount = selectedChallenge.checkIns.length + 1;
      const milestone = ACHIEVEMENTS.find(a => a.day === newDayCount);
      
      if (milestone) {
        setUnlockedAchievement(milestone);
        setTimeout(() => setCelebrationOpen(true), 500);
      }

      if (newDayCount === 100) {
        updateChallenge(selectedChallenge.id, { status: 'completed' });
        setTimeout(() => {
          setSelectedChallenge({ ...selectedChallenge, checkIns: [...selectedChallenge.checkIns, { id: '', date: '', createdAt: '' }] });
          setSummaryOpen(true);
        }, 1500);
      }
      
      checkIn(selectedChallenge.id, notes, link);
    }
  };

  const handleCreate = (data: Parameters<typeof createChallenge>[0]) => {
    createChallenge(data);
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-flame flex items-center justify-center shadow-glow animate-pulse">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-gradient-flame opacity-40 blur-xl animate-glow-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">Loading your challenges...</p>
        </div>
      </div>
    );
  }

  // Challenge detail page view
  if (viewingChallengeDetail) {
    const latestChallenge = challenges.find(c => c.id === viewingChallengeDetail.id) || viewingChallengeDetail;
    
    return (
      <div className="min-h-screen bg-background">
        <ChallengeDetailPage
          challenge={latestChallenge}
          onBack={() => setViewingChallengeDetail(null)}
          onCheckIn={handleDetailPageCheckIn}
        />
        
        <ConfettiCelebration
          open={celebrationOpen}
          onOpenChange={setCelebrationOpen}
          achievement={unlockedAchievement}
          challengeName={latestChallenge.name}
          dayCount={latestChallenge.checkIns.length + 1}
        />

        <ChallengeSummary
          challenge={latestChallenge}
          open={summaryOpen}
          onOpenChange={setSummaryOpen}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header 
        onCreateChallenge={() => setCreateDialogOpen(true)} 
        challengeCount={totalChallenges}
        challenges={challenges}
      />

      <main ref={containerRef} className="container max-w-6xl mx-auto px-4 py-4 md:py-6">
        {totalChallenges === 0 ? (
          <EmptyState onCreateChallenge={() => setCreateDialogOpen(true)} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            {/* Desktop Tabs */}
            <TabsList className="hidden md:grid w-full grid-cols-8 h-11 glass-card p-1">
              <TabsTrigger value="today" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Calendar className="w-4 h-4" />
                Today
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Flame className="w-4 h-4" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="code-hub" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Code className="w-4 h-4" />
                Code Hub
              </TabsTrigger>
              <TabsTrigger value="fitness-hub" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Dumbbell className="w-4 h-4" />
                Fitness Hub
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* ========== TODAY TAB ========== */}
            <TabsContent value="today" className="space-y-5 mt-0">
              <div className="grid lg:grid-cols-3 gap-5">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-5">
                  <TodayHero 
                    challenges={challenges}
                    onQuickCheckIn={handleCheckInClick}
                  />

                  {/* Urgent challenges */}
                  {dashboardStats.urgentChallenges.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <h3 className="text-sm font-semibold text-destructive">Streak at risk!</h3>
                      </div>
                      <div className="space-y-2">
                        {dashboardStats.urgentChallenges.map((challenge) => (
                          <ChallengeListCard
                            key={challenge.id}
                            challenge={challenge}
                            onViewDetails={() => handleViewDetails(challenge)}
                            onCheckIn={() => handleCheckInClick(challenge.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending challenges */}
                  {activeChallenges.filter(c => !hasCheckedInToday(c.id) && getStreak(c) < 7).length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 px-1">
                        <Flame className="w-4 h-4" />
                        Ready to check in
                      </h3>
                      <div className="space-y-2">
                        {activeChallenges
                          .filter(c => !hasCheckedInToday(c.id) && getStreak(c) < 7)
                          .map((challenge) => (
                            <ChallengeListCard
                              key={challenge.id}
                              challenge={challenge}
                              onViewDetails={() => handleViewDetails(challenge)}
                              onCheckIn={() => handleCheckInClick(challenge.id)}
                            />
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Done today */}
                  {dashboardStats.doneToday > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 px-1">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        Done today ({dashboardStats.doneToday})
                      </h3>
                      <div className="space-y-2 opacity-80">
                        {activeChallenges
                          .filter(c => hasCheckedInToday(c.id))
                          .slice(0, 3)
                          .map((challenge) => (
                            <ChallengeListCard
                              key={challenge.id}
                              challenge={challenge}
                              onViewDetails={() => handleViewDetails(challenge)}
                              onCheckIn={() => handleCheckInClick(challenge.id)}
                            />
                          ))}
                        {dashboardStats.doneToday > 3 && (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            +{dashboardStats.doneToday - 3} more completed
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                  <QuoteCard />
                  <SmartInsights challenges={challenges} />
                </div>
              </div>
            </TabsContent>

            {/* ========== ALL CHALLENGES TAB ========== */}
            <TabsContent value="challenges" className="space-y-5 mt-0">
              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <GlowingStatCard
                  value={dashboardStats.active}
                  label="Active Challenges"
                  icon={<Flame className="w-5 h-5" />}
                  variant="flame"
                />
                <GlowingStatCard
                  value={`${dashboardStats.doneToday}/${dashboardStats.active}`}
                  label="Today's Progress"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  variant="teal"
                />
                <GlowingStatCard
                  value={dashboardStats.bestStreak}
                  label="Best Streak"
                  icon={<TrendingUp className="w-5 h-5" />}
                  variant="flame"
                  glowing={dashboardStats.bestStreak >= 30}
                />
                <GlowingStatCard
                  value={`${dashboardStats.avgProgress}%`}
                  label="Avg Progress"
                  icon={<Target className="w-5 h-5" />}
                  variant="default"
                />
              </div>

              {/* Challenge list */}
              <GlassCard padding="none" className="overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <h3 className="font-semibold">All Challenges ({challenges.length})</h3>
                  <Button
                    size="sm"
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-gradient-flame hover:opacity-90 gap-1 shadow-glow"
                  >
                    <Plus className="w-4 h-4" />
                    New
                  </Button>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="p-3 space-y-2">
                    {challenges.map((challenge) => (
                      <ChallengeListCard
                        key={challenge.id}
                        challenge={challenge}
                        onViewDetails={() => handleViewDetails(challenge)}
                        onCheckIn={() => handleCheckInClick(challenge.id)}
                      />
                    ))}
                    {challenges.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No challenges yet</p>
                        <Button 
                          onClick={() => setCreateDialogOpen(true)} 
                          variant="link" 
                          className="mt-2"
                        >
                          Create your first challenge
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </GlassCard>
            </TabsContent>

            {/* ========== HUB TABS ========== */}
            <TabsContent value="code-hub">
              <CodeHub 
                challenges={challenges} 
                onNavigateBack={() => setActiveTab('challenges')}
              />
            </TabsContent>

            <TabsContent value="fitness-hub">
              <FitnessHub 
                challenges={challenges} 
                onNavigateBack={() => setActiveTab('challenges')}
              />
            </TabsContent>

            {/* ========== ANALYTICS TAB ========== */}
            <TabsContent value="analytics">
              <AnalyticsDashboard challenges={challenges} />
            </TabsContent>

            {/* ========== LEADERBOARD TAB ========== */}
            <TabsContent value="leaderboard">
              <Leaderboard challenges={challenges} />
            </TabsContent>

            {/* ========== PROFILE TAB ========== */}
            <TabsContent value="profile">
              <div className="max-w-md mx-auto">
                <ProfileCard challenges={challenges} />
              </div>
            </TabsContent>

            {/* ========== SETTINGS TAB ========== */}
            <TabsContent value="settings">
              <div className="max-w-2xl mx-auto">
                <SettingsPanel />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Floating CTA for check-in (only show when needed) */}
      {dashboardStats.pendingToday > 0 && !dashboardStats.allDoneToday && activeTab === 'today' && (
        <FloatingCTA
          label={`Check In (${dashboardStats.pendingToday} remaining)`}
          icon={<Flame className="w-5 h-5" />}
          onClick={() => {
            const nextChallenge = activeChallenges.find(c => !hasCheckedInToday(c.id));
            if (nextChallenge) handleCheckInClick(nextChallenge.id);
          }}
        />
      )}

      {/* Mobile Navigation */}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Dialogs */}
      <CreateChallengeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreate}
      />

      <CategorySpecificCheckIn
        challenge={selectedChallenge}
        open={checkInDialogOpen}
        onOpenChange={setCheckInDialogOpen}
        onCheckIn={handleCheckIn}
      />

      <ChallengeDetails
        challenge={selectedChallenge}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onCheckIn={() => {
          setDetailsOpen(false);
          setCheckInDialogOpen(true);
        }}
        onDelete={deleteChallenge}
      />

      <ConfettiCelebration
        open={celebrationOpen}
        onOpenChange={setCelebrationOpen}
        achievement={unlockedAchievement}
        challengeName={selectedChallenge?.name || ''}
        dayCount={selectedChallenge ? selectedChallenge.checkIns.length + 1 : 0}
      />

      <ChallengeSummary
        challenge={selectedChallenge}
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
      />
    </div>
  );
};

export default Index;
