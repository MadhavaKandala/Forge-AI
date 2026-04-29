import React, { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useProgramStore } from '@/store/useProgramStore';
import { type ProgramTemplate } from '@/services/programService';

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

const ProgramsPage: React.FC = () => {
    const {
        activePrograms,
        availablePrograms,
        enrollments,
        fetchAll,
        enrollInProgram,
        unenrollFromProgram,
    } = useProgramStore();

    const [selectedProgram, setSelectedProgram] = useState<ProgramTemplate | null>(null);
    const [selectedTime, setSelectedTime] = useState('09:00');
    const timeSlots = useMemo(buildTimeSlots, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const activeProgramIds = useMemo(
        () => new Set(enrollments.map((e) => e.programId)),
        [enrollments],
    );

    const getEnrollmentId = (programType: string): string | null => {
        const enrollment = enrollments.find((e) => e.programId === programType);
        return enrollment?.id ?? null;
    };

    const handleDeploy = async () => {
        if (!selectedProgram) return;
        await enrollInProgram(selectedProgram.type, selectedTime);
        setSelectedProgram(null);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white px-4 pt-6 pb-28">
            <h1 className="text-xl font-black tracking-[0.16em] uppercase text-[#C8FF00]">Programs</h1>

            <section className="mt-6">
                <h2 className="text-xs font-black tracking-[0.18em] uppercase text-zinc-400 mb-3">ACTIVE PROGRAMS</h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {activePrograms.map((program) => {
                        const enrollmentId = getEnrollmentId(program.programType);
                        return (
                            <div
                                key={program.id}
                                className="min-w-[280px] rounded-2xl border border-zinc-800 bg-[#141414] p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{program.icon ?? '🎯'}</span>
                                        <div>
                                            <p className="font-black">{program.name}</p>
                                            <p className="text-xs text-zinc-400">
                                                Day {program.currentDay}/{program.totalDays}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="rounded-full bg-zinc-900 px-2 py-1 text-xs text-[#C8FF00] flex items-center gap-1">
                                        <Flame className="w-3 h-3" />
                                        {(enrollments.find((e) => e.programId === program.programType)?.streak ?? 0).toString()}
                                    </div>
                                </div>

                                <Progress value={program.completionPercentage ?? 0} className="h-2 mt-4 bg-zinc-800" />

                                <Button
                                    type="button"
                                    onClick={() => enrollmentId && unenrollFromProgram(enrollmentId)}
                                    className="w-full mt-4 bg-[#1C1C1C] border border-zinc-700 text-[#FF4444] hover:bg-zinc-900 font-black uppercase tracking-[0.12em]"
                                >
                                    DEACTIVATE
                                </Button>
                            </div>
                        );
                    })}
                    {activePrograms.length === 0 && (
                        <div className="w-full rounded-2xl border border-zinc-800 bg-[#141414] p-4 text-sm text-zinc-500">
                            No active programs.
                        </div>
                    )}
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-xs font-black tracking-[0.18em] uppercase text-zinc-400 mb-3">ALL PROGRAMS</h2>
                <div className="grid grid-cols-2 gap-3">
                    {availablePrograms.map((program) => {
                        const isActive = activeProgramIds.has(program.type);
                        return (
                            <div key={program.type} className="rounded-2xl border border-zinc-800 bg-[#141414] overflow-hidden">
                                <div className="h-1 bg-[#C8FF00]" />
                                <div className="p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xl">{program.icon}</span>
                                        {isActive && (
                                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-zinc-900 text-[#22C55E] font-black">
                                                <BadgeCheck className="w-3 h-3" />
                                                ACTIVE
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-black text-sm">{program.name}</p>
                                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-3">{program.description}</p>
                                    <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-[0.1em]">{program.days} days</p>
                                    {!isActive && (
                                        <Button
                                            type="button"
                                            onClick={() => setSelectedProgram(program)}
                                            className="w-full mt-3 bg-[#C8FF00] text-black hover:bg-[#b8ef00] font-black uppercase tracking-[0.12em]"
                                        >
                                            ACTIVATE
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <Sheet open={!!selectedProgram} onOpenChange={(open) => !open && setSelectedProgram(null)}>
                <SheetContent
                    side="bottom"
                    className="bg-[#141414] border-zinc-800 rounded-t-3xl max-h-[85vh] overflow-y-auto"
                >
                    {selectedProgram && (
                        <div className="space-y-4">
                            <SheetHeader>
                                <SheetTitle className="text-white font-black uppercase tracking-[0.12em]">
                                    {selectedProgram.name}
                                </SheetTitle>
                                <SheetDescription className="text-zinc-400">
                                    Set mission slot. Deploy requirements.
                                </SheetDescription>
                            </SheetHeader>

                            <div className="rounded-2xl bg-[#1C1C1C] p-3 border border-zinc-800">
                                <p className="text-xs text-zinc-500 uppercase font-black tracking-[0.14em] mb-2">Requirements</p>
                                <div className="space-y-2">
                                    {selectedProgram.dailyRequirements.map((requirement, idx) => (
                                        <p key={idx} className="text-sm text-zinc-200">• {requirement}</p>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-zinc-500 uppercase font-black tracking-[0.14em] mb-2">Time Slot</p>
                                <div className="max-h-52 overflow-y-auto rounded-2xl border border-zinc-800 bg-[#1C1C1C] p-2 grid grid-cols-3 gap-2">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setSelectedTime(slot)}
                                            className={`text-xs font-black rounded-xl px-2 py-2 border ${selectedTime === slot
                                                    ? 'border-[#C8FF00] bg-[#C8FF00] text-black'
                                                    : 'border-zinc-700 text-zinc-300 bg-zinc-900'
                                                }`}
                                        >
                                            {to12h(slot)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={handleDeploy}
                                className="w-full h-11 bg-[#C8FF00] text-black hover:bg-[#b8ef00] font-black uppercase tracking-[0.14em]"
                            >
                                DEPLOY PROGRAM
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default ProgramsPage;
