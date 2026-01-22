import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Challenge, CATEGORY_CONFIG } from '@/types/challenge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    // In a real implementation, this would generate an image
  };

  return (
    <div className="space-y-6">
      {/* Share Your Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Progress
          </CardTitle>
          <CardDescription>
            Let the world know about your {categoryConfig.label} journey!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Share Card Preview */}
          <div className="mb-4 p-4 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">{categoryConfig.emoji}</div>
              <div>
                <h3 className="font-bold">100 Days of {categoryConfig.label}</h3>
                <p className="text-sm text-muted-foreground">{challenge.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded bg-background/50">
                <p className="text-xl font-bold">{challenge.checkIns.length}</p>
                <p className="text-xs text-muted-foreground">Days</p>
              </div>
              <div className="p-2 rounded bg-background/50">
                <p className="text-xl font-bold">{calculateStreak(challenge)}🔥</p>
                <p className="text-xs text-muted-foreground">Streak</p>
              </div>
              <div className="p-2 rounded bg-background/50">
                <p className="text-xl font-bold">{Math.round(challenge.checkIns.length)}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="gap-2 flex-1 sm:flex-none"
              onClick={() => handleShare('twitter')}
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 flex-1 sm:flex-none"
              onClick={() => handleShare('linkedin')}
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 flex-1 sm:flex-none"
              onClick={() => handleShare('copy')}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 flex-1 sm:flex-none"
              onClick={handleDownloadCard}
            >
              <Download className="w-4 h-4" />
              Download Card
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {categoryConfig.label} Leaderboard
          </CardTitle>
          <CardDescription>
            See how you rank among other challengers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeLeaderboardTab} onValueChange={setActiveLeaderboardTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="streak" className="gap-2">
                <Flame className="w-4 h-4" />
                By Streak
              </TabsTrigger>
              <TabsTrigger value="days" className="gap-2">
                <Star className="w-4 h-4" />
                By Days
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeLeaderboardTab} className="mt-0">
              <div ref={leaderboardRef} className="space-y-2">
                {leaderboardData.slice(0, 8).map((user, index) => (
                  <div 
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      user.isCurrentUser 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 flex justify-center shrink-0">
                      {getRankIcon(index + 1)}
                    </div>

                    {/* Avatar & Name */}
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`flex-1 font-medium truncate ${user.isCurrentUser ? 'text-primary' : ''}`}>
                      {user.name}
                      {user.isCurrentUser && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </span>

                    {/* Stats */}
                    <div className="text-right">
                      <p className="font-bold">
                        {activeLeaderboardTab === 'streak' ? `${user.streak}🔥` : user.days}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activeLeaderboardTab === 'streak' ? 'streak' : 'days'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Community Members */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-secondary" />
            Challenge Community
          </CardTitle>
          <CardDescription>
            {MOCK_MEMBERS.length + 1} people taking this challenge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MOCK_MEMBERS.map((member) => (
              <div 
                key={member.id}
                className="p-3 rounded-lg bg-muted/50 text-center hover:bg-muted transition-colors"
              >
                <Avatar className="w-12 h-12 mx-auto mb-2">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium truncate">{member.name}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      member.status === 'completed' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : ''
                    }`}
                  >
                    Day {member.day}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              View All Members
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Join Community CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
        <CardContent className="p-6 text-center">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-primary" />
          <h3 className="text-lg font-bold mb-2">Compete & Connect</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Join the global community of {categoryConfig.label.toLowerCase()} challengers
          </p>
          <Button className="bg-gradient-fire hover:opacity-90">
            Enable Public Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
