import React from 'react';
import { useForm } from 'react-hook-form';
import { CreateTaskDTO, TaskCategory, TaskPriority } from '../../types/task';
import { taskService } from '../../services/taskService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus } from 'lucide-react';

interface AddTaskModalProps {
    onTaskAdded: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ onTaskAdded }) => {
    const [open, setOpen] = React.useState(false);
    const { register, handleSubmit, reset, setValue } = useForm<CreateTaskDTO>({
        defaultValues: {
            priority: 'medium',
            category: 'personal',
            status: 'todo',
            isRecurring: false
        }
    });

    const onSubmit = async (data: CreateTaskDTO) => {
        try {
            await taskService.createTask(data);
            setOpen(false);
            reset();
            onTaskAdded();
        } catch (error) {
            console.error('Failed to create task', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" className="h-12 w-12 rounded-full shadow-lg bg-[#dfff4f] text-black hover:bg-[#ccee3e]">
                    <Plus className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#18181b] text-white border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            placeholder="Task title"
                            {...register('title', { required: true })}
                            className="bg-zinc-900 border-zinc-800"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Select onValueChange={(v) => setValue('category', v as TaskCategory)} defaultValue="personal">
                                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="coding">Coding</SelectItem>
                                    <SelectItem value="gym">Gym</SelectItem>
                                    <SelectItem value="diet">Diet</SelectItem>
                                    <SelectItem value="personal">Personal</SelectItem>
                                    <SelectItem value="work">Work</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Select onValueChange={(v) => setValue('priority', v as TaskPriority)} defaultValue="medium">
                                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Textarea
                            placeholder="Description (optional)"
                            {...register('description')}
                            className="bg-zinc-900 border-zinc-800 min-h-[80px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="number"
                            placeholder="Est. Minutes"
                            {...register('estimatedMinutes', { valueAsNumber: true })}
                            className="bg-zinc-900 border-zinc-800"
                        />
                        <Input
                            type="date"
                            {...register('scheduledDate')}
                            className="bg-zinc-900 border-zinc-800"
                        />
                    </div>

                    <Button type="submit" className="w-full bg-[#dfff4f] text-black hover:bg-[#ccee3e]">
                        Create Task
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
