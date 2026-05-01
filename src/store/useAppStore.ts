import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Habit } from './useHabitStore';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';

const OTP_LENGTH = 6;
const OTP_LOCK_MS = 30 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeOtp = (otp: string): string => otp.trim();

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

const toIsoDate = (value?: string): string | null => {
    if (!value) return null;
    return value.split('T')[0] || null;
};

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

export const createSessionIntegrity = (token: string, email: string): string => {
    const source = `${token}:${email}:forge-auth-v1`;
    let hash = 5381;
    for (let i = 0; i < source.length; i += 1) {
        hash = (hash * 33) ^ source.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
};

const fetchSupabaseUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) return null;
    return data;
};

const sessionEmail = (session: Session): string => session.user.email?.trim().toLowerCase() ?? '';

const saveSupabaseUserProfile = async (session: Session) => {
    const existingProfile = await fetchSupabaseUserProfile(session.user.id);
    if (existingProfile) return existingProfile;

    const now = new Date().toISOString();
    const email = sessionEmail(session);
    const fallbackName = email.split('@')[0] || 'Operator';

    const { data, error } = await supabase
        .from('users')
        .insert({
            id: session.user.id,
            email,
            name: fallbackName,
            total_xp: 0,
            created_at: now,
        })
        .select('*')
        .maybeSingle();

    if (error) return fetchSupabaseUserProfile(session.user.id);
    return data;
};

interface AppState {
    isAuthenticated: boolean;
    requiresPasswordCreation: boolean;
    sessionToken: string | null;
    sessionEmail: string | null;
    sessionIntegrity: string | null;
    supabaseUserId: string | null;
    supabaseProfile: unknown | null;

    pendingEmail: string | null;
    failedOtpAttempts: number;
    otpLockUntil: number | null;
    authError: string | null;

    requestOtp: (email: string) => Promise<boolean>;
    verifyOtp: (email: string, otp: string) => Promise<boolean>;
    completePasswordCreation: (password: string) => Promise<boolean>;
    hydrateSession: (session: Session | null) => Promise<void>;
    syncHabitsToSupabase: () => Promise<boolean>;
    syncMissionsToSupabase: () => Promise<boolean>;
    fetchUserData: () => Promise<boolean>;
    clearAuthError: () => void;
    logout: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            requiresPasswordCreation: false,
            sessionToken: null,
            sessionEmail: null,
            sessionIntegrity: null,
            supabaseUserId: null,
            supabaseProfile: null,

            pendingEmail: null,
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

                const { error } = await supabase.auth.signInWithOtp({
                    email: normalizedEmail,
                    options: {
                        shouldCreateUser: true,
                    },
                });

                if (error) {
                    set({ authError: error.message });
                    return false;
                }

