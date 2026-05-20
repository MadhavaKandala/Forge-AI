import { motion } from 'framer-motion';
import { Medal, TrendingUp, Flame, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatarUrl?: string;
  days: number;
  totalDays: number;
  streak: number;
  consistency: number;
  isCurrentUser?: boolean;
}

interface LeaderboardPeekProps {
  users: LeaderboardUser[];
  onViewFull?: () => void;
}

const rankIcons: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export function LeaderboardPeek({ users, onViewFull }: LeaderboardPeekProps) {
  return (
    <motion.div
      className="glass-card p-4 md:p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-neon-gold" />
          <h3 className="font-bold">Leaderboard</h3>
          <span className="text-xs text-foreground-muted">(This Week)</span>
        </div>
        <button
          onClick={onViewFull}
          className="text-xs text-neon-cyan hover:underline"
        >
          See Full Leaderboard →
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-foreground-muted border-b border-border">
              <th className="pb-2 font-medium">Rank</th>
              <th className="pb-2 font-medium">User</th>
              <th className="pb-2 font-medium text-right">Days</th>
              <th className="pb-2 font-medium text-right">Streak</th>
              <th className="pb-2 font-medium text-right hidden sm:table-cell">Consistency</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr
                key={user.rank}
                className={cn(
                  'border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer',
                  user.isCurrentUser && 'bg-neon-cyan/5'
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
              >
                <td className="py-3 font-mono">
                  {rankIcons[user.rank] || user.rank}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                      user.isCurrentUser ? 'bg-gradient-neon text-background' : 'bg-muted'
                    )}>
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className={cn(
                      'font-medium truncate max-w-[100px]',
                      user.isCurrentUser && 'text-neon-cyan'
                    )}>
                      {user.isCurrentUser ? 'You' : user.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right font-mono">
                  {user.days}/{user.totalDays}
                </td>
                <td className="py-3 text-right">
                  <span className="inline-flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-streak-mid" />
                    <span className="font-mono">{user.streak}d</span>
                  </span>
                </td>
                <td className="py-3 text-right hidden sm:table-cell">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-neon-emerald rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${user.consistency}%` }}
                        transition={{ delay: 0.8 + index * 0.05, duration: 0.5 }}
                      />
                    </div>
                    <span className="font-mono text-xs w-8">{user.consistency}%</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
