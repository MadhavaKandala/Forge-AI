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
                    let user = await userRepository.getCurrentUser();
                    if (!user) {
                        // Initialize default user if none exists
                        const defaultUser: Partial<User> = {
                            id: 'default-user',
                            name: 'Madhava', // From previous store
                            level: 1,
                            total_xp: 0,
                            onboarding_completed: 0,
                            avatar_url: 'https://github.com/shadcn.png'
                        };
                        user = await userRepository.create(defaultUser);
                    }
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
