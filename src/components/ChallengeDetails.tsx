import { motion } from 'framer-motion';
import { Challenge, ACHIEVEMENTS } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CategoryBadge } from './CategoryBadge';
import { StreakBadge } from './StreakBadge';
import { ProgressRing } from './ProgressRing';
import { HeatmapCalendar } from './HeatmapCalendar';
import { AchievementBadge } from './AchievementBadge';
import { Check, Calendar, Target, TrendingUp, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ChallengeDetailsProps {
  challenge: Challenge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckIn: () => void;
  onDelete: (id: string) => void;
}

export function ChallengeDetails({ challenge, open, onOpenChange, onCheckIn, onDelete }: ChallengeDetailsProps) {
  const { getStreak, getBestStreak, getProgress, hasCheckedInToday, getDaysRemaining } = useChallenges();

  if (!challenge) return null;

  const streak = getStreak(challenge);
  const bestStreak = getBestStreak(challenge);
  const progress = getProgress(challenge);
  const checkedIn = hasCheckedInToday(challenge.id);
  const daysRemaining = getDaysRemaining(challenge);

  const stats = [
    { label: 'Days Done', value: challenge.checkIns.length, icon: Check },
    { label: 'Current Streak', value: `${streak} 🔥`, icon: TrendingUp },
    { label: 'Best Streak', value: bestStreak, icon: Target },
    { label: 'Days Left', value: daysRemaining, icon: Calendar },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CategoryBadge category={challenge.category} />
              <SheetTitle className="font-display text-2xl">{challenge.name}</SheetTitle>
              {challenge.description && (
                <SheetDescription>{challenge.description}</SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-6">
            {/* Progress Ring */}
            <div className="flex items-center justify-center">
              <ProgressRing progress={progress} size={160} strokeWidth={10}>
                <div className="text-center">
                  <span className="text-3xl font-display font-bold">{progress}%</span>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
              </ProgressRing>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-muted/50 border border-border/50"
                >
                  <stat.icon className="w-4 h-4 text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <Separator />

            {/* Heatmap */}
            <div className="space-y-3">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Activity
              </h3>
              <HeatmapCalendar challenge={challenge} weeks={12} />
            </div>

            <Separator />

            {/* Achievements */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold">Achievements</h3>
              <div className="grid grid-cols-4 gap-2">
                {ACHIEVEMENTS.map((achievement) => (
                  <AchievementBadge
                    key={achievement.day}
                    achievement={achievement}
                    unlocked={challenge.checkIns.length >= achievement.day}
                    size="sm"
                  />
                ))}
              </div>
            </div>

            {/* Goal */}
            {challenge.goalTarget && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-display font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Goal
                  </h3>
                  <p className="text-muted-foreground">{challenge.goalTarget}</p>
                </div>
              </>
            )}

            {/* Meta info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Started: {format(new Date(challenge.startDate), 'PPP')}</p>
              <p>Difficulty: {challenge.difficulty}</p>
            </div>

            {/* Delete action */}
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (confirm('Are you sure you want to delete this challenge?')) {
                  onDelete(challenge.id);
                  onOpenChange(false);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Challenge
            </Button>
          </div>
        </ScrollArea>

        {/* Fixed bottom action */}
        <div className="p-6 border-t bg-background">
          <Button
            onClick={onCheckIn}
            disabled={checkedIn}
            className="w-full bg-gradient-fire hover:opacity-90 font-semibold"
            size="lg"
          >
            {checkedIn ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Checked in today!
              </>
            ) : (
              <>
                🔥 Check In Now
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
