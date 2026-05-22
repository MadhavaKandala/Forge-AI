import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Challenge } from '@/types/challenge';
import { format, subDays, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapCalendarProps {
  challenge: Challenge;
  weeks?: number;
  className?: string;
}

export function HeatmapCalendar({ challenge, weeks = 12, className }: HeatmapCalendarProps) {
  const checkInsMap = useMemo(() => {
    return new Map(challenge.checkIns.map(ci => [ci.date, ci]));
  }, [challenge.checkIns]);

  const calendarData = useMemo(() => {
    const today = new Date();
    const startDate = startOfWeek(subDays(today, (weeks - 1) * 7));
    const days: Date[] = [];
    
    for (let i = 0; i < weeks * 7; i++) {
      days.push(addDays(startDate, i));
    }
    
    return days;
  }, [weeks]);

  const getIntensity = (date: Date): 0 | 1 | 2 | 3 | 4 => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const checkIn = checkInsMap.get(dateStr);
    
    if (!checkIn) return 0;
    if (checkIn.notes && checkIn.link) return 4;
    if (checkIn.notes || checkIn.link) return 3;
    return 2;
  };

  const intensityColors = {
    0: 'bg-heatmap-empty',
    1: 'bg-heatmap-light',
    2: 'bg-heatmap-medium',
    3: 'bg-heatmap-dark',
    4: 'bg-heatmap-max',
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-1">
        {/* Week day labels */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground pr-2">
          {weekDays.map((day, i) => (
            <div key={day} className="h-3 flex items-center">
              {i % 2 === 1 && <span>{day}</span>}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="flex gap-1">
          {Array.from({ length: weeks }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayOffset = weekIndex * 7 + dayIndex;
                const date = calendarData[dayOffset];
                if (!date) return null;
                
                const intensity = getIntensity(date);
                const checkIn = checkInsMap.get(format(date, 'yyyy-MM-dd'));
                const isToday = isSameDay(date, new Date());
                const isFuture = date > new Date();

                return (
                  <Tooltip key={dayIndex}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: dayOffset * 0.005 }}
                        className={cn(
                          'w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
                          intensityColors[intensity],
                          isToday && 'ring-2 ring-primary',
                          isFuture && 'opacity-30'
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">{format(date, 'EEEE, MMM d, yyyy')}</p>
                        {checkIn ? (
                          <>
                            <p className="text-secondary font-medium">✓ Checked in</p>
                            {checkIn.notes && (
                              <p className="text-sm text-muted-foreground">{checkIn.notes}</p>
                            )}
                          </>
                        ) : (
                          <p className="text-muted-foreground">No check-in</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={cn('w-3 h-3 rounded-sm', intensityColors[i as 0|1|2|3|4])} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
