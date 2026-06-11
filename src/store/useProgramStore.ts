import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { deactivateEnrollmentInSupabase, syncEnrollmentToSupabase } from '@/lib/syncFromSupabase';
import { Program, ProgramDay } from '../services/programService';
import { PROGRAM_TEMPLATES, type ProgramTemplate } from '../services/programService';
import { useHabitStore } from './useHabitStore';
import { getCurrentStoreUserId, getUserScopedStoreName, useAppStore } from './useAppStore';

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

export interface CustomProgramInput {
    name: string;
    description: string;
    days: number;
    icon: string;
    category?: ProgramTemplate['category'];
    dailyRequirements: string[];
    dailyRequirementTimes?: Record<string, string>;
    isOngoing?: boolean;
}

export type RequirementCompletions = Record<string, Record<string, string[]>>;

interface ProgramState {
    activePrograms: Program[];
    completedPrograms: Program[];
    availablePrograms: ProgramTemplate[];
    customPrograms: ProgramTemplate[];
    selectedProgram: Program | null;
    selectedProgramDays: ProgramDay[];
    selectedProgramMilestones: any[];
    enrollments: ProgramEnrollment[];
    requirementCompletions: RequirementCompletions;
    isLoading: boolean;
    error: string | null;
    setEnrollments: (enrollments: ProgramEnrollment[]) => void;
    fetchAll: () => Promise<void>;
    fetchActivePrograms: () => Promise<void>;
    fetchAvailablePrograms: () => Promise<void>;
    fetchCompletedPrograms: () => Promise<void>;
    addCustomProgram: (program: CustomProgramInput) => void;
    enrollInProgram: (programId: string, selectedTime: string) => Promise<void>;
    unenrollFromProgram: (enrollmentId: string) => Promise<void>;
    toggleRequirementCompletion: (enrollmentId: string, requirementTitle: string, date: string) => void;
    startProgram: (type: string) => Promise<Program | null>;
    pauseProgram: (programId: string) => Promise<void>;
    resumeProgram: (programId: string) => Promise<void>;
    completeDailyRequirement: (programId: string, notes?: string) => Promise<void>;
    selectProgram: (programId: string) => Promise<void>;
    clearSelectedProgram: () => void;
    clearAll: () => void;
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

const getAllTemplates = (customPrograms: ProgramTemplate[]): ProgramTemplate[] => [
    ...PROGRAM_TEMPLATES,
    ...customPrograms,
];

export const useProgramStore = create<ProgramState>()(
    persist(
        (set, get) => ({
            activePrograms: [],
            completedPrograms: [],
            availablePrograms: PROGRAM_TEMPLATES,
            customPrograms: [],
            selectedProgram: null,
            selectedProgramDays: [],
            selectedProgramMilestones: [],
            enrollments: [],
            requirementCompletions: {},
            isLoading: false,
            error: null,

            setEnrollments: (enrollments) => {
                set({ enrollments });
                void get().fetchActivePrograms();
            },

            fetchAll: async () => {
                await get().fetchAvailablePrograms();
                await get().fetchActivePrograms();
                await get().fetchCompletedPrograms();
            },

            fetchAvailablePrograms: async () => {
                set((state) => ({ availablePrograms: getAllTemplates(state.customPrograms) }));
            },

            fetchActivePrograms: async () => {
                const { enrollments, customPrograms } = get();
                const templates = getAllTemplates(customPrograms);
                const active = enrollments
                    .map((enrollment) => {
                        if (enrollment.programId === 'demo-morning-protocol') {
                            return toDemoMorningProtocol(enrollment);
                        }
                        const template = templates.find((p) => p.type === enrollment.programId);
                        return template ? toProgram(template, enrollment) : null;
                    })
                    .filter((p): p is Program => p !== null);
                set({ activePrograms: active });
            },

            fetchCompletedPrograms: async () => {
                set({ completedPrograms: [] });
            },

            addCustomProgram: (program) => {
                const id = crypto.randomUUID();
                const nextProgram: ProgramTemplate = {
                    type: id,
                    name: program.name.trim(),
                    description: program.description.trim() || 'Custom tactical program.',
                    days: program.isOngoing ? 3650 : Math.max(1, program.days),
                    icon: program.icon,
                    difficulty: 'beginner',
                    category: program.category ?? 'wellness',
                    dailyRequirements: program.dailyRequirements,
                    dailyRequirementTimes: program.dailyRequirementTimes,
                    totalXpPotential: Math.max(1, program.dailyRequirements.length) * (program.isOngoing ? 3650 : Math.max(1, program.days)) * 10,
                    isCustom: true,
                    isOngoing: program.isOngoing,
                };

                set((state) => {
                    const customPrograms = [...state.customPrograms, nextProgram];
                    return {
                        customPrograms,
                        availablePrograms: getAllTemplates(customPrograms),
                    };
                });
            },

            enrollInProgram: async (programId: string, selectedTime: string) => {
                const template = getAllTemplates(get().customPrograms).find((p) => p.type === programId);
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

                const enrollment: ProgramEnrollment = {
                    id: programId,
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
                    const requirementTime = template.dailyRequirementTimes?.[requirement] ?? selectedTime;
                    habitStore.addHabit({
                        title: requirement,
                        time: toTimeLabel(requirementTime),
                        type: 'checkbox',
                        category: 'personal',
                        fromProgramId: programId,
                    });
                }

                const userId = useAppStore.getState().user?.id;
                if (userId) {
                    syncEnrollmentToSupabase(userId, programId, selectedTime, 1, 0);
                }

                await get().fetchActivePrograms();
                toast.success('Program deployed. Habits injected into Daily Ops.');
            },

            unenrollFromProgram: async (enrollmentId: string) => {
                const enrollment = get().enrollments.find((item) => item.id === enrollmentId);
                set((state) => {
                    const { [enrollmentId]: _removed, ...requirementCompletions } = state.requirementCompletions;
                    return {
                        enrollments: state.enrollments.filter((e) => e.id !== enrollmentId),
                        requirementCompletions,
                    };
                });

                useHabitStore.getState().removeHabitsByProgramId(enrollmentId);
                const userId = useAppStore.getState().user?.id;
                if (userId && enrollment) {
                    deactivateEnrollmentInSupabase(userId, enrollment.programId);
                }
                await get().fetchActivePrograms();
                toast.success('Program deactivated.');
            },

            toggleRequirementCompletion: (enrollmentId, requirementTitle, date) => {
                let completedNow = false;
                set((state) => {
                    const enrollmentCompletions = state.requirementCompletions[enrollmentId] ?? {};
                    const dateCompletions = enrollmentCompletions[date] ?? [];
                    const alreadyComplete = dateCompletions.includes(requirementTitle);
                    const nextDateCompletions = alreadyComplete
                        ? dateCompletions.filter((title) => title !== requirementTitle)
                        : [...dateCompletions, requirementTitle];
                    completedNow = !alreadyComplete;

                    return {
                        requirementCompletions: {
                            ...state.requirementCompletions,
                            [enrollmentId]: {
                                ...enrollmentCompletions,
                                [date]: nextDateCompletions,
                            },
                        },
                    };
                });

                if (completedNow) {
                    useHabitStore.getState().addXP(5);
                    toast.success('+5 XP. Requirement complete.');
                } else {
                    toast.info('Requirement unchecked.');
                }
            },

            startProgram: async (type: string) => {
                await get().enrollInProgram(type, '09:00');
                const enrollment = get().enrollments.find((e) => e.programId === type);
                if (!enrollment) return null;
                const template = getAllTemplates(get().customPrograms).find((p) => p.type === type);
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
                const userId = useAppStore.getState().user?.id;
                const enrollment = get().enrollments.find((item) => item.programId === programId);
                if (userId && enrollment) {
                    syncEnrollmentToSupabase(userId, enrollment.programId, enrollment.preferredTime, enrollment.currentDay, enrollment.streak);
                }
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
                const template = getAllTemplates(get().customPrograms).find((p) => p.type === enrollment.programId);
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

            clearAll: () => set({
                activePrograms: [],
                completedPrograms: [],
                availablePrograms: PROGRAM_TEMPLATES,
                customPrograms: [],
                selectedProgram: null,
                selectedProgramDays: [],
                selectedProgramMilestones: [],
                enrollments: [],
                requirementCompletions: {},
                isLoading: false,
                error: null,
            }),
        }),
        {
            name: getUserScopedStoreName('program-store', getCurrentStoreUserId()),
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                activePrograms: state.activePrograms,
                completedPrograms: state.completedPrograms,
                availablePrograms: state.availablePrograms,
                customPrograms: state.customPrograms,
                selectedProgram: state.selectedProgram,
                selectedProgramDays: state.selectedProgramDays,
                selectedProgramMilestones: state.selectedProgramMilestones,
                enrollments: state.enrollments,
                requirementCompletions: state.requirementCompletions,
            }),
        },
    ),
);
