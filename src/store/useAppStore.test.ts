import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from './useAppStore';

describe('useAppStore auth', () => {
    beforeEach(() => {
        localStorage.clear();
        useAppStore.setState({
            isAuthenticated: false,
            user: null,
            supabaseUserId: null,
            supabaseProfile: null,
            authError: null,
        });
    });

    it('supports local login helper and sign out state reset', async () => {
        useAppStore.getState().login({
            id: 'local-user',
            email: 'test@test.com',
            name: 'Operator',
            avatar: '',
            totalXP: 0,
        });
        expect(useAppStore.getState().isAuthenticated).toBe(true);

        await useAppStore.getState().logout();
        expect(useAppStore.getState().isAuthenticated).toBe(false);
    });
});
