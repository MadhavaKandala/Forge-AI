import React from 'react';
import { Task } from '../../types/schema';
import { TaskItem } from './TaskItem';
import { ScrollArea } from '../ui/scroll-area';

interface TaskListProps {
    tasks: Task[];
    onToggle: (id: string, isCompleted: boolean) => void;
    onEdit: (task: Task) => void;
    isLoading?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onEdit, isLoading }) => {
    if (isLoading) {
        return <div className="p-4 text-center text-muted-foreground">Loading tasks...</div>;
    }

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <p>No tasks found.</p>
                <p className="text-sm">Create a new task to get started!</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-2 p-1">
                {tasks.map((task) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={onToggle}
                        onEdit={onEdit}
                    />
                ))}
            </div>
        </ScrollArea>
    );
};
