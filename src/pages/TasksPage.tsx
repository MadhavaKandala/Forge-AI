import React, { useEffect, useState } from 'react';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { AddTaskModal } from '@/components/habit-tracker/AddTaskModal';
import { TaskDetailModal } from '@/components/habit-tracker/TaskDetailModal';
import { taskService } from '@/services/taskService';
import { Task, TaskCategory, TaskStatus } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Filter, Layout, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useHabitStore } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';

const TasksPage = () => {
    const { tasks, updateTask: updateStoreTask, fetchTasks } = useHabitStore();
    const [filter, setFilter] = useState<{ category?: TaskCategory | 'all' }>({ category: 'all' });
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
        try {
            updateStoreTask(taskId, { status: newStatus });
            await taskService.updateTask(taskId, { status: newStatus });
            toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
        } catch (error) {
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

    const categories: string[] = ['all', 'coding', 'gym', 'diet', 'personal', 'work', 'academics'];

    return (
        <div className="w-full h-screen overflow-hidden flex flex-col relative bg-background text-foreground">
            <div className="p-4 flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-2">
                    <Layout className="h-6 w-6 text-[#dfff4f]" />
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter">Mission Control</h1>
                </div>
                <div className="flex items-center gap-1">
                    <AddTaskModal
                        onTaskAdded={fetchTasks}
                        trigger={
                            <Button variant="ghost" size="icon" className="text-[#dfff4f]">
                                <Plus className="h-5 w-5" />
                            </Button>
                        }
                    />
                    <Button variant="ghost" size="icon">
                        <Filter className="h-5 w-5" />
                    </Button>
                </div>
            </div>

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
                                onClick={() => setFilter({ ...filter, category: cat as any })}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

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
