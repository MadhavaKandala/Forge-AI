import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { Program, ProgramDay } from '../services/programService';
import { PROGRAM_TEMPLATES, type ProgramTemplate } from '../services/programService';
import { useHabitStore } from './useHabitStore';

export interface ProgramEnrollment {
    id: string;
    programId: string;
    startedAt: string;
    preferredTime: string;
    currentDay: number;
    totalDays: number;
    streak: number;
    completedDays: number;
}

interface ProgramState {
    activePrograms: Program[];
    completedPrograms: Program[];
    availablePrograms: ProgramTemplate[];
    selectedProgram: Program | null;
    selectedProgramDays: ProgramDay[];
    selectedProgramMilestones: any[];
    enrollments: ProgramEnrollment[];
    isLoading: boolean;
    error: string | null;
    fetchAll: () => Promise<void>;
    fetchActivePrograms: () => Promise<void>;
    fetchAvailablePrograms: () => Promise<void>;
    fetchCompletedPrograms: () => Promise<void>;
    enrollInProgram: (programId: string, selectedTime: string) => Promise<void>;
    unenrollFromProgram: (enrollmentId: string) => Promise<void>;
    startProgram: (type: string) => Promise<Program | null>;
    pauseProgram: (programId: string) => Promise<void>;
    resumeProgram: (programId: string) => Promise<void>;
    completeDailyRequirement: (programId: string, notes?: string) => Promise<void>;
    selectProgram: (programId: string) => Promise<void>;
    clearSelectedProgram: () => void;
}

const toProgram = (template: ProgramTemplate, enrollment: ProgramEnrollment): Program => {
    const completion = (enrollment.completedDays / Math.max(enrollment.totalDays, 1)) * 100;
    return {
        id: enrollment.id,
        name: template.name,
        description: template.description,
        programType: template.type,
        totalDays: template.days,
        currentDay: enrollment.currentDay,
        status: 'active',
        startedAt: enrollment.startedAt,
        category: template.category,
        difficulty: template.difficulty,
        dailyRequirements: template.dailyRequirements,
        phases: template.phases,
        totalXpPotential: template.totalXpPotential,
        xpEarned: enrollment.completedDays * 10,
        completionPercentage: completion,
        icon: template.icon,
    };
};

const toDemoMorningProtocol = (enrollment: ProgramEnrollment): Program => ({
    id: enrollment.id,
    name: 'Morning Protocol',
    description: 'Meditation, code, gym, and planning before the day gets noisy.',
    programType: 'routine',
    totalDays: enrollment.totalDays,
    currentDay: enrollment.currentDay,
    status: 'active',
    startedAt: enrollment.startedAt,
    category: 'productivity',
    difficulty: 'beginner',
    dailyRequirements: ['Morning Meditation', 'Morning Code Session', 'Gym'],
    totalXpPotential: 3000,
    xpEarned: enrollment.completedDays * 100,
    completionPercentage: (enrollment.completedDays / Math.max(enrollment.totalDays, 1)) * 100,
    icon: '⚡',
});

