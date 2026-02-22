import { create } from 'zustand';
import { BlitzList, BlitzSession, BlitzBreak } from '../types/schema';
import { blitzRepository } from '../repositories/blitz.repository';
import { v4 as uuidv4 } from 'uuid';

interface BlitzState {
    lists: BlitzList[];
    currentSession: BlitzSession | null;
    currentBreaks: BlitzBreak[];
    isLoading: boolean;
    error: string | null;

    // List Actions
    fetchLists: () => Promise<void>;
    addList: (list: Omit<BlitzList, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateList: (id: string, updates: Partial<BlitzList>) => Promise<void>;
    deleteList: (id: string) => Promise<void>;

    // Session Actions
    startBlitzSession: (taskId: string, estMinutes: number) => Promise<void>;
    pauseBlitzSession: () => Promise<void>;
    resumeBlitzSession: () => Promise<void>;
    completeBlitzSession: (takenMinutes: number) => Promise<void>;

    // Break Actions
    startBreak: (sessionId: string) => Promise<void>;
    completeBreak: (breakId: string) => Promise<void>;
}

export const useBlitzStore = create<BlitzState>((set, get) => ({
    lists: [],
    currentSession: null,
    currentBreaks: [],
    isLoading: false,
    error: null,

    fetchLists: async () => {
        set({ isLoading: true });
        try {
            const lists = await blitzRepository.findAllLists();
            set({ lists });
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ isLoading: false });
        }
    },

    addList: async (listData) => {
        try {
            const newList: BlitzList = {
                ...listData,
                id: uuidv4(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            } as BlitzList;
            await blitzRepository.create(newList);
            set(state => ({ lists: [...state.lists, newList] }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    updateList: async (id, updates) => {
        try {
            await blitzRepository.update(id, { ...updates, updated_at: new Date().toISOString() });
            set(state => ({
                lists: state.lists.map(l => l.id === id ? { ...l, ...updates } : l)
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    deleteList: async (id) => {
        try {
            await blitzRepository.delete(id);
            set(state => ({
                lists: state.lists.filter(l => l.id !== id)
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    startBlitzSession: async (taskId, estMinutes) => {
        try {
            const newSession: BlitzSession = {
                id: uuidv4(),
                task_id: taskId,
                started_at: new Date().toISOString(),
                est_minutes: estMinutes,
                was_completed: 0
            };
            await blitzRepository.saveSession(newSession);
            set({ currentSession: newSession, currentBreaks: [] });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    pauseBlitzSession: async () => {
        // Log pause logic if needed
    },

    resumeBlitzSession: async () => {
        // Log resume logic if needed
    },

    completeBlitzSession: async (takenMinutes) => {
        const { currentSession } = get();
        if (!currentSession) return;

        try {
            const updates = {
                ended_at: new Date().toISOString(),
                taken_minutes: takenMinutes,
                was_completed: 1
            };
            await blitzRepository.updateSession(currentSession.id, updates);
            set({ currentSession: null, currentBreaks: [] });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    startBreak: async (sessionId) => {
        try {
            const newBreak: BlitzBreak = {
                id: uuidv4(),
                session_id: sessionId,
                started_at: new Date().toISOString()
            };
            await blitzRepository.saveBreak(newBreak);
            set(state => ({ currentBreaks: [...state.currentBreaks, newBreak] }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    completeBreak: async (breakId) => {
        try {
            const updates = { ended_at: new Date().toISOString() };
            await blitzRepository.updateBreak(breakId, updates);
            set(state => ({
                currentBreaks: state.currentBreaks.map(b => b.id === breakId ? { ...b, ...updates } : b)
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    }
}));
