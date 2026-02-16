import React, { useState } from 'react';
import { Header } from '@/components/habit-tracker/Header';
import { WeekStrip } from '@/components/habit-tracker/WeekStrip';
import { DaySection } from '@/components/habit-tracker/DaySection';
import { HabitList } from '@/components/habit-tracker/HabitList';
import { ScheduleSection } from '@/components/habit-tracker/ScheduleSection';
import { BottomNav } from '@/components/habit-tracker/BottomNav';
import { AnalyticsSection } from '@/components/habit-tracker/AnalyticsSection';
import { CommunitySection } from '@/components/habit-tracker/CommunitySection';
import { ProfileSection } from '@/components/habit-tracker/ProfileSection';
import { EisenhowerMatrix } from '@/components/habit-tracker/EisenhowerMatrix';
import { ProductivityTracker } from '@/components/habit-tracker/ProductivityTracker';
import { SmartSchedule } from '@/components/habit-tracker/SmartSchedule';
import { WhatNextCard } from '@/components/habit-tracker/WhatNextCard';
import { ProgramSection } from '@/components/habit-tracker/ProgramSection';
import { AddTaskModal } from '@/components/habit-tracker/AddTaskModal';
import TasksPage from './TasksPage';
import VoiceNotePage from './VoiceNotePage';
import { CodeHub } from '@/components/Hubs/CodeHub';
import { FitnessHub } from '@/components/Hubs/FitnessHub';
import { ReadingHub } from '@/components/Hubs/ReadingHub';
import { DietHub } from '@/components/Hubs/DietHub';
import { useChallenges } from '@/hooks/useChallenges';
import { useHabitStore } from '@/store/useHabitStore';

const Index = () => {
  const [activeTab, setActiveTab] = useState('hub');
  const [selectedHub, setSelectedHub] = useState<string | null>(null);
  const { activeChallenges } = useChallenges();
  const { fetchTasks } = useHabitStore();

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-32 font-sans selection:bg-primary selection:text-black overflow-x-hidden">
      {/* Header always visible except for Tasks/Kanban which has its own header */}
      {activeTab !== 'tasks' && <Header />}

      {/* Main Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-md mx-auto">
        {activeTab === 'hub' && (
          <>
            {/* Top Utility Strip */}
            <WeekStrip />

            {/* Live Programs - Horizontal High Density */}
            <ProgramSection onSeeAll={() => setActiveTab('program')} onHubSelect={setSelectedHub} />

            {/* Smart Suggestions - High Priority */}
            <WhatNextCard />

            {/* Smart Schedule - Real Time Context */}
            <SmartSchedule />

            {/* Day Progress Summary */}
            <DaySection />

            {/* Productivity System (1-3-5 Rule) */}
            <ProductivityTracker />

            {/* Priority Matrix - Collapsible or Compact */}
            <div className="px-6 mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Strategic Matrix</h2>
              <EisenhowerMatrix />
            </div>

            {/* Habit Checklist (Bottom Priority) */}
            <div id="habit-checklist" className="mt-4 border-t border-zinc-900 pt-8">
              <HabitList onCategoryClick={setSelectedHub} />
            </div>

            <ScheduleSection />
          </>
        )}

        {activeTab === 'tasks' && <TasksPage />}
        {activeTab === 'voice' && <VoiceNotePage />}
        {activeTab === 'analytics' && <AnalyticsSection />}
        {activeTab === 'program' && (
          <div className="px-6 py-6">
            <h2 className="text-2xl font-bold mb-6">All Programs</h2>
            <ProgramSection onSeeAll={() => { }} />
          </div>
        )}
        {activeTab === 'community' && <CommunitySection />}
        {activeTab === 'profile' && <ProfileSection />}

        {/* Categories Hubs Overlays */}
        {selectedHub === 'coding' && (
          <div className="fixed inset-0 bg-[#09090b] z-50 overflow-y-auto px-6 py-8 animate-in slide-in-from-right duration-300">
            <CodeHub challenges={activeChallenges} onNavigateBack={() => setSelectedHub(null)} />
          </div>
        )}
        {selectedHub === 'fitness' && (
          <div className="fixed inset-0 bg-[#09090b] z-50 overflow-y-auto px-6 py-8 animate-in slide-in-from-right duration-300">
            <FitnessHub challenges={activeChallenges} onNavigateBack={() => setSelectedHub(null)} />
          </div>
        )}
        {selectedHub === 'gym' && (
          <div className="fixed inset-0 bg-[#09090b] z-50 overflow-y-auto px-6 py-8 animate-in slide-in-from-right duration-300">
            <FitnessHub challenges={activeChallenges} onNavigateBack={() => setSelectedHub(null)} />
          </div>
        )}
        {selectedHub === 'reading' && (
          <div className="fixed inset-0 bg-[#09090b] z-50 overflow-y-auto px-6 py-8 animate-in slide-in-from-right duration-300">
            <ReadingHub challenges={activeChallenges} onNavigateBack={() => setSelectedHub(null)} />
          </div>
        )}
        {selectedHub === 'diet' && (
          <div className="fixed inset-0 bg-[#09090b] z-50 overflow-y-auto px-6 py-8 animate-in slide-in-from-right duration-300">
            <DietHub onNavigateBack={() => setSelectedHub(null)} />
          </div>
        )}

        {/* Global Floating Action Button */}
        {activeTab !== 'tasks' && (
          <div className="fixed bottom-24 right-6 z-40">
            <AddTaskModal />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
