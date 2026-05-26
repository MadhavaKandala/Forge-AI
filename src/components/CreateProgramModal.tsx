import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useProgramStore } from '@/store/useProgramStore';
import { cn } from '@/lib/utils';
import { type ProgramTemplate } from '@/services/programService';

interface CreateProgramModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface RequirementDraft {
    id: string;
    title: string;
    time: string;
}

type CustomCategory = Extract<ProgramTemplate['category'], 'fitness' | 'coding' | 'work' | 'wellness'>;

const ICON_OPTIONS = ['💪', '🧠', '📚', '🎯', '⚡', '🔥', '🏃', '✨'];
const CATEGORY_OPTIONS: CustomCategory[] = ['fitness', 'coding', 'work', 'wellness'];

const buildTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 5; hour <= 23; hour += 1) {
        slots.push(`${String(hour).padStart(2, '0')}:00`);
        if (hour !== 23) slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
    return slots;
};

const to12h = (time24: string): string => {
    const [hRaw, min] = time24.split(':').map(Number);
    const suffix = hRaw >= 12 ? 'PM' : 'AM';
    const h12 = hRaw % 12 === 0 ? 12 : hRaw % 12;
    return `${h12}:${String(min).padStart(2, '0')} ${suffix}`;
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
    const [category, setCategory] = useState<CustomCategory>('wellness');
    const [requirements, setRequirements] = useState<RequirementDraft[]>([createRequirement()]);
    const timeSlots = useMemo(buildTimeSlots, []);

    const resetForm = () => {
        setName('');
        setDescription('');
        setDays(30);
        setIsOngoing(false);
        setIcon(ICON_OPTIONS[0]);
        setCategory('wellness');
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
            category,
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
            <SheetContent
                side="bottom"
                className="max-h-[92vh] overflow-y-auto rounded-t-3xl border-zinc-800 bg-[#141414] px-5 pb-7 pt-6 data-[state=open]:duration-300"
            >
                <div className="space-y-5">
                    <SheetHeader className="pr-8 text-left">
                        <SheetTitle className="text-xl font-black uppercase tracking-[0.14em] text-white">NEW PROGRAM</SheetTitle>
                        <SheetDescription className="text-xs font-semibold text-zinc-500">
                            Build a custom protocol. Deploy it when ready.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-3">
                        <label className="block">
                            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Program Name</span>
                            <Input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Program Name"
                                className="h-12 rounded-xl border-zinc-800 bg-[#1C1C1C] text-sm font-semibold text-white placeholder:text-zinc-600 focus-visible:ring-[#C8FF00]/40"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Description</span>
                            <textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Describe the mission brief"
                                rows={2}
                                className="w-full resize-none rounded-xl border border-zinc-800 bg-[#1C1C1C] px-3 py-3 text-sm font-semibold leading-5 text-white outline-none placeholder:text-zinc-600 focus:border-[#C8FF00]/70"
                            />
                        </label>
                    </div>

                    <section>
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Icon</p>
                        <div className="grid grid-cols-8 gap-2">
                            {ICON_OPTIONS.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        setIcon(option);
                                        toast.info(`${option} icon selected.`);
                                    }}
                                    className={cn(
                                        'grid h-10 place-items-center rounded-xl border bg-[#1C1C1C] text-lg transition-colors',
                                        icon === option
                                            ? 'border-[#C8FF00] shadow-[0_0_18px_rgba(200,255,0,0.18)]'
                                            : 'border-zinc-800 text-zinc-400',
                                    )}
                                    aria-label={`Select ${option} icon`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Duration</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {[
                                { value: false, label: 'FIXED DURATION' },
                                { value: true, label: 'ONGOING' },
                            ].map((option) => (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => {
                                        setIsOngoing(option.value);
                                        toast.info(`${option.label} selected.`);
                                    }}
                                    className={cn(
                                        'h-10 rounded-xl border px-3 text-[10px] font-black uppercase tracking-[0.12em]',
                                        isOngoing === option.value
                                            ? 'border-[#C8FF00] bg-[#C8FF00] text-black'
                                            : 'border-zinc-700 bg-[#141414] text-zinc-500',
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        {!isOngoing && (
                            <Input
                                type="number"
                                min={1}
                                value={days}
                                onChange={(event) => setDays(Math.max(1, Number(event.target.value) || 1))}
                                className="mt-3 h-11 rounded-xl border-zinc-800 bg-zinc-950 text-sm font-black text-white focus-visible:ring-[#C8FF00]/40"
                            />
                        )}
                    </section>

                    <section>
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Category</p>
                        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                            {CATEGORY_OPTIONS.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        setCategory(option);
                                        toast.info(`${option.toUpperCase()} category selected.`);
                                    }}
                                    className={cn(
                                        'h-10 shrink-0 rounded-full border px-4 text-[10px] font-black uppercase tracking-[0.14em]',
                                        category === option
                                            ? 'border-[#C8FF00] bg-[#C8FF00] text-black'
                                            : 'border-zinc-800 bg-[#1C1C1C] text-zinc-500',
                                    )}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Daily Requirements</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setRequirements((items) => [...items, createRequirement()]);
                                    toast.info('Requirement row added.');
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400"
                            >
                                ADD REQUIREMENT
                                <Plus className="h-3.5 w-3.5" />
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
                                                setRequirements((items) => items.map((item) => (
                                                    item.id === requirement.id ? { ...item, title: nextTitle } : item
                                                )));
                                            }}
                                            placeholder="Requirement title"
                                            className="h-11 rounded-xl border-zinc-800 bg-zinc-950 text-sm font-semibold text-white placeholder:text-zinc-600 focus-visible:ring-[#C8FF00]/40"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRequirements((items) => {
                                                    if (items.length === 1) {
                                                        toast.error('At least one requirement required.');
                                                        return items;
                                                    }
                                                    toast.info('Requirement removed.');
                                                    return items.filter((item) => item.id !== requirement.id);
                                                });
                                            }}
                                            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-zinc-800 text-[#FF4444]"
                                            aria-label="Remove requirement"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <select
                                        value={requirement.time}
                                        onChange={(event) => {
                                            const nextTime = event.target.value;
                                            setRequirements((items) => items.map((item) => (
                                                item.id === requirement.id ? { ...item, time: nextTime } : item
                                            )));
                                            toast.info(`${to12h(nextTime)} selected.`);
                                        }}
                                        className="mt-3 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs font-black uppercase tracking-[0.12em] text-[#C8FF00] outline-none focus:border-[#C8FF00]/70"
                                    >
                                        {timeSlots.map((slot) => (
                                            <option key={slot} value={slot}>{to12h(slot)}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </section>

                    <Button
                        type="button"
                        onClick={handleSubmit}
                        className="h-12 w-full rounded-xl bg-[#C8FF00] text-[11px] font-black uppercase tracking-[0.16em] text-black hover:bg-[#b8ef00]"
                    >
                        CREATE PROGRAM
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
