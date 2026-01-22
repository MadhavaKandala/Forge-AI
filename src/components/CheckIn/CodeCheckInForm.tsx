import { useState } from 'react';
import { Challenge, MOOD_CONFIG } from '@/types/challenge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CategoryCheckInData, CODE_LANGUAGES } from './types';
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

export function CodeCheckInForm({ onSubmit, challenge }: CodeCheckInFormProps) {
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
    <div className="space-y-5">
      {/* Hours Coded Slider */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Hours Coded Today
        </Label>
        <div className="px-2">
          <Slider
            value={[hoursCoded]}
            onValueChange={(v) => setHoursCoded(v[0])}
            min={0}
            max={12}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>0h</span>
            <span className="font-medium text-foreground text-lg">{hoursCoded}h</span>
            <span>12h</span>
          </div>
        </div>
        {errors.hours && (
          <p className="text-sm text-red-500">{errors.hours}</p>
        )}
      </div>

      {/* Languages Used */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Code className="w-4 h-4 text-secondary" />
          Languages Used
        </Label>
        <div className="flex flex-wrap gap-2">
          {CODE_LANGUAGES.slice(0, 12).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                selectedLanguages.includes(lang)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 hover:bg-muted border-border'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* GitHub Commit Link */}
      <div className="space-y-2">
        <Label htmlFor="commitLink" className="flex items-center gap-2">
          <Github className="w-4 h-4" />
          GitHub Commit / PR Link
        </Label>
        <Input
          id="commitLink"
          type="url"
          placeholder="https://github.com/..."
          value={commitLink}
          onChange={(e) => setCommitLink(e.target.value)}
          className={errors.commitLink ? 'border-red-500' : ''}
        />
        {errors.commitLink && (
          <p className="text-sm text-red-500">{errors.commitLink}</p>
        )}
      </div>

      {/* Difficulty Level */}
      <div className="space-y-3">
        <Label>Problem Difficulty</Label>
        <RadioGroup
          value={difficulty}
          onValueChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}
          className="flex gap-3"
        >
          {['easy', 'medium', 'hard'].map((level) => (
            <div key={level} className="flex items-center">
              <RadioGroupItem value={level} id={`diff-${level}`} className="peer sr-only" />
              <Label
                htmlFor={`diff-${level}`}
                className={`px-4 py-2 rounded-lg border cursor-pointer transition-all capitalize peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 ${
                  level === 'easy' ? 'text-green-500' :
                  level === 'medium' ? 'text-yellow-500' :
                  'text-red-500'
                }`}
              >
                {level}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Mood Selector */}
      <div className="space-y-3">
        <Label>Mood After Coding</Label>
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

      {/* Blockers */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="blockers"
            checked={hadBlockers}
            onCheckedChange={(checked) => setHadBlockers(checked as boolean)}
          />
          <Label htmlFor="blockers" className="flex items-center gap-2 cursor-pointer">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Had any blockers?
          </Label>
        </div>
        {hadBlockers && (
          <Textarea
            placeholder="Describe the blockers you faced..."
            value={blockerNotes}
            onChange={(e) => setBlockerNotes(e.target.value)}
            className="resize-none"
            rows={2}
          />
        )}
      </div>

      {/* Next Goal */}
      <div className="space-y-2">
        <Label htmlFor="nextGoal" className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Tomorrow's Goal (Optional)
        </Label>
        <Input
          id="nextGoal"
          placeholder="What will you work on next?"
          value={nextGoal}
          onChange={(e) => setNextGoal(e.target.value)}
        />
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any other thoughts or reflections..."
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
