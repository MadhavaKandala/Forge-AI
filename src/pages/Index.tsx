import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  MoreVertical,
  Plus,
  Rocket,
  Settings,
  CheckCircle2,
  Clock,
  LayoutList,
  Infinity,
  List as ListIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/useUserStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useBlitzStore } from '@/store/useBlitzStore';
import { BlitzTaskCard } from '@/components/blitz/BlitzTaskCard';
import { PillButton } from '@/components/ui/PillButton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ListManager } from '@/components/blitz/ListManager';

const TABS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'this_week', label: 'This Week' },
  { id: 'today', label: 'Today' },
  { id: 'done', label: 'Done' }
] as const;

type AppTab = typeof TABS[number]['id'];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { tasks, fetchTasks, updateTask, deleteTask, addTask } = useTaskStore();
  const { lists, fetchLists, startBlitzSession } = useBlitzStore();

  const [activeTab, setActiveTab] = useState<AppTab>('today');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showManageLists, setShowManageLists] = useState(false);

  // Add Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEst, setNewTaskEst] = useState('30');

  useEffect(() => {
    fetchTasks();
    fetchLists();
  }, []);

  const handleStartBlitz = async (taskId: string, est: number) => {
    await startBlitzSession(taskId, est);
    navigate('/blitz');
  };

  const currentList = selectedListId ? lists.find(l => l.id === selectedListId) : null;

  const filteredTasks = tasks.filter(t => {
    const matchesStatus = (activeTab === 'done' || activeTab === 'completed')
      ? (t.status === 'done' || t.status === 'completed')
      : t.status === activeTab;

    const matchesList = selectedListId ? t.list_id === selectedListId : true;

    return matchesStatus && matchesList;
  });

  const doneCount = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
  const progress = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0;

  const handleAddTask = async () => {
    if (!newTaskTitle) return;
    await addTask({
      title: newTaskTitle,
      status: activeTab === 'done' ? 'today' : activeTab,
      estimated_minutes: parseInt(newTaskEst),
      user_id: user?.id || 'default-user',
      category: 'personal',
      priority: 'medium',
      list_id: selectedListId || undefined,
      has_subtasks: 0,
      completed_subtasks: 0,
      total_subtasks: 0,
      xp_value: 10,
      difficulty_multiplier: 1
    });
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-['Space Grotesk'] pb-40">
      {/* Top Bar */}
      <header className="p-6 flex items-center justify-between">
        <div
          onClick={() => setShowManageLists(true)}
          className="flex items-center gap-3 bg-[#1a1a1a] p-2 pr-4 rounded-2xl border border-[#262626] cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex -space-x-1.5">
            {lists.slice(0, 2).map((l, i) => (
              <div key={l.id} className="w-6 h-6 rounded-lg border-2 border-black" style={{ backgroundColor: l.color }} />
            ))}
            {lists.length === 0 && <div className="w-6 h-6 rounded-lg border-2 border-black bg-zinc-700" />}
          </div>
          <span className="font-bold text-lg">{currentList?.title || 'All Lists'}</span>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsUnlimited(!isUnlimited)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-all font-bold text-sm",
              isUnlimited ? "bg-gradient-to-r from-[#dfff4f] to-[#2fb58f] text-black border-transparent shadow-[0_0_20px_rgba(223,255,79,0.2)]" : "border-[#262626] text-muted-foreground"
            )}
          >
            <Infinity className="w-4 h-4" />
            Unlimited
          </button>

          <Avatar className="w-10 h-10 border border-[#262626]">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-[#1a1a1a] text-xs font-bold">{user?.display_name?.charAt(0) || 'M'}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 mb-4 flex items-center gap-6 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AppTab)}
            className={cn(
              "text-lg font-bold transition-all relative pb-2 whitespace-nowrap",
              activeTab === tab.id ? "text-white" : "text-zinc-500"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#dfff4f] rounded-full shadow-[0_0_10px_rgba(223,255,79,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="px-6 mb-8 flex items-center gap-4">
        <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#dfff4f] to-[#2fb58f] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-bold text-zinc-500 font-mono">
          {doneCount}/{tasks.length} DONE
        </span>
      </div>

      {/* Task List */}
      <div className="px-6 space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center opacity-40">
            <CheckCircle2 className="w-16 h-16 mb-4" />
            <p className="text-xl font-bold">All Clear</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const taskList = lists.find(l => l.id === task.list_id);
            return (
              <BlitzTaskCard
                key={task.id}
                taskId={task.id}
                title={task.title}
                estimateMinutes={task.estimated_minutes || 0}
                status={task.status}
                onStartBlitz={() => handleStartBlitz(task.id, task.estimated_minutes || 30)}
                onDelete={() => deleteTask(task.id)}
                onToggleDone={() => updateTask(task.id, { status: task.status === 'done' ? 'today' : 'done' })}
                listColor={taskList?.color}
                listInitial={taskList?.initial || 'T'}
              />
            );
          })
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-8 left-0 w-full px-6 flex items-center gap-4 z-50">
        <PillButton
          onClick={() => filteredTasks[0] && handleStartBlitz(filteredTasks[0].id, filteredTasks[0].estimated_minutes || 30)}
          disabled={filteredTasks.length === 0}
          className="flex-1 py-7 text-xl flex items-center justify-center gap-3 active:scale-95 shadow-green-500/20 disabled:opacity-50"
        >
          <Rocket className="w-6 h-6" />
          BLITZ NOW
        </PillButton>

        <button
          onClick={() => setShowAddTask(true)}
          className="w-16 h-16 bg-[#1a1a1a] rounded-full border border-[#262626] flex items-center justify-center shadow-2xl active:scale-90 transition-all"
        >
          <Plus className="w-8 h-8 text-[#dfff4f]" />
        </button>
      </div>

      {/* Add Task Sheet */}
      <BottomSheet
        title="Create Task"
        open={showAddTask}
        onOpenChange={setShowAddTask}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm uppercase tracking-widest">Title</label>
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Leet code potd"
              className="bg-transparent border-[#262626] text-xl h-14 focus:border-[#dfff4f]"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm uppercase tracking-widest">Est Time (min)</label>
              <Input
                type="number"
                value={newTaskEst}
                onChange={(e) => setNewTaskEst(e.target.value)}
                className="bg-transparent border-[#262626] text-xl h-14"
              />
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm uppercase tracking-widest">Bucket</label>
              <div className="h-14 bg-[#1a1a1a] rounded-md border border-[#262626] flex items-center px-4 font-bold text-sm">
                {activeTab.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setShowAddTask(false)} className="flex-1 py-4 font-bold text-muted-foreground">Cancel</button>
            <PillButton onClick={handleAddTask} className="flex-1 py-4">Save</PillButton>
          </div>
        </div>
      </BottomSheet>

      {/* Manage Lists Sheet */}
      <BottomSheet
        title="Manage Lists"
        open={showManageLists}
        onOpenChange={setShowManageLists}
      >
        <ListManager onClose={() => setShowManageLists(false)} />
      </BottomSheet>
    </div>
  );
};

export default Index;
