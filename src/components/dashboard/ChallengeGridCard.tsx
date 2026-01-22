import { motion } from 'framer-motion';
import { Challenge, CATEGORY_CONFIG } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Flame, Trophy, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChallengeGridCardProps {
  challenge: Challenge;
  onViewDetails: () => void;
  onQuickCheckIn: () => void;
  index?: number;
}

export function ChallengeGridCard({
  challenge,
  onViewDetails,
  onQuickCheckIn,
  index = 0,
}: ChallengeGridCardProps) {
  const { getStreak, getProgress, getBestStreak, hasCheckedInToday } = useChallenges();
  
  const config = CATEGORY_CONFIG[challenge.category];
  const streak = getStreak(challenge);
  const progress = getProgress(challenge);
  const bestStreak = getBestStreak(challenge);
  const checkedIn = hasCheckedInToday(challenge.id);
  const isCompleted = challenge.status === 'completed';
  
  // Calculate consistency
  const daysSinceStart = Math.max(1, Math.ceil(
    (Date.now() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const consistency = Math.round((challenge.checkIns.length / daysSinceStart) * 100);

  // Get average mood
  const moods = challenge.checkIns.filter(ci => ci.mood).map(ci => ci.mood);
  const moodLabels = { great: '🤩', good: '😊', okay: '😐', struggling: '😔' };
  const avgMood = moods.length > 0 
    ? moodLabels[moods[moods.length - 1] as keyof typeof moodLabels] || '😊'
    : null;

  return (
    <motion.div
      className={cn(
        'glass-card p-4 md:p-5 border-2 transition-all group cursor-pointer',
        'hover-lift',
        challenge.category === 'coding' && 'border-neon-cyan/30 hover:glow-cyan',
        challenge.category === 'fitness' && 'border-neon-pink/30 hover:glow-pink',
        challenge.category === 'reading' && 'border-neon-purple/30 hover:glow-purple',
        challenge.category === 'creativity' && 'border-neon-gold/30 hover:glow-gold',
        challenge.category === 'learning' && 'border-neon-emerald/30 hover:glow-emerald',
        !['coding', 'fitness', 'reading', 'creativity', 'learning'].includes(challenge.category) && 'border-neon-cyan/30 hover:glow-cyan'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.4, 
        ease: [0.34, 1.56, 0.64, 1] 
      }}
      onClick={onViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="text-3xl"
            animate={streak >= 7 ? { 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0]
            } : undefined}
            transition={{ duration: 0.5, repeat: streak >= 7 ? Infinity : 0, repeatDelay: 2 }}
          >
            {config.emoji}
          </motion.div>
          <div>
            <h3 className="font-bold text-sm md:text-base truncate max-w-[180px]">
              {challenge.name}
            </h3>
            <p className="text-xs text-foreground-tertiary">
              Day {challenge.checkIns.length}/100
            </p>
          </div>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1 px-2 py-1 bg-neon-gold/10 rounded-full">
            <Trophy className="w-3.5 h-3.5 text-neon-gold" />
            <span className="text-xs font-semibold text-neon-gold">Complete</span>
          </div>
        )}
      </div>

      {/* Streak Badge */}
      {streak > 0 && (
        <motion.div 
          className="mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
        >
          <span className="streak-badge">
            <Flame className="w-3.5 h-3.5 animate-flame-flicker" />
            {streak}-day streak
          </span>
        </motion.div>
      )}

      {/* Progress Ring */}
      <div className="flex justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              stroke={config.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={264}
              initial={{ strokeDashoffset: 264 }}
              animate={{ strokeDashoffset: 264 - (264 * progress / 100) }}
              transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: 'easeOut' }}
              style={{
                filter: `drop-shadow(0 0 6px ${config.color})`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              className="stat-number text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              {progress}%
            </motion.span>
            <span className="text-[10px] text-foreground-muted">Day {challenge.checkIns.length}</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="flex justify-between text-xs text-foreground-tertiary mb-4 px-2">
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          <span>Best: {bestStreak}d</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{consistency}%</span>
        </div>
        {avgMood && (
          <div className="flex items-center gap-1">
            <span>Mood:</span>
            <span>{avgMood}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs glass-card border-0 hover:bg-muted"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
        >
          View Details
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
        {!isCompleted && (
          <Button
            size="sm"
            className={cn(
              'flex-1 text-xs font-semibold',
              checkedIn 
                ? 'bg-muted text-foreground-muted cursor-not-allowed'
                : 'bg-gradient-neon text-background hover:opacity-90 glow-cyan'
            )}
            disabled={checkedIn}
            onClick={(e) => {
              e.stopPropagation();
              if (!checkedIn) onQuickCheckIn();
            }}
          >
            {checkedIn ? '✓ Done' : 'Check In'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
