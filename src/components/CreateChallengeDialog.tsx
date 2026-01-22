import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ChallengeCategory, ChallengeDifficulty, CATEGORY_CONFIG } from '@/types/challenge';
import { CalendarIcon, Flame } from 'lucide-react';
import { format } from 'date-fns';

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    name: string;
    category: ChallengeCategory;
    description?: string;
    goalTarget?: string;
    difficulty: ChallengeDifficulty;
    startDate: string;
  }) => void;
}

export function CreateChallengeDialog({ open, onOpenChange, onCreate }: CreateChallengeDialogProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ChallengeCategory>('coding');
  const [description, setDescription] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>('medium');
  const [startDate, setStartDate] = useState<Date>(new Date());

  const handleCreate = () => {
    onCreate({
      name,
      category,
      description: description || undefined,
      goalTarget: goalTarget || undefined,
      difficulty,
      startDate: startDate.toISOString(),
    });
    // Reset form
    setStep(1);
    setName('');
    setCategory('coding');
    setDescription('');
    setGoalTarget('');
    setDifficulty('medium');
    setStartDate(new Date());
    onOpenChange(false);
  };

  const categories = Object.entries(CATEGORY_CONFIG) as [ChallengeCategory, typeof CATEGORY_CONFIG[ChallengeCategory]][];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Flame className="w-5 h-5 text-primary" />
            Start a New Challenge
          </DialogTitle>
          <DialogDescription>
            Step {step} of 2 • {step === 1 ? 'Basic Info' : 'Details & Start'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 pt-4"
            >
              {/* Challenge Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Challenge Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., 100 Days of Coding"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-base"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <Label>Category</Label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                        category === key 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <span className="text-2xl">{config.emoji}</span>
                      <span className="text-xs font-medium">{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)} 
                disabled={!name.trim()}
                className="w-full bg-gradient-fire hover:opacity-90"
              >
                Continue
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pt-4"
            >
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What will you do each day?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>

              {/* Goal Target */}
              <div className="space-y-2">
                <Label htmlFor="goal">Goal Target (Optional)</Label>
                <Input
                  id="goal"
                  placeholder="e.g., Solve 100 LeetCode problems"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <Label>Difficulty Level</Label>
                <RadioGroup value={difficulty} onValueChange={(v) => setDifficulty(v as ChallengeDifficulty)} className="flex gap-4">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <div key={d} className="flex items-center space-x-2">
                      <RadioGroupItem value={d} id={d} />
                      <Label htmlFor={d} className="capitalize cursor-pointer">{d}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(d) => d && setStartDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleCreate} 
                  className="flex-1 bg-gradient-fire hover:opacity-90"
                >
                  🔥 Start Challenge
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
