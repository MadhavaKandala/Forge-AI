import React, { useEffect, useState } from 'react';
import { Task } from '../types/schema';
import { useTaskStore } from '../store/useTaskStore';
import { TaskList } from '../components/tasks/TaskList';
import { AddTaskModal } from '../components/tasks/AddTaskModal';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';

export const TasksPage: React.FC = () => {
    const { tasks, fetchTasks, addTask, updateTask, deleteTask, isLoading } = useTaskStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
    const [dateFilter, setDateFilter] = useState(new Date());

    useEffect(() => {
        // Fetch tasks on mount
        fetchTasks();
    }, []);

    const handleCreateTask = async (taskData: Partial<Task>) => {
        await addTask({
            ...taskData,
            user_id: 'default-user',
            xp_value: 10,
            difficulty_multiplier: 1.0,
            has_subtasks: 0,
            completed_subtasks: 0,
            total_subtasks: 0
        } as Omit<Task, 'id' | 'created_at' | 'updated_at'>);
    };

    const handleToggleTask = async (id: string, isCompleted: boolean) => {
        const update = {
            status: isCompleted ? 'completed' : 'todo',
            completed_at: isCompleted ? new Date().toISOString() : undefined
        };
        await updateTask(id, update as Partial<Task>);
    };

    const handleEditTask = (task: Task) => {
        // TODO: Implement Edit Modal
        console.log("Edit task", task);
    };

    // Filter tasks based on UI state
    // In future this filtering might happen at DB level via store selector or query
    const filteredTasks = tasks.filter(task => {
        if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
        return true;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.status === b.status) return 0;
        if (a.status === 'in_progress') return -1;
        if (a.status === 'completed') return 1;
        return 0;
    });

    return (
        <div className="container mx-auto p-4 max-w-md pb-24">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Tasks</h1>
                    <p className="text-muted-foreground">{format(dateFilter, 'EEEE, MMM do')}</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} size="icon" className="rounded-full h-10 w-10">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            <Tabs defaultValue="all" className="w-full mb-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>All</TabsTrigger>
                    <TabsTrigger value="coding" onClick={() => setSelectedCategory('coding')}>Code</TabsTrigger>
                    <TabsTrigger value="gym" onClick={() => setSelectedCategory('gym')}>Gym</TabsTrigger>
                    <TabsTrigger value="personal" onClick={() => setSelectedCategory('personal')}>Life</TabsTrigger>
                </TabsList>
            </Tabs>

            <TaskList
                tasks={sortedTasks}
                onToggle={handleToggleTask}
                onEdit={handleEditTask}
                isLoading={isLoading}
            />

            <AddTaskModal
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onSubmit={handleCreateTask}
            />
        </div>
    );
};

export default TasksPage;
