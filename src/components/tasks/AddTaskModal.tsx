import React, { useState } from 'react';
import { Task } from '../../types/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';

interface AddTaskModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (task: Partial<Task>) => Promise<void>;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onOpenChange, onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<string>('personal');
    const [priority, setPriority] = useState<string>('medium');
    const [estimatedMinutes, setEstimatedMinutes] = useState('');
    const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        setLoading(true);
        try {
            await onSubmit({
                title,
                description,
                category: category as any,
                priority: priority as any,
                status: 'todo',
                estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
                scheduled_date: scheduledDate ? format(scheduledDate, 'yyyy-MM-dd') : undefined,
                is_recurring: 0,
                completed_subtasks: 0,
                total_subtasks: 0,
                has_subtasks: 0
            });

            // Reset form
            setTitle('');
            setDescription('');
            setCategory('personal');
            setPriority('medium');
            setEstimatedMinutes('');
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="coding">Coding</SelectItem>
                                    <SelectItem value="gym">Gym</SelectItem>
                                    <SelectItem value="diet">Diet</SelectItem>
                                    <SelectItem value="personal">Personal</SelectItem>
                                    <SelectItem value="work">Work</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !scheduledDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={scheduledDate}
                                        onSelect={setScheduledDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estimate">Est. Time (min)</Label>
                            <Input
                                id="estimate"
                                type="number"
                                value={estimatedMinutes}
                                onChange={(e) => setEstimatedMinutes(e.target.value)}
                                placeholder="30"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
