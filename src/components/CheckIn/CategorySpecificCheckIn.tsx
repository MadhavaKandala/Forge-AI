import { useState } from 'react';
import { motion } from 'framer-motion';
import { Challenge, ACHIEVEMENTS, CATEGORY_CONFIG, MOOD_CONFIG } from '@/types/challenge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CodeCheckInForm } from './CodeCheckInForm';
import { FitnessCheckInForm } from './FitnessCheckInForm';
import { GenericCheckInForm } from './GenericCheckInForm';
import { CategoryCheckInData, categoryDataToCheckIn } from './types';
import { Check, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface CategorySpecificCheckInProps {
  challenge: Challenge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckIn: (notes?: string, link?: string, date?: string) => void;
}

export function CategorySpecificCheckIn({
  challenge,
  open,
  onOpenChange,
  onCheckIn,
}: CategorySpecificCheckInProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showSuccess, setShowSuccess] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<typeof ACHIEVEMENTS[number] | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!challenge) return null;

  const categoryConfig = CATEGORY_CONFIG[challenge.category];
  const isRetroactive = !isToday(selectedDate);
  const existingCheckIn = challenge.checkIns.find(
    ci => ci.date === format(selectedDate, 'yyyy-MM-dd')
  );

  // Check if date is valid (not in future, not before challenge start)
  const challengeStartDate = startOfDay(new Date(challenge.startDate));
  const today = startOfDay(new Date());
  const isDateValid = !isBefore(today, selectedDate) && !isBefore(selectedDate, challengeStartDate);

  const handleSubmit = (data: CategoryCheckInData) => {
    // Reset validation error
    setValidationError(null);

    // Validate date
    if (!isDateValid) {
      setValidationError('Please select a valid date within your challenge period.');
      return;
    }

    // Check for duplicate check-in
    if (existingCheckIn && !isRetroactive) {
      setValidationError('You have already checked in for this date.');
      return;
    }

    // Calculate day count for milestone check
    const newDayCount = challenge.checkIns.length + 1;
    const milestone = ACHIEVEMENTS.find(a => a.day === newDayCount);
    
    if (milestone) {
      setUnlockedAchievement(milestone);
    }

    // Convert category data to standard check-in format
    const checkInData = categoryDataToCheckIn({
      ...data,
      date: format(selectedDate, 'yyyy-MM-dd'),
      isRetroactive,
    });

    // Call the check-in handler
    onCheckIn(
      checkInData.notes,
      checkInData.link,
      format(selectedDate, 'yyyy-MM-dd')
    );

    setShowSuccess(true);

    // Reset after showing success
    setTimeout(() => {
      setShowSuccess(false);
      setUnlockedAchievement(null);
      setSelectedDate(new Date());
      onOpenChange(false);
    }, milestone ? 3000 : 1500);
  };

  // Success state
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
            <h2 className="text-2xl font-display font-bold">
              {isRetroactive ? 'Retroactive Check-in Saved!' : `Day ${challenge.checkIns.length + 1} Complete!`}
            </h2>
            <p className="text-muted-foreground">
              {isRetroactive 
                ? `Added check-in for ${format(selectedDate, 'MMM d, yyyy')}`
                : 'Keep the streak going! 🔥'
              }
            </p>
            
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

  // Render appropriate form based on category
  const renderCategoryForm = () => {
    switch (challenge.category) {
      case 'coding':
        return <CodeCheckInForm onSubmit={handleSubmit} challenge={challenge} />;
      case 'fitness':
        return <FitnessCheckInForm onSubmit={handleSubmit} challenge={challenge} />;
      default:
        return <GenericCheckInForm onSubmit={handleSubmit} challenge={challenge} category={challenge.category} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto glass-card border-border/50">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${categoryConfig.color}15` }}
            >
              {categoryConfig.emoji}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {categoryConfig.label} Check-In
              </DialogTitle>
              <DialogDescription className="text-sm">
                Day {challenge.checkIns.length + 1} of {challenge.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Date Picker for Retroactive Check-ins */}
          <div className="flex items-center justify-between p-4 rounded-xl glass border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <span className="text-sm font-medium">Check-in Date</span>
                {isRetroactive && (
                  <p className="text-xs text-muted-foreground">Retroactive entry</p>
                )}
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 glass border-border/50">
                  {format(selectedDate, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-card" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => 
                    isBefore(today, startOfDay(date)) || 
                    isBefore(startOfDay(date), challengeStartDate)
                  }
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Existing Check-in Warning */}
          {existingCheckIn && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-sm text-amber-600 dark:text-amber-400">
                You already have a check-in for this date. New submission will update it.
              </span>
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <span className="text-sm text-destructive">{validationError}</span>
            </div>
          )}

          {/* Category-Specific Form */}
          {renderCategoryForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
