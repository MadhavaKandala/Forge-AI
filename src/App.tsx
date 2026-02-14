import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PomodoroPage from "./pages/PomodoroPage";
import SchedulePage from "./pages/SchedulePage";
import ProgramsPage from "./pages/ProgramsPage";
import ProgramDetailPage from "./pages/ProgramDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { useEffect } from "react";
import { App as CapacitorApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useHabitStore } from "./store/useHabitStore";
import { useUserStore } from "./store/useUserStore";
import { useScheduleStore } from "./store/useScheduleStore";

const App = () => {
  const { setSelectedDate: setHabitDate, fetchHabits, fetchTasks } = useHabitStore();
  const { setSelectedDate: setScheduleDate } = useScheduleStore(); // If needed to sync both
  const { fetchUser } = useUserStore();

  const syncDate = () => {
    const today = new Date();
    setHabitDate(today);
    if (setScheduleDate) setScheduleDate(today);
  };

  useEffect(() => {
    // 0. Fetch Initial Data
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

    // 1. Request Notification Permissions on mount
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

    // 1b. Create Notification Channel (Android)
    const createChannel = async () => {
      try {
        await LocalNotifications.createChannel({
          id: 'schedule-channel',
          name: 'Schedule Reminders',
          description: 'Notifications for your scheduled activities',
          importance: 5, // HIGH
          visibility: 1, // PUBLIC
          sound: 'beep.wav', // optional, will use default if not found
          vibration: true,
        });
      } catch (e) {
        console.error("Error creating notification channel", e);
      }
    };
    createChannel();

    // 1c. Listen for Notifications (Foreground)
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Notification received:', notification);
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Notification action performed:', notification);
    });

    // 2. Initial Date Sync
    syncDate();

    // 3. Listen for App State Changes (Resume) to sync date
    const subscription = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        syncDate();
        fetchHabits(); // Refresh data on resume
      }
    });

    // 4. Fallback interval check (every minute)
    const interval = setInterval(() => {
      syncDate();
    }, 60000);

    return () => {
      // Clean up listeners
      subscription.then(sub => sub.remove());
      clearInterval(interval);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/programs/:id" element={<ProgramDetailPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
