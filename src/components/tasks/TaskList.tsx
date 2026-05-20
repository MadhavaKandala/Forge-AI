import React from 'react';
import { Task } from '../../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
    tasks: Task[];
    isLoading: boolean;
    onUpdate: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, isLoading, onUpdate }) => {
    if (isLoading) {
        return <div className="p-4 text-center text-muted-foreground">Loading tasks...</div>;
    }

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <span className="text-2xl">📝</span>
                </div>
                <h3 className="font-semibold text-lg">No tasks yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs mt-1">
                    Add a task to start tracking your productivity.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-24">
            {tasks.map((task) => (
                <TaskItem key={task.id} task={task} onUpdate={onUpdate} />
            ))}
        </div>
    );
};