const toTimeLabel = (time24: string): string => {
    const [hRaw, m] = time24.split(':').map(Number);
    const suffix = hRaw >= 12 ? 'PM' : 'AM';
    const h12 = hRaw % 12 === 0 ? 12 : hRaw % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const useProgramStore = create<ProgramState>()(
    persist(
        (set, get) => ({
            activePrograms: [],
            completedPrograms: [],
            availablePrograms: PROGRAM_TEMPLATES,
            selectedProgram: null,
            selectedProgramDays: [],
            selectedProgramMilestones: [],
            enrollments: [],
            isLoading: false,
            error: null,

            fetchAll: async () => {
                await get().fetchAvailablePrograms();
                await get().fetchActivePrograms();
                await get().fetchCompletedPrograms();
            },

            fetchAvailablePrograms: async () => {
                set({ availablePrograms: PROGRAM_TEMPLATES });
            },

            fetchActivePrograms: async () => {
                const { enrollments } = get();
                const active = enrollments
                    .map((enrollment) => {
                        if (enrollment.programId === 'demo-morning-protocol') {
                            return toDemoMorningProtocol(enrollment);
                        }
                        const template = PROGRAM_TEMPLATES.find((p) => p.type === enrollment.programId);
                        return template ? toProgram(template, enrollment) : null;
                    })
                    .filter((p): p is Program => p !== null);
                set({ activePrograms: active });
            },

            fetchCompletedPrograms: async () => {
                set({ completedPrograms: [] });
            },

            enrollInProgram: async (programId: string, selectedTime: string) => {
                const template = PROGRAM_TEMPLATES.find((p) => p.type === programId);
                if (!template) {
                    set({ error: 'Program not found' });
                    toast.error('Program not found.');
                    return;
                }

                const exists = get().enrollments.some((e) => e.programId === programId);
                if (exists) {
                    toast.error('Program already active.');
                    return;
                }

                const enrollmentId = crypto.randomUUID();
                const enrollment: ProgramEnrollment = {
                    id: enrollmentId,
                    programId,
                    startedAt: new Date().toISOString(),
                    preferredTime: selectedTime,
                    currentDay: 1,
                    totalDays: template.days,
                    streak: 0,
                    completedDays: 0,
                };

                set((state) => ({
                    enrollments: [...state.enrollments, enrollment],
                }));

                const habitStore = useHabitStore.getState();
                for (const requirement of template.dailyRequirements) {
                    habitStore.addHabit({
                        title: requirement,
                        time: toTimeLabel(selectedTime),
                        type: 'checkbox',
                        category: 'personal',
                        fromProgramId: enrollmentId,
                    });
                }

                await get().fetchActivePrograms();
                toast.success('Program activated — requirements added to your daily schedule');
            },

            unenrollFromProgram: async (enrollmentId: string) => {
                set((state) => ({
                    enrollments: state.enrollments.filter((e) => e.id !== enrollmentId),
                }));

                useHabitStore.getState().removeHabitsByProgramId(enrollmentId);
                await get().fetchActivePrograms();
                toast.success('Program deactivated');
            },

            startProgram: async (type: string) => {
                await get().enrollInProgram(type, '09:00');
                const enrollment = get().enrollments.find((e) => e.programId === type);
                if (!enrollment) return null;
                const template = PROGRAM_TEMPLATES.find((p) => p.type === type);
                if (!template) return null;
                return toProgram(template, enrollment);
            },

            pauseProgram: async () => {
                toast.info('Program paused.');
            },

            resumeProgram: async () => {
                toast.success('Program resumed.');
            },

            completeDailyRequirement: async (programId: string) => {
                set((state) => ({
                    enrollments: state.enrollments.map((e) => {
                        if (e.programId !== programId) return e;
                        return {
                            ...e,
                            completedDays: Math.min(e.completedDays + 1, e.totalDays),
                            currentDay: Math.min(e.currentDay + 1, e.totalDays),
                            streak: e.streak + 1,
                        };
                    }),
                }));
                useHabitStore.getState().addXP(20);
                await get().fetchActivePrograms();
                toast.success('Requirement completed.');
            },

            selectProgram: async (programId: string) => {
                const enrollment = get().enrollments.find((e) => e.id === programId || e.programId === programId);
                if (!enrollment) {
                    set({ selectedProgram: null, selectedProgramDays: [], selectedProgramMilestones: [] });
                    return;
                }
                const template = PROGRAM_TEMPLATES.find((p) => p.type === enrollment.programId);
                if (!template) {
                    set({ selectedProgram: null, selectedProgramDays: [], selectedProgramMilestones: [] });
                    return;
                }
                set({
                    selectedProgram: toProgram(template, enrollment),
                    selectedProgramDays: [],
                    selectedProgramMilestones: [],
                });
            },

            clearSelectedProgram: () => {
                set({
                    selectedProgram: null,
                    selectedProgramDays: [],
                    selectedProgramMilestones: [],
                    error: null,
                });
            },
        }),
        {
            name: 'program-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                activePrograms: state.activePrograms,
                completedPrograms: state.completedPrograms,
                availablePrograms: state.availablePrograms,
                selectedProgram: state.selectedProgram,
                selectedProgramDays: state.selectedProgramDays,
                selectedProgramMilestones: state.selectedProgramMilestones,
                enrollments: state.enrollments,
            }),
        },
    ),
);
