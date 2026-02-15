import React, { useRef } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Clock, GripVertical, CheckCircle2 } from 'lucide-react';

interface KanbanBoardProps {
    tasks: Task[];
    onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
    onTaskClick?: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'backlog', label: 'Backlog', color: 'bg-slate-500/10' },
    { id: 'this_week', label: 'This Week', color: 'bg-blue-500/10' },
    { id: 'today', label: 'Today', color: 'bg-yellow-500/10' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-primary/10' },
    { id: 'completed', label: 'Done', color: 'bg-green-500/10' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskMove, onTaskClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const getTasksByStatus = (status: TaskStatus) => {
        const filtered = tasks.filter((t) => {
            // Map legacy or missing statuses
            const taskStatus = t.status || 'backlog';

            if (status === 'backlog') {
                return taskStatus === 'backlog' || taskStatus === 'todo' || taskStatus === 'cancelled' || !taskStatus;
            }
            return taskStatus === status;
        });

        return filtered;
    };

    console.log("KanbanBoard: Rendering with tasks:", tasks.length);
    if (tasks.length > 0) {
        console.log("KanbanBoard: Task statuses:", tasks.map(t => t.status));
    }

    return (
        <div className="w-full h-full overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 w-full h-full">
                <div className="flex gap-4 p-4 h-full min-h-[600px]" ref={containerRef}>
                    {COLUMNS.map((column) => (
                        <div
                            key={column.id}
                            className={cn(
                                "flex flex-col w-[280px] rounded-2xl border bg-card/50 backdrop-blur-sm",
                                column.color
                            )}
                        >
                            <div className="p-4 flex items-center justify-between border-b bg-muted/30">
                                <h3 className="font-bold text-sm uppercase tracking-wider">{column.label}</h3>
                                <Badge variant="secondary" className="rounded-full">
                                    {getTasksByStatus(column.id).length}
                                </Badge>
                            </div>

                            <div className="flex-1 p-3 flex flex-col gap-3 min-h-[200px]">
                                <AnimatePresence mode="popLayout">
                                    {getTasksByStatus(column.id).map((task) => (
                                        <KanbanCard
                                            key={task.id}
                                            task={task}
                                            onMove={onTaskMove}
                                            onClick={() => onTaskClick?.(task)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};

interface KanbanCardProps {
    task: Task;
    onMove: (taskId: string, newStatus: TaskStatus) => void;
    onClick: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onMove, onClick }) => {
    const priorityColors = {
        low: 'bg-blue-500/20 text-blue-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        high: 'bg-red-500/20 text-red-400'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileTap={{ scale: 0.98, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
            className={cn(
                "group relative flex flex-col p-3 rounded-xl border bg-card/80 hover:border-primary/50 transition-colors shadow-sm cursor-grab active:cursor-grabbing",
                task.status === 'completed' && "opacity-60 grayscale-[0.5]"
            )}
            onClick={onClick}
        >
            <div className="flex gap-2 mb-2 items-start">
                <div className="mt-1 text-muted-foreground group-hover:text-primary transition-colors">
                    <GripVertical className="h-4 w-4" />
                </div>
                <h4 className={cn(
                    "font-semibold text-sm leading-tight flex-1",
                    task.status === 'completed' && "line-through text-muted-foreground"
                )}>
                    {task.title}
                </h4>
                {task.status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                )}
            </div>

            <div className="flex items-center gap-2 mt-auto">
                <Badge variant="outline" className={cn("text-[10px] uppercase border-none", priorityColors[task.priority])}>
                    {task.priority}
                </Badge>
                <span className="text-[10px] text-muted-foreground capitalize">{task.category}</span>

                {task.estimatedMinutes && (
                    <div className="flex items-center gap-1 ml-auto text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{task.estimatedMinutes}m</span>
                    </div>
                )}
            </div>

            {/* Simple Status Quick Actions - Fixed for mobile visibility */}
            <div className="flex gap-1.5 mt-3 pt-3 border-t border-zinc-900/50">
                {COLUMNS.filter(c => c.id !== task.status).map(c => (
                    <button
                        key={c.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            onMove(task.id, c.id);
                        }}
                        className="flex-1 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-[#dfff4f] hover:text-[#dfff4f] flex items-center justify-center text-[8px] font-black uppercase tracking-tighter transition-all"
                        title={`Move to ${c.label}`}
                    >
                        {c.label.split(' ')[0]}
                    </button>
                ))}
            </div>
        </motion.div>
    );
};
