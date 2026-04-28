import React, { useEffect, useState } from 'react';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { AddTaskModal } from '@/components/habit-tracker/AddTaskModal';
import { TaskDetailModal } from '@/components/habit-tracker/TaskDetailModal';
import { Task, TaskCategory, TaskStatus } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Filter, Layout, Plus, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useHabitStore } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';

const TasksPage = () => {
    const { tasks, updateTask: updateStoreTask, completeTask, fetchTasks } = useHabitStore();
    const [filter, setFilter] = useState<{ category?: TaskCategory | 'all' }>({ category: 'all' });
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
        try {
            if (newStatus === 'completed') {
                completeTask(taskId);
                toast.success('+25 XP');
                return;
            }

            updateStoreTask(taskId, { status: newStatus, completed: false });
            toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
        } catch {
            toast.error("Failed to move task");
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailOpen(true);
    };

    const filteredTasks = tasks.filter(t => {
        if (filter.category && filter.category !== 'all' && t.category !== filter.category) return false;
        return true;
    });

    const categories: string[] = ['all', 'coding', 'gym', 'diet', 'personal', 'academics', 'devotional', 'other'];

    return (
        <div className="w-full h-screen overflow-hidden flex flex-col relative bg-background text-foreground">
            <div className="p-4 flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-zinc-900">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 hover:text-[#dfff4f] transition-colors"
                    >
                        <Layout className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-black italic uppercase tracking-tighter">Mission Control</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-500 hover:text-[#dfff4f] transition-colors h-10 w-10 bg-zinc-900/50 border border-zinc-800 rounded-xl"
                        onClick={() => {
                            fetchTasks();
                            toast.success("Intel Synchronized");
                        }}
                    >
                        <Clock className="h-5 w-5" />
                    </Button>
                    <AddTaskModal
                        onTaskAdded={fetchTasks}
                        trigger={
                            <Button variant="ghost" size="icon" className="text-[#dfff4f] h-10 w-10 bg-zinc-900 border border-zinc-800 rounded-xl">
                                <Plus className="h-5 w-5" />
                            </Button>
                        }
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500"
                        onClick={() => setShowFilters((prev) => !prev)}
                    >
                        <Filter className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {showFilters && (
                <div className="px-4 pb-4">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex w-max space-x-2 pb-2">
                            {categories.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={filter.category === cat ? "secondary" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "rounded-full capitalize px-4 border-zinc-800",
                                        filter.category === cat ? "bg-[#dfff4f] text-black hover:bg-[#ccee3e]" : "bg-zinc-900/50 text-zinc-400"
                                    )}
                                    onClick={() => setFilter({ ...filter, category: cat as TaskCategory | 'all' })}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            <div className="flex-1 overflow-hidden">
                <KanbanBoard
                    tasks={filteredTasks}
                    onTaskMove={handleTaskMove}
                    onTaskClick={handleTaskClick}
                />
            </div>

            <div className="fixed bottom-24 right-4 z-50">
                <AddTaskModal onTaskAdded={fetchTasks} />
            </div>

            <TaskDetailModal
                task={selectedTask}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />
        </div>
    );
};

export default TasksPage;
