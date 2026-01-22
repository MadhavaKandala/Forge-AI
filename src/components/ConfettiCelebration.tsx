import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Achievement } from '@/types/challenge';
import { Share2, Download, X } from 'lucide-react';

interface ConfettiCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement: Achievement | null;
  challengeName: string;
  dayCount: number;
}

export function ConfettiCelebration({ 
  open, 
  onOpenChange, 
  achievement, 
  challengeName,
  dayCount 
}: ConfettiCelebrationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && containerRef.current) {
      // Create confetti
      const colors = [
        'hsl(24, 95%, 53%)',
        'hsl(38, 92%, 50%)',
        'hsl(168, 76%, 36%)',
        'hsl(12, 90%, 55%)',
        'hsl(280, 80%, 55%)',
        'hsl(340, 75%, 55%)',
      ];

      const container = containerRef.current;

      // Initial burst
      for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        const isCircle = Math.random() > 0.5;
        confetti.style.cssText = `
          position: absolute;
          width: ${gsap.utils.random(8, 16)}px;
          height: ${gsap.utils.random(8, 16)}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: ${isCircle ? '50%' : '2px'};
          pointer-events: none;
          z-index: 50;
        `;
        container.appendChild(confetti);

        const startX = window.innerWidth / 2;
        const startY = window.innerHeight * 0.3;

        gsap.set(confetti, { x: startX, y: startY, scale: 0, rotation: gsap.utils.random(0, 360) });

        gsap.to(confetti, {
          x: startX + gsap.utils.random(-400, 400),
          y: window.innerHeight + 100,
          rotation: gsap.utils.random(-720, 720),
          scale: gsap.utils.random(0.5, 1.5),
          opacity: 0,
          duration: gsap.utils.random(2, 4),
          delay: gsap.utils.random(0, 0.5),
          ease: 'power1.out',
          onComplete: () => confetti.remove(),
        });
      }

      // Badge animation
      if (badgeRef.current) {
        gsap.fromTo(badgeRef.current,
          { scale: 0, rotation: -180 },
          { 
            scale: 1, 
            rotation: 0, 
            duration: 0.8, 
            delay: 0.3,
            ease: 'back.out(2)',
          }
        );

        // Glow pulse
        gsap.to(badgeRef.current, {
          boxShadow: '0 0 60px hsl(24, 95%, 53%), 0 0 100px hsl(38, 92%, 50%)',
          duration: 0.5,
          delay: 0.8,
          yoyo: true,
          repeat: 3,
        });
      }

      // Text animation
      if (textRef.current) {
        gsap.fromTo(textRef.current.children,
          { opacity: 0, y: 30 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.6, 
            stagger: 0.15,
            delay: 0.6,
            ease: 'power3.out',
          }
        );
      }
    }
  }, [open]);

  if (!achievement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-gradient-to-br from-background via-background to-muted border-2 border-primary/20">
        <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden" />
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="relative z-10 p-8 text-center space-y-6">
          {/* Achievement Badge */}
          <div 
            ref={badgeRef}
            className="w-32 h-32 mx-auto rounded-full bg-gradient-fire flex items-center justify-center shadow-glow"
          >
            <span className="text-6xl">{achievement.badge}</span>
          </div>

          {/* Text Content */}
          <div ref={textRef} className="space-y-3">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">
              🎉 Achievement Unlocked!
            </p>
            <h2 className="text-3xl font-display font-bold">
              {achievement.name}
            </h2>
            <p className="text-muted-foreground">
              {achievement.description}
            </p>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Day {dayCount} of <span className="font-semibold text-foreground">{challengeName}</span>
              </p>
            </div>
          </div>

          {/* Certificate Preview */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-2">🏆 Certificate of Achievement</p>
            <p className="font-display font-bold">{achievement.name}</p>
            <p className="text-sm text-muted-foreground">
              Completed on {new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button className="bg-gradient-fire hover:opacity-90 gap-2" size="sm">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
