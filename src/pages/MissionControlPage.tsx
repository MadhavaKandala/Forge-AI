import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useHabitStore } from '@/store/useHabitStore';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { Plus, ChevronDown, ChevronRight, ArrowRight, Check } from 'lucide-react';
import { AddTaskModal } from '@/components/habit-tracker/AddTaskModal';

const MissionControlPage = () => {
  const tasks = useHabitStore((s) => s.tasks);
  const updateTask = useHabitStore((s) => s.updateTask);
  const addXP = useHabitStore((s) => s.addXP);
  const fetchTasks = useHabitStore((s) => s.fetchTasks);
  const addTask = useHabitStore((s) => s.addTask);

  const [filter, setFilter] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  const [isTodoOpen, setIsTodoOpen] = useState(true);
  const [isInProgressOpen, setIsInProgressOpen] = useState(true);
  const [isDoneOpen, setIsDoneOpen] = useState(false);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    if (!filter) return tasks;
    return tasks.filter((t) => t.category === filter);
  }, [tasks, filter]);

  const todoTasks = useMemo(() => {
    return filteredTasks
      .filter((t) => ['today', 'this_week', 'backlog'].includes(t.status))
      .sort((a, b) => {
        const order = { today: 1, this_week: 2, backlog: 3 };
        return (order[a.status as keyof typeof order] || 4) - (order[b.status as keyof typeof order] || 4);
      });
  }, [filteredTasks]);

  const inProgressTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.status === 'in_progress');
  }, [filteredTasks]);

  const doneTasks = useMemo(() => {
    return filteredTasks.filter((t) => ['completed'].includes(t.status));
  }, [filteredTasks]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle.trim()) return;

    // We only pass title and status='today'.
    // The store's addTask handles all other defaults based on quadrant/etc.
    // Cast to any to bypass strict type checking for omitted properties if needed,
    // but CreateTaskDTO requires category. Let's look at the type.
    // Wait, CreateTaskDTO requires `category`. Let's use a dynamic one if needed, or just standard 'other'.
    await addTask({
      title: quickAddTitle.trim(),
      category: 'other', // fallback default that won't conflict with rules
      status: 'today'
    } as any);

    setQuickAddTitle('');
    toast.success('Mission added to TODO');
  };

  const handleMoveToProgress = (taskId: string) => {
    updateTask(taskId, { status: 'in_progress' });
    toast.success('Mission moved to IN PROGRESS');
  };

  const handleMoveToDone = (task: Task) => {
    updateTask(task.id, { status: 'completed' });
    const xpReward = task.priority === 'high' ? 50 : 25;
    addXP(xpReward);
    toast.success(`+${xpReward} XP`);
  };

  const categories = Array.from(new Set(tasks.map((t) => t.category))).sort();

  const TaskCard = ({ task, isDoneSection }: { task: Task; isDoneSection?: boolean }) => (
    <div className={cn(
      "flex items-center w-full max-h-[60px] h-[60px] rounded-lg border border-zinc-800 bg-[#141414] px-4 transition-all mb-2",
      isDoneSection && "opacity-60"
    )}>
      <div className={cn(
        "w-3 h-3 rounded-full mr-4 flex-shrink-0",
        task.priority === 'high' && "bg-red-500",
        task.priority === 'medium' && "bg-orange-500",
        task.priority === 'low' && "bg-zinc-500"
      )} />

      <div className="flex-1 min-w-0 pr-4">
        <p className={cn(
          "text-sm font-semibold truncate text-white",
          isDoneSection && "line-through text-zinc-400"
        )}>
          {task.title}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">
          {task.category}
        </span>

        {!isDoneSection && (
          <button
            onClick={() => task.status === 'in_progress' ? handleMoveToDone(task) : handleMoveToProgress(task.id)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 hover:bg-[#C8FF00] hover:text-black transition-colors"
          >
            {task.status === 'in_progress' ? (
              <Check className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white pb-24 flex flex-col">
      {/* Quick Add Bar */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-[#0A0A0A] sticky top-0 z-10">
        <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={quickAddTitle}
            onChange={(e) => setQuickAddTitle(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 bg-[#141414] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#C8FF00] text-white"
          />
          <button
            type="submit"
            disabled={!quickAddTitle.trim()}
            className="flex items-center justify-center bg-[#C8FF00] text-black w-11 h-11 rounded-lg disabled:opacity-50 transition-opacity"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>
        </form>
      </div>

      {/* Filter Chips */}
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            'px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap',
            !filter ? 'bg-[#C8FF00] text-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
          )}
        >
          ALL
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap',
              filter === cat
                ? 'bg-[#C8FF00] text-black'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="flex-1 px-4 py-6 space-y-6">
        {/* TODO Section */}
        <div className="flex flex-col">
          <button
            onClick={() => setIsTodoOpen(!isTodoOpen)}
            className="flex items-center justify-between py-2 mb-2 w-full text-left"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-300">TODO</h2>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{todoTasks.length}</span>
            </div>
            {isTodoOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
          </button>

          {isTodoOpen && (
            <div className="flex flex-col">
              {todoTasks.length > 0 ? (
                todoTasks.map(task => <TaskCard key={task.id} task={task} />)
              ) : (
                <p className="text-sm text-zinc-600 italic py-2">No pending missions.</p>
              )}
            </div>
          )}
        </div>

        {/* IN PROGRESS Section */}
        <div className="flex flex-col">
          <button
            onClick={() => setIsInProgressOpen(!isInProgressOpen)}
            className="flex items-center justify-between py-2 mb-2 w-full text-left"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#C8FF00]">IN PROGRESS</h2>
              <span className="text-xs bg-[#C8FF00]/20 text-[#C8FF00] px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
            </div>
            {isInProgressOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
          </button>

          {isInProgressOpen && (
            <div className="flex flex-col">
              {inProgressTasks.length > 0 ? (
                inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)
              ) : (
                <p className="text-sm text-zinc-600 italic py-2">No missions in progress.</p>
              )}
            </div>
          )}
        </div>

        {/* DONE Section */}
        <div className="flex flex-col">
          <button
            onClick={() => setIsDoneOpen(!isDoneOpen)}
            className="flex items-center justify-between py-2 mb-2 w-full text-left"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-500">DONE</h2>
              <span className="text-xs bg-zinc-800/50 text-zinc-500 px-2 py-0.5 rounded-full">{doneTasks.length}</span>
            </div>
            {isDoneOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
          </button>

          {isDoneOpen && (
            <div className="flex flex-col">
              {doneTasks.length > 0 ? (
                doneTasks.map(task => <TaskCard key={task.id} task={task} isDoneSection />)
              ) : (
                <p className="text-sm text-zinc-600 italic py-2">No completed missions yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-20 right-6 z-50">
        <AddTaskModal
          trigger={
            <button className="flex items-center justify-center w-14 h-14 bg-[#C8FF00] text-black rounded-full shadow-lg shadow-[#C8FF00]/20 hover:scale-105 active:scale-95 transition-all">
              <Plus className="w-6 h-6 font-black" />
            </button>
          }
        />
      </div>
    </div>
  );
};

export default MissionControlPage;
