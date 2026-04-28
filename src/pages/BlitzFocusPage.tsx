import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gamepad2, FileText, Pause, Play, ChevronRight, CheckCircle2, Circle, Maximize2, Settings } from 'lucide-react';
import { BlitzTimer } from '@/components/blitz/BlitzTimer';
import { PillButton } from '@/components/ui/PillButton';
import { useBlitzStore } from '@/store/useBlitzStore';
import { useTaskStore } from '@/store/useTaskStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const BlitzFocusPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentSession, completeBlitzSession, startBreak } = useBlitzStore();
    const { tasks, updateTask } = useTaskStore();

    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showSubtasks, setShowSubtasks] = useState(false);

    const task = tasks.find(t => t.id === currentSession?.task_id);

    useEffect(() => {
        if (!currentSession) {
            navigate('/');
            return;
        }
        setSeconds(currentSession.est_minutes ? currentSession.est_minutes * 60 : 0);
    }, [currentSession, navigate]);

    useEffect(() => {
        let interval: any;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(s => s - 1);
            }, 1000);
        } else if (seconds === 0 && isActive) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const handleDone = async () => {
        if (currentSession) {
            const est = currentSession.est_minutes ?? 0;
            const taken = Math.floor((est * 60 - seconds) / 60);
            await completeBlitzSession(taken);
            if (task) {
                await updateTask(task.id, { status: 'done', completed: 1, completed_at: new Date().toISOString() });
            }
            navigate('/');
        }
    };

    const handleOpenTaskDetails = () => {
        navigate('/tasks');
    };

    if (!task) return null;

    return (
        <div className={cn(
            "min-h-screen bg-black text-white p-6 flex flex-col transition-all duration-500",
            isFullScreen && "p-0"
        )}>
            {!isFullScreen && (
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate('/')} className="p-2 bg-[#1a1a1a] rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">Blitz mode</h1>
                    <button
                        className="p-2 bg-[#1a1a1a] rounded-full text-muted-foreground"
                        onClick={() => toast.success('Settings coming soon')}
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            )}

            {!isFullScreen && (
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded bg-[#dfff4f]" />
                        <span className="text-lg font-bold">Coding</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                    </div>
                    <div className="w-full h-1 bg-[#262626] rounded-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-[#dfff4f] w-1/3" />
                        {/* Simulate progress */}
                    </div>
                    <div className="text-[12px] text-right text-muted-foreground mt-1 font-mono">0/1 DONE</div>
                </div>
            )}

            <div className={cn(
                "flex-1 flex flex-col",
                isFullScreen ? "items-center justify-center bg-[#0a0a0a]" : "bg-[#121212] p-6 rounded-3xl border border-[#262626] shadow-2xl relative overflow-hidden"
            )}>
                {isFullScreen && (
                    <div className="absolute top-12 left-0 w-full text-center">
                        <h2 className="text-2xl font-bold text-muted-foreground uppercase tracking-widest">{task.title}</h2>
                    </div>
                )}

                {!isFullScreen && (
                    <div className="flex justify-between items-start mb-12">
                        <h2 className="text-xl font-medium max-w-[80%]">{task.title}</h2>
                        <button
                            className="p-2 bg-black/20 rounded-lg border border-[#262626]"
                            onClick={handleOpenTaskDetails}
                        >
                            <FileText className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                )}

                <div className="flex-1 flex items-center justify-center">
                    <BlitzTimer
                        seconds={seconds}
                        totalSeconds={(task.estimated_minutes ?? 0) * 60}
                        isFullScreen={isFullScreen}
                    />
                </div>

                <div className={cn(
                    "w-full mt-auto",
                    isFullScreen ? "max-w-sm px-8 pb-12" : ""
                )}>
                    {/* Subtasks summary */}
                    <div
                        onClick={() => setShowSubtasks(!showSubtasks)}
                        className="bg-black/20 p-4 rounded-2xl flex items-center justify-between mb-6 cursor-pointer border border-white/5"
                    >
                        <div className="flex items-center gap-2">
                            <Circle className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground font-medium">0/2 Subtasks</span>
                        </div>
                        <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", showSubtasks && "rotate-90")} />
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-8">
                        <button
                            onClick={() => currentSession && startBreak(currentSession.id)}
                            className="flex-1 py-4 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-white/5 hover:bg-[#222]"
                        >
                            <Gamepad2 className="w-6 h-6" />
                        </button>
                        <button
                            className="flex-1 py-4 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-white/5 hover:bg-[#222]"
                            onClick={handleOpenTaskDetails}
                        >
                            <FileText className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className="flex-1 py-4 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-white/5 hover:bg-[#222]"
                        >
                            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>
                        <button
                            className="flex-1 py-4 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-white/5 hover:bg-[#222]"
                            onClick={() => setShowSubtasks(!showSubtasks)}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            className="flex-1 py-4 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-white/5 hover:bg-[#222]"
                        >
                            <Maximize2 className="w-6 h-6" />
                        </button>
                    </div>

                    <PillButton onClick={handleDone} className="w-full py-6 text-xl flex items-center justify-center gap-2 shadow-green-500/20">
                        <CheckCircle2 className="w-6 h-6" />
                        DONE
                    </PillButton>
                </div>
            </div>
        </div>
    );
};

export default BlitzFocusPage;
