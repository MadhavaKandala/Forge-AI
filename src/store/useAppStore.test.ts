import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from './useAppStore';

describe('useAppStore auth OTP', () => {
    beforeEach(() => {
        localStorage.clear();
        useAppStore.getState().logout();
    });

    it('verifies the requested OTP using matching SHA-256 hex encoding', async () => {
        const requested = await useAppStore.getState().requestOtp('test@test.com');
        const verified = await useAppStore.getState().verifyOtp('test@test.com', '123456');

        expect(requested).toBe(true);
        expect(verified).toBe(true);
        expect(useAppStore.getState().isAuthenticated).toBe(true);
    });
});
