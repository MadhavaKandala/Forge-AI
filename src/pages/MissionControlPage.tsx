import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { useHabitStore } from '@/store/useHabitStore';
import { Task, TaskStatus } from '@/types/task';
import { cn } from '@/lib/utils';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MissionControlPage = () => {
  const { tasks, updateTask, addXP, fetchTasks } = useHabitStore();
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'backlog', label: 'BACKLOG', color: 'bg-slate-900/40' },
    { id: 'this_week', label: 'THIS WEEK', color: 'bg-blue-900/40' },
    { id: 'today', label: 'TODAY', color: 'bg-yellow-900/40' },
    { id: 'in_progress', label: 'IN PROGRESS', color: 'bg-orange-900/40' },
    { id: 'completed', label: 'DEPLOYED', color: 'bg-green-900/40' },
  ];

  const filteredTasks = useMemo(() => {
    if (!filter) return tasks;
    return tasks.filter((t) => t.category === filter);
  }, [tasks, filter]);

  const tasksByStatus = useMemo(
    () =>
      columns.reduce(
        (acc, col) => {
          acc[col.id] = filteredTasks.filter((t) => t.status === col.id);
          return acc;
        },
        {} as Record<TaskStatus, Task[]>
      ),
    [filteredTasks]
  );

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    const task = tasks.find((t) => t.id === draggableId);

    if (task && newStatus !== task.status) {
      updateTask(task.id, { status: newStatus });

      if (newStatus === 'completed') {
        const xpReward = task.priority === 'high' ? 50 : 25;
        addXP(xpReward);
        toast.success(`+${xpReward} XP`);
      }
    }
  };

  const categories = Array.from(new Set(tasks.map((t) => t.category))).sort();

  return (
    <div className="w-full h-screen bg-[#0A0A0A] text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 border-b border-zinc-800">
        <h1 className="text-3xl font-black">MISSION CONTROL</h1>
        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-[0.15em]">Kanban Deployment Board</p>
      </div>

      {/* Filter Pills */}
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto">
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

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto p-6 gap-4 flex">
          {columns.map((col) => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'flex-shrink-0 w-80 rounded-xl border border-zinc-800 bg-[#141414] flex flex-col',
                    snapshot.isDraggingOver && 'ring-2 ring-[#C8FF00]'
                  )}
                >
                  {/* Column Header */}
                  <div className={cn('p-4 border-b border-zinc-800', col.color)}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xs uppercase tracking-wider">{col.label}</h3>
                      <span className="text-sm font-bold text-[#C8FF00]">{tasksByStatus[col.id].length}</span>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {tasksByStatus[col.id].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => setSelectedTask(task)}
                            className={cn(
                              'rounded-lg border border-zinc-700 bg-zinc-900 p-3 cursor-grab active:cursor-grabbing transition-all',
                              snapshot.isDragging && 'shadow-lg ring-2 ring-[#C8FF00]',
                              task.status === 'completed' && 'opacity-60 line-through'
                            )}
                          >
                            <p className="text-sm font-semibold">{task.title}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <span
                                className={cn(
                                  'px-2 py-1 rounded-full font-bold',
                                  task.priority === 'high' && 'bg-red-500/20 text-red-400',
                                  task.priority === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                                  task.priority === 'low' && 'bg-blue-500/20 text-blue-400'
                                )}
                              >
                                {task.priority}
                              </span>
                              <span className="text-zinc-500">{task.category}</span>
                            </div>
                            {task.estimatedMinutes && (
                              <p className="text-xs text-zinc-500 mt-2">~{task.estimatedMinutes}min</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Task Detail Modal - simplified inline view */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-[#1C1C1C] rounded-t-2xl border-t border-zinc-800 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black">MISSION DETAILS</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase text-zinc-500 font-bold">TITLE</label>
                <p className="text-lg font-semibold mt-1">{selectedTask.title}</p>
              </div>

              <div>
                <label className="text-xs uppercase text-zinc-500 font-bold">DESCRIPTION</label>
                <p className="text-sm text-zinc-300 mt-1">{selectedTask.description || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-zinc-500 font-bold">PRIORITY</label>
                  <p className="text-sm mt-1 font-bold">{selectedTask.priority}</p>
                </div>
                <div>
                  <label className="text-xs uppercase text-zinc-500 font-bold">STATUS</label>
                  <p className="text-sm mt-1 font-bold">{selectedTask.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-zinc-500 font-bold">CATEGORY</label>
                  <p className="text-sm mt-1 capitalize">{selectedTask.category}</p>
                </div>
                <div>
                  <label className="text-xs uppercase text-zinc-500 font-bold">EST TIME</label>
                  <p className="text-sm mt-1">{selectedTask.estimatedMinutes || '?'}min</p>
                </div>
              </div>

              <button
                onClick={() => {
                  toast.success('Mission synced');
                  setSelectedTask(null);
                }}
                className="w-full bg-[#C8FF00] text-black font-black text-xs uppercase tracking-widest py-3 rounded-lg mt-6"
              >
                SYNC MISSION DATA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionControlPage;
