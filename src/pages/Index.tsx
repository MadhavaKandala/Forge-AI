import { useState } from 'react';
import { motion } from 'framer-motion';
import { useChallenges } from '@/hooks/useChallenges';
import { Challenge } from '@/types/challenge';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { ChallengeCard } from '@/components/ChallengeCard';
import { CreateChallengeDialog } from '@/components/CreateChallengeDialog';
import { CheckInDialog } from '@/components/CheckInDialog';
import { ChallengeDetails } from '@/components/ChallengeDetails';
import { QuoteCard } from '@/components/QuoteCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Trophy } from 'lucide-react';

const Index = () => {
  const {
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

  const totalChallenges = activeChallenges.length + completedChallenges.length;

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
      checkIn(selectedChallenge.id, notes, link);
    }
  };

  const handleCreate = (data: Parameters<typeof createChallenge>[0]) => {
    createChallenge(data);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onCreateChallenge={() => setCreateDialogOpen(true)} 
        challengeCount={totalChallenges}
      />

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {totalChallenges === 0 ? (
          <EmptyState onCreateChallenge={() => setCreateDialogOpen(true)} />
        ) : (
          <div className="space-y-8">
            {/* Daily Quote */}
            <QuoteCard />

            {/* Challenges Tabs */}
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="active" className="flex items-center gap-2 text-base">
                  <Flame className="w-4 h-4" />
                  Active ({activeChallenges.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2 text-base">
                  <Trophy className="w-4 h-4" />
                  Completed ({completedChallenges.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {activeChallenges.length === 0 ? (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-muted-foreground py-12"
                  >
                    No active challenges. Start one today!
                  </motion.p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {activeChallenges.map((challenge, i) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <ChallengeCard
                          challenge={challenge}
                          onViewDetails={handleViewDetails}
                          onCheckIn={handleCheckInClick}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedChallenges.length === 0 ? (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-muted-foreground py-12"
                  >
                    Complete your first 100-day challenge to see it here! 🏆
                  </motion.p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {completedChallenges.map((challenge, i) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <ChallengeCard
                          challenge={challenge}
                          onViewDetails={handleViewDetails}
                          onCheckIn={handleCheckInClick}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
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
    </div>
  );
};

export default Index;
