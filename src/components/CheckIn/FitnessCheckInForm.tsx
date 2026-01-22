import { useState, useMemo, forwardRef } from 'react';
import { Challenge, MOOD_CONFIG } from '@/types/challenge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryCheckInData, WORKOUT_TYPES } from './types';
import { cn } from '@/lib/utils';
import { 
  Timer, 
  Flame, 
  Trophy,
  Upload,
  Sparkles,
  Dumbbell,
  MapPin,
} from 'lucide-react';

interface FitnessCheckInFormProps {
  onSubmit: (data: CategoryCheckInData) => void;
  challenge: Challenge;
}

export const FitnessCheckInForm = forwardRef<HTMLDivElement, FitnessCheckInFormProps>(
  function FitnessCheckInForm({ onSubmit, challenge }, ref) {
    const [workoutType, setWorkoutType] = useState<string>('running');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [intensity, setIntensity] = useState<'easy' | 'moderate' | 'hard'>('moderate');
  const [personalRecord, setPersonalRecord] = useState(false);
  const [prDescription, setPrDescription] = useState('');
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'struggling'>('good');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>('km');
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculate calories based on workout type, duration, and intensity
  const caloriesBurned = useMemo(() => {
    const workout = WORKOUT_TYPES.find(w => w.value === workoutType);
    if (!workout) return 0;
    
    const intensityMultiplier = intensity === 'easy' ? 0.8 : intensity === 'hard' ? 1.3 : 1;
    return Math.round(workout.caloriesPerMinute * durationMinutes * intensityMultiplier);
  }, [workoutType, durationMinutes, intensity]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (durationMinutes <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (durationMinutes > 480) {
      newErrors.duration = 'Duration cannot exceed 8 hours';
    }

    if (distance && isNaN(parseFloat(distance))) {
      newErrors.distance = 'Please enter a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Note: In production, this would upload to storage
      // For now, create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data: CategoryCheckInData = {
      date: new Date().toISOString().split('T')[0],
      notes,
      mood,
      fitnessData: {
        workoutType: workoutType as any,
        durationMinutes,
        intensity,
        caloriesBurned,
        personalRecord,
        prDescription: personalRecord ? prDescription : undefined,
        distance: distance ? parseFloat(distance) : undefined,
        distanceUnit,
      },
    };

    onSubmit(data);
  };

  const selectedWorkout = WORKOUT_TYPES.find(w => w.value === workoutType);

    return (
      <div ref={ref} className="space-y-6">
        {/* Workout Type */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary" />
            </div>
            Workout Type
          </Label>
          <Select value={workoutType} onValueChange={setWorkoutType}>
            <SelectTrigger className="h-11 glass border-border/50">
              <SelectValue placeholder="Select workout type" />
            </SelectTrigger>
            <SelectContent>
              {WORKOUT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <span className="flex items-center gap-2">
                    <span>{type.emoji}</span>
                    <span>{type.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Timer className="w-4 h-4 text-secondary" />
            </div>
            Duration (minutes)
          </Label>
          <div className="flex gap-2">
            <Input
              id="duration"
              type="number"
              min={1}
              max={480}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
              className={cn(
                'flex-1 h-11 glass border-border/50',
                errors.duration && 'border-destructive'
              )}
            />
            <div className="flex gap-1">
              {[15, 30, 45, 60].map((mins) => (
                <Button
                  key={mins}
                  type="button"
                  variant={durationMinutes === mins ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDurationMinutes(mins)}
                  className={cn(
                    durationMinutes === mins && 'bg-gradient-flame'
                  )}
                >
                  {mins}
                </Button>
              ))}
            </div>
          </div>
          {errors.duration && (
            <p className="text-sm text-destructive">{errors.duration}</p>
          )}
        </div>

        {/* Intensity */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Intensity Level</Label>
          <RadioGroup
            value={intensity}
            onValueChange={(v) => setIntensity(v as 'easy' | 'moderate' | 'hard')}
            className="flex gap-2"
          >
            {[
              { value: 'easy', label: 'Easy', emoji: '🚶', color: 'text-green-500 bg-green-500/10 border-green-500/30' },
              { value: 'moderate', label: 'Moderate', emoji: '🏃', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
              { value: 'hard', label: 'Hard', emoji: '🔥', color: 'text-red-500 bg-red-500/10 border-red-500/30' },
            ].map((level) => (
              <div key={level.value} className="flex-1">
                <RadioGroupItem value={level.value} id={`int-${level.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`int-${level.value}`}
                  className={cn(
                    'flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all',
                    'peer-data-[state=checked]:scale-105 peer-data-[state=checked]:shadow-md',
                    intensity === level.value ? level.color : 'glass border-border/50 hover:border-border'
                  )}
                >
                  <span className="text-2xl mb-1">{level.emoji}</span>
                  <span className="text-sm font-medium">{level.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Calories Burned (Auto-calculated) */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-flame flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-medium text-sm">Estimated Calories</span>
                <p className="text-[10px] text-muted-foreground">
                  {selectedWorkout?.label} • {intensity} • {durationMinutes}min
                </p>
              </div>
            </div>
            <span className="text-3xl font-bold stat-number text-gradient-flame">{caloriesBurned}</span>
          </div>
        </div>

        {/* Distance (for applicable workouts) */}
        {['running', 'cycling', 'swimming'].includes(workoutType) && (
          <div className="space-y-2">
            <Label htmlFor="distance" className="flex items-center gap-2 text-sm font-medium">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              Distance
            </Label>
            <div className="flex gap-2">
              <Input
                id="distance"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className={cn(
                  'flex-1 h-11 glass border-border/50',
                  errors.distance && 'border-destructive'
                )}
              />
              <Select value={distanceUnit} onValueChange={(v) => setDistanceUnit(v as 'km' | 'miles')}>
                <SelectTrigger className="w-24 h-11 glass border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">km</SelectItem>
                  <SelectItem value="miles">miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.distance && (
              <p className="text-sm text-destructive">{errors.distance}</p>
            )}
          </div>
        )}

        {/* Personal Record */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="pr"
              checked={personalRecord}
              onCheckedChange={(checked) => setPersonalRecord(checked as boolean)}
              className="w-5 h-5"
            />
            <Label htmlFor="pr" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <Trophy className="w-4 h-4 text-amber-500" />
              New Personal Record?
            </Label>
          </div>
          {personalRecord && (
            <Input
              placeholder="Describe your PR (e.g., 'Fastest 5K: 24:30')"
              value={prDescription}
              onChange={(e) => setPrDescription(e.target.value)}
              className="h-11 glass border-border/50"
            />
          )}
        </div>

        {/* Mood Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Mood After Workout</Label>
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

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            Workout Photo
          </Label>
          <div className="relative">
            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src={photoPreview} 
                  alt="Workout preview" 
                  className="w-full h-32 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setPhotoPreview(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer glass hover:bg-muted/50 transition-colors border-border/50">
                <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-sm text-muted-foreground">Click to upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="How did you feel? Any highlights?"
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
          Complete Workout Check-In
        </Button>
      </div>
    );
  }
);
