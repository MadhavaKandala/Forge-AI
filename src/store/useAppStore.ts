import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

import { loadUserData, syncAllHabitsToSupabase, syncAllMissionsToSupabase } from '@/lib/syncFromSupabase';
import { clearSupabaseAuthStorage, supabase } from '@/lib/supabase';

const GOOGLE_WEB_CLIENT_ID = '275760652639-4flj5gar1op7tfsr5gkkcd13t8t4t2im.apps.googleusercontent.com';

interface AppUser {
    id: string;
    email: string;
    name: string;
    avatar: string;
    totalXP: number;
}

const fetchSupabaseUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) return null;
    return data;
};

const toAppUser = (user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown> | null;
}, profile?: { name?: string | null; avatar_url?: string | null; total_xp?: number | null } | null): AppUser => ({
    id: user.id,
    email: user.email ?? '',
    name: profile?.name ?? (typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : 'Operator'),
    avatar: profile?.avatar_url ?? (typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : ''),
    totalXP: profile?.total_xp ?? 0,
});

const deriveNameFromEmail = (email?: string | null) => {
    const localPart = email?.split('@')[0]?.trim();
    if (!localPart) return 'Operator';

    return localPart
        .replace(/[._-]+/g, ' ')
        .replace(/\d+/g, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ') || 'Operator';
};

const getFallbackProfileName = (email?: string | null, googleName?: string | null) => {
    const emailName = deriveNameFromEmail(email);
    if (emailName !== 'Operator') return emailName;
    return googleName?.trim() || 'Operator';
};

const navigateToAuthRoot = () => {
    if (typeof window === 'undefined') return;

    window.location.replace('/#/');
    window.setTimeout(() => window.location.reload(), 50);
};

interface AppState {
    isAuthenticated: boolean;
    user: AppUser | null;
    supabaseUserId: string | null;
    supabaseProfile: unknown | null;
    authError: string | null;
    onboardingComplete: boolean;
    userGoals: string[];
    userSubcategories: string[];
    wakeTime: string;
    notificationsEnabled: boolean;
    moodCheckEnabled: boolean;
    dailyBriefShown: string | null;
    completedTours: string[];

    login: (user: AppUser) => void;
    logout: () => Promise<void>;
    signInWithGoogle: () => Promise<boolean>;
    signOut: () => Promise<void>;
    checkSession: () => Promise<boolean>;
    setOnboardingComplete: () => void;
    completeOnboarding: (settings: {
        displayName: string;
        userGoals: string[];
        userSubcategories: string[];
        wakeTime: string;
    }) => void;
    resetOnboarding: () => void;
    startOnboardingEdit: () => void;
    setWakeTime: (wakeTime: string) => void;
    setNotificationsEnabled: (enabled: boolean) => void;
    setMoodCheckEnabled: (enabled: boolean) => void;
    setDailyBriefShown: (date: string) => void;
    markTourComplete: (key: string) => void;
    syncHabitsToSupabase: () => Promise<boolean>;
    syncMissionsToSupabase: () => Promise<boolean>;
    fetchUserData: () => Promise<boolean>;
    clearAuthError: () => void;
}

export const getCurrentStoreUserId = () => useAppStore.getState().user?.id ?? 'guest';
export const getUserScopedStoreName = (baseName: string, userId = getCurrentStoreUserId()) => `${baseName}-${userId}`;

const reinitializeUserStores = async (userId: string) => {
    const [
        { useHabitStore },
        { useTaskStore },
        { useProgramStore },
        { useScheduleStore },
        { useVoiceStore },
    ] = await Promise.all([
        import('./useHabitStore'),
        import('./useTaskStore'),
        import('./useProgramStore'),
        import('./useScheduleStore'),
        import('./useVoiceStore'),
    ]);

    const stores = [
        { store: useHabitStore, baseName: 'habit-store' },
        { store: useTaskStore, baseName: 'task-store' },
        { store: useProgramStore, baseName: 'program-store' },
        { store: useScheduleStore, baseName: 'schedule-store' },
        { store: useVoiceStore, baseName: 'voice-store' },
    ];

    await Promise.all(stores.map(async ({ store, baseName }) => {
        const scopedName = getUserScopedStoreName(baseName, userId);
        const hasPersistedState = localStorage.getItem(scopedName) !== null;
        const transientName = getUserScopedStoreName(baseName, 'transient');

        store.persist.setOptions({ name: transientName });
        store.getState().clearAll?.();
        localStorage.removeItem(transientName);
        store.persist.setOptions({ name: scopedName });
        if (hasPersistedState) {
            await store.persist.rehydrate();
        }
    }));
};

const activateAppPersistence = async (userId: string) => {
    const scopedName = getUserScopedStoreName('app-store', userId);
    useAppStore.persist.setOptions({ name: scopedName });
    if (localStorage.getItem(scopedName) !== null) {
        await useAppStore.persist.rehydrate();
    }
};

const syncHabitProfile = async (profile: AppUser) => {
    const { useHabitStore } = await import('./useHabitStore');
    useHabitStore.setState((state) => ({
        user: state.user
            ? {
                ...state.user,
                name: state.user.name || profile.name,
                avatarUrl: state.user.avatarUrl || profile.avatar,
            }
            : {
            name: profile.name,
            level: 1,
            xp: profile.totalXP,
            avatarUrl: profile.avatar,
            notificationsEnabled: true,
        },
    }));
};

const getAuthErrorMessage = (err: unknown) => {
    if (err instanceof Error && err.message.trim()) {
        const code = 'code' in err && typeof err.code === 'string' ? ` (${err.code})` : '';
        return `${err.message}${code}`;
    }
    if (err && typeof err === 'object') {
        const errorLike = err as { message?: unknown; code?: unknown };
        const message = typeof errorLike.message === 'string' ? errorLike.message : '';
        const code = typeof errorLike.code === 'string' ? errorLike.code : '';
        if (message && code) return `${message} (${code})`;
        if (message) return message;
        if (code) return `Google sign-in failed: status ${code}`;
    }
    if (typeof err === 'string' && err.trim()) return err;
    return 'Google sign-in failed. Try again.';
};

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            user: null,
            supabaseUserId: null,
            supabaseProfile: null,
            authError: null,
            onboardingComplete: false,
            userGoals: [],
            userSubcategories: [],
            wakeTime: '06:00',
            notificationsEnabled: false,
            moodCheckEnabled: true,
            dailyBriefShown: null,
            completedTours: [],

            login: (user: AppUser) => {
                set({
                    isAuthenticated: true,
                    user,
                    supabaseUserId: user.id,
                    authError: null,
                });
            },

            logout: async () => {
                await get().signOut();
            },

            signInWithGoogle: async () => {
                try {
                    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
                    const googleAuthConfig = Capacitor.isNativePlatform()
                        ? { scopes: ['profile', 'email'], grantOfflineAccess: false }
                        : {
                            clientId: GOOGLE_WEB_CLIENT_ID,
                            scopes: ['profile', 'email'],
                            grantOfflineAccess: false,
                        };

                    await GoogleAuth.initialize(googleAuthConfig);
                    try {
                        await GoogleAuth.signOut();
                    } catch {
                        // The user may not have a cached Google session yet.
                    }

                    const googleUser = await GoogleAuth.signIn();
                    const idToken = googleUser.authentication?.idToken;
                    if (!idToken) throw new Error('Missing Google ID token');

                    const { data, error } = await supabase.auth.signInWithIdToken({
                        provider: 'google',
                        token: idToken,
                    });

                    if (error || !data.user) throw error ?? new Error('Unable to sign in');

                    await activateAppPersistence(data.user.id);
                    await reinitializeUserStores(data.user.id);
                    const supabaseProfile = await fetchSupabaseUserProfile(data.user.id);
                    if (supabaseProfile) {
                        await loadUserData(data.user.id);
                    }
                    const googleProfile = googleUser as {
                        displayName?: string;
                        name?: string;
                        email?: string;
                        imageUrl?: string;
                    };
                    const profile = {
                        id: data.user.id,
                        email: googleProfile.email ?? data.user.email ?? '',
                        name: supabaseProfile?.name
                            ?? getFallbackProfileName(googleProfile.email ?? data.user.email, googleProfile.displayName ?? googleProfile.name),
                        avatar: supabaseProfile?.avatar_url ?? googleProfile.imageUrl ?? '',
                        totalXP: typeof supabaseProfile?.total_xp === 'number' ? supabaseProfile.total_xp : 0,
                    };
                    const onboardingComplete = Boolean(supabaseProfile);

                    set({
                        isAuthenticated: true,
                        user: profile,
                        supabaseUserId: data.user.id,
                        supabaseProfile,
                        authError: null,
                        onboardingComplete,
                        userGoals: useAppStore.getState().userGoals,
                        userSubcategories: useAppStore.getState().userSubcategories,
                        wakeTime: useAppStore.getState().wakeTime || '06:00',
                        notificationsEnabled: useAppStore.getState().notificationsEnabled ?? false,
                        moodCheckEnabled: useAppStore.getState().moodCheckEnabled ?? true,
                        dailyBriefShown: null,
                    });
                    await syncHabitProfile(profile);
                    toast.success(`Welcome, ${profile.name}`);
                    return true;
                } catch (err) {
                    const message = getAuthErrorMessage(err);
                    set({ authError: message });
                    toast.error(message);
                    return false;
                }
            },

            signOut: async () => {
                const { useHabitStore } = await import('./useHabitStore');
                const { useTaskStore } = await import('./useTaskStore');
                const { useProgramStore } = await import('./useProgramStore');
                const { useScheduleStore } = await import('./useScheduleStore');
                const { useVoiceStore } = await import('./useVoiceStore');

                // Move persistence to the guest scope before Supabase emits SIGNED_OUT.
                // Otherwise the auth listener can overwrite the signed-in user's scoped app data.
                useHabitStore.persist.setOptions({ name: getUserScopedStoreName('habit-store', 'guest') });
                useTaskStore.persist.setOptions({ name: getUserScopedStoreName('task-store', 'guest') });
                useProgramStore.persist.setOptions({ name: getUserScopedStoreName('program-store', 'guest') });
                useScheduleStore.persist.setOptions({ name: getUserScopedStoreName('schedule-store', 'guest') });
                useVoiceStore.persist.setOptions({ name: getUserScopedStoreName('voice-store', 'guest') });
                useAppStore.persist.setOptions({ name: getUserScopedStoreName('app-store', 'guest') });
                clearSupabaseAuthStorage();

                try {
                    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
                    const googleAuthConfig = Capacitor.isNativePlatform()
                        ? { scopes: ['profile', 'email'], grantOfflineAccess: false }
                        : {
                            clientId: GOOGLE_WEB_CLIENT_ID,
                            scopes: ['profile', 'email'],
                            grantOfflineAccess: false,
                        };
                    await GoogleAuth.initialize(googleAuthConfig);
                    await GoogleAuth.signOut();
                } catch (e) {
                    console.log('Google signout error:', e);
                }

                try {
                    await supabase.auth.signOut();
                } catch (e) {
                    console.log('Supabase signout error:', e);
                }
                clearSupabaseAuthStorage();

                useHabitStore.getState().clearAll();
                useTaskStore.getState().clearAll();
                useProgramStore.getState().clearAll();
                useScheduleStore.getState().clearAll();
                useVoiceStore.getState().clearAll();
                localStorage.clear();
                set({
                    isAuthenticated: false,
                    user: null,
                    supabaseUserId: null,
                    supabaseProfile: null,
                    authError: null,
                    onboardingComplete: false,
                    userGoals: [],
                    userSubcategories: [],
                    wakeTime: '06:00',
                    notificationsEnabled: false,
                    moodCheckEnabled: true,
                    dailyBriefShown: null,
                    completedTours: [],
                });
                toast.success('Logged out. See you tomorrow.');
                navigateToAuthRoot();
            },

            checkSession: async () => {
                try {
                    const { data } = await supabase.auth.getSession();
                    if (data.session) {
                        const sessionUser = data.session.user;
                        const supabaseProfile = await fetchSupabaseUserProfile(sessionUser.id);
                        await activateAppPersistence(sessionUser.id);
                        await reinitializeUserStores(sessionUser.id);
                        if (supabaseProfile) {
                            await loadUserData(sessionUser.id);
                        }
                        const profile = toAppUser(sessionUser, supabaseProfile);
                        set({
                            isAuthenticated: true,
                            user: profile,
                            supabaseUserId: sessionUser.id,
                            supabaseProfile,
                            authError: null,
                            onboardingComplete: Boolean(supabaseProfile),
                            userGoals: useAppStore.getState().userGoals,
                            userSubcategories: useAppStore.getState().userSubcategories,
                            wakeTime: useAppStore.getState().wakeTime || '06:00',
                            notificationsEnabled: useAppStore.getState().notificationsEnabled ?? false,
                            moodCheckEnabled: useAppStore.getState().moodCheckEnabled ?? true,
                        });
                        await syncHabitProfile(profile);
                        return true;
                    }

                    useAppStore.persist.setOptions({ name: getUserScopedStoreName('app-store', 'guest') });
                    set({
                        isAuthenticated: false,
                        user: null,
                        supabaseUserId: null,
                        supabaseProfile: null,
                        authError: null,
                        onboardingComplete: false,
                        userGoals: [],
                        userSubcategories: [],
                        wakeTime: '06:00',
                        notificationsEnabled: false,
                        moodCheckEnabled: true,
                        dailyBriefShown: null,
                    });
                    return false;
                } catch (error) {
                    console.error('checkSession failed:', error);
                    useAppStore.persist.setOptions({ name: getUserScopedStoreName('app-store', 'guest') });
                    set({
                        isAuthenticated: false,
                        user: null,
                        supabaseUserId: null,
                        supabaseProfile: null,
                        authError: null,
                        onboardingComplete: false,
                        userGoals: [],
                        userSubcategories: [],
                        wakeTime: '06:00',
                        notificationsEnabled: false,
                        moodCheckEnabled: true,
                        dailyBriefShown: null,
                    });
                    return false;
                }
            },

            setOnboardingComplete: () => set({ onboardingComplete: true }),
            completeOnboarding: ({ displayName, userGoals, userSubcategories, wakeTime }) => {
                const name = displayName.trim() || deriveNameFromEmail(get().user?.email);
                const { supabaseUserId, user } = get();

                set({
                    user: user ? { ...user, name } : user,
                    userGoals,
                    userSubcategories,
                    wakeTime,
                    onboardingComplete: true,
                });

                if (supabaseUserId) {
                    supabase.from('profiles').upsert({
                        id: supabaseUserId,
                        email: user?.email ?? null,
                        name,
                        avatar_url: user?.avatar ?? null,
                        total_xp: user?.totalXP ?? 0,
                    }, { onConflict: 'id' }).then(({ error }) => {
                        if (error) console.error('profile sync failed:', error);
                    });
                }

                void syncHabitProfile({
                    id: user?.id ?? supabaseUserId ?? 'local',
                    email: user?.email ?? '',
                    name,
                    avatar: user?.avatar ?? '',
                    totalXP: user?.totalXP ?? 0,
                });
            },
            resetOnboarding: () => set({
                onboardingComplete: false,
                userGoals: [],
                userSubcategories: [],
                wakeTime: '06:00',
                dailyBriefShown: null,
            }),
            startOnboardingEdit: () => set({
                onboardingComplete: false,
                dailyBriefShown: null,
            }),
            setWakeTime: (wakeTime: string) => set({ wakeTime }),
            setNotificationsEnabled: (enabled: boolean) => set({ notificationsEnabled: enabled }),
            setMoodCheckEnabled: (enabled: boolean) => set({ moodCheckEnabled: enabled }),
            setDailyBriefShown: (date: string) => set({ dailyBriefShown: date }),
            markTourComplete: (key: string) => set((state) => ({
                completedTours: state.completedTours.includes(key)
                    ? state.completedTours
                    : [...state.completedTours, key],
            })),

            syncHabitsToSupabase: async () => {
                const { supabaseUserId } = get();
                if (!supabaseUserId) {
                    set({ authError: 'Login required before syncing habits.' });
                    return false;
                }

                const { useHabitStore } = await import('./useHabitStore');
                const { habits } = useHabitStore.getState();
                syncAllHabitsToSupabase(supabaseUserId, habits.filter((habit) => !habit.id.startsWith('demo-')));
                set({ authError: null });
                return true;
            },

            syncMissionsToSupabase: async () => {
                const { supabaseUserId } = get();
                if (!supabaseUserId) {
                    set({ authError: 'Login required before syncing missions.' });
                    return false;
                }

                const { useHabitStore } = await import('./useHabitStore');
                const { tasks } = useHabitStore.getState();
                syncAllMissionsToSupabase(supabaseUserId, tasks.filter((task) => !task.id.startsWith('demo-')));
                set({ authError: null });
                return true;
            },

            fetchUserData: async () => {
                const { supabaseUserId, user } = get();
                if (!supabaseUserId) return false;

                const profileResult = await supabase.from('profiles').select('*').eq('id', supabaseUserId).maybeSingle();
                if (profileResult.error) {
                    set({ authError: profileResult.error.message });
                    return false;
                }

                await loadUserData(supabaseUserId);

                const totalXp = typeof profileResult.data?.total_xp === 'number' ? profileResult.data.total_xp : user?.totalXP ?? 0;

                set({
                    user: user ? {
                        ...user,
                        name: profileResult.data?.name ?? user.name,
                        avatar: profileResult.data?.avatar_url ?? user.avatar,
                        totalXP: totalXp,
                    } : user,
                    supabaseProfile: profileResult.data,
                    authError: null,
                });
                return true;
            },

            clearAuthError: () => set({ authError: null }),
        }),
        {
            name: getUserScopedStoreName('app-store', 'guest'),
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                supabaseUserId: state.supabaseUserId,
                supabaseProfile: state.supabaseProfile,
                onboardingComplete: state.onboardingComplete,
                userGoals: state.userGoals,
                userSubcategories: state.userSubcategories,
                wakeTime: state.wakeTime,
                notificationsEnabled: state.notificationsEnabled,
                moodCheckEnabled: state.moodCheckEnabled,
                dailyBriefShown: state.dailyBriefShown,
                completedTours: state.completedTours,
            }),
        },
    ),
);
