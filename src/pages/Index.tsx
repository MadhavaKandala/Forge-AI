import React, { useState } from 'react';
import { Header } from '@/components/habit-tracker/Header';
import { SearchBar } from '@/components/habit-tracker/SearchBar';
import { DaySection } from '@/components/habit-tracker/DaySection';
import { HabitList } from '@/components/habit-tracker/HabitList';
import { ProgramSection } from '@/components/habit-tracker/ProgramSection';
import { BottomNav } from '@/components/habit-tracker/BottomNav';
import { ScheduleSection } from '@/components/habit-tracker/ScheduleSection';
import { AnalyticsSection } from '@/components/habit-tracker/AnalyticsSection';
import { CommunitySection } from '@/components/habit-tracker/CommunitySection';
import { ProfileSection } from '@/components/habit-tracker/ProfileSection';
import { WeekStrip } from '@/components/habit-tracker/WeekStrip';
import { useHabitStore } from '@/store/useHabitStore';
import TasksPage from './TasksPage';
import ProgramsPage from './ProgramsPage';

const Index = () => {
  const { getDailyProgress, selectedDate } = useHabitStore();
  const [activeTab, setActiveTab] = useState('hub');

  const progress = getDailyProgress(selectedDate);

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TasksPage />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'programs':
        return <ProgramsPage />;
      case 'profile':
        return <ProfileSection />;
      case 'hub':
      default:
        return (
          <div className="flex flex-col w-full animate-in fade-in duration-500">
            <DaySection />
            <div className="px-6 mb-2">
              <h2 className="text-xl font-bold mb-4">Your Progress</h2>
              <div className="w-full bg-[#18181B] rounded-2xl p-5 border border-[#27272A] flex items-center justify-between mb-8 transition-all hover:border-zinc-700">
                <div className="flex flex-col">
                  <span className="text-zinc-400 text-sm mb-1">Daily Goal</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white transition-all duration-500">
                      {progress}%
                    </span>
                    <span className="text-xs text-[#dfff4f]">+1% vs yesterday</span>
                  </div>
                  <button
                    onClick={() => window.location.href = '/pomodoro'}
                    className="mt-2 text-xs bg-[#dfff4f] text-black px-3 py-1 rounded-full font-bold hover:bg-[#ccee3e] transition-colors"
                  >
                    ▶ Start Focus
                  </button>
                </div>

                {/* Progress Ring */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {/* Background Circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-zinc-800"
                    />
                    {/* Foreground Circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#dfff4f"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 * (1 - progress / 100)}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-white">{progress}%</span>
                </div>
              </div>
            </div>

            <HabitList />
            <ScheduleSection />
            <ProgramSection />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 max-w-md mx-auto md:border-x md:border-[#27272A] relative">
      <Header />
      {activeTab === 'hub' && (
        <>
          <SearchBar />
          <WeekStrip />
        </>
      )}

      {renderContent()}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
