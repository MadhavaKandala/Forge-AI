import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Challenge } from '@/types/challenge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Check, 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar,
  Link as LinkIcon,
  MessageSquare,
  Sparkles,
  Clock,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';

interface ChallengeDetailTodayProps {
  challenge: Challenge;
  streak: number;
  bestStreak: number;
  progress: number;
  checkedIn: boolean;
  onCheckIn: (notes?: string, link?: string) => void;
}

export function ChallengeDetailToday({
  challenge,
  streak,
  bestStreak,
  progress,
  checkedIn,
  onCheckIn,
}: ChallengeDetailTodayProps) {
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Calculate consistency (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  });
  const consistencyScore = Math.round(
    (challenge.checkIns.filter(ci => last7Days.includes(ci.date)).length / 7) * 100
  );

  // Today's check-in if exists
  const todayCheckIn = challenge.checkIns.find(
    ci => ci.date === new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.children,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)' }
      );
    }
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: 'power3.out' }
      );
    }
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    onCheckIn(notes || undefined, link || undefined);
    setNotes('');
    setLink('');
    setIsSubmitting(false);
  };

  const stats = [
    { 
      label: 'Current Streak', 
      value: streak, 
      icon: Flame, 
      suffix: '🔥',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    { 
      label: 'Best Streak', 
      value: bestStreak, 
      icon: Target, 
      suffix: '',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    { 
      label: 'Days Done', 
      value: challenge.checkIns.length, 
      icon: Calendar, 
      suffix: '/100',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    { 
      label: '7-Day Consistency', 
      value: consistencyScore, 
      icon: TrendingUp, 
      suffix: '%',
      color: consistencyScore >= 70 ? 'text-green-500' : 'text-yellow-500',
      bgColor: consistencyScore >= 70 ? 'bg-green-500/10' : 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className={`${stat.bgColor} border-0`}>
            <CardContent className="p-4 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold">
                {stat.value}{stat.suffix}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Day 1</span>
            <span>Day 50</span>
            <span>Day 100</span>
          </div>
        </CardContent>
      </Card>

      {/* Check-in Form or Completed Status */}
      <div ref={formRef}>
        {checkedIn ? (
          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-lg text-green-500">Checked in today!</CardTitle>
                  <CardDescription>
                    Great job maintaining your streak
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayCheckIn && (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      Checked in at {format(new Date(todayCheckIn.createdAt), 'h:mm a')}
                    </span>
                  </div>
                  {todayCheckIn.notes && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm">{todayCheckIn.notes}</p>
                    </div>
                  )}
                  {todayCheckIn.link && (
                    <a 
                      href={todayCheckIn.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {todayCheckIn.link}
                    </a>
                  )}
                </>
              )}
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Come back tomorrow to continue your {streak + 1}-day streak!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-fire flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Check In Now</CardTitle>
                    <CardDescription>
                      Day {challenge.checkIns.length + 1} of your journey
                    </CardDescription>
                  </div>
                </div>
                {streak > 0 && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    🔥 {streak} day streak at risk!
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  What did you accomplish today?
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Share your progress, learnings, or challenges..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="link" className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Add a link (optional)
                </Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://github.com/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-fire hover:opacity-90 font-semibold h-12"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🔥 Complete Day {challenge.checkIns.length + 1}
                  </span>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Pro tip: Consistency beats perfection. Even small progress counts!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Motivational Quote */}
      <Card className="bg-muted/30">
        <CardContent className="p-4 text-center">
          <Sparkles className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-sm italic text-muted-foreground">
            "The only way to do great work is to love what you do."
          </p>
          <p className="text-xs text-muted-foreground mt-1">— Steve Jobs</p>
        </CardContent>
      </Card>
    </div>
  );
}
