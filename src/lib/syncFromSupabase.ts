import { supabase } from '@/lib/supabase';
import { PROGRAM_TEMPLATES } from '@/services/programService';
import type { Category, Habit } from '@/store/useHabitStore';
import type { ProgramEnrollment } from '@/store/useProgramStore';
import type { EisenhowerQuadrant, Task, TaskCategory, TaskPriority, TaskStatus } from '@/types/task';

const CATEGORY_VALUES: Category[] = ['coding', 'devotional', 'diet', 'gym', 'personal', 'academics', 'breaks'];
const TASK_CATEGORY_VALUES: TaskCategory[] = ['coding', 'gym', 'diet', 'personal', 'work', 'academics', 'devotional', 'other'];
const TASK_PRIORITY_VALUES: TaskPriority[] = ['low', 'medium', 'high'];
const TASK_STATUS_VALUES: TaskStatus[] = ['backlog', 'this_week', 'today', 'in_progress', 'completed', 'cancelled'];
const QUADRANT_VALUES: EisenhowerQuadrant[] = ['q1', 'q2', 'q3', 'q4'];

const logSyncError = (scope: string, error: { message?: string } | null) => {
    if (error) {
        console.error(`${scope} sync failed:`, error);
    }
};

const asCategory = (value: string | null | undefined): Category => (
    CATEGORY_VALUES.includes((value ?? '') as Category) ? (value as Category) : 'personal'
);

const asTaskCategory = (value: string | null | undefined): TaskCategory => (
    TASK_CATEGORY_VALUES.includes((value ?? '') as TaskCategory) ? (value as TaskCategory) : 'personal'
);

const asTaskPriority = (value: string | null | undefined): TaskPriority => (
    TASK_PRIORITY_VALUES.includes((value ?? '') as TaskPriority) ? (value as TaskPriority) : 'medium'
);

const asTaskStatus = (value: string | null | undefined): TaskStatus => (
    TASK_STATUS_VALUES.includes((value ?? '') as TaskStatus) ? (value as TaskStatus) : 'today'
);

const asQuadrant = (value: string | null | undefined): EisenhowerQuadrant => (
    QUADRANT_VALUES.includes((value ?? '') as EisenhowerQuadrant) ? (value as EisenhowerQuadrant) : 'q2'
);

const getProgramDuration = (programId: string) => (
    PROGRAM_TEMPLATES.find((program) => program.type === programId)?.days ?? 30
);

const mapMissionRow = (row: {
    id: string;
    title: string;
    category: string | null;
    priority: string | null;
    stage: string | null;
    quadrant: string | null;
    estimate: number | null;
    target_date: string | null;
}): Task => ({
    id: row.id,
    title: row.title,
    category: asTaskCategory(row.category),
    priority: asTaskPriority(row.priority),
    status: asTaskStatus(row.stage),
    completed: row.stage === 'completed',
    size: 'medium',
    quadrant: asQuadrant(row.quadrant),
    estimatedMinutes: row.estimate ?? undefined,
    scheduledDate: row.target_date ?? undefined,
    dueDate: row.target_date ?? undefined,
    isRecurring: false,
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

const mapEnrollmentRow = (row: {
    program_id: string;
    current_day: number | null;
    streak: number | null;
    time_slot: string | null;
}): ProgramEnrollment => {
    const currentDay = row.current_day ?? 1;

    return {
        id: row.program_id,
        programId: row.program_id,
        startedAt: new Date().toISOString(),
        preferredTime: row.time_slot ?? '09:00',
        currentDay,
        totalDays: getProgramDuration(row.program_id),
        streak: row.streak ?? 0,
        completedDays: Math.max(currentDay - 1, 0),
    };
};

export async function loadUserData(userId: string) {
    const [{ useHabitStore }, { useProgramStore }] = await Promise.all([
        import('@/store/useHabitStore'),
        import('@/store/useProgramStore'),
    ]);

    const [habitsResult, missionsResult, enrollmentsResult, completionsResult] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userId),
        supabase.from('missions').select('*').eq('user_id', userId),
        supabase.from('enrollments').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('habit_completions').select('*').eq('user_id', userId),
    ]);

    logSyncError('habits load', habitsResult.error);
    logSyncError('missions load', missionsResult.error);
    logSyncError('enrollments load', enrollmentsResult.error);
    logSyncError('habit completions load', completionsResult.error);

    const completionMap = new Map<string, string[]>();
    for (const completion of completionsResult.data ?? []) {
        const dates = completionMap.get(completion.habit_id) ?? [];
        dates.push(completion.completed_date);
        completionMap.set(completion.habit_id, dates);
    }

    useHabitStore.getState().setHabits(
        (habitsResult.data ?? []).map((row) => ({
            id: row.id,
            title: row.title,
            time: row.scheduled_time ?? 'Flexible',
            streak: (completionMap.get(row.id) ?? []).length,
            completedDates: completionMap.get(row.id) ?? [],
            type: 'checkbox',
            category: asCategory(row.category),
            history: {},
            fromProgramId: row.from_program_id ?? undefined,
        })),
    );
    useHabitStore.getState().setTasks((missionsResult.data ?? []).map(mapMissionRow));
    useProgramStore.getState().setEnrollments((enrollmentsResult.data ?? []).map(mapEnrollmentRow));
}

