import React, { useMemo } from 'react';
import { Calendar, AlertTriangle, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/store/useTaskStore';

export const ExamCountdown = () => {
    const { tasks } = useTaskStore();

    const upcomingTask = useMemo(() => {
        const now = Date.now();
        const upcomingTasks = tasks
            .filter(task => {
                // Ensure it's not completed and has a due date
                if (task.status === 'completed' || task.status === 'done' || !task.due_date) return false;

                // Only consider future tasks
                const dueDate = new Date(task.due_date).getTime();
                return dueDate >= now;
            })
            .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

        return upcomingTasks.length > 0 ? upcomingTasks[0] : null;
    }, [tasks]);

    if (!upcomingTask) {
        return null; // Don't render anything if there are no upcoming deadlines
    }

    const dueDate = new Date(upcomingTask.due_date!);
    const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    let color = "text-green-500";
    let bg = "bg-green-500/10";
    let border = "border-green-500/20";
    let urgency = "Normal";

    if (daysLeft <= 3) {
        color = "text-red-500";
        bg = "bg-red-500/10";
        border = "border-red-500/20";
        urgency = "CRITICAL";
    } else if (daysLeft <= 7) {
        color = "text-yellow-500";
        bg = "bg-yellow-500/10";
        border = "border-yellow-500/20";
        urgency = "URGENT";
    }

    return (
        <div className="w-full px-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Upcoming Deadlines</h2>

            <div className={`rounded-xl border ${border} ${bg} p-4`}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg} border ${border}`}>
                            <AlertTriangle className={`w-5 h-5 ${color}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">{upcomingTask.title}</h3>
                            <p className={`text-xs font-bold ${color}`}>
                                {urgency} • {daysLeft} Days Left
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#18181B]/50 rounded-lg p-3 mb-3 border border-zinc-800">
                    <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-3 h-3 text-zinc-400" />
                        <span className="text-xs text-zinc-400 uppercase font-bold">Recommended Action</span>
                    </div>
                    <p className="text-sm text-white font-medium">{upcomingTask.description || 'Focus on completing this task.'}</p>
                </div>

                <Button variant="outline" className={`w-full h-9 text-xs border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500`}>
                    View Exam Plan <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
            </div>
        </div>
    );
};
