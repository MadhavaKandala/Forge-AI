import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { suggesterService, SuggestionResult } from '../services/suggesterService';
import { SmartSuggestion, UserPattern } from '../types/schema';

interface SuggesterState {
    currentSuggestion: SuggestionResult | null;
    suggestionHistory: SmartSuggestion[];
    userPatterns: UserPattern | null;
    isLoading: boolean;
    lastCalculated: string | null;

    // Actions
    getSuggestion: () => Promise<void>;
    recordAction: (taskId: string, action: SmartSuggestion['action_taken']) => Promise<void>;
    fetchHistory: () => Promise<void>;
    updatePatterns: (patterns: Partial<UserPattern>) => Promise<void>;
}

export const useSuggesterStore = create<SuggesterState>()(
    persist(
        (set, get) => ({
            currentSuggestion: null,
            suggestionHistory: [],
            userPatterns: null,
            isLoading: false,
            lastCalculated: null,

            getSuggestion: async () => {
                set({ isLoading: true });
                try {
                    const result = await suggesterService.getNextAction();
                    set({
                        currentSuggestion: result,
                        lastCalculated: new Date().toISOString(),
                        isLoading: false
                    });
                } catch (error) {
                    console.error("Error getting suggestion:", error);
                    set({ isLoading: false });
                }
            },

            recordAction: async (taskId, action) => {
                const { currentSuggestion } = get();
                if (!currentSuggestion || !currentSuggestion.nextAction) return;

                try {
                    await suggesterService.saveSuggestion({
                        taskId,
                        rank: 1,
                        actionTaken: action,
                        availableMinutes: 120, // Context should be passed or re-gathered
                        energyLevel: 'medium'
                    });
                    // Refresh history after recording action
                    await get().fetchHistory();
                } catch (error) {
                    console.error("Error recording action:", error);
                }
            },

            fetchHistory: async () => {
                // Implementation to fetch from DB
            },

            updatePatterns: async (patterns) => {
                set((state) => ({
                    userPatterns: state.userPatterns ? { ...state.userPatterns, ...patterns } : null
                }));
            }
        }),
        {
            name: 'suggester-storage',
            partialize: (state) => ({
                userPatterns: state.userPatterns,
                lastCalculated: state.lastCalculated
            }),
        }
    )
);
