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
import { Search } from 'lucide-react';

/* 
 * ProgramSection is commented out as user hasn't asked for it to be restored explicitly 
 * but it was in the original imports. 
 * I will placeholder it if needed or omit for now if not part of user 'features'.
 * Actually, user had 'program' tab. I will add a placeholder for it.
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
            {/* Search Bar - only on Hub */}
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

            <WeekStrip />
            <DaySection />
            <HabitList />
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
