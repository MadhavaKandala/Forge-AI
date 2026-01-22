import { useState, forwardRef } from 'react';
import { Challenge, ChallengeCategory, CATEGORY_CONFIG, MOOD_CONFIG } from '@/types/challenge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { CategoryCheckInData } from './types';
import { cn } from '@/lib/utils';
import { 
  Link as LinkIcon, 
  Sparkles,
  FileText,
  Star,
} from 'lucide-react';

interface GenericCheckInFormProps {
  onSubmit: (data: CategoryCheckInData) => void;
  challenge: Challenge;
  category: ChallengeCategory;
}

// Category-specific prompts
const CATEGORY_PROMPTS: Record<ChallengeCategory, {
  activityLabel: string;
  activityPlaceholder: string;
  timeLabel?: string;
  notesPrompt: string;
}> = {
  reading: {
    activityLabel: 'What did you read?',
    activityPlaceholder: 'Book title, chapter, or pages...',
    timeLabel: 'Pages Read',
    notesPrompt: 'Key insights or favorite quotes...',
  },
  learning: {
    activityLabel: 'What did you learn?',
    activityPlaceholder: 'Topic, course, or concept...',
    timeLabel: 'Minutes Spent',
    notesPrompt: 'Key takeaways or resources used...',
  },
  productivity: {
    activityLabel: 'What did you accomplish?',
    activityPlaceholder: 'Tasks completed, goals achieved...',
    timeLabel: 'Focus Time (minutes)',
    notesPrompt: 'Productivity wins or improvements...',
  },
  creativity: {
    activityLabel: 'What did you create?',
    activityPlaceholder: 'Drawing, writing, music...',
    timeLabel: 'Time Spent (minutes)',
    notesPrompt: 'Inspiration or creative process notes...',
  },
  health: {
    activityLabel: 'Health activity today?',
    activityPlaceholder: 'Meditation, healthy eating, sleep...',
    timeLabel: 'Duration (minutes)',
    notesPrompt: 'How did it make you feel?',
  },
  coding: {
    activityLabel: 'What did you code?',
    activityPlaceholder: 'Project, problem, or feature...',
    timeLabel: 'Hours Coded',
    notesPrompt: 'What did you learn or accomplish?',
  },
  fitness: {
    activityLabel: 'Workout completed?',
    activityPlaceholder: 'Type of exercise...',
    timeLabel: 'Duration (minutes)',
    notesPrompt: 'How do you feel after?',
  },
  other: {
    activityLabel: 'Activity completed',
    activityPlaceholder: 'Describe what you did...',
    timeLabel: 'Time Spent (minutes)',
    notesPrompt: 'Additional notes...',
  },
};

export const GenericCheckInForm = forwardRef<HTMLDivElement, GenericCheckInFormProps>(
  function GenericCheckInForm({ onSubmit, challenge, category }, ref) {
    const [activityDescription, setActivityDescription] = useState('');
    const [timeSpent, setTimeSpent] = useState(30);
    const [satisfaction, setSatisfaction] = useState<1 | 2 | 3 | 4 | 5>(4);
    const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'struggling'>('good');
    const [link, setLink] = useState('');
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const prompts = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.other;
    const categoryConfig = CATEGORY_CONFIG[category];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!activityDescription.trim()) {
      newErrors.activity = 'Please describe your activity';
    }

    if (link && !isValidUrl(link)) {
      newErrors.link = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data: CategoryCheckInData = {
      date: new Date().toISOString().split('T')[0],
      notes,
      link: link || undefined,
      mood,
      genericData: {
        activityDescription,
        timeSpentMinutes: timeSpent,
        satisfaction,
      },
    };

    onSubmit(data);
  };

    return (
      <div ref={ref} className="space-y-6">
        {/* Category Header */}
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${categoryConfig.color}15` }}>
            {categoryConfig.emoji}
          </div>
          <div>
            <p className="font-semibold">{categoryConfig.label} Check-In</p>
            <p className="text-xs text-muted-foreground">{categoryConfig.tips[0]}</p>
          </div>
        </div>

        {/* Activity Description */}
        <div className="space-y-2">
          <Label htmlFor="activity" className="flex items-center gap-2 text-sm font-medium">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            {prompts.activityLabel}
          </Label>
          <Textarea
            id="activity"
            placeholder={prompts.activityPlaceholder}
            value={activityDescription}
            onChange={(e) => setActivityDescription(e.target.value)}
            className={cn(
              'resize-none glass border-border/50',
              errors.activity && 'border-destructive'
            )}
            rows={2}
          />
          {errors.activity && (
            <p className="text-sm text-destructive">{errors.activity}</p>
          )}
        </div>

        {/* Time Spent */}
        {prompts.timeLabel && (
          <div className="glass-card p-4 space-y-3">
            <Label className="flex items-center justify-between">
              <span className="text-sm font-medium">{prompts.timeLabel}</span>
              <span className="text-2xl font-bold stat-number text-gradient-flame">{timeSpent}</span>
            </Label>
            <Slider
              value={[timeSpent]}
              onValueChange={(v) => setTimeSpent(v[0])}
              min={5}
              max={180}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>1 hour</span>
              <span>3 hours</span>
            </div>
          </div>
        )}

        {/* Satisfaction Rating */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Star className="w-4 h-4 text-amber-500" />
            How satisfied are you?
          </Label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setSatisfaction(rating)}
                className={cn(
                  'flex-1 p-3 rounded-xl border-2 text-center transition-all duration-200',
                  satisfaction >= rating
                    ? 'border-amber-500 bg-amber-500/10 scale-105'
                    : 'glass border-border/50 hover:border-amber-500/30'
                )}
              >
                <span className="text-xl">
                  {satisfaction >= rating ? '⭐' : '☆'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">How are you feeling?</Label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(MOOD_CONFIG) as [keyof typeof MOOD_CONFIG, typeof MOOD_CONFIG.great][]).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMood(key)}
                className={cn(
                  'p-3 rounded-xl border-2 text-center transition-all duration-200',
                  mood === key
                    ? 'border-primary bg-primary/10 scale-105 shadow-md'
                    : 'glass border-border/50 hover:border-primary/30'
                )}
              >
                <span className="text-2xl block mb-1">{config.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{config.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Link */}
        <div className="space-y-2">
          <Label htmlFor="link" className="flex items-center gap-2 text-sm font-medium">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <LinkIcon className="w-4 h-4" />
            </div>
            Add a Link
          </Label>
          <Input
            id="link"
            type="url"
            placeholder="https://..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={cn(
              'h-11 glass border-border/50',
              errors.link && 'border-destructive'
            )}
          />
          {errors.link && (
            <p className="text-sm text-destructive">{errors.link}</p>
          )}
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder={prompts.notesPrompt}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none glass border-border/50"
            rows={2}
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          className="w-full bg-gradient-flame hover:opacity-90 font-semibold h-14 text-base shadow-glow rounded-xl"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Complete Check-In
        </Button>
      </div>
    );
  }
);
