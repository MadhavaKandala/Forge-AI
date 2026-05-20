import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

import { supabase } from '@/lib/supabase';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';
import type { Habit } from './useHabitStore';

const GOOGLE_WEB_CLIENT_ID = '275760652639-4flj5gar1op7tfsr5gkkcd13t8t4t2im.apps.googleusercontent.com';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const deterministicUuid = (source: string): string => {
    let hash = 2166136261;
    for (let i = 0; i < source.length; i += 1) {
        hash ^= source.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    const hex = Array.from({ length: 32 }, (_, index) => {
        hash ^= index + source.length;
        hash = Math.imul(hash, 16777619);
        return ((hash >>> ((index % 4) * 8)) & 0xff).toString(16).padStart(2, '0');
    }).join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hex.slice(18, 20)}-${hex.slice(20, 32)}`;
};

const toSupabaseUuid = (userId: string, kind: string, localId: string): string => (
    UUID_REGEX.test(localId) ? localId : deterministicUuid(`${userId}:${kind}:${localId}`)
);

const toMissionStage = (status: TaskStatus): 'BACKLOG' | 'THIS_WEEK' | 'TODAY' | 'IN_PROGRESS' | 'DONE' => {
    if (status === 'completed' || status === 'cancelled') return 'DONE';
    if (status === 'this_week') return 'THIS_WEEK';
    if (status === 'in_progress') return 'IN_PROGRESS';
    if (status === 'today') return 'TODAY';
    return 'BACKLOG';
};

const fromMissionStage = (stage: string): TaskStatus => {
    if (stage === 'THIS_WEEK') return 'this_week';
    if (stage === 'TODAY') return 'today';
    if (stage === 'IN_PROGRESS') return 'in_progress';
    if (stage === 'DONE') return 'completed';
    return 'backlog';
};

const toMissionPriority = (priority: TaskPriority): 'HIGH' | 'MEDIUM' | 'LOW' => priority.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW';

const fromMissionPriority = (priority: string): TaskPriority => {
    if (priority === 'HIGH') return 'high';
    if (priority === 'LOW') return 'low';
    return 'medium';
};

const toHabitRow = (habit: Habit, userId: string) => ({
    id: toSupabaseUuid(userId, 'habit', habit.id),
    user_id: userId,
    title: habit.title,
    category: habit.category,
    scheduled_time: habit.time,
    xp_reward: 10,
    from_program_id: habit.fromProgramId && UUID_REGEX.test(habit.fromProgramId) ? habit.fromProgramId : null,
    created_at: new Date().toISOString(),
});

const toHabitCompletionRows = (habit: Habit, userId: string) => {
    const habitId = toSupabaseUuid(userId, 'habit', habit.id);
    return habit.completedDates.map((date) => ({
        id: deterministicUuid(`${userId}:habit_completion:${habit.id}:${date}`),
        user_id: userId,
        habit_id: habitId,
        completed_date: date,
        completed_at: `${date}T00:00:00.000Z`,
    }));
};

const toMissionRow = (task: Task, userId: string) => ({
    id: toSupabaseUuid(userId, 'mission', task.id),
    user_id: userId,
    title: task.title,
    category: task.category,
    priority: toMissionPriority(task.priority),
    stage: toMissionStage(task.status),
    quadrant: task.quadrant,
    estimate: task.estimatedMinutes ?? null,
    target_date: task.dueDate ?? task.scheduledDate ?? null,
    created_at: task.createdAt,
});

interface AppUser {
    id: string;
    email: string;
    name: string;
    avatar: string;
    totalXP: number;
}

const fetchSupabaseUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) return null;
    return data;
};

const ensureSupabaseUserProfile = async (user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown> | null;
}) => {
    const existingProfile = await fetchSupabaseUserProfile(user.id);
    if (existingProfile) return existingProfile;

    const now = new Date().toISOString();
    const email = user.email?.trim().toLowerCase() ?? '';
    const metadataName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null;
    const fallbackName = metadataName ?? email.split('@')[0] ?? 'Operator';

    const { data, error } = await supabase
        .from('users')
        .insert({
            id: user.id,
            email,
            name: fallbackName || 'Operator',
            total_xp: 0,
            created_at: now,
        })
        .select('*')
        .maybeSingle();

    if (error) return fetchSupabaseUserProfile(user.id);
    return data;
};

const toAppUser = (user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown> | null;
}, profileTotalXp?: number): AppUser => ({
    id: user.id,
    email: user.email ?? '',
    name: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : 'Operator',
    avatar: typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : '',
    totalXP: profileTotalXp ?? 0,
});

interface AppState {
    isAuthenticated: boolean;
    user: AppUser | null;
    supabaseUserId: string | null;
    supabaseProfile: unknown | null;
    authError: string | null;
    onboardingComplete: boolean;

    login: (user: AppUser) => void;
    logout: () => Promise<void>;
    signInWithGoogle: () => Promise<boolean>;
    signOut: () => Promise<void>;
    checkSession: () => Promise<boolean>;
    setOnboardingComplete: () => void;
    syncHabitsToSupabase: () => Promise<boolean>;
    syncMissionsToSupabase: () => Promise<boolean>;
    fetchUserData: () => Promise<boolean>;
    clearAuthError: () => void;
}

export const getCurrentStoreUserId = () => useAppStore.getState().user?.id ?? 'guest';
export const getUserScopedStoreName = (baseName: string, userId = getCurrentStoreUserId()) => `${baseName}-${userId}`;

const scopedStoreBaseNames = [
    'app-store',
    'habit-store',
    'task-store',
    'program-store',
    'schedule-store',
    'voice-store',
] as const;

const hasExistingUserData = (userId: string) => [
    ...scopedStoreBaseNames,
].some((baseName) => localStorage.getItem(getUserScopedStoreName(baseName, userId)) !== null);

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

const syncProfileXpToSupabase = async (userId: string) => {
    const { useHabitStore } = await import('./useHabitStore');
    const habitUser = useHabitStore.getState().user;
    const totalXP = habitUser?.xp ?? useAppStore.getState().user?.totalXP ?? 0;

    const { error } = await supabase
        .from('users')
        .update({ total_xp: totalXP })
        .eq('id', userId);

    if (!error) {
        useAppStore.setState((state) => ({
            user: state.user ? { ...state.user, totalXP } : state.user,
        }));
    }

    return error;
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

                    const googleUser = await GoogleAuth.signIn();
                    const idToken = googleUser.authentication?.idToken;
                    if (!idToken) throw new Error('Missing Google ID token');

                    const { data, error } = await supabase.auth.signInWithIdToken({
                        provider: 'google',
                        token: idToken,
                    });

                    if (error || !data.user) throw error ?? new Error('Unable to sign in');

                    const supabaseProfile = await ensureSupabaseUserProfile(data.user);
                    const existingUserData = hasExistingUserData(data.user.id);
                    await activateAppPersistence(data.user.id);
                    await reinitializeUserStores(data.user.id);
                    const googleProfile = googleUser as {
                        displayName?: string;
                        name?: string;
                        email?: string;
                        imageUrl?: string;
                    };
                    const profile = {
                        id: data.user.id,
                        email: googleProfile.email ?? data.user.email ?? '',
                        name: googleProfile.displayName ?? googleProfile.name ?? 'Operator',
                        avatar: googleProfile.imageUrl ?? '',
                        totalXP: typeof supabaseProfile?.total_xp === 'number' ? supabaseProfile.total_xp : 0,
                    };
                    const onboardingComplete = existingUserData ? true : false;

                    set({
                        isAuthenticated: true,
                        user: profile,
                        supabaseUserId: data.user.id,
                        supabaseProfile,
                        authError: null,
                        onboardingComplete,
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
                const currentUserId = get().supabaseUserId;
                if (currentUserId) {
                    await Promise.allSettled([
                        get().syncHabitsToSupabase(),
                        get().syncMissionsToSupabase(),
                    ]);
                }

                try {
                    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
                    await GoogleAuth.signOut();
                    await supabase.auth.signOut();
                } catch {
                    try {
                        await supabase.auth.signOut();
                    } catch {
                        // noop
                    }
                }

                const { useHabitStore } = await import('./useHabitStore');
                const { useTaskStore } = await import('./useTaskStore');
                const { useProgramStore } = await import('./useProgramStore');
                const { useScheduleStore } = await import('./useScheduleStore');
                const { useVoiceStore } = await import('./useVoiceStore');

                useHabitStore.persist.setOptions({ name: getUserScopedStoreName('habit-store', 'guest') });
                useTaskStore.persist.setOptions({ name: getUserScopedStoreName('task-store', 'guest') });
                useProgramStore.persist.setOptions({ name: getUserScopedStoreName('program-store', 'guest') });
                useScheduleStore.persist.setOptions({ name: getUserScopedStoreName('schedule-store', 'guest') });
                useVoiceStore.persist.setOptions({ name: getUserScopedStoreName('voice-store', 'guest') });
                useAppStore.persist.setOptions({ name: getUserScopedStoreName('app-store', 'guest') });

                useHabitStore.getState().clearAll();
                useTaskStore.getState().clearAll();
                useProgramStore.getState().clearAll();
                useScheduleStore.getState().clearAll();
                useVoiceStore.getState().clearAll();
                set({
                    isAuthenticated: false,
                    user: null,
                    supabaseUserId: null,
                    supabaseProfile: null,
                    authError: null,
                    onboardingComplete: false,
                });
                toast.success('Signed out.');
            },

            checkSession: async () => {
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    const sessionUser = data.session.user;
                    const supabaseProfile = await ensureSupabaseUserProfile(sessionUser);
                    const existingUserData = hasExistingUserData(sessionUser.id);
                    const appStoreKey = getUserScopedStoreName('app-store', sessionUser.id);
                    const hasAppStore = localStorage.getItem(appStoreKey) !== null;
                    await activateAppPersistence(sessionUser.id);
                    await reinitializeUserStores(sessionUser.id);
                    const persistedOnboardingComplete = useAppStore.getState().onboardingComplete;
                    const profile = toAppUser(
                        sessionUser,
                        typeof supabaseProfile?.total_xp === 'number' ? supabaseProfile.total_xp : 0,
                    );
                    set({
                        isAuthenticated: true,
                        user: profile,
                        supabaseUserId: sessionUser.id,
                        supabaseProfile,
                        authError: null,
                        onboardingComplete: hasAppStore ? persistedOnboardingComplete : existingUserData,
                    });
                    await syncHabitProfile(profile);
                    return true;
                }

                set({
                    isAuthenticated: false,
                    user: null,
                    supabaseUserId: null,
                    supabaseProfile: null,
                    onboardingComplete: false,
                });
                return false;
            },

            setOnboardingComplete: () => set({ onboardingComplete: true }),

            syncHabitsToSupabase: async () => {
                const { supabaseUserId } = get();
                if (!supabaseUserId) {
                    set({ authError: 'Login required before syncing habits.' });
                    return false;
                }

                const { useHabitStore } = await import('./useHabitStore');
                const { habits } = useHabitStore.getState();
                const userHabits = habits.filter((habit) => !habit.id.startsWith('demo-'));
                const habitRows = userHabits.map((habit) => toHabitRow(habit, supabaseUserId));
                const completionRows = userHabits.flatMap((habit) => toHabitCompletionRows(habit, supabaseUserId));

                if (habitRows.length > 0) {
                    const { error } = await supabase
                        .from('habits')
                        .upsert(habitRows, { onConflict: 'id' });

                    if (error) {
                        set({ authError: error.message });
                        return false;
                    }
                }

                if (completionRows.length > 0) {
                    const { error } = await supabase
                        .from('habit_completions')
                        .upsert(completionRows, { onConflict: 'id' });

                    if (error) {
                        set({ authError: error.message });
                        return false;
                    }
                }

                const profileError = await syncProfileXpToSupabase(supabaseUserId);
                if (profileError) {
                    set({ authError: profileError.message });
                    return false;
                }

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
                const missionRows = tasks
                    .filter((task) => !task.id.startsWith('demo-'))
                    .map((task) => toMissionRow(task, supabaseUserId));

                if (missionRows.length === 0) {
                    set({ authError: null });
                    return true;
                }

                const { error } = await supabase
                    .from('missions')
                    .upsert(missionRows, { onConflict: 'id' });

                if (error) {
                    set({ authError: error.message });
                    return false;
                }

                const profileError = await syncProfileXpToSupabase(supabaseUserId);
                if (profileError) {
                    set({ authError: profileError.message });
                    return false;
                }

                set({ authError: null });
                return true;
            },

            fetchUserData: async () => {
                const { supabaseUserId, user } = get();
                if (!supabaseUserId) return false;

                const [profileResult, habitsResult, completionsResult, missionsResult] = await Promise.all([
                    supabase.from('users').select('*').eq('id', supabaseUserId).maybeSingle(),
                    supabase.from('habits').select('*').eq('user_id', supabaseUserId),
                    supabase.from('habit_completions').select('*').eq('user_id', supabaseUserId),
                    supabase.from('missions').select('*').eq('user_id', supabaseUserId),
                ]);

                const firstError = profileResult.error || habitsResult.error || completionsResult.error || missionsResult.error;
                if (firstError) {
                    set({ authError: firstError.message });
                    return false;
                }

                const { useHabitStore } = await import('./useHabitStore');
                const remoteHabits = habitsResult.data ?? [];
                const remoteCompletions = completionsResult.data ?? [];
                const remoteMissions = missionsResult.data ?? [];

                if (remoteHabits.length > 0) {
                    const habits: Habit[] = remoteHabits.map((row) => ({
                        id: row.id,
                        title: row.title,
                        time: row.scheduled_time ?? 'Flexible',
                        streak: 0,
                        completedDates: remoteCompletions
                            .filter((completion) => completion.habit_id === row.id)
                            .map((completion) => completion.completed_date),
                        type: 'checkbox',
                        category: row.category ?? 'personal',
                        history: {},
                        fromProgramId: row.from_program_id ?? undefined,
                    }));

                    useHabitStore.setState({ habits });
                }

                if (remoteMissions.length > 0) {
                    const tasks: Task[] = remoteMissions.map((row) => ({
                        id: row.id,
                        title: row.title,
                        category: row.category ?? 'personal',
                        priority: fromMissionPriority(row.priority ?? 'MEDIUM'),
                        status: fromMissionStage(row.stage ?? 'BACKLOG'),
                        completed: row.stage === 'DONE',
                        size: 'medium',
                        quadrant: row.quadrant ?? 'q2',
                        estimatedMinutes: row.estimate ?? undefined,
                        scheduledDate: row.target_date ?? undefined,
                        dueDate: row.target_date ?? undefined,
                        isRecurring: false,
                        subtasks: [],
                        createdAt: row.created_at ?? new Date().toISOString(),
                        updatedAt: row.created_at ?? new Date().toISOString(),
                    }));

                    useHabitStore.setState({ tasks });
                }

                const totalXp = typeof profileResult.data?.total_xp === 'number' ? profileResult.data.total_xp : user?.totalXP ?? 0;

                set({
                    user: user ? { ...user, totalXP: totalXp } : user,
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
            }),
        },
    ),
);