                set({
                    pendingEmail: normalizedEmail,
                    failedOtpAttempts: 0,
                    otpLockUntil: null,
                    requiresPasswordCreation: false,
                    authError: null,
                });
                return true;
            },

            verifyOtp: async (email: string, otp: string) => {
                const normalizedEmail = email.trim().toLowerCase();
                const now = Date.now();
                const {
                    pendingEmail,
                    failedOtpAttempts,
                    otpLockUntil,
                } = get();

                if (otpLockUntil && now < otpLockUntil) {
                    set({ authError: `Too many attempts. Try again in ${Math.ceil((otpLockUntil - now) / 1000)}s.` });
                    return false;
                }

                if (!pendingEmail) {
                    set({ authError: 'OTP expired. Resend code.' });
                    return false;
                }

                const normalizedOtp = normalizeOtp(otp);

                if (normalizedEmail !== pendingEmail || !/^\d{6}$/.test(normalizedOtp) || normalizedOtp.length !== OTP_LENGTH) {
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

                set({ requiresPasswordCreation: true });

                const { data, error } = await supabase.auth.verifyOtp({
                    email: normalizedEmail,
                    token: normalizedOtp,
                    type: 'email',
                });

                if (error || !data.session) {
                    set({ requiresPasswordCreation: false });
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
                        authError: error?.message ?? 'Invalid code. Try again.',
                    });
                    return false;
                }

                const sessionToken = data.session.access_token;
                const sessionIntegrity = createSessionIntegrity(sessionToken, normalizedEmail);
                const supabaseProfile = await fetchSupabaseUserProfile(data.session.user.id);

                set({
                    isAuthenticated: false,
                    requiresPasswordCreation: true,
                    sessionToken,
                    sessionEmail: normalizedEmail,
                    sessionIntegrity,
                    supabaseUserId: data.session.user.id,
                    supabaseProfile,
                    pendingEmail: null,
                    failedOtpAttempts: 0,
                    otpLockUntil: null,
                    authError: null,
                });
                return true;
            },

            completePasswordCreation: async (password: string) => {
                const { data: sessionData } = await supabase.auth.getSession();
                const session = sessionData.session;

                if (!session) {
                    set({ authError: 'Session expired. Resend OTP.' });
                    return false;
                }

                const { error } = await supabase.auth.updateUser({ password });
                if (error) {
                    set({ authError: error.message });
                    return false;
                }

                const { data: refreshedSessionData } = await supabase.auth.getSession();
                const activeSession = refreshedSessionData.session ?? session;
                const email = sessionEmail(activeSession);
                const supabaseProfile = await saveSupabaseUserProfile(activeSession);

                set({
                    isAuthenticated: true,
                    requiresPasswordCreation: false,
                    sessionToken: activeSession.access_token,
                    sessionEmail: email,
                    sessionIntegrity: createSessionIntegrity(activeSession.access_token, email),
                    supabaseUserId: activeSession.user.id,
                    supabaseProfile,
                    pendingEmail: null,
                    failedOtpAttempts: 0,
                    otpLockUntil: null,
                    authError: null,
                });
                return true;
            },

            hydrateSession: async (session: Session | null) => {
                if (!session) {
                    set({
                        isAuthenticated: false,
                        requiresPasswordCreation: false,
                        sessionToken: null,
                        sessionEmail: null,
                        sessionIntegrity: null,
                        supabaseUserId: null,
                        supabaseProfile: null,
                    });
                    return;
                }

                const email = sessionEmail(session);
                const supabaseProfile = await fetchSupabaseUserProfile(session.user.id);
                const requiresPasswordCreation = get().requiresPasswordCreation;

                set({
                    isAuthenticated: !requiresPasswordCreation,
                    requiresPasswordCreation,
                    sessionToken: session.access_token,
                    sessionEmail: email,
                    sessionIntegrity: createSessionIntegrity(session.access_token, email),
                    supabaseUserId: session.user.id,
                    supabaseProfile,
                    authError: null,
                });
            },

            syncHabitsToSupabase: async () => {
                const { supabaseUserId } = get();
                if (!supabaseUserId) {
                    set({ authError: 'Login required before syncing habits.' });
                    return false;
                }

                const { useHabitStore } = await import('./useHabitStore');
                const { habits } = useHabitStore.getState();
                const habitRows = habits.map((habit) => toHabitRow(habit, supabaseUserId));
                const completionRows = habits.flatMap((habit) => toHabitCompletionRows(habit, supabaseUserId));

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
                const missionRows = tasks.map((task) => toMissionRow(task, supabaseUserId));

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

                set({ authError: null });
                return true;
            },

            fetchUserData: async () => {
                const { supabaseUserId } = get();
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

                set({
                    supabaseProfile: profileResult.data,
                    authError: null,
                });
                return true;
            },

            clearAuthError: () => set({ authError: null }),

            logout: async () => {
                await supabase.auth.signOut();
                set({
                    isAuthenticated: false,
                    requiresPasswordCreation: false,
                    sessionToken: null,
                    sessionEmail: null,
                    sessionIntegrity: null,
                    supabaseUserId: null,
                    supabaseProfile: null,
                    pendingEmail: null,
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
                requiresPasswordCreation: state.requiresPasswordCreation,
                sessionToken: state.sessionToken,
                sessionEmail: state.sessionEmail,
                sessionIntegrity: state.sessionIntegrity,
                supabaseUserId: state.supabaseUserId,
                supabaseProfile: state.supabaseProfile,
            }),
        },
    ),
);
