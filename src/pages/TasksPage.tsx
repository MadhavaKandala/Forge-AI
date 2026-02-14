import React, { useEffect, useState } from 'react';
import { TaskList } from '@/components/tasks/TaskList';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { taskService } from '@/services/taskService';
import { Task, TaskCategory } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

    const filteredTasks = tasks.filter(t => {
        if (filter.category && filter.category !== 'all' && t.category !== filter.category) return false;
        return true;
    });

    const categories: string[] = ['all', 'coding', 'gym', 'diet', 'personal', 'work'];

    return (
        <div className="w-full h-full flex flex-col relative min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="p-4 flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <h1 className="text-2xl font-bold">Tasks</h1>
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

            {/* Task List */}
            <div className="flex-1 px-4">
                <TaskList
                    tasks={filteredTasks}
                    isLoading={isLoading}
                    onUpdate={fetchTasks}
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
