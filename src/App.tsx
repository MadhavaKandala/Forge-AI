import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import BottomNav from '@/components/BottomNav';
import DailyBrief from '@/components/DailyBrief';
import AuthPage from '@/pages/AuthPage';
import BlitzFocusPage from '@/pages/BlitzFocusPage';
import HomePage from '@/pages/HomePage';
import JournalPage from '@/pages/JournalPage';
import NotFound from '@/pages/NotFound';
import { OnboardingPage } from '@/pages/OnboardingPage';
import ProfilePage from '@/pages/ProfilePage';
import ProgressPage from '@/pages/ProgressPage';
import ProgramDetailPage from '@/pages/ProgramDetailPage';
import ProgramsPage from '@/pages/ProgramsPage';
import PomodoroPage from '@/pages/PomodoroPage';
import SchedulePage from '@/pages/SchedulePage';
import StatsPage from '@/pages/StatsPage';
import TasksPage from '@/pages/TasksPage';
import VoicePage from '@/pages/VoicePage';
import WhatNextPage from '@/pages/WhatNextPage';
import { useHabitStore } from '@/store/useHabitStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const isAuthenticated = useAppStore((s) => s.isAuthenticated);
    const onboardingComplete = useAppStore((s) => s.onboardingComplete);

    if (!isAuthenticated) {
        return <AuthPage />;
    }

    if (!onboardingComplete) {
        return <Navigate to="/onboarding" replace />;
    }

    return (
        <>
            {children}
            <BottomNav />
        </>
    );
};

const App = () => {
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const isAuthenticated = useAppStore((s) => s.isAuthenticated);
    const dailyBriefShown = useAppStore((s) => s.dailyBriefShown);
    const checkSession = useAppStore((s) => s.checkSession);
    const fetchUserData = useAppStore((s) => s.fetchUserData);
    const syncHabitsToSupabase = useAppStore((s) => s.syncHabitsToSupabase);
    const syncMissionsToSupabase = useAppStore((s) => s.syncMissionsToSupabase);
    const onboardingComplete = useAppStore((s) => s.onboardingComplete);
    const { setSelectedDate: setHabitDate, fetchHabits, fetchTasks } = useHabitStore();
    const { setSelectedDate: setScheduleDate } = useScheduleStore();

    const syncDate = () => {
        const today = new Date();
        setHabitDate(today);
        if (setScheduleDate) setScheduleDate(today);
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const hasSession = await checkSession();
                if (hasSession) {
                    await fetchUserData();
                }
            } finally {
                setIsCheckingSession(false);
            }
        };

        void initAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange(() => {
            void checkSession().then((hasSession) => {
                if (hasSession) {
                    void fetchUserData();
                }
            });
        });

        const initData = async () => {
            try {
                await fetchHabits();
                await fetchTasks();
            } catch (err) {
                console.error('Failed to fetch initial data', err);
            }
        };
        void initData();

        const requestPermissions = async () => {
            try {
                const permStatus = await LocalNotifications.checkPermissions();
                if (permStatus.display !== 'granted') {
                    await LocalNotifications.requestPermissions();
                }
            } catch (e) {
                console.error('Error requesting notifications permissions', e);
            }
        };

        void requestPermissions();

        const createChannel = async () => {
            try {
                await LocalNotifications.createChannel({
                    id: 'schedule-channel',
                    name: 'Schedule Reminders',
                    description: 'Notifications for your scheduled activities',
                    importance: 5,
                    visibility: 1,
                    sound: 'beep.wav',
                    vibration: true,
                });
            } catch (e) {
                console.error('Error creating notification channel', e);
            }
        };
        void createChannel();

        const notificationReceivedListener = LocalNotifications.addListener('localNotificationReceived', (notification) => {
            console.log('Notification received:', notification);
        });

        const notificationActionListener = LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
            console.log('Notification action performed:', notification);
        });

        syncDate();

        const subscription = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
                syncDate();
                void fetchHabits();
                if (isAuthenticated) {
                    void fetchUserData();
                }
                return;
            }

            if (isAuthenticated) {
                void Promise.allSettled([
                    syncHabitsToSupabase(),
                    syncMissionsToSupabase(),
                ]);
            }
        });

        const interval = setInterval(() => {
            syncDate();
        }, 60000);

        return () => {
            void subscription.then((sub) => sub.remove());
            void notificationReceivedListener.then((listener) => listener.remove());
            void notificationActionListener.then((listener) => listener.remove());
            authListener.subscription.unsubscribe();
            clearInterval(interval);
        };
    }, [checkSession, fetchHabits, fetchTasks, fetchUserData, isAuthenticated, setHabitDate, setScheduleDate, syncHabitsToSupabase, syncMissionsToSupabase]);

    if (isCheckingSession) {
        return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#C8FF00] font-black uppercase tracking-[0.2em]">LOADING</div>;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                {isAuthenticated && onboardingComplete && dailyBriefShown !== new Date().toISOString().split('T')[0] && <DailyBrief />}
                <HashRouter>
                    {!isAuthenticated ? (
                        <AuthPage />
                    ) : (
                        <Routes>
                            <Route path="/onboarding" element={onboardingComplete ? <Navigate to="/" replace /> : <OnboardingPage />} />
                            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                            <Route path="/blitz" element={<ProtectedRoute><BlitzFocusPage /></ProtectedRoute>} />
                            <Route path="/pomodoro" element={<ProtectedRoute><PomodoroPage /></ProtectedRoute>} />
                            <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
                            <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
                            <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
                            <Route path="/programs" element={<ProtectedRoute><ProgramsPage /></ProtectedRoute>} />
                            <Route path="/programs/:id" element={<ProtectedRoute><ProgramDetailPage /></ProtectedRoute>} />
                            <Route path="/what-next" element={<ProtectedRoute><WhatNextPage /></ProtectedRoute>} />
                            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
                            <Route path="/missions/new" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
                            <Route path="/voice" element={<ProtectedRoute><VoicePage /></ProtectedRoute>} />
                            <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                            <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
                        </Routes>
                    )}
                </HashRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default App;
