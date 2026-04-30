import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddScheduleModal } from '../components/habit-tracker/AddScheduleModal';
import { scheduleService, ScheduleItem } from '../services/scheduleService';
import { cn } from '../lib/utils';

const displayTime = (item: ScheduleItem): string => item.scheduledTime || item.time || 'All Day';

export const SchedulePage: React.FC = () => {
    const navigate = useNavigate();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [items, setItems] = useState<ScheduleItem[]>([]);
    const [view, setView] = useState<'day' | 'week' | 'month'>('day');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        if (date) {
            fetchSchedule(date);
        }
    }, [date]);

    const fetchSchedule = async (selectedDate: Date) => {
        const data = await scheduleService.getScheduleForDate(selectedDate);
        setItems(data);
    };

    return (
        <div className="container mx-auto p-4 max-w-md pb-24 min-h-screen bg-background">
            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Schedule</h1>
                <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-6 w-6" />
                </Button>
            </div>

            <div className="flex gap-2 mb-6 bg-muted p-1 rounded-lg">
                <Button
                    variant={view === 'day' ? 'secondary' : 'ghost'}
                    className="flex-1 h-8 text-xs"
                    onClick={() => setView('day')}
                >
                    Day
                </Button>
                <Button
                    variant={view === 'week' ? 'secondary' : 'ghost'}
                    className="flex-1 h-8 text-xs"
                    onClick={() => setView('week')}
                >
                    Week
                </Button>
                <Button
                    variant={view === 'month' ? 'secondary' : 'ghost'}
                    className="flex-1 h-8 text-xs"
                    onClick={() => setView('month')}
                >
                    Month
                </Button>
            </div>

            <div className="mb-6 flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow"
                />
            </div>

            <div className="space-y-4">
                <h2 className="font-semibold text-lg">{date ? format(date, 'EEEE, MMMM do') : 'Select a date'}</h2>

                {items.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No events scheduled.</p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-4 p-3 rounded-xl border bg-card items-start">
                                <div className="flex flex-col items-center min-w-[3rem]">
                                    <span className="font-bold text-sm">{displayTime(item)}</span>
                                    <div className="h-full w-0.5 bg-muted mt-2"></div>
                                </div>
                                <div className="flex-1">
                                    <h3 className={cn("font-medium", item.status === 'completed' && "line-through text-muted-foreground")}>{item.title}</h3>
                                    {item.duration && (
                                        <p className="text-xs text-muted-foreground">{item.duration} min</p>
                                    )}
                                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                                        {item.category || item.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AddScheduleModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    if (date) fetchSchedule(date);
                }}
            />
        </div>
    );
};

export default SchedulePage;
