import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { programService, type Program, type ProgramTemplate, type ProgramDay } from '../services/programService';

interface ProgramState {
    activePrograms: Program[];
    completedPrograms: Program[];
    availablePrograms: ProgramTemplate[];

    // Selected Program Details
    selectedProgram: Program | null;
    selectedProgramDays: ProgramDay[];
    selectedProgramMilestones: any[];

    isLoading: boolean;
    error: string | null;

    // Actions
    fetchAll: () => Promise<void>;
    fetchActivePrograms: () => Promise<void>;
    fetchAvailablePrograms: () => Promise<void>;
    fetchCompletedPrograms: () => Promise<void>;

    startProgram: (type: string) => Promise<Program | null>;
    pauseProgram: (programId: string) => Promise<void>;
    resumeProgram: (programId: string) => Promise<void>;
    completeDailyRequirement: (programId: string, notes?: string) => Promise<void>;

    selectProgram: (programId: string) => Promise<void>;
    clearSelectedProgram: () => void;
}

export const useProgramStore = create<ProgramState>()(
    persist(
        (set, get) => ({
            activePrograms: [],
            completedPrograms: [],
            availablePrograms: [],
            selectedProgram: null,
            selectedProgramDays: [],
            selectedProgramMilestones: [],
            isLoading: false,
            error: null,

            fetchAll: async () => {
                set({ isLoading: true, error: null });
                try {
                    await Promise.all([
                        get().fetchActivePrograms(),
                        get().fetchCompletedPrograms(),
                        get().fetchAvailablePrograms()
                    ]);
                } catch (error) {
                    console.error('Error fetching programs:', error);
                    set({ error: (error as Error).message });
                } finally {
                    set({ isLoading: false });
                }
            },

            fetchActivePrograms: async () => {
                try {
                    const programs = await programService.getActivePrograms();
                    set({ activePrograms: programs });
                } catch (err) {
                    console.error('Failed to fetch active programs', err);
                }
            },

            fetchAvailablePrograms: async () => {
                try {
                    const available = await programService.getAvailablePrograms();
                    set({ availablePrograms: available });
                } catch (err) {
                    console.error('Failed to fetch available programs', err);
                }
            },

            fetchCompletedPrograms: async () => {
                try {
                    const completed = await programService.getCompletedPrograms();
                    set({ completedPrograms: completed });
                } catch (err) {
                    console.error('Failed to fetch completed programs', err);
                }
            },

            startProgram: async (type: string) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await programService.startProgram(type);
                    if (result) {
                        await get().fetchAll();
                    }
                    return result;
                } catch (error) {
                    console.error('Error starting program:', error);
                    set({ error: (error as Error).message });
                    return null;
                } finally {
                    set({ isLoading: false });
                }
            },

            pauseProgram: async (programId: string) => {
                await programService.pauseProgram(programId);
                await get().fetchAll();
                // Refresh selected program if active
                const { selectedProgram } = get();
                if (selectedProgram?.id === programId) {
                    await get().selectProgram(programId);
                }
            },

            resumeProgram: async (programId: string) => {
                await programService.resumeProgram(programId);
                await get().fetchAll();
                const { selectedProgram } = get();
                if (selectedProgram?.id === programId) {
                    await get().selectProgram(programId);
                }
            },

            completeDailyRequirement: async (programId: string, notes?: string) => {
                await programService.completeProgramDay(programId, notes);
                await get().fetchActivePrograms();

                // Refresh selected program state
                const { selectedProgram } = get();
                if (selectedProgram?.id === programId) {
                    await get().selectProgram(programId);
                }
            },

            selectProgram: async (programId: string) => {
                set({ isLoading: true });
                try {
                    const program = await programService.getProgramById(programId);
                    const days = await programService.getProgramDays(programId);
                    const milestones = await programService.getProgramMilestones(programId);
                    set({
                        selectedProgram: program,
                        selectedProgramDays: days,
                        selectedProgramMilestones: milestones,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error('Error selecting program:', error);
                    set({ isLoading: false, error: 'Failed to load program details' });
                }
            },

            clearSelectedProgram: () => {
                set({
                    selectedProgram: null,
                    selectedProgramDays: [],
                    selectedProgramMilestones: [],
                    error: null
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
                selectedProgramMilestones: state.selectedProgramMilestones
            })
        }
    )
);
