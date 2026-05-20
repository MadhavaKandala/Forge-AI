import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Challenge } from '@/types/challenge';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

interface WeeklySparklineProps {
  challenges: Challenge[];
  className?: string;
  height?: number;
}

export function WeeklySparkline({ challenges, className, height = 40 }: WeeklySparklineProps) {
  const weekData = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLabel = format(date, 'EEE').charAt(0);
      const isToday = i === 0;

      // Count how many challenges were checked in on this day
      let checkedIn = 0;
      const total = challenges.filter(c => c.status === 'active').length;

      challenges.forEach(challenge => {
        challenge.checkIns.forEach(checkIn => {
          if (checkIn.date.startsWith(dateStr)) {
            checkedIn++;
          }
        });
      });

      const progress = total > 0 ? (checkedIn / total) * 100 : 0;

      days.push({
        date,
        dateStr,
        dayLabel,
        isToday,
        checkedIn,
        total,
        progress,
        isComplete: progress === 100 && total > 0,
        isEmpty: total === 0,
      });
    }

    return days;
  }, [challenges]);

  return (
    <div className={cn('flex items-end justify-between gap-1', className)}>
      {weekData.map((day, i) => (
        <div key={day.dateStr} className="flex flex-col items-center gap-1 flex-1">
          {/* Bar */}
          <div
            className="relative w-full flex items-end justify-center"
            style={{ height }}
          >
            <motion.div
              className={cn(
                'w-full max-w-[20px] rounded-t-md transition-colors',
                day.isComplete && 'bg-secondary',
                !day.isComplete && day.progress > 0 && 'bg-primary/60',
                day.progress === 0 && !day.isEmpty && 'bg-muted',
                day.isEmpty && 'bg-muted/50',
                day.isToday && !day.isComplete && day.progress < 100 && 'animate-pulse',
              )}
              initial={{ height: 0 }}
              animate={{ height: day.isEmpty ? height * 0.1 : Math.max(height * 0.1, (day.progress / 100) * height) }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
            />
            {/* Today indicator */}
            {day.isToday && !day.isComplete && (
              <motion.div
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>

          {/* Day label */}
          <span className={cn(
            'text-[10px]',
            day.isToday ? 'text-primary font-semibold' : 'text-muted-foreground'
          )}>
            {day.dayLabel}
          </span>
        </div>
      ))}
    </div>
  );
}
