import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types/schema';
import { userRepository } from '../repositories/user.repository';

interface UserState {
    user: User | null;
    isLoading: boolean;
    error: string | null;

    fetchUser: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            error: null,

            fetchUser: async () => {
                set({ isLoading: true, error: null });
                try {
                    const user = await userRepository.getCurrentUser();
                    set({ user });
                } catch (error) {
                    set({ error: (error as Error).message });
                } finally {
                    set({ isLoading: false });
                }
            },

            updateUser: async (updates) => {
                const { user } = get();
                if (!user) return;

                try {
                    await userRepository.update(user.id, updates);
                    set({ user: { ...user, ...updates } });
                } catch (error) {
                    set({ error: (error as Error).message });
                }
            }
        }),
        {
            name: 'user-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user
            })
        }
    )
);
