import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useChallenges } from '@/hooks/useChallenges';
import { Challenge, ACHIEVEMENTS } from '@/types/challenge';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { ChallengeCard } from '@/components/ChallengeCard';
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
import { TodaySection } from '@/components/TodaySection';
import { AllChallengesDashboard } from '@/components/AllChallengesDashboard';
import { ChallengeSummary } from '@/components/ChallengeSummary';
import { MobileNavigation } from '@/components/MobileNavigation';
import { InstallPrompt } from '@/components/InstallPrompt';
import { CodeHub } from '@/components/Hubs/CodeHub';
import { ChallengeDetailPage } from '@/components/ChallengeDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Trophy, BarChart3, User, Settings, Calendar, Code } from 'lucide-react';

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

  // GSAP entrance animation
  useEffect(() => {
    if (isLoaded && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [isLoaded]);

  const handleViewDetails = (challenge: Challenge) => {
    // Use new full-page detail view
    setViewingChallengeDetail(challenge);
  };

  // Handler for check-in from detail page
  const handleDetailPageCheckIn = (notes?: string, link?: string) => {
    if (viewingChallengeDetail) {
      const newDayCount = viewingChallengeDetail.checkIns.length + 1;
      const milestone = ACHIEVEMENTS.find(a => a.day === newDayCount);
      
      if (milestone) {
        setUnlockedAchievement(milestone);
        setTimeout(() => setCelebrationOpen(true), 500);
      }

      // Check for 100-day completion
      if (newDayCount === 100) {
        updateChallenge(viewingChallengeDetail.id, { status: 'completed' });
        setTimeout(() => {
          setSelectedChallenge({ ...viewingChallengeDetail, checkIns: [...viewingChallengeDetail.checkIns, { id: '', date: '', createdAt: '' }] });
          setSummaryOpen(true);
        }, 1500);
      }
      
      checkIn(viewingChallengeDetail.id, notes, link);
      // Update the viewing challenge with new data
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

      // Check for 100-day completion
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-fire flex items-center justify-center shadow-glow animate-pulse">
            <span className="text-3xl">🔥</span>
          </div>
          <p className="text-muted-foreground">Loading your challenges...</p>
        </div>
      </div>
    );
  }

  // If viewing a challenge detail page, show it instead of the main dashboard
  if (viewingChallengeDetail) {
    // Get the latest challenge data
    const latestChallenge = challenges.find(c => c.id === viewingChallengeDetail.id) || viewingChallengeDetail;
    
    return (
      <div className="min-h-screen bg-background">
        <ChallengeDetailPage
          challenge={latestChallenge}
          onBack={() => setViewingChallengeDetail(null)}
          onCheckIn={handleDetailPageCheckIn}
        />
        
        {/* Celebration Dialog */}
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
      />

      <main ref={containerRef} className="container max-w-6xl mx-auto px-4 py-6">
        {totalChallenges === 0 ? (
          <EmptyState onCreateChallenge={() => setCreateDialogOpen(true)} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Desktop Tabs */}
            <TabsList className="hidden md:grid w-full grid-cols-7 h-12">
              <TabsTrigger value="today" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Today
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="code-hub" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code Hub
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Today Tab */}
            <TabsContent value="today" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TodaySection 
                    challenges={challenges} 
                    onCheckIn={handleCheckInClick} 
                  />
                </div>
                <div className="space-y-6">
                  <QuoteCard />
                  <SmartInsights challenges={challenges} />
                </div>
              </div>
            </TabsContent>

            {/* Challenges Tab */}
            <TabsContent value="challenges" className="space-y-6">
              <AllChallengesDashboard
                challenges={challenges}
                onViewDetails={handleViewDetails}
                onCheckIn={handleCheckInClick}
                onCreateChallenge={() => setCreateDialogOpen(true)}
              />
            </TabsContent>

            {/* Code Hub Tab */}
            <TabsContent value="code-hub">
              <CodeHub 
                challenges={challenges} 
                onNavigateBack={() => setActiveTab('challenges')}
              />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <AnalyticsDashboard challenges={challenges} />
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard">
              <Leaderboard challenges={challenges} />
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="max-w-md mx-auto">
                <ProfileCard challenges={challenges} />
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="max-w-2xl mx-auto">
                <SettingsPanel />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

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
