import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PROGRAM_TEMPLATES } from '@/services/programService';
import { useProgramStore } from '@/store/useProgramStore';
import { cn } from '@/lib/utils';

const routineTheme: Record<string, { bg: string; accent: string; copy: string }> = {
    leetcode_75: { bg: '#E8F4FF', accent: '#38BDF8', copy: 'Plan interview tasks easily.' },
    leetcode_150: { bg: '#F4E8FF', accent: '#C084FC', copy: 'Placement prep in seconds.' },
    dsa_sheet: { bg: '#FFF4CC', accent: '#FACC15', copy: 'Build problem-solving habits.' },
    gym_progress: { bg: '#FFE8E2', accent: '#FB7185', copy: 'Small effort. Strong body.' },
    core_subjects: { bg: '#E8FBEF', accent: '#22C55E', copy: 'Track revision progress.' },
};

const toTimeLabel = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '06:00';
    if (hour < 18) return '16:00';
    return '20:00';
};

export default function CuratedRoutineRail() {
    const enrollInProgram = useProgramStore((s) => s.enrollInProgram);
    const enrollments = useProgramStore((s) => s.enrollments);
    const activeProgramIds = new Set(enrollments.map((item) => item.programId));

    const activateRoutine = async (programId: string) => {
        if (activeProgramIds.has(programId)) {
            toast.info('Routine already active.');
            return;
        }

        await enrollInProgram(programId, toTimeLabel());
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
                {PROGRAM_TEMPLATES.slice(0, 5).map((program) => {
                    const theme = routineTheme[program.type] ?? routineTheme.leetcode_75;
                    const active = activeProgramIds.has(program.type);
                    return (
                        <button
                            key={program.type}
                            type="button"
                            onClick={() => { void activateRoutine(program.type); }}
                            className="min-h-[236px] w-[168px] shrink-0 overflow-hidden rounded-[28px] p-4 text-left text-[#101010] shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
                            style={{ backgroundColor: theme.bg }}
                        >
                            <div className="flex items-start justify-between">
                                <span className="text-3xl">{program.icon}</span>
                                <span
                                    className={cn('grid h-8 w-8 place-items-center rounded-full text-white', active && 'text-black')}
                                    style={{ backgroundColor: active ? '#C8FF00' : theme.accent }}
                                >
                                    {active ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                </span>
                            </div>
                            <h3 className="mt-5 text-xl font-black uppercase leading-[1.05] tracking-tight">{program.name}</h3>
                            <p className="mt-3 min-h-10 text-xs font-bold leading-5 text-[#202020]/70">{theme.copy}</p>
                            <div className="mt-5 rounded-2xl bg-white/70 p-3">
                                {program.dailyRequirements.slice(0, 3).map((item, index) => (
                                    <div key={item} className="mb-2 flex items-center gap-2 last:mb-0">
                                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black text-white" style={{ backgroundColor: theme.accent }}>
                                            {index + 1}
                                        </span>
                                        <span className="truncate text-[10px] font-black">{item}</span>
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
