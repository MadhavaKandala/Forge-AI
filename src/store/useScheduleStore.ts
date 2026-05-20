import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Schedule } from '../types/schema';
import { scheduleRepository } from '../repositories/schedule.repository';
import { habitRepository } from '../repositories/habit.repository';
import { taskRepository } from '../repositories/task.repository';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentStoreUserId, getUserScopedStoreName } from './useAppStore';

export interface ScheduleWithDetails extends Schedule {
    title?: string;
    color?: string; // Optional for UI
}

interface ScheduleState {
    schedules: ScheduleWithDetails[];
    selectedDate: Date;
    isLoading: boolean;
    error: string | null;

    setSelectedDate: (date: Date) => void;
    fetchSchedules: (date: Date) => Promise<void>;
    addSchedule: (schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    clearAll: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
    persist(
        (set, get) => ({
            schedules: [],
            selectedDate: new Date(),
            isLoading: false,
            error: null,

            setSelectedDate: (date) => {
                set({ selectedDate: date });
                get().fetchSchedules(date);
            },

            fetchSchedules: async (date) => {
                set({ isLoading: true });
                try {
            // TODO: Get real user ID
            const dateStr = date.toISOString().split('T')[0];

            // 1. Fetch from Schedules table
            const explicitSchedules = (await scheduleRepository.findByDate('default-user', dateStr)) || [];

            // 2. Fetch Tasks scheduled for this date
            const scheduledTasks = (await taskRepository.findByScheduledDate(dateStr)) || [];

            // Enrich Explicit Schedules
            const enrichedExplicit = await Promise.all(explicitSchedules.map(async (s) => {
                let title = 'Untitled';
                let color = '#ffffff';

                if (s.schedulable_type === 'habit') {
                    const habit = await habitRepository.findById(s.schedulable_id);
                    if (habit) {
                        title = habit.name;
                        color = '#dfff4f';
                    }
                } else if (s.schedulable_type === 'task') {
                    const task = await taskRepository.findById(s.schedulable_id);
                    if (task) {
                        title = task.title;
                        color = '#3b82f6';
                    }
                }
                return { ...s, title, color };
            }));

            // Convert Task Records to ScheduleWithDetails
            const enrichedTasks: ScheduleWithDetails[] = scheduledTasks.map(t => ({
                id: t.id,
                user_id: t.user_id,
                schedulable_type: 'task',
                schedulable_id: t.id,
                scheduled_date: t.scheduled_date || dateStr,
                scheduled_time: t.scheduled_time,
                buffer_before_minutes: 0,
                buffer_after_minutes: 0,
                status: t.status === 'completed' ? 'completed' : 'scheduled',
                notification_sent: 0,
                notification_time_minutes: 0,
                created_at: t.created_at,
                updated_at: t.updated_at,
                title: t.title,
                color: '#3b82f6',
                estimated_duration_minutes: t.estimated_minutes
            }));

            // AGGRESSIVE SAFETY CHECK
            // Ensure inputs to spread are arrays
            const safeExplicit = Array.isArray(enrichedExplicit) ? enrichedExplicit : [];
            const safeTasks = Array.isArray(enrichedTasks) ? enrichedTasks : [];

            if (!Array.isArray(enrichedExplicit)) console.error("CRITICAL: enrichedExplicit is not array:", enrichedExplicit);
            if (!Array.isArray(enrichedTasks)) console.error("CRITICAL: enrichedTasks is not array:", enrichedTasks);

            // Combine and Sort
            const allSchedules = [...safeExplicit, ...safeTasks].sort((a, b) => {
                const timeA = a.scheduled_time || '00:00';
                const timeB = b.scheduled_time || '00:00';
                return timeA.localeCompare(timeB);
            });

                    set({ schedules: allSchedules });
                } catch (error) {
                    console.error("Error fetching schedules:", error);
                    set({ error: (error as Error).message, schedules: [] }); // Reset to empty array on error
                } finally {
                    set({ isLoading: false });
                }
            },

            addSchedule: async (scheduleData) => {
                try {
                    const newSchedule: Schedule = {
                        ...scheduleData,
                        id: uuidv4(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    } as Schedule;

                    await scheduleRepository.create(newSchedule);
                    // Refresh if it's for the selected date
                    const { selectedDate } = get();
                    const dateStr = selectedDate.toISOString().split('T')[0];
                    if (newSchedule.scheduled_date === dateStr) {
                        get().fetchSchedules(selectedDate);
                    }
                } catch (error) {
                    set({ error: (error as Error).message });
                }
            },

            clearAll: () => set({
                schedules: [],
                selectedDate: new Date(),
                isLoading: false,
                error: null,
            })
        }),
        {
            name: getUserScopedStoreName('schedule-store', getCurrentStoreUserId()),
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                schedules: state.schedules
            })
        }
    )
);
