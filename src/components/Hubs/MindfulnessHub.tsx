import { useEffect, useRef, useMemo, useState } from 'react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChallenges } from '@/hooks/useChallenges';
import {
    Brain,
    Smile,
    Calendar,
    BookOpen,
    TrendingUp,
    Meh,
    Frown,
    Laugh,
    Plus,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { MOOD_CONFIG } from '@/types/challenge';

interface MindfulnessHubProps {
    onNavigateBack?: () => void;
}

export function MindfulnessHub({ onNavigateBack }: MindfulnessHubProps) {
    const { userProfile } = useChallenges();
    const containerRef = useRef<HTMLDivElement>(null);

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

    const moodData = useMemo(() => {
        const entries = userProfile.mindfulness?.journalEntries || [];
        // Sort by date ascending
        return [...entries]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-14) // Last 14 entries
            .map(entry => ({
                date: format(new Date(entry.date), 'MMM dd'),
                moodValue: entry.mood === 'great' ? 4 : entry.mood === 'good' ? 3 : entry.mood === 'okay' ? 2 : 1,
                mood: entry.mood,
                note: entry.title || entry.content.substring(0, 20) + '...'
            }));
    }, [userProfile.mindfulness]);

    const moodStats = useMemo(() => {
        const entries = userProfile.mindfulness?.journalEntries || [];
        const totalEntries = entries.length;
        const moodCounts = entries.reduce((acc, entry) => {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Dominant mood
        const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        return { totalEntries, dominantMood, moodCounts };
    }, [userProfile.mindfulness]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const config = MOOD_CONFIG[data.mood as keyof typeof MOOD_CONFIG];
            return (
                <div className="glass-card p-3 border border-white/10 backdrop-blur-md">
                    <p className="font-medium text-sm">{label}</p>
                    <p className={`text-sm font-bold flex items-center gap-1 ${config?.color}`}>
                        {config?.emoji} {config?.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate">{data.note}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div ref={containerRef} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-display">Mindfulness Hub</h1>
                        <p className="text-sm text-muted-foreground">Track your mood & thoughts</p>
                    </div>
                </div>
                {onNavigateBack && (
                    <Button variant="outline" onClick={onNavigateBack} className="w-full sm:w-auto">
                        ← Back to Challenges
                    </Button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
                    <CardContent className="p-4 text-center">
                        <BookOpen className="w-5 h-5 mx-auto text-emerald-500 mb-2" />
                        <p className="text-2xl font-bold">{moodStats.totalEntries}</p>
                        <p className="text-xs text-muted-foreground">Journal Entries</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/5 border-pink-500/20">
                    <CardContent className="p-4 text-center">
                        <Smile className="w-5 h-5 mx-auto text-pink-500 mb-2" />
                        <p className="text-2xl font-bold capitalize">{moodStats.dominantMood}</p>
                        <p className="text-xs text-muted-foreground">Dominant Mood</p>
                    </CardContent>
                </Card>
                <Card className="col-span-2 bg-card/50">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Mood Breakdown</span>
                        </div>
                        <div className="flex gap-2 h-20 items-end">
                            {Object.entries(MOOD_CONFIG).map(([key, config]) => {
                                const count = moodStats.moodCounts[key] || 0;
                                const percentage = moodStats.totalEntries > 0 ? (count / moodStats.totalEntries) * 100 : 0;
                                return (
                                    <div key={key} className="flex-1 flex flex-col items-center gap-1 group">
                                        <div className="w-full relative bg-muted rounded-t-sm h-full overflow-hidden flex items-end transition-all hover:bg-muted/80">
                                            <div
                                                className={`w-full transition-all duration-1000 ease-out opacity-80 group-hover:opacity-100 ${key === 'great' ? 'bg-emerald-400' :
                                                        key === 'good' ? 'bg-cyan-400' :
                                                            key === 'okay' ? 'bg-amber-400' :
                                                                'bg-pink-400'
                                                    }`}
                                                style={{ height: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">{config.emoji}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mood Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Mood History</CardTitle>
                    <CardDescription>Your emotional journey over the last 2 weeks</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={moodData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                dy={10}
                            />
                            <YAxis
                                domain={[1, 4]}
                                hide={true}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'white', strokeOpacity: 0.1 }} />
                            <Line
                                type="monotone"
                                dataKey="moodValue"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Journal History */}
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-500" />
                        Recent Journal Entries
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="space-y-4">
                        {userProfile.mindfulness?.journalEntries.slice().reverse().map(entry => {
                            const config = MOOD_CONFIG[entry.mood as keyof typeof MOOD_CONFIG];
                            return (
                                <div key={entry.id} className="group relative pl-4 border-l-2 border-muted hover:border-emerald-500 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {format(new Date(entry.date), 'MMMM d, yyyy')}
                                        </span>
                                        <Badge variant="outline" className={`gap-1 ${config?.color} border-current/20`}>
                                            {config?.emoji} {config?.label}
                                        </Badge>
                                    </div>
                                    <h4 className="font-semibold text-sm mb-1">{entry.title || 'Journal Entry'}</h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-none transition-all">
                                        {entry.content}
                                    </p>
                                </div>
                            )
                        })}
                        {(!userProfile.mindfulness?.journalEntries || userProfile.mindfulness.journalEntries.length === 0) && (
                            <div className="text-center py-6 text-muted-foreground">
                                <p>No journal entries yet.</p>
                                <p className="text-xs mt-1">Check in to a challenge to add one!</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
