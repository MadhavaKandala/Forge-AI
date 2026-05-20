import { useState, forwardRef } from 'react';
import { Challenge, MOOD_CONFIG } from '@/types/challenge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CategoryCheckInData, CODE_LANGUAGES } from './types';
import { cn } from '@/lib/utils';
import { 
  Code, 
  Clock, 
  Github, 
  AlertTriangle, 
  Target,
  Sparkles,
} from 'lucide-react';

interface CodeCheckInFormProps {
  onSubmit: (data: CategoryCheckInData) => void;
  challenge: Challenge;
}

export const CodeCheckInForm = forwardRef<HTMLDivElement, CodeCheckInFormProps>(
  function CodeCheckInForm({ onSubmit, challenge }, ref) {
    const [hoursCoded, setHoursCoded] = useState(1);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [commitLink, setCommitLink] = useState('');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'struggling'>('good');
    const [hadBlockers, setHadBlockers] = useState(false);
    const [blockerNotes, setBlockerNotes] = useState('');
    const [nextGoal, setNextGoal] = useState('');
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const toggleLanguage = (lang: string) => {
      setSelectedLanguages(prev => 
        prev.includes(lang) 
          ? prev.filter(l => l !== lang)
          : [...prev, lang]
      );
    };

    const validate = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (hoursCoded < 0 || hoursCoded > 24) {
        newErrors.hours = 'Hours must be between 0 and 24';
      }

      if (commitLink && !isValidUrl(commitLink)) {
        newErrors.commitLink = 'Please enter a valid URL';
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
        link: commitLink || undefined,
        mood,
        codeData: {
          hoursCoded,
          languages: selectedLanguages,
          difficulty,
          hadBlockers,
          blockerNotes: hadBlockers ? blockerNotes : undefined,
          nextGoal: nextGoal || undefined,
          commitLink: commitLink || undefined,
        },
      };

      onSubmit(data);
    };

    return (
      <div ref={ref} className="space-y-6">
        {/* Hours Coded Slider */}
        <div className="glass-card p-4 space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            Hours Coded Today
          </Label>
          <div className="px-1">
            <Slider
              value={[hoursCoded]}
              onValueChange={(v) => setHoursCoded(v[0])}
              min={0}
              max={12}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between mt-3 text-sm text-muted-foreground">
              <span>0h</span>
              <span className="font-bold text-foreground text-2xl stat-number bg-gradient-flame bg-clip-text text-transparent">
                {hoursCoded}h
              </span>
              <span>12h</span>
            </div>
          </div>
          {errors.hours && (
            <p className="text-sm text-destructive">{errors.hours}</p>
          )}
        </div>

        {/* Languages Used */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Code className="w-4 h-4 text-secondary" />
            </div>
            Languages Used
          </Label>
          <div className="flex flex-wrap gap-2">
            {CODE_LANGUAGES.slice(0, 12).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-full border transition-all duration-200',
                  selectedLanguages.includes(lang)
                    ? 'bg-primary text-primary-foreground border-primary shadow-glow scale-105'
                    : 'glass hover:bg-muted/80 border-border/50 hover:border-primary/30'
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* GitHub Commit Link */}
        <div className="space-y-2">
          <Label htmlFor="commitLink" className="flex items-center gap-2 text-sm font-medium">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Github className="w-4 h-4" />
            </div>
            GitHub Commit / PR Link
          </Label>
          <Input
            id="commitLink"
            type="url"
            placeholder="https://github.com/..."
            value={commitLink}
            onChange={(e) => setCommitLink(e.target.value)}
            className={cn(
              'h-11 glass border-border/50 focus:border-primary/50',
              errors.commitLink && 'border-destructive'
            )}
          />
          {errors.commitLink && (
            <p className="text-sm text-destructive">{errors.commitLink}</p>
          )}
        </div>

        {/* Difficulty Level */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Problem Difficulty</Label>
          <RadioGroup
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}
            className="flex gap-2"
          >
            {[
              { value: 'easy', label: 'Easy', color: 'text-green-500 bg-green-500/10 border-green-500/30' },
              { value: 'medium', label: 'Medium', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30' },
              { value: 'hard', label: 'Hard', color: 'text-red-500 bg-red-500/10 border-red-500/30' },
            ].map((level) => (
              <div key={level.value} className="flex-1">
                <RadioGroupItem value={level.value} id={`diff-${level.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`diff-${level.value}`}
                  className={cn(
                    'flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all font-medium',
                    'peer-data-[state=checked]:scale-105 peer-data-[state=checked]:shadow-md',
                    difficulty === level.value ? level.color : 'glass border-border/50 hover:border-border'
                  )}
                >
                  {level.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Mood Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Mood After Coding</Label>
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

        {/* Blockers */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="blockers"
              checked={hadBlockers}
              onCheckedChange={(checked) => setHadBlockers(checked as boolean)}
              className="w-5 h-5"
            />
            <Label htmlFor="blockers" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Had any blockers?
            </Label>
          </div>
          {hadBlockers && (
            <Textarea
              placeholder="Describe the blockers you faced..."
              value={blockerNotes}
              onChange={(e) => setBlockerNotes(e.target.value)}
              className="resize-none glass border-border/50 focus:border-primary/50"
              rows={2}
            />
          )}
        </div>

        {/* Next Goal */}
        <div className="space-y-2">
          <Label htmlFor="nextGoal" className="flex items-center gap-2 text-sm font-medium">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            Tomorrow's Goal
          </Label>
          <Input
            id="nextGoal"
            placeholder="What will you work on next?"
            value={nextGoal}
            onChange={(e) => setNextGoal(e.target.value)}
            className="h-11 glass border-border/50 focus:border-primary/50"
          />
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any other thoughts or reflections..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none glass border-border/50 focus:border-primary/50"
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
