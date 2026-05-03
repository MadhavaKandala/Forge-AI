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
                set((state) => ({
                    suggestionHistory: [
                        ...state.suggestionHistory,
                        {
                            id: `${taskId}-${Date.now()}`,
                            user_id: 'local-user',
                            suggested_task_id: taskId,
                            rank: 1,
                            time_available_minutes: 120,
                            energy_level: 'medium',
                            current_time: new Date().toISOString(),
                            day_of_week: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
                            action_taken: action,
                            task_completed: action === 'started' ? 1 : 0,
                            was_correct_suggestion: action === 'started' ? 1 : 0,
                            created_at: new Date().toISOString()
                        }
                    ]
                }));
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
