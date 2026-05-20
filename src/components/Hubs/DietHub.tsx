import { useEffect, useRef, useMemo, useState } from 'react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Utensils,
    Droplets,
    Flame,
    Scale,
    Plus,
    Apple,
    Coffee,
    ChevronLeft,
    ChevronRight,
    TrendingDown,
    TrendingUp,
    Target
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from 'date-fns';
import { useChallenges } from '@/hooks/useChallenges';
import { useHabitStore } from '@/store/useHabitStore';
import { DietLog } from '@/types/challenge';

interface DietHubProps {
    onNavigateBack?: () => void;
}

export function DietHub({ onNavigateBack }: DietHubProps) {
    const { userProfile, updateUserProfile } = useChallenges();
    const { dietLogs, waterIntakeLiters, addDietLog, addWater } = useHabitStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);

    const [addMealOpen, setAddMealOpen] = useState(false);
    const [logWaterOpen, setLogWaterOpen] = useState(false);

    // New meal form state
    const [newMeal, setNewMeal] = useState<Omit<DietLog, 'id'>>({
        date: new Date().toISOString().split('T')[0],
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        waterIntakeLiters: 0,
        type: 'meal',
        description: ''
    });

    const [waterAmount, setWaterAmount] = useState(0.25); // Default 250ml

    // GSAP Animation
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
            );
        }
    }, []);

    const dietStats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = dietLogs.filter(l => l.date === today);

        const totalCalories = todayLogs.reduce((sum, l) => sum + l.calories, 0);
        const totalProtein = todayLogs.reduce((sum, l) => sum + l.protein, 0);
        const totalCarbs = todayLogs.reduce((sum, l) => sum + l.carbs, 0);
        const totalFats = todayLogs.reduce((sum, l) => sum + l.fats, 0);

        const calorieGoal = userProfile.diet?.dailyCalorieGoal || 2000;
        const waterGoal = userProfile.diet?.dailyWaterGoalLiters || 2.5;

        return {
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFats,
            calorieGoal,
            waterGoal,
            caloriesRemaining: Math.max(0, calorieGoal - totalCalories),
            calorieProgress: Math.min(100, (totalCalories / calorieGoal) * 100),
            waterProgress: Math.min(100, (waterIntakeLiters / waterGoal) * 100)
        };
    }, [dietLogs, waterIntakeLiters, userProfile.diet]);

    const handleAddMeal = () => {
        if (!newMeal.description || !newMeal.calories) return;
        addDietLog(newMeal);
        setAddMealOpen(false);
        setNewMeal({
            date: new Date().toISOString().split('T')[0],
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            waterIntakeLiters: 0,
            type: 'meal',
            description: ''
        });
    };

    const handleAddWater = () => {
        addWater(waterAmount);
        setLogWaterOpen(false);
    };

    return (
        <div ref={containerRef} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                        <Utensils className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-display">Diet Hub</h1>
                        <p className="text-sm text-muted-foreground font-mono uppercase tracking-tighter">Fuel your potential</p>
                    </div>
                </div>
                {onNavigateBack && (
                    <Button variant="outline" onClick={onNavigateBack} className="w-full sm:w-auto font-mono text-xs uppercase tracking-wider border-zinc-800 hover:bg-zinc-800">
                        ← Back
                    </Button>
                )}
            </div>

            {/* Quick Stats */}
            <div ref={statsRef} className="grid grid-cols-3 gap-3 sm:gap-4">
                <Card className="bg-card border-border hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-4 text-center">
                        <Flame className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xl sm:text-2xl font-bold">{dietStats.caloriesRemaining}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase tracking-tighter">kcal left</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-4 text-center">
                        <Droplets className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xl sm:text-2xl font-bold">{waterIntakeLiters.toFixed(1)}L</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase tracking-tighter">drank</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-4 text-center">
                        <Scale className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xl sm:text-2xl font-bold">{userProfile.diet?.currentWeight || '--'} lbs</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase tracking-tighter">weight</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Main Tracking */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Calorie Progress */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg">Daily Calories</CardTitle>
                                <CardDescription>{dietStats.totalCalories} / {dietStats.calorieGoal} kcal</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setAddMealOpen(true)} className="gap-2">
                                <Plus className="w-4 h-4" /> Log Meal
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative h-6 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${dietStats.calorieProgress}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[10px] font-black uppercase text-white drop-shadow-md">
                                        {Math.round(dietStats.calorieProgress)}% FUELLED
                                    </span>
                                </div>
                            </div>

                            {/* Macros Breakdown */}
                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase">
                                        <span>Protein</span>
                                        <span>{dietStats.totalProtein}g</span>
                                    </div>
                                    <Progress value={Math.min(100, (dietStats.totalProtein / 150) * 100)} className="h-1 bg-zinc-900" indicatorClassName="bg-pink-500" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase">
                                        <span>Carbs</span>
                                        <span>{dietStats.totalCarbs}g</span>
                                    </div>
                                    <Progress value={Math.min(100, (dietStats.totalCarbs / 250) * 100)} className="h-1 bg-zinc-900" indicatorClassName="bg-amber-500" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase">
                                        <span>Fats</span>
                                        <span>{dietStats.totalFats}g</span>
                                    </div>
                                    <Progress value={Math.min(100, (dietStats.totalFats / 70) * 100)} className="h-1 bg-zinc-900" indicatorClassName="bg-sky-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meal History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Meals</CardTitle>
                            <CardDescription>Today's food diary</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {dietLogs.filter(l => l.date === new Date().toISOString().split('T')[0]).reverse().map(log => (
                                    <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900/50 border border-border/50 group hover:border-emerald-500/50 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            {log.type === 'meal' ? <Utensils className="w-5 h-5" /> : <Apple className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm truncate uppercase tracking-tight">{log.description}</h4>
                                            <div className="flex gap-2 text-[10px] text-muted-foreground font-mono uppercase">
                                                <span>P: {log.protein}g</span>
                                                <span>C: {log.carbs}g</span>
                                                <span>F: {log.fats}g</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-emerald-500">+{log.calories}</span>
                                            <p className="text-[10px] text-muted-foreground font-mono uppercase">kcal</p>
                                        </div>
                                    </div>
                                ))}
                                {dietLogs.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground font-mono text-sm border border-dashed rounded-xl">
                                        No meals logged today.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Water & Weight */}
                <div className="space-y-6">
                    {/* Water Tracking */}
                    <Card className="overflow-hidden relative">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Droplets className="w-5 h-5 text-blue-500" />
                                Hydration
                            </CardTitle>
                            <CardDescription>{waterIntakeLiters.toFixed(2)} / {dietStats.waterGoal} L</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative aspect-square max-w-[150px] mx-auto flex items-center justify-center">
                                {/* Water Level SVG Visualization */}
                                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-800" />
                                    <circle
                                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                                        strokeDasharray="283"
                                        strokeDashoffset={283 - (283 * dietStats.waterProgress / 100)}
                                        className="text-blue-500 transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-white">{Math.round(dietStats.waterProgress)}%</span>
                                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">DRUNK</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" onClick={() => { setWaterAmount(0.25); setLogWaterOpen(true); }} className="gap-1 font-mono text-[10px]">
                                    +250ml
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => { setWaterAmount(0.5); setLogWaterOpen(true); }} className="gap-1 font-mono text-[10px]">
                                    +500ml
                                </Button>
                            </div>
                        </CardContent>
                        {/* Wave animation simulation at bottom */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500/20" />
                    </Card>

                    {/* Weekly Insight */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400">Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                <TrendingDown className="w-4 h-4 text-emerald-500 mt-0.5" />
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-emerald-500 uppercase">Calorie Deficit</p>
                                    <p className="text-[10px] text-muted-foreground">You are currently in a -420 kcal deficit for safe fat loss.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <Droplets className="w-4 h-4 text-blue-500 mt-0.5" />
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-blue-500 uppercase">Hydration Peak</p>
                                    <p className="text-[10px] text-muted-foreground">You reached your goal early today! Maintaining energy levels.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Meal Dialog */}
            <Dialog open={addMealOpen} onOpenChange={setAddMealOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Food Intake</DialogTitle>
                        <DialogDescription>Track your calories and macros</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="e.g. Chicken breast with rice"
                                value={newMeal.description}
                                onChange={e => setNewMeal({ ...newMeal, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Calories (kcal)</Label>
                                <Input
                                    type="number"
                                    value={newMeal.calories || ''}
                                    onChange={e => setNewMeal({ ...newMeal, calories: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={newMeal.type} onValueChange={(v: any) => setNewMeal({ ...newMeal, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="meal">Full Meal</SelectItem>
                                        <SelectItem value="snack">Light Snack</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold">Protein (g)</Label>
                                <Input
                                    type="number"
                                    value={newMeal.protein || ''}
                                    onChange={e => setNewMeal({ ...newMeal, protein: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold">Carbs (g)</Label>
                                <Input
                                    type="number"
                                    value={newMeal.carbs || ''}
                                    onChange={e => setNewMeal({ ...newMeal, carbs: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold">Fats (g)</Label>
                                <Input
                                    type="number"
                                    value={newMeal.fats || ''}
                                    onChange={e => setNewMeal({ ...newMeal, fats: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddMealOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddMeal} disabled={!newMeal.description || !newMeal.calories}>Log Intake</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Log Water Dialog */}
            <Dialog open={logWaterOpen} onOpenChange={setLogWaterOpen}>
                <DialogContent className="sm:max-w-[300px]">
                    <DialogHeader>
                        <DialogTitle>Log Water</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 flex flex-col items-center gap-6">
                        <Droplets className="w-16 h-16 text-blue-500 animate-bounce" />
                        <div className="text-center">
                            <p className="text-2xl font-black">{waterAmount} L</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hydration Boost</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant={waterAmount === 0.25 ? "default" : "outline"} size="sm" onClick={() => setWaterAmount(0.25)}>250ml</Button>
                            <Button variant={waterAmount === 0.5 ? "default" : "outline"} size="sm" onClick={() => setWaterAmount(0.5)}>500ml</Button>
                            <Button variant={waterAmount === 1 ? "default" : "outline"} size="sm" onClick={() => setWaterAmount(1.0)}>1.0L</Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 font-bold" onClick={handleAddWater}>CONFIRM DRINK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
