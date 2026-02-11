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
import { Challenge, ChallengeCategory } from '@/types/challenge';
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
  const { getProgress, getStreak } = useChallenges();

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
          progress: 15, // Minimum visual for empty state to show the shape
          realProgress: 0,
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
        progress: Math.max(15, avgProgress), // Ensure at least small visual
        realProgress: avgProgress,
        xp,
        streak: maxStreak,
        fullMark: 100,
      };
    });
  }, [challenges, getProgress, getStreak]);

  // Calculate total level and XP
  const totalStats = useMemo(() => {
    const totalXP = radarData.reduce((sum, d) => sum + d.xp, 0);
    const totalLevel = Math.min(99, Math.floor(totalXP / 1000) + 1);
    const xpToNext = (totalLevel * 1000) - totalXP;

    return {
      totalXP,
      totalLevel,
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
          className="glass-card p-4 min-w-[180px] backdrop-blur-xl border border-white/10"
          style={{
            borderColor: `${data.color}50`,
            boxShadow: `0 0 20px ${data.color}20`
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
              <span className="text-muted-foreground">Level</span>
              <span className="font-mono font-bold text-foreground">{data.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono text-foreground">{data.realProgress}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">XP</span>
              <span className="font-mono text-foreground">{data.xp.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Streak</span>
              <span className="font-mono text-foreground">🔥 {data.streak}d</span>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center py-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Ambient glow background */}
      <div className="absolute inset-0 -z-10 select-none pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-neon-cyan/5 blur-[80px] animate-pulse-slow" />
      </div>

      {/* Radar Chart */}
      <div className="w-full h-[300px] md:h-[400px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.15}
              gridType="polygon"
            />
            <PolarAngleAxis
              dataKey="label"
              tick={({ x, y, payload, index }) => {
                const data = radarData[index];
                // Adjust label position to avoid overlap with graph
                return (
                  <g
                    transform={`translate(${x},${y})`}
                    className="cursor-pointer group"
                    onClick={() => onAxisClick?.(data.category)}
                  >
                    <text
                      x={0}
                      y={0}
                      dy={y > 150 ? 15 : -5} // Dynamic vertical offset based on position
                      textAnchor={x > 200 ? 'start' : x < 100 ? 'end' : 'middle'}
                      fill={data.color}
                      fontSize={11} // Smaller font on mobile default
                      fontWeight={600}
                      className="md:text-[13px] transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" // Add glow on hover
                    >
                      {payload.value}
                    </text>
                    <text
                      x={0}
                      y={0}
                      dy={y > 150 ? 28 : 8}
                      textAnchor={x > 200 ? 'start' : x < 100 ? 'end' : 'middle'}
                      fill="hsl(var(--muted-foreground))"
                      fontSize={9}
                      className="md:text-[10px] opacity-70"
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

            {/* Background "Potential" Shape */}
            <Radar
              name="Potential"
              dataKey="fullMark"
              stroke="transparent"
              fill="hsl(var(--muted))"
              fillOpacity={0.05}
            />

            {/* Actual Progress Shape */}
            <Radar
              name="Progress"
              dataKey="progress"
              stroke="hsl(var(--neon-cyan))"
              strokeWidth={2.5}
              fill="url(#radarGradient)"
              fillOpacity={0.4}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
              dot={({ cx, cy, payload }) => (
                <motion.circle
                  key={payload.label}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={payload.color}
                  stroke="white"
                  strokeWidth={1.5}
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    delay: 0.5,
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  style={{
                    filter: `drop-shadow(0 0 6px ${payload.color})`,
                  }}
                />
              )}
            />
            <Tooltip
              cursor={false}
              content={<CustomTooltip />}
              wrapperStyle={{ outline: 'none' }}
            />
            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--neon-cyan))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--neon-purple))" stopOpacity={0.05} />
              </radialGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>

        {/* Center Level Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-background/50 backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.2)]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
          >
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">Level</span>
            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-white to-white/70">
              {totalStats.totalLevel}
            </span>
            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden mt-1.5">
              <motion.div
                className="h-full bg-gradient-neon"
                initial={{ width: 0 }}
                animate={{ width: `${totalStats.xpProgress}%` }}
                transition={{ delay: 1, duration: 0.8 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
