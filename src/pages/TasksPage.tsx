import React, { useEffect, useState } from 'react';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { taskService } from '@/services/taskService';
import { Task, TaskCategory, TaskStatus } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Filter, Layout } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<{ category?: TaskCategory | 'all' }>({ category: 'all' });

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const fetchedTasks = await taskService.getTasks();
            setTasks(fetchedTasks);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
        try {
            // Optimistic update
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

            await taskService.updateTask(taskId, { status: newStatus });
            toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
        } catch (error) {
            toast.error("Failed to move task");
            fetchTasks(); // Rollback
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter.category && filter.category !== 'all' && t.category !== filter.category) return false;
        return true;
    });

    const categories: string[] = ['all', 'coding', 'gym', 'diet', 'personal', 'work'];

    return (
        <div className="w-full h-screen overflow-hidden flex flex-col relative bg-background text-foreground">
            {/* Header */}
            <div className="p-4 flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-2">
                    <Layout className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">Kanban Board</h1>
                </div>
                <Button variant="ghost" size="icon">
                    <Filter className="h-5 w-5" />
                </Button>
            </div>

            {/* Category Filter */}
            <div className="px-4 pb-4">
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex w-max space-x-2 pb-2">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={filter.category === cat ? "secondary" : "outline"}
                                size="sm"
                                className="rounded-full capitalize"
                                onClick={() => setFilter({ ...filter, category: cat as any })}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-hidden">
                <KanbanBoard
                    tasks={filteredTasks}
                    onTaskMove={handleTaskMove}
                    onTaskClick={(task) => console.log("Task clicked:", task)}
                />
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-4 z-50">
                <AddTaskModal onTaskAdded={fetchTasks} />
            </div>
        </div>
    );
};

export default TasksPage;
