import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CURATED_ROUTINES } from '@/lib/curatedRoutines';
import { useHabitStore } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';

export default function CuratedRoutineRail() {
    const habits = useHabitStore((s) => s.habits);
    const addHabit = useHabitStore((s) => s.addHabit);
    const activeRoutineIds = new Set(habits.map((habit) => habit.fromProgramId).filter(Boolean));

    const activateRoutine = (routineId: string) => {
        const routine = CURATED_ROUTINES.find((item) => item.id === routineId);
        if (!routine) return;
        if (activeRoutineIds.has(routineId)) {
            toast.info('Routine already active.');
            return;
        }

        routine.steps.forEach((step) => {
            addHabit({
                title: step.title,
                time: step.time,
                type: 'checkbox',
                category: step.category,
                fromProgramId: routine.id,
            });
        });
        toast.success(`${routine.name} deployed to Daily Ops`);
    };

    return (
        <section className="mt-7">
            <div className="mb-4 flex items-end justify-between">
                <div>
                    <h2 className="text-xl font-black uppercase leading-tight text-white">Curated Routines</h2>
                    <p className="mt-1 text-xs font-bold text-zinc-500">Structure your life in seconds.</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C8FF00]">Stacks</span>
            </div>
            <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2">
                {CURATED_ROUTINES.map((routine) => {
                    const active = activeRoutineIds.has(routine.id);
                    return (
                        <button
                            key={routine.id}
                            type="button"
                            onClick={() => activateRoutine(routine.id)}
                            className="min-h-[236px] w-[168px] shrink-0 overflow-hidden rounded-[28px] p-4 text-left text-[#101010] shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
                            style={{ backgroundColor: routine.bg }}
                        >
                            <div className="flex items-start justify-between">
                                <span className="text-3xl">{routine.icon}</span>
                                <span
                                    className={cn('grid h-8 w-8 place-items-center rounded-full text-white', active && 'text-black')}
                                    style={{ backgroundColor: active ? '#C8FF00' : routine.accent }}
                                >
                                    {active ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                </span>
                            </div>
                            <h3 className="mt-5 text-xl font-black uppercase leading-[1.05] tracking-tight">{routine.name}</h3>
                            <p className="mt-3 min-h-10 text-xs font-bold leading-5 text-[#202020]/70">{routine.tagline}</p>
                            <div className="mt-5 rounded-2xl bg-white/70 p-3">
                                {routine.steps.slice(0, 3).map((step, index) => (
                                    <div key={step.title} className="mb-2 flex items-center gap-2 last:mb-0">
                                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black text-white" style={{ backgroundColor: routine.accent }}>
                                            {index + 1}
                                        </span>
                                        <span className="truncate text-[10px] font-black">{step.time} · {step.title}</span>
                                    </div>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
