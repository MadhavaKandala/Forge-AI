import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PomodoroPage from "./pages/PomodoroPage";
import SchedulePage from "./pages/SchedulePage";
import ProgramsPage from "./pages/ProgramsPage";
import ProgramDetailPage from "./pages/ProgramDetailPage";
import WhatNextPage from "./pages/WhatNextPage";
import TasksPage from "./pages/TasksPage";
import VoicePage from "./pages/VoicePage";
import StatsPage from "./pages/StatsPage";
import ProfilePage from "./pages/ProfilePage";
import { OnboardingPage } from "./pages/OnboardingPage";
import BlitzFocusPage from "./pages/BlitzFocusPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

import { useEffect, useState } from "react";
import { App as CapacitorApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useHabitStore } from "./store/useHabitStore";
import { useUserStore } from "./store/useUserStore";
import { useScheduleStore } from "./store/useScheduleStore";
import { createSessionIntegrity, useAppStore } from "./store/useAppStore";
import { supabase } from "./lib/supabase";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUserStore();

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono">LOADING...</div>;
  if (!user || !user.onboarding_completed) {
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
  const isAuthenticated = useAppStore((s) => {
    if (!s.isAuthenticated || !s.sessionToken || !s.sessionEmail || !s.sessionIntegrity) {
      return false;
    }
    return s.sessionIntegrity === createSessionIntegrity(s.sessionToken, s.sessionEmail);
  });
  const hydrateSession = useAppStore((s) => s.hydrateSession);
  const fetchUserData = useAppStore((s) => s.fetchUserData);
  const { setSelectedDate: setHabitDate, fetchHabits, fetchTasks } = useHabitStore();
  const { setSelectedDate: setScheduleDate } = useScheduleStore();
  const { fetchUser } = useUserStore();

  const syncDate = () => {
    const today = new Date();
    setHabitDate(today);
    if (setScheduleDate) setScheduleDate(today);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        await hydrateSession(data.session);
        if (data.session) {
          await fetchUserData();
        }
      } finally {
        setIsCheckingSession(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrateSession(session).then(() => {
        if (session) void fetchUserData();
      });
    });

    const initData = async () => {
      try {
        await fetchUser();
        await fetchHabits();
        await fetchTasks();
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    initData();

    const requestPermissions = async () => {
      try {
        const permStatus = await LocalNotifications.checkPermissions();
        if (permStatus.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      } catch (e) {
        console.error("Error requesting notifications permissions", e);
      }
    };

    requestPermissions();

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
        console.error("Error creating notification channel", e);
      }
    };
    createChannel();

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
        fetchHabits();
      }
    });

    const interval = setInterval(() => {
      syncDate();
    }, 60000);

    return () => {
      subscription.then(sub => sub.remove());
      notificationReceivedListener.then(listener => listener.remove());
      notificationActionListener.then(listener => listener.remove());
      authListener.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [fetchUserData, hydrateSession, fetchHabits, fetchTasks, fetchUser, setHabitDate, setScheduleDate]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          {isCheckingSession ? (
            <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono">LOADING...</div>
          ) : !isAuthenticated ? (
            <AuthPage />
          ) : (
            <Routes>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/blitz" element={<ProtectedRoute><BlitzFocusPage /></ProtectedRoute>} />
              <Route path="/pomodoro" element={<ProtectedRoute><PomodoroPage /></ProtectedRoute>} />
              <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
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
