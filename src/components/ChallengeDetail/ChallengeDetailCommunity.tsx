import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Challenge, CATEGORY_CONFIG } from '@/types/challenge';
import { GlassCard } from '@/components/dashboard/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  Share2, 
  Twitter, 
  Linkedin,
  Download,
  Copy,
  Check,
  Flame,
  Medal,
  Crown,
  Star,
  Sparkles,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChallengeDetailCommunityProps {
  challenge: Challenge;
}

// Mock leaderboard data
const MOCK_LEADERBOARD = [
  { id: '1', name: 'Alex Chen', avatar: '', streak: 45, days: 67, rank: 1 },
  { id: '2', name: 'Sarah Miller', avatar: '', streak: 38, days: 52, rank: 2 },
  { id: '3', name: 'James Wilson', avatar: '', streak: 33, days: 48, rank: 3 },
  { id: '4', name: 'Emily Brown', avatar: '', streak: 28, days: 41, rank: 4 },
  { id: '5', name: 'Michael Lee', avatar: '', streak: 25, days: 39, rank: 5 },
  { id: '6', name: 'You', avatar: '', streak: 0, days: 0, rank: 6, isCurrentUser: true },
  { id: '7', name: 'David Kim', avatar: '', streak: 18, days: 32, rank: 7 },
  { id: '8', name: 'Lisa Wang', avatar: '', streak: 15, days: 28, rank: 8 },
];

// Mock community members
const MOCK_MEMBERS = [
  { id: '1', name: 'Taylor Swift', avatar: '', day: 45, status: 'active' },
  { id: '2', name: 'John Doe', avatar: '', day: 23, status: 'active' },
  { id: '3', name: 'Jane Smith', avatar: '', day: 67, status: 'completed' },
  { id: '4', name: 'Bob Johnson', avatar: '', day: 12, status: 'active' },
];

