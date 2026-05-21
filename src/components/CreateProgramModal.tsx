import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useProgramStore } from '@/store/useProgramStore';
import { cn } from '@/lib/utils';

interface CreateProgramModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface RequirementDraft {
    id: string;
    title: string;
    time: string;
}

const ICON_OPTIONS = ['💪', '🧠', '📚', '🎯', '⚡', '🔥'];

const buildTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 5; hour <= 23; hour += 1) {
        slots.push(`${String(hour).padStart(2, '0')}:00`);
        if (hour !== 23) slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
    return slots;
};

const createRequirement = (): RequirementDraft => ({
    id: crypto.randomUUID(),
    title: '',
    time: '09:00',
});

export default function CreateProgramModal({ open, onOpenChange }: CreateProgramModalProps) {
    const addCustomProgram = useProgramStore((s) => s.addCustomProgram);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [days, setDays] = useState(30);
    const [isOngoing, setIsOngoing] = useState(false);
    const [icon, setIcon] = useState(ICON_OPTIONS[0]);
    const [requirements, setRequirements] = useState<RequirementDraft[]>([createRequirement()]);
    const timeSlots = useMemo(buildTimeSlots, []);

    const resetForm = () => {
        setName('');
        setDescription('');
        setDays(30);
        setIsOngoing(false);
        setIcon(ICON_OPTIONS[0]);
        setRequirements([createRequirement()]);
    };

    const handleSubmit = () => {
        const trimmedName = name.trim();
        const validRequirements = requirements
            .map((requirement) => ({ ...requirement, title: requirement.title.trim() }))
            .filter((requirement) => requirement.title.length > 0);

        if (!trimmedName) {
            toast.error('Program name required.');
            return;
        }

        if (validRequirements.length === 0) {
            toast.error('Add at least one daily requirement.');
            return;
        }

        const dailyRequirementTimes = validRequirements.reduce<Record<string, string>>((acc, requirement) => {
            acc[requirement.title] = requirement.time;
            return acc;
        }, {});

        addCustomProgram({
            name: trimmedName,
            description,
            days,
            icon,
            dailyRequirements: validRequirements.map((requirement) => requirement.title),
            dailyRequirementTimes,
            isOngoing,
        });
        toast.success('Program created. Ready to deploy.');
        resetForm();
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-3xl border-zinc-800 bg-[#141414]">
                <div className="space-y-5">
                    <SheetHeader>
                        <SheetTitle className="text-white font-black uppercase tracking-[0.14em]">CREATE PROGRAM</SheetTitle>
                        <SheetDescription className="text-zinc-500">Build a custom protocol. Deploy it when ready.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-3">
                        <Input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Program Name"
                            className="border-zinc-800 bg-[#1C1C1C] text-white placeholder:text-zinc-600"
                        />
                        <Input
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Description"
                            className="border-zinc-800 bg-[#1C1C1C] text-white placeholder:text-zinc-600"
                        />
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-3">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Duration</p>
                            <button
                                type="button"
                                onClick={() => setIsOngoing((value) => !value)}
                                className={cn(
                                    'rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]',
                                    isOngoing ? 'border-[#C8FF00] bg-[#C8FF00] text-black' : 'border-zinc-700 text-zinc-400',
                                )}
                            >
                                ONGOING
                            </button>
                        </div>
                        <Input
                            type="number"
                            min={1}
                            value={days}
                            disabled={isOngoing}
                            onChange={(event) => setDays(Math.max(1, Number(event.target.value) || 1))}
                            className="border-zinc-800 bg-zinc-950 text-white disabled:opacity-40"
                        />
                    </div>

                    <div>
                        <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Icon</p>
                        <div className="grid grid-cols-6 gap-2">
                            {ICON_OPTIONS.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setIcon(option)}
                                    className={cn(
                                        'grid h-11 place-items-center rounded-xl border bg-[#1C1C1C] text-xl',
                                        icon === option ? 'border-[#C8FF00] shadow-[0_0_18px_rgba(200,255,0,0.18)]' : 'border-zinc-800',
                                    )}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Daily Requirements</p>
                            <button
                                type="button"
                                onClick={() => setRequirements((items) => [...items, createRequirement()])}
                                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#C8FF00]"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                ADD REQUIREMENT
                            </button>
                        </div>
                        <div className="space-y-3">
                            {requirements.map((requirement) => (
                                <div key={requirement.id} className="rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-3">
                                    <div className="flex gap-2">
                                        <Input
                                            value={requirement.title}
                                            onChange={(event) => {
                                                const nextTitle = event.target.value;
                                                setRequirements((items) => items.map((item) => item.id === requirement.id ? { ...item, title: nextTitle } : item));
                                            }}
                                            placeholder="Requirement title"
                                            className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setRequirements((items) => items.length === 1 ? items : items.filter((item) => item.id !== requirement.id))}
                                            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-zinc-800 text-[#FF4444]"
                                            aria-label="Remove requirement"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <select
                                        value={requirement.time}
                                        onChange={(event) => {
                                            const nextTime = event.target.value;
                                            setRequirements((items) => items.map((item) => item.id === requirement.id ? { ...item, time: nextTime } : item));
                                        }}
                                        className="mt-3 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs font-black uppercase tracking-[0.12em] text-[#C8FF00]"
                                    >
                                        {timeSlots.map((slot) => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="button"
                        onClick={handleSubmit}
                        className="h-12 w-full bg-[#C8FF00] text-black hover:bg-[#b8ef00] font-black uppercase tracking-[0.16em]"
                    >
                        CREATE PROGRAM
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
