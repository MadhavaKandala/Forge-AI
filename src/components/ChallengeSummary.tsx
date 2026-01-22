import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { Challenge, ACHIEVEMENTS, CATEGORY_CONFIG } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Calendar, 
  Flame, 
  Target, 
  Share2, 
  Download, 
  X,
  Sparkles,
  Star
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChallengeSummaryProps {
  challenge: Challenge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChallengeSummary({ challenge, open, onOpenChange }: ChallengeSummaryProps) {
  const { getBestStreak } = useChallenges();
  const containerRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && containerRef.current && confettiRef.current) {
      // Create confetti
      const confettiContainer = confettiRef.current;
      const colors = ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
      
      for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'absolute w-2 h-2 rounded-full';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = '50%';
        confetti.style.top = '40%';
        confettiContainer.appendChild(confetti);

        gsap.to(confetti, {
          x: (Math.random() - 0.5) * 400,
          y: (Math.random() - 0.5) * 400,
          rotation: Math.random() * 720,
          scale: Math.random() * 1.5 + 0.5,
          opacity: 0,
          duration: 2 + Math.random(),
          ease: 'power2.out',
          onComplete: () => confetti.remove(),
        });
      }

      // Animate content
      const tl = gsap.timeline();
      
      tl.fromTo(
        containerRef.current.querySelector('.trophy-icon'),
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' }
      )
      .fromTo(
        containerRef.current.querySelector('.congrats-text'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.3'
      )
      .fromTo(
        statsRef.current?.children || [],
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.1 },
        '-=0.2'
      );
    }
  }, [open]);

  if (!challenge) return null;

  const bestStreak = getBestStreak(challenge);
  const totalDays = challenge.checkIns.length;
  const config = CATEGORY_CONFIG[challenge.category];
  const startDate = new Date(challenge.startDate);
  const endDate = challenge.checkIns[challenge.checkIns.length - 1]?.createdAt 
    ? new Date(challenge.checkIns[challenge.checkIns.length - 1].createdAt)
    : new Date();
  const journeyDays = differenceInDays(endDate, startDate) + 1;
  const consistency = Math.round((totalDays / journeyDays) * 100);

  const stats = [
    { label: 'Days Completed', value: totalDays, icon: Calendar, color: 'text-primary' },
    { label: 'Best Streak', value: `${bestStreak}🔥`, icon: Flame, color: 'text-orange-500' },
    { label: 'Consistency', value: `${consistency}%`, icon: Target, color: 'text-secondary' },
    { label: 'Journey Length', value: `${journeyDays} days`, icon: Star, color: 'text-accent' },
  ];

  const handleShare = async () => {
    const shareText = `🏆 I completed the 100 Days of ${challenge.name} challenge!\n\n` +
      `📊 Stats:\n` +
      `• ${totalDays} days completed\n` +
      `• ${bestStreak} day best streak\n` +
      `• ${consistency}% consistency\n\n` +
      `#100DaysChallenge #${challenge.category}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `100 Days of ${challenge.name} - Complete!`,
          text: shareText,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div ref={containerRef} className="relative">
          {/* Confetti container */}
          <div ref={confettiRef} className="absolute inset-0 overflow-hidden pointer-events-none z-10" />

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-20"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Header with gradient */}
          <div className="bg-gradient-fire p-8 text-center text-white relative overflow-hidden">
            {/* Sparkle effects */}
            <Sparkles className="absolute top-4 left-8 w-6 h-6 opacity-50 animate-pulse" />
            <Sparkles className="absolute bottom-6 right-10 w-4 h-4 opacity-50 animate-pulse" />
            
            <div className="trophy-icon w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Trophy className="w-10 h-10" />
            </div>
            
            <div className="congrats-text">
              <h2 className="font-display text-3xl font-bold mb-2">
                Congratulations! 🎉
              </h2>
              <p className="text-white/80">
                You completed the challenge!
              </p>
            </div>
          </div>

          {/* Challenge info */}
          <div className="p-6 space-y-6">
            {/* Challenge name card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${config.color}20` }}
              >
                {config.emoji}
              </div>
              <div>
                <p className="font-display font-bold text-lg">{challenge.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Stats grid */}
            <div ref={statsRef} className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl bg-card border text-center"
                >
                  <stat.icon className={cn('w-5 h-5 mx-auto mb-2', stat.color)} />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Achievements showcase */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" />
                Achievements Earned
              </h3>
              <div className="flex flex-wrap gap-2">
                {ACHIEVEMENTS.map((achievement) => (
                  <Badge
                    key={achievement.day}
                    variant={totalDays >= achievement.day ? 'default' : 'secondary'}
                    className={cn(
                      'text-lg py-1 px-3',
                      totalDays >= achievement.day && 'bg-gradient-fire'
                    )}
                  >
                    {achievement.badge}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  // Generate a simple certificate/image
                  const canvas = document.createElement('canvas');
                  canvas.width = 800;
                  canvas.height = 600;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    // Simple certificate design
                    ctx.fillStyle = '#1a1a2e';
                    ctx.fillRect(0, 0, 800, 600);
                    ctx.fillStyle = '#f97316';
                    ctx.fillRect(0, 0, 800, 8);
                    ctx.fillRect(0, 592, 800, 8);
                    ctx.font = 'bold 48px sans-serif';
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    ctx.fillText('🏆 CHALLENGE COMPLETE 🏆', 400, 120);
                    ctx.font = '32px sans-serif';
                    ctx.fillText(challenge.name, 400, 200);
                    ctx.font = '24px sans-serif';
                    ctx.fillStyle = '#888';
                    ctx.fillText(`${totalDays} Days | ${bestStreak} Best Streak | ${consistency}% Consistency`, 400, 280);
                    ctx.font = '20px sans-serif';
                    ctx.fillText(`${format(startDate, 'MMMM d')} - ${format(endDate, 'MMMM d, yyyy')}`, 400, 340);
                    
                    canvas.toBlob((blob) => {
                      if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${challenge.name.replace(/\s+/g, '-')}-certificate.png`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    });
                  }
                }}
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                className="flex-1 gap-2 bg-gradient-fire hover:opacity-90"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
