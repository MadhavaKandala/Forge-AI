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
import { ProgramSection } from '@/components/habit-tracker/ProgramSection';
import TasksPage from './TasksPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('hub');

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
            <ProgramSection onSeeAll={() => setActiveTab('program')} />

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
            <div className="mt-4 border-t border-zinc-900 pt-8">
              <HabitList />
            </div>

            <ScheduleSection />
          </>
        )}

        {activeTab === 'tasks' && <TasksPage />}

        {activeTab === 'analytics' && <AnalyticsSection />}
        {activeTab === 'program' && (
          <div className="px-6 py-6">
            <h2 className="text-2xl font-bold mb-6">All Programs</h2>
            <ProgramSection onSeeAll={() => { }} />
          </div>
        )}
        {activeTab === 'community' && <CommunitySection />}
        {activeTab === 'profile' && <ProfileSection />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
