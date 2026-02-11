import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScheduleStore } from '../store/useScheduleStore';
import { cn } from '../lib/utils';
import { AddTaskModal } from '../components/tasks/AddTaskModal';
import { useTaskStore } from '../store/useTaskStore';

export const SchedulePage: React.FC = () => {
    const navigate = useNavigate();
    const { schedules, selectedDate, setSelectedDate, fetchSchedules } = useScheduleStore();
    const { addTask } = useTaskStore();

    // View State (Ui only for now)
    const [view, setView] = React.useState<'day' | 'week' | 'month'>('day');
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

    useEffect(() => {
        fetchSchedules(selectedDate);
    }, [selectedDate]); // Re-fetch when date changes

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
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border shadow"
                />
            </div>

            <div className="space-y-4">
                <h2 className="font-semibold text-lg">{format(selectedDate, 'EEEE, MMMM do')}</h2>

                {schedules.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No events scheduled.</p>
                ) : (
                    <div className="space-y-3">
                        {schedules.map((item, index) => (
                            <div key={index} className="flex gap-4 p-3 rounded-xl border bg-card items-start">
                                <div className="flex flex-col items-center min-w-[3rem]">
                                    <span className="font-bold text-sm">{item.scheduled_time || 'All Day'}</span>
                                    <div className="h-full w-0.5 bg-muted mt-2"></div>
                                </div>
                                <div className="flex-1">
                                    <h3 className={cn("font-medium", item.status === 'completed' && "line-through text-muted-foreground")}>{item.title}</h3>
                                    {item.estimated_duration_minutes && (
                                        <p className="text-xs text-muted-foreground">{item.estimated_duration_minutes} min</p>
                                    )}
                                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                                        {item.schedulable_type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AddTaskModal
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onSubmit={async (task) => {
                    // Auto-schedule for selected date
                    await addTask({
                        ...task,
                        scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
                        // defaults
                        user_id: 'default-user',
                        xp_value: 10,
                        difficulty_multiplier: 1,
                        has_subtasks: 0, completed_subtasks: 0, total_subtasks: 0
                    } as any);
                    fetchSchedules(selectedDate);
                }}
            />
        </div>
    );
};

export default SchedulePage;
