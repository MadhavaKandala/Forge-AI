import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Challenge, ACHIEVEMENTS } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { Check, Link, FileText } from 'lucide-react';

interface CheckInDialogProps {
  challenge: Challenge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckIn: (notes?: string, link?: string) => void;
}

export function CheckInDialog({ challenge, open, onOpenChange, onCheckIn }: CheckInDialogProps) {
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<typeof ACHIEVEMENTS[number] | null>(null);
  
  const { getProgress } = useChallenges();

  if (!challenge) return null;

  const handleCheckIn = () => {
    const newDayCount = challenge.checkIns.length + 1;
    
    // Check for milestone achievement
    const milestone = ACHIEVEMENTS.find(a => a.day === newDayCount);
    if (milestone) {
      setUnlockedAchievement(milestone);
    }
    
    onCheckIn(notes || undefined, link || undefined);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setUnlockedAchievement(null);
      setNotes('');
      setLink('');
      onOpenChange(false);
    }, unlockedAchievement ? 3000 : 1500);
  };

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-8 space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
              className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-secondary-foreground" />
            </motion.div>
            <h2 className="text-2xl font-display font-bold">Day {challenge.checkIns.length + 1} Complete!</h2>
            <p className="text-muted-foreground">Keep the streak going! 🔥</p>
            
            {unlockedAchievement && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 rounded-xl bg-gradient-fire text-white"
              >
                <p className="text-sm font-medium mb-2">🎉 Achievement Unlocked!</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl">{unlockedAchievement.badge}</span>
                  <div className="text-left">
                    <p className="font-bold">{unlockedAchievement.name}</p>
                    <p className="text-sm opacity-90">Day {unlockedAchievement.day} Milestone</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Daily Check-In</DialogTitle>
          <DialogDescription>
            Day {challenge.checkIns.length + 1} of your {challenge.name} challenge
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              What did you accomplish? (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Share your progress, learnings, or reflections..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Add a link (Optional)
            </Label>
            <Input
              id="link"
              type="url"
              placeholder="GitHub commit, article, social post..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleCheckIn} 
            className="w-full bg-gradient-fire hover:opacity-90 font-semibold"
          >
            🔥 Complete Day {challenge.checkIns.length + 1}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