export function ChallengeDetailCommunity({ challenge }: ChallengeDetailCommunityProps) {
  const [copied, setCopied] = useState(false);
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState('streak');
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const categoryConfig = CATEGORY_CONFIG[challenge.category];

  // Update mock data with current user's stats
  const leaderboardData = MOCK_LEADERBOARD.map(user => 
    user.isCurrentUser 
      ? { ...user, streak: challenge.checkIns.length > 0 ? calculateStreak(challenge) : 0, days: challenge.checkIns.length }
      : user
  ).sort((a, b) => activeLeaderboardTab === 'streak' ? b.streak - a.streak : b.days - a.days);

  function calculateStreak(challenge: Challenge): number {
    if (challenge.checkIns.length === 0) return 0;
    const sortedDates = [...challenge.checkIns]
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
    if (leaderboardRef.current) {
      gsap.fromTo(
        leaderboardRef.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [activeLeaderboardTab]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
    }
  };

  const handleShare = (platform: 'twitter' | 'linkedin' | 'copy') => {
    const shareText = `I'm on Day ${challenge.checkIns.length} of my 100 Days of ${categoryConfig.label} challenge! ${categoryConfig.emoji} #100DaysChallenge`;
    const shareUrl = window.location.href;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        toast({
          title: "Link copied!",
          description: "Share link has been copied to clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  const handleDownloadCard = () => {
    toast({
      title: "Generating image...",
      description: "Your shareable card is being created.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Share Your Progress */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Share Your Progress</h3>
            <p className="text-sm text-muted-foreground">Let the world know about your journey!</p>
          </div>
        </div>

        {/* Share Card Preview */}
        <motion.div 
          className="mb-5 p-5 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 border border-white/10 relative overflow-hidden"
          whileHover={{ scale: 1.01 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                className="text-4xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {categoryConfig.emoji}
              </motion.div>
              <div>
                <h3 className="font-bold text-lg">100 Days of {categoryConfig.label}</h3>
                <p className="text-sm text-muted-foreground">{challenge.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl glass">
                <p className="text-2xl font-bold font-display">{challenge.checkIns.length}</p>
                <p className="text-xs text-muted-foreground">Days</p>
              </div>
              <div className="p-3 rounded-xl glass">
                <p className="text-2xl font-bold font-display">{calculateStreak(challenge)}🔥</p>
                <p className="text-xs text-muted-foreground">Streak</p>
              </div>
              <div className="p-3 rounded-xl glass">
                <p className="text-2xl font-bold font-display">{challenge.checkIns.length}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Share Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { platform: 'twitter' as const, icon: Twitter, label: 'Twitter' },
            { platform: 'linkedin' as const, icon: Linkedin, label: 'LinkedIn' },
          ].map((btn) => (
            <motion.div key={btn.platform} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                className="gap-2 flex-1 sm:flex-none glass rounded-xl hover:bg-white/10"
                onClick={() => handleShare(btn.platform)}
              >
                <btn.icon className="w-4 h-4" />
                {btn.label}
              </Button>
            </motion.div>
          ))}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              className="gap-2 flex-1 sm:flex-none glass rounded-xl hover:bg-white/10"
              onClick={() => handleShare('copy')}
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              className="gap-2 flex-1 sm:flex-none glass rounded-xl hover:bg-white/10"
              onClick={handleDownloadCard}
            >
              <Download className="w-4 h-4" />
              Download Card
            </Button>
          </motion.div>
        </div>
      </GlassCard>

      {/* Leaderboard */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-semibold">{categoryConfig.label} Leaderboard</h3>
            <p className="text-sm text-muted-foreground">See how you rank among challengers</p>
          </div>
        </div>

        <Tabs value={activeLeaderboardTab} onValueChange={setActiveLeaderboardTab}>
          <TabsList className="grid w-full grid-cols-2 mb-5 glass rounded-xl h-11 p-1">
            <TabsTrigger value="streak" className="gap-2 rounded-lg data-[state=active]:bg-white/10">
              <Flame className="w-4 h-4" />
              By Streak
            </TabsTrigger>
            <TabsTrigger value="days" className="gap-2 rounded-lg data-[state=active]:bg-white/10">
              <Star className="w-4 h-4" />
              By Days
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeLeaderboardTab} className="mt-0">
            <div ref={leaderboardRef} className="space-y-2">
              {leaderboardData.slice(0, 8).map((user, index) => (
                <motion.div 
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    user.isCurrentUser 
                      ? 'glass border-2 border-primary/30 shadow-glow' 
                      : 'glass border border-white/5 hover:border-white/10'
                  }`}
                  whileHover={{ x: 4 }}
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center shrink-0">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Avatar & Name */}
                  <Avatar className="w-9 h-9 border-2 border-white/10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs bg-muted">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`flex-1 font-medium truncate ${user.isCurrentUser ? 'text-primary' : ''}`}>
                    {user.name}
                    {user.isCurrentUser && (
                      <Badge className="ml-2 text-xs bg-primary/20 text-primary border-0">You</Badge>
                    )}
                  </span>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="font-bold font-display">
                      {activeLeaderboardTab === 'streak' ? `${user.streak}🔥` : user.days}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activeLeaderboardTab === 'streak' ? 'streak' : 'days'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </GlassCard>

      {/* Community Members */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold">Challenge Community</h3>
            <p className="text-sm text-muted-foreground">{MOCK_MEMBERS.length + 1} people taking this challenge</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MOCK_MEMBERS.map((member, index) => (
            <motion.div 
              key={member.id}
              className="p-4 rounded-xl glass border border-white/5 text-center hover:border-white/10 transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2, scale: 1.02 }}
            >
              <Avatar className="w-14 h-14 mx-auto mb-3 border-2 border-white/10">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="bg-muted">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium truncate">{member.name}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs glass ${
                    member.status === 'completed' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : ''
                  }`}
                >
                  Day {member.day}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 text-center">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" className="gap-2 glass rounded-xl hover:bg-white/10">
              <Users className="w-4 h-4" />
              View All Members
            </Button>
          </motion.div>
        </div>
      </GlassCard>

      {/* Join Community CTA */}
      <GlassCard className="relative overflow-hidden border-0 bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-2xl" />
        <div className="relative text-center py-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
          </motion.div>
          <h3 className="text-xl font-bold mb-2">Compete & Connect</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Join the global community of {categoryConfig.label.toLowerCase()} challengers and share your journey
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="bg-gradient-fire hover:opacity-90 rounded-xl shadow-glow font-semibold px-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Enable Public Profile
            </Button>
          </motion.div>
        </div>
      </GlassCard>
    </div>
  );
}
