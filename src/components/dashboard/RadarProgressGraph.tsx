import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Challenge, CATEGORY_CONFIG, ChallengeCategory } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';

interface RadarProgressGraphProps {
  challenges: Challenge[];
  onAxisClick?: (category: ChallengeCategory) => void;
}

// Map categories to radar axes
const RADAR_CATEGORIES: { category: ChallengeCategory; label: string; color: string }[] = [
  { category: 'coding', label: 'Code', color: '#00D9FF' },
  { category: 'fitness', label: 'Fitness', color: '#FF1654' },
  { category: 'reading', label: 'Reading', color: '#A78BFA' },
  { category: 'creativity', label: 'Writing', color: '#FCD34D' },
  { category: 'learning', label: 'Learning', color: '#10B981' },
];

export function RadarProgressGraph({ challenges, onAxisClick }: RadarProgressGraphProps) {
  const { getProgress, getStreak, getBestStreak } = useChallenges();

  // Calculate data for each category
  const radarData = useMemo(() => {
    return RADAR_CATEGORIES.map(({ category, label, color }) => {
      const categoryChallenges = challenges.filter(c => c.category === category);
      
      if (categoryChallenges.length === 0) {
        return {
          category,
          label,
          color,
          level: 0,
          progress: 0,
          xp: 0,
          streak: 0,
          fullMark: 100,
        };
      }

      // Calculate aggregate stats
      const totalProgress = categoryChallenges.reduce((sum, c) => sum + getProgress(c), 0);
      const avgProgress = Math.round(totalProgress / categoryChallenges.length);
      const maxStreak = Math.max(...categoryChallenges.map(c => getStreak(c)));
      const totalCheckIns = categoryChallenges.reduce((sum, c) => sum + c.checkIns.length, 0);
      
      // Calculate level (1-10 based on progress)
      const level = Math.min(10, Math.floor(avgProgress / 10) + 1);
      
      // XP is total check-ins * 50
      const xp = totalCheckIns * 50;

      return {
        category,
        label,
        color,
        level,
        progress: avgProgress,
        xp,
        streak: maxStreak,
        fullMark: 100,
      };
    });
  }, [challenges, getProgress, getStreak]);

  // Calculate total level and XP
  const totalStats = useMemo(() => {
    const totalXP = radarData.reduce((sum, d) => sum + d.xp, 0);
    const avgProgress = Math.round(radarData.reduce((sum, d) => sum + d.progress, 0) / radarData.length);
    const totalLevel = Math.min(99, Math.floor(totalXP / 1000) + 1);
    const xpToNext = (totalLevel * 1000) - totalXP;
    
    return {
      totalXP,
      totalLevel,
      avgProgress,
      xpToNext: Math.max(0, xpToNext),
      xpProgress: ((totalXP % 1000) / 1000) * 100,
    };
  }, [radarData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-4 min-w-[180px]"
          style={{ 
            borderColor: `${data.color}50`,
            boxShadow: `0 0 20px ${data.color}30`
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color, boxShadow: `0 0 10px ${data.color}` }}
            />
            <span className="font-bold" style={{ color: data.color }}>{data.label}</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Level</span>
              <span className="font-mono font-bold">{data.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Progress</span>
              <span className="font-mono">{data.progress}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">XP</span>
              <span className="font-mono">{data.xp.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Streak</span>
              <span className="font-mono">🔥 {data.streak}d</span>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.34, 1.3, 0.64, 1] }}
    >
      {/* Ambient glow background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-neon-cyan/10 blur-[100px] animate-glow-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-neon-purple/10 blur-[80px] animate-glow-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Radar Chart */}
      <div className="h-[320px] md:h-[400px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid 
              stroke="hsl(var(--radar-grid))"
              strokeOpacity={0.3}
              gridType="polygon"
            />
            <PolarAngleAxis 
              dataKey="label"
              tick={({ x, y, payload, index }) => {
                const data = radarData[index];
                return (
                  <g 
                    transform={`translate(${x},${y})`}
                    className="cursor-pointer"
                    onClick={() => onAxisClick?.(data.category)}
                  >
                    <text
                      x={0}
                      y={0}
                      textAnchor="middle"
                      fill={data.color}
                      fontSize={12}
                      fontWeight={600}
                      style={{ 
                        textShadow: `0 0 10px ${data.color}80`,
                        filter: 'drop-shadow(0 0 4px currentColor)'
                      }}
                    >
                      {payload.value}
                    </text>
                    <text
                      x={0}
                      y={14}
                      textAnchor="middle"
                      fill="hsl(var(--foreground-tertiary))"
                      fontSize={10}
                    >
                      Lv.{data.level}
                    </text>
                  </g>
                );
              }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Progress"
              dataKey="progress"
              stroke="hsl(var(--neon-cyan))"
              strokeWidth={3}
              fill="url(#radarGradient)"
              fillOpacity={0.3}
              dot={({ cx, cy, payload }) => (
                <motion.circle
                  key={payload.label}
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill={payload.color}
                  stroke={payload.color}
                  strokeWidth={2}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  style={{
                    filter: `drop-shadow(0 0 8px ${payload.color})`,
                  }}
                />
              )}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--neon-cyan))" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(var(--neon-purple))" stopOpacity={0.1} />
              </radialGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>

        {/* Center Level Badge */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
        >
          <div className="glass-card p-4 rounded-2xl glow-cyan">
            <div className="level-badge-lg mb-1">
              LEVEL {totalStats.totalLevel}
            </div>
            <p className="text-xs text-foreground-tertiary font-mono">
              {totalStats.totalXP.toLocaleString()} XP
            </p>
            <div className="mt-2 w-20 h-1.5 bg-muted rounded-full overflow-hidden mx-auto">
              <motion.div
                className="h-full bg-gradient-neon"
                initial={{ width: 0 }}
                animate={{ width: `${totalStats.xpProgress}%` }}
                transition={{ delay: 1, duration: 0.8 }}
              />
            </div>
            <p className="text-[10px] text-foreground-muted mt-1">
              {totalStats.xpToNext} XP to next
            </p>
          </div>
        </motion.div>
      </div>

      {/* Continuous glow ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[350px] md:h-[350px] rounded-full border-2 border-neon-cyan/20 -z-10"
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