export const syncHabitToSupabase = (userId: string, habit: Habit) => {
    supabase.from('habits').upsert({
        id: habit.id,
        user_id: userId,
        title: habit.title,
        category: habit.category,
        scheduled_time: habit.time ?? null,
        xp_reward: 10,
        from_program_id: habit.fromProgramId ?? null,
    }, { onConflict: 'id' }).then(({ error }) => {
        logSyncError('habit', error);
    });
};

export const deleteHabitFromSupabase = (userId: string, habitId: string) => {
    supabase.from('habits').delete().eq('user_id', userId).eq('id', habitId).then(({ error }) => {
        logSyncError('habit delete', error);
    });
};

export const syncHabitCompletionToSupabase = (userId: string, habitId: string, completedDate: string) => {
    supabase.from('habit_completions').insert({
        user_id: userId,
        habit_id: habitId,
        completed_date: completedDate,
    }).then(({ error }) => {
        logSyncError('habit completion', error);
    });
};

export const syncMissionToSupabase = (userId: string, task: Task) => {
    supabase.from('missions').upsert({
        id: task.id,
        user_id: userId,
        title: task.title,
        category: task.category ?? 'personal',
        priority: task.priority ?? 'medium',
        stage: task.status ?? 'today',
        quadrant: task.quadrant ?? null,
        estimate: task.estimatedMinutes ?? null,
        target_date: task.dueDate ?? task.scheduledDate ?? null,
    }, { onConflict: 'id' }).then(({ error }) => {
        logSyncError('mission', error);
    });
};

export const deleteMissionFromSupabase = (userId: string, taskId: string) => {
    supabase.from('missions').delete().eq('user_id', userId).eq('id', taskId).then(({ error }) => {
        logSyncError('mission delete', error);
    });
};

export const syncEnrollmentToSupabase = (
    userId: string,
    programId: string,
    selectedTime: string,
    currentDay: number,
    streak: number,
) => {
    supabase.from('enrollments').upsert({
        user_id: userId,
        program_id: programId,
        is_active: true,
        time_slot: selectedTime,
        current_day: currentDay,
        streak,
    }, { onConflict: 'user_id,program_id' }).then(({ error }) => {
        logSyncError('enrollment', error);
    });
};

export const deactivateEnrollmentInSupabase = (userId: string, programId: string) => {
    supabase.from('enrollments').update({ is_active: false }).eq('user_id', userId).eq('program_id', programId).then(({ error }) => {
        logSyncError('enrollment deactivate', error);
    });
};

export const syncAllHabitsToSupabase = (userId: string, habits: Habit[]) => {
    const habitRows = habits.map((habit) => ({
        id: habit.id,
        user_id: userId,
        title: habit.title,
        category: habit.category,
        scheduled_time: habit.time ?? null,
        xp_reward: 10,
        from_program_id: habit.fromProgramId ?? null,
    }));

    const completionRows = habits.flatMap((habit) => habit.completedDates.map((completedDate) => ({
        user_id: userId,
        habit_id: habit.id,
        completed_date: completedDate,
    })));

    if (habitRows.length > 0) {
        supabase.from('habits').upsert(habitRows, { onConflict: 'id' }).then(({ error }) => {
            logSyncError('habits bulk', error);
        });
    }

    if (completionRows.length > 0) {
        supabase.from('habit_completions').upsert(completionRows, { onConflict: 'user_id,habit_id,completed_date' }).then(({ error }) => {
            logSyncError('habit completions bulk', error);
        });
    }
};

export const syncAllMissionsToSupabase = (userId: string, tasks: Task[]) => {
    const missionRows = tasks.map((task) => ({
        id: task.id,
        user_id: userId,
        title: task.title,
        category: task.category ?? 'personal',
        priority: task.priority ?? 'medium',
        stage: task.status ?? 'today',
        quadrant: task.quadrant ?? null,
        estimate: task.estimatedMinutes ?? null,
        target_date: task.dueDate ?? task.scheduledDate ?? null,
    }));

    if (missionRows.length > 0) {
        supabase.from('missions').upsert(missionRows, { onConflict: 'id' }).then(({ error }) => {
            logSyncError('missions bulk', error);
        });
    }
};
