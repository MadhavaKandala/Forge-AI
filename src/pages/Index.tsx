import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useChallenges } from '@/hooks/useChallenges';
import { Challenge } from '@/types/challenge';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { ChallengeCard } from '@/components/ChallengeCard';
import { CreateChallengeDialog } from '@/components/CreateChallengeDialog';
import { CheckInDialog } from '@/components/CheckInDialog';
import { ChallengeDetails } from '@/components/ChallengeDetails';
import { QuoteCard } from '@/components/QuoteCard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { Leaderboard } from '@/components/Leaderboard';
import { SmartInsights } from '@/components/SmartInsights';
import { ProfileCard } from '@/components/ProfileCard';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Trophy, BarChart3, User, Settings } from 'lucide-react';
import { ACHIEVEMENTS } from '@/types/challenge';

const Index = () => {
  const {
    challenges,
    activeChallenges,
    completedChallenges,
    isLoaded,
    createChallenge,
    deleteChallenge,
    checkIn,
  } = useChallenges();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<typeof ACHIEVEMENTS[number] | null>(null);
  const [activeTab, setActiveTab] = useState('challenges');

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
    setSelectedChallenge(challenge);
    setDetailsOpen(true);
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
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-fire flex items-center justify-center shadow-glow animate-flame-pulse">
            <span className="text-3xl">🔥</span>
          </div>
          <p className="text-muted-foreground">Loading your challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onCreateChallenge={() => setCreateDialogOpen(true)} 
        challengeCount={totalChallenges}
      />

      <main ref={containerRef} className="container max-w-6xl mx-auto px-4 py-8">
        {totalChallenges === 0 ? (
          <EmptyState onCreateChallenge={() => setCreateDialogOpen(true)} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 h-12">
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span className="hidden sm:inline">Challenges</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Challenges Tab */}
            <TabsContent value="challenges" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <QuoteCard />
                  
                  <Tabs defaultValue="active" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2 h-10">
                      <TabsTrigger value="active" className="flex items-center gap-2">
                        <Flame className="w-4 h-4" />
                        Active ({activeChallenges.length})
                      </TabsTrigger>
                      <TabsTrigger value="completed" className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Completed ({completedChallenges.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                      {activeChallenges.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">
                          No active challenges. Start one today!
                        </p>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {activeChallenges.map((challenge) => (
                            <ChallengeCard
                              key={challenge.id}
                              challenge={challenge}
                              onViewDetails={handleViewDetails}
                              onCheckIn={handleCheckInClick}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4">
                      {completedChallenges.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">
                          Complete your first 100-day challenge! 🏆
                        </p>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {completedChallenges.map((challenge) => (
                            <ChallengeCard
                              key={challenge.id}
                              challenge={challenge}
                              onViewDetails={handleViewDetails}
                              onCheckIn={handleCheckInClick}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-6">
                  <SmartInsights challenges={challenges} />
                </div>
              </div>
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

      {/* Dialogs */}
      <CreateChallengeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreate}
      />

      <CheckInDialog
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
    </div>
  );
};

export default Index;