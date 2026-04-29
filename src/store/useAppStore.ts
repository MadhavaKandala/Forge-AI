import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_LOCK_MS = 30 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

const hashValue = async (value: string): Promise<string> => {
    const encoded = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return toHex(digest);
};

export const createSessionIntegrity = (token: string, email: string): string => {
    const source = `${token}:${email}:forge-auth-v1`;
    let hash = 5381;
    for (let i = 0; i < source.length; i += 1) {
        hash = (hash * 33) ^ source.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
};

interface AppState {
    isAuthenticated: boolean;
    sessionToken: string | null;
    sessionEmail: string | null;
    sessionIntegrity: string | null;

    pendingEmail: string | null;
    pendingOtpHash: string | null;
    otpExpiresAt: number | null;
    failedOtpAttempts: number;
    otpLockUntil: number | null;
    authError: string | null;

    requestOtp: (email: string) => Promise<boolean>;
    verifyOtp: (email: string, otp: string) => Promise<boolean>;
    clearAuthError: () => void;
    logout: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            sessionToken: null,
            sessionEmail: null,
            sessionIntegrity: null,

            pendingEmail: null,
            pendingOtpHash: null,
            otpExpiresAt: null,
            failedOtpAttempts: 0,
            otpLockUntil: null,
            authError: null,

            requestOtp: async (email: string) => {
                const normalizedEmail = email.trim().toLowerCase();
                const now = Date.now();
                const { otpLockUntil } = get();

                if (!emailRegex.test(normalizedEmail)) {
                    set({ authError: 'Enter valid email.' });
                    return false;
                }

                if (otpLockUntil && now < otpLockUntil) {
                    set({ authError: `Too many attempts. Try again in ${Math.ceil((otpLockUntil - now) / 1000)}s.` });
                    return false;
                }

                const otpHash = await hashValue(generateOtp());
                set({
                    pendingEmail: normalizedEmail,
                    pendingOtpHash: otpHash,
                    otpExpiresAt: now + OTP_TTL_MS,
                    failedOtpAttempts: 0,
                    otpLockUntil: null,
                    authError: null,
                });
                return true;
            },

            verifyOtp: async (email: string, otp: string) => {
                const normalizedEmail = email.trim().toLowerCase();
                const now = Date.now();
                const {
                    pendingEmail,
                    pendingOtpHash,
                    otpExpiresAt,
                    failedOtpAttempts,
                    otpLockUntil,
                } = get();

                if (otpLockUntil && now < otpLockUntil) {
                    set({ authError: `Too many attempts. Try again in ${Math.ceil((otpLockUntil - now) / 1000)}s.` });
                    return false;
                }

                if (!pendingEmail || !pendingOtpHash || !otpExpiresAt || now > otpExpiresAt) {
                    set({ authError: 'OTP expired. Resend code.' });
                    return false;
                }

                if (normalizedEmail !== pendingEmail || !/^\d{6}$/.test(otp) || otp.length !== OTP_LENGTH) {
                    const attempts = failedOtpAttempts + 1;
                    if (attempts >= MAX_OTP_ATTEMPTS) {
                        set({
                            failedOtpAttempts: 0,
                            otpLockUntil: now + OTP_LOCK_MS,
                            authError: 'Too many attempts. Wait 30 seconds.',
                        });
                        return false;
                    }

                    set({
                        failedOtpAttempts: attempts,
                        authError: 'Invalid code. Try again.',
                    });
                    return false;
                }

                const otpHash = await hashValue(otp);
                if (otpHash !== pendingOtpHash) {
                    const attempts = failedOtpAttempts + 1;
                    if (attempts >= MAX_OTP_ATTEMPTS) {
                        set({
                            failedOtpAttempts: 0,
                            otpLockUntil: now + OTP_LOCK_MS,
                            authError: 'Too many attempts. Wait 30 seconds.',
                        });
                        return false;
                    }

                    set({
                        failedOtpAttempts: attempts,
                        authError: 'Invalid code. Try again.',
                    });
                    return false;
                }

                const sessionToken = crypto.randomUUID();
                const sessionIntegrity = createSessionIntegrity(sessionToken, normalizedEmail);
                set({
                    isAuthenticated: true,
                    sessionToken,
                    sessionEmail: normalizedEmail,
                    sessionIntegrity,
                    pendingEmail: null,
                    pendingOtpHash: null,
                    otpExpiresAt: null,
                    failedOtpAttempts: 0,
                    otpLockUntil: null,
                    authError: null,
                });
                return true;
            },

            clearAuthError: () => set({ authError: null }),

            logout: () => {
                set({
                    isAuthenticated: false,
                    sessionToken: null,
                    sessionEmail: null,
                    sessionIntegrity: null,
                    pendingEmail: null,
                    pendingOtpHash: null,
                    otpExpiresAt: null,
                    failedOtpAttempts: 0,
                    otpLockUntil: null,
                    authError: null,
                });
            },
        }),
        {
            name: 'app-auth-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                sessionToken: state.sessionToken,
                sessionEmail: state.sessionEmail,
                sessionIntegrity: state.sessionIntegrity,
            }),
        },
    ),
);
