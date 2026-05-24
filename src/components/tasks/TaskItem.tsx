import React from 'react';
import { Task } from '../../types/task';
import { Check, Clock, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { taskService } from '../../services/taskService';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface TaskItemProps {
    task: Task;
    onUpdate: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate }) => {
    const handleComplete = async () => {
        if (task.status !== 'completed') {
            await taskService.completeTask(task.id);
            onUpdate();
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this task?')) {
            await taskService.deleteTask(task.id);
            onUpdate();
        }
    };

    const priorityColors = {
        low: 'bg-blue-500/10 text-blue-500',
        medium: 'bg-yellow-500/10 text-yellow-500',
        high: 'bg-red-500/10 text-red-500'
    };

    return (
        <div className={cn(
            "group flex items-center gap-3 p-3 rounded-xl border bg-card transition-all hover:bg-accent/50",
            task.status === 'completed' && "opacity-60 bg-muted/50"
        )}>
            <button
                onClick={handleComplete}
                aria-label={task.status === 'completed' ? "Task completed" : "Mark task as complete"}
                className={cn(
                    "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    task.status === 'completed'
                        ? "bg-green-500 border-green-500 cursor-default"
                        : "border-muted-foreground hover:border-primary"
                )}
            >
                {task.status === 'completed' && <Check className="h-3.5 w-3.5 text-white" />}
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                        "font-medium truncate",
                        task.status === 'completed' && "line-through text-muted-foreground"
                    )}>
                        {task.title}
                    </h4>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider", priorityColors[task.priority])}>
                        {task.priority}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="capitalize">{task.category}</span>
                    {task.estimatedMinutes && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedMinutes}m</span>
                        </div>
                    )}
                    {task.scheduledDate && (
                        <span>• {format(new Date(task.scheduledDate), 'MMM d')}</span>
                    )}
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                aria-label="Delete task"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};
