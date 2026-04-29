import { create } from 'zustand';

interface AppState {
    isAuthenticated: boolean;
    pendingEmail: string | null;
    pendingOtp: string | null;
    requestOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<boolean>;
    logout: () => void;
}

const generateOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();

export const useAppStore = create<AppState>((set, get) => ({
    isAuthenticated: false,
    pendingEmail: null,
    pendingOtp: null,

    requestOtp: async (email: string) => {
        const otp = generateOtp();
        set({
            pendingEmail: email.trim().toLowerCase(),
            pendingOtp: otp,
        });
    },

    verifyOtp: async (email: string, otp: string) => {
        const normalizedEmail = email.trim().toLowerCase();
        const { pendingEmail, pendingOtp } = get();
        const isValid = pendingEmail === normalizedEmail && pendingOtp === otp;

        if (isValid) {
            set({
                isAuthenticated: true,
                pendingOtp: null,
            });
            return true;
        }

        return false;
    },

    logout: () => {
        set({
            isAuthenticated: false,
            pendingEmail: null,
            pendingOtp: null,
        });
    },
}));
