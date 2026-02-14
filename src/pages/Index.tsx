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
import { Search, Flame } from 'lucide-react';

/* 
 * ProgramSection Placeholder
 */
const ProgramPlaceholder = () => (
  <div className="w-full px-6 py-10 text-center text-zinc-500">
    <h2 className="text-xl font-bold text-white mb-2">Programs</h2>
    <p>Coming soon...</p>
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState('hub');

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-32 font-sans selection:bg-[#dfff4f] selection:text-black">
      {/* Header always visible */}
      <Header />

      {/* Main Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'hub' && (
          <>
            {/* Search Bar */}
            <div className="w-full px-6 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search habits..."
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-2xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#dfff4f] transition-colors"
                />
              </div>
            </div>

            {/* Top Utility Strip */}
            <WeekStrip />

            {/* Smart Schedule - Real Time Context */}
            <SmartSchedule />

            {/* Day Progress & Streak */}
            <DaySection />

            {/* Productivity System (1-3-5 Rule) */}
            <ProductivityTracker />

            {/* Priority Matrix */}
            <EisenhowerMatrix />

            {/* Original Habit List (Bottom Priority) */}
            <div className="mt-8 border-t border-zinc-800 pt-8">
              <h2 className="px-6 text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Habit Checklist</h2>
              <HabitList />
            </div>

            <ScheduleSection />
          </>
        )}

        {activeTab === 'analytics' && <AnalyticsSection />}
        {activeTab === 'program' && <ProgramPlaceholder />}
        {activeTab === 'community' && <CommunitySection />}
        {activeTab === 'profile' && <ProfileSection />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
