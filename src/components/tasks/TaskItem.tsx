import React from 'react';
import { Task } from '../../types/schema';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Clock, ExternalLink, RefreshCw } from 'lucide-react';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string, isCompleted: boolean) => void;
    onEdit: (task: Task) => void;
}

const priorityColors: Record<string, string> = {
    low: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    high: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit }) => {
    const isCompleted = task.status === 'completed';

    return (
        <div
            className={cn(
                "flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm transition-all cursor-pointer hover:border-zinc-700",
                isCompleted && "opacity-60 bg-muted/50"
            )}
        >
            <Checkbox
                checked={isCompleted}
                onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
            />

            <div className="flex-1 space-y-1" onClick={() => onEdit(task)}>
                <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                        "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        isCompleted && "line-through text-muted-foreground"
                    )}>
                        {task.title}
                    </span>
                    <Badge variant="secondary" className={cn("text-[10px] uppercase px-1 py-0", priorityColors[task.priority] || priorityColors.medium)}>
                        {task.priority}
                    </Badge>
                </div>

                {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                        <span className="capitalize">{task.category}</span>
                    </div>

                    {task.estimated_minutes && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimated_minutes}m</span>
                            {task.actual_minutes ? <span className="text-green-500">({task.actual_minutes}m)</span> : null}
                        </div>
                    )}

                    {task.scheduled_time && (
                        <div className="flex items-center gap-1">
                            <span>{task.scheduled_time}</span>
                        </div>
                    )}

                    {task.is_recurring === 1 && (
                        <div className="flex items-center gap-1 text-blue-400">
                            <RefreshCw className="w-3 h-3" />
                        </div>
                    )}

                    {/* External links logic if needed, schema stores as string/JSON */}
                    {/* {task.external_links && ... } */}
                </div>
            </div>
        </div>
    );
};
