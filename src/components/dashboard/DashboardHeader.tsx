import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, Flame, Zap, Trophy } from 'lucide-react';

interface DashboardHeaderProps {
  userName?: string;
  level: number;
  streak: number;
  xp: number;
  avatarUrl?: string;
  onSettingsClick?: () => void;
}

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return { text: 'Good Morning', emoji: '☀️' };
  if (hour >= 12 && hour < 18) return { text: 'Good Afternoon', emoji: '🌤️' };
  if (hour >= 18 && hour < 21) return { text: 'Good Evening', emoji: '🌆' };
  return { text: 'Night Owl Mode', emoji: '🌙' };
}

export function DashboardHeader({
  userName = 'Challenger',
  level,
  streak,
  xp,
  avatarUrl,
  onSettingsClick,
}: DashboardHeaderProps) {
  const greeting = getGreeting();

  return (
    <motion.header
      className="sticky top-0 z-50 glass-nav pt-safe"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Avatar + Greeting */}
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar className="w-10 h-10 border-2 border-neon-cyan/30 glow-cyan">
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback className="bg-gradient-neon text-background font-bold">
                  {userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-neon-emerald rounded-full border-2 border-background" />
            </motion.div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-foreground-tertiary text-sm">
                  {greeting.emoji} {greeting.text},
                </span>
                <span className="font-semibold">{userName}!</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                {/* Streak */}
                {streak > 0 && (
                  <motion.span 
                    className="streak-badge text-xs"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <Flame className="w-3.5 h-3.5 animate-flame-flicker" />
                    {streak}-day streak
                  </motion.span>
                )}
                {/* Level */}
                <motion.span 
                  className="level-badge text-xs"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <Trophy className="w-3 h-3 inline mr-1" />
                  Level {level}
                </motion.span>
              </div>
            </div>
          </div>

          {/* Right: XP + Settings */}
          <div className="flex items-center gap-3">
            {/* XP Display (desktop only) */}
            <motion.div 
              className="hidden md:flex items-center gap-2 glass-card px-3 py-1.5 rounded-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Zap className="w-4 h-4 text-neon-gold" />
              <span className="text-sm font-mono font-semibold">
                {xp.toLocaleString()} XP
              </span>
            </motion.div>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="glass-card w-10 h-10 rounded-full hover:glow-cyan"
              onClick={onSettingsClick}
            >
              <Settings className="w-5 h-5 text-foreground-tertiary" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
