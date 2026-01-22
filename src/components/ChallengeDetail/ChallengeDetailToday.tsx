import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Challenge } from '@/types/challenge';
import { GlassCard } from '@/components/dashboard/GlassCard';
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
  Quote,
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
      gradient: 'from-primary/20 to-primary/5',
      iconColor: 'text-primary',
      glow: true,
    },
    { 
      label: 'Best Streak', 
      value: bestStreak, 
      icon: Target, 
      suffix: '',
      gradient: 'from-secondary/20 to-secondary/5',
      iconColor: 'text-secondary',
      glow: false,
    },
    { 
      label: 'Days Done', 
      value: challenge.checkIns.length, 
      icon: Calendar, 
      suffix: '/100',
      gradient: 'from-muted to-muted/50',
      iconColor: 'text-muted-foreground',
      glow: false,
    },
    { 
      label: '7-Day Consistency', 
      value: consistencyScore, 
      icon: TrendingUp, 
      suffix: '%',
      gradient: consistencyScore >= 70 ? 'from-green-500/20 to-green-500/5' : 'from-yellow-500/20 to-yellow-500/5',
      iconColor: consistencyScore >= 70 ? 'text-green-500' : 'text-yellow-500',
      glow: consistencyScore >= 70,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <GlassCard 
              className={`bg-gradient-to-br ${stat.gradient} ${stat.glow ? 'shadow-glow' : ''}`}
              padding="sm"
            >
              <div className="text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.iconColor}`} />
                <p className="text-2xl font-bold font-display">
                  {stat.value}{stat.suffix}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Overall Progress</span>
          <Badge variant="outline" className="glass">
            {progress}% complete
          </Badge>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-3" />
          <div 
            className="absolute top-0 h-3 rounded-full bg-gradient-to-r from-primary/50 to-transparent blur-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>Day 1</span>
          <span className="text-primary font-medium">Day {challenge.checkIns.length}</span>
          <span>Day 100</span>
        </div>
      </GlassCard>

      {/* Check-in Form or Completed Status */}
      <div ref={formRef}>
        {checkedIn ? (
          <GlassCard className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Check className="w-6 h-6 text-green-500" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-green-500">Checked in today!</h3>
                <p className="text-sm text-muted-foreground">
                  Great job maintaining your streak
                </p>
              </div>
            </div>
            
            {todayCheckIn && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    Checked in at {format(new Date(todayCheckIn.createdAt), 'h:mm a')}
                  </span>
                </div>
                {todayCheckIn.notes && (
                  <div className="p-4 rounded-xl glass">
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
                <div className="pt-3 border-t border-white/5">
                  <p className="text-sm text-muted-foreground">
                    Come back tomorrow to continue your <span className="text-primary font-medium">{streak + 1}-day streak!</span>
                  </p>
                </div>
              </div>
            )}
          </GlassCard>
        ) : (
          <GlassCard className="border-primary/20" glow glowColor="flame">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-gradient-fire flex items-center justify-center shadow-glow"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold">Check In Now</h3>
                  <p className="text-sm text-muted-foreground">
                    Day {challenge.checkIns.length + 1} of your journey
                  </p>
                </div>
              </div>
              {streak > 0 && (
                <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse">
                  🔥 {streak} day streak at risk!
                </Badge>
              )}
            </div>

            <div className="space-y-5">
              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  What did you accomplish today?
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Share your progress, learnings, or challenges..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] resize-none bg-white/5 border-white/10 focus:border-primary/50 rounded-xl"
                />
              </div>

              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="link" className="flex items-center gap-2 text-sm">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  Add a link (optional)
                </Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://github.com/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl"
                />
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-fire hover:opacity-90 font-semibold h-12 rounded-xl shadow-glow"
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
              </motion.div>

              <p className="text-xs text-center text-muted-foreground">
                Pro tip: Consistency beats perfection. Even small progress counts!
              </p>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Motivational Quote */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Quote className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm italic text-foreground/80">
              "The only way to do great work is to love what you do."
            </p>
            <p className="text-xs text-muted-foreground mt-2">— Steve Jobs</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
