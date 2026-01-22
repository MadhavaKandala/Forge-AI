import { useState } from 'react';
import { Challenge, ChallengeCategory, CATEGORY_CONFIG, MOOD_CONFIG } from '@/types/challenge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { CategoryCheckInData } from './types';
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

export function GenericCheckInForm({ onSubmit, challenge, category }: GenericCheckInFormProps) {
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
    <div className="space-y-5">
      {/* Category Header */}
      <div className="p-3 rounded-lg bg-muted/50 border flex items-center gap-3">
        <span className="text-2xl">{categoryConfig.emoji}</span>
        <div>
          <p className="font-medium">{categoryConfig.label} Check-In</p>
          <p className="text-xs text-muted-foreground">{categoryConfig.tips[0]}</p>
        </div>
      </div>

      {/* Activity Description */}
      <div className="space-y-2">
        <Label htmlFor="activity" className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          {prompts.activityLabel}
        </Label>
        <Textarea
          id="activity"
          placeholder={prompts.activityPlaceholder}
          value={activityDescription}
          onChange={(e) => setActivityDescription(e.target.value)}
          className={`resize-none ${errors.activity ? 'border-red-500' : ''}`}
          rows={2}
        />
        {errors.activity && (
          <p className="text-sm text-red-500">{errors.activity}</p>
        )}
      </div>

      {/* Time Spent */}
      {prompts.timeLabel && (
        <div className="space-y-3">
          <Label className="flex items-center justify-between">
            <span>{prompts.timeLabel}</span>
            <span className="text-lg font-bold text-primary">{timeSpent}</span>
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
        <Label className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          How satisfied are you?
        </Label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setSatisfaction(rating)}
              className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                satisfaction >= rating
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : 'border-border hover:bg-muted/50'
              }`}
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
        <Label>How are you feeling?</Label>
        <div className="flex gap-2">
          {(Object.entries(MOOD_CONFIG) as [keyof typeof MOOD_CONFIG, typeof MOOD_CONFIG.great][]).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMood(key)}
              className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                mood === key
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <span className="text-2xl block mb-1">{config.emoji}</span>
              <span className="text-xs">{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Link */}
      <div className="space-y-2">
        <Label htmlFor="link" className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          Add a Link (Optional)
        </Label>
        <Input
          id="link"
          type="url"
          placeholder="https://..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className={errors.link ? 'border-red-500' : ''}
        />
        {errors.link && (
          <p className="text-sm text-red-500">{errors.link}</p>
        )}
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder={prompts.notesPrompt}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="resize-none"
          rows={2}
        />
      </div>

      {/* Submit Button */}
      <Button 
        onClick={handleSubmit}
        className="w-full bg-gradient-fire hover:opacity-90 font-semibold h-12"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Complete Check-In
      </Button>
    </div>
  );
}
