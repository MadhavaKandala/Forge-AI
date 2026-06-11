import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Check,
    ChevronDown,
    Filter,
    Loader2,
    Mic,
    Plus,
    Play,
    Sparkles,
    Target,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import GuidedTour, { type TourStep } from '@/components/GuidedTour';
import { NewMissionModal } from '@/components/NewMissionModal';
import { TaskDetailModal } from '@/components/habit-tracker/TaskDetailModal';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useHabitStore } from '@/store/useHabitStore';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '@/types/task';

type MissionFilter = 'all' | 'coding' | 'gym' | 'work' | 'personal' | 'academics' | 'diet';
type MissionSectionType = 'today' | 'backlog' | 'completed';

interface ParsedMission {
    id: string;
    title: string;
    priority: TaskPriority;
    category: TaskCategory;
    displayCategory: string;
    stage: 'today';
    checked: boolean;
}

interface WebSpeechRecognitionResultEvent {
    resultIndex: number;
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

type WebSpeechRecognition = {
    start: () => void;
    stop: () => void;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: WebSpeechRecognitionResultEvent) => void) | null;
};

const FILTERS: { id: MissionFilter; label: string }[] = [
    { id: 'all', label: 'ALL' },
    { id: 'coding', label: 'CODING' },
    { id: 'gym', label: 'GYM' },
    { id: 'work', label: 'WORK' },
    { id: 'personal', label: 'PERSONAL' },
    { id: 'academics', label: 'ACADEMICS' },
    { id: 'diet', label: 'DIET' },
];

const MISSIONS_TOUR_KEY = 'missions-tour';

const MISSIONS_TOUR_STEPS: TourStep[] = [
    {
        targetId: 'smart-input-bar',
        title: 'AI MISSION PARSER',
        description: "Type anything like 'finish report today, gym tomorrow' and AI creates structured tasks automatically.",
        position: 'bottom',
    },
    {
        targetId: 'today-missions-section',
        title: "TODAY'S MISSIONS",
        description: 'Your active tasks. Tap START to begin, then DONE to complete and earn XP.',
        position: 'top',
    },
    {
        targetId: 'backlog-section',
        title: 'BACKLOG',
        description: 'Future tasks waiting to be deployed. Tap the arrow to move to today.',
        position: 'top',
    },
    {
        targetId: 'mission-fab',
        title: 'NEW MISSION',
        description: 'Tap + to create a detailed mission with priority, category and due date.',
        position: 'left',
    },
];

const MISSION_PARSER_SYSTEM_PROMPT = `You are a military mission parser. Extract tasks from
natural language. Return ONLY valid JSON array, nothing else.
No markdown, no explanation, just the JSON.
Format: [{title, priority, category, stage}]
priority: HIGH/MEDIUM/LOW
stage: always 'today' for new tasks
category: Coding/Gym/Diet/Personal/Academics/Agency/Work
Detect priority from urgency words:
today/now/urgent/asap/deadline = HIGH
tomorrow/soon/this week = MEDIUM
later/eventually/someday = LOW
Default priority: MEDIUM`;

const PRIORITY_BORDER: Record<TaskPriority, string> = {
    high: '#FF4444',
    medium: '#FF6B35',
    low: '#555555',
};

const PRIORITY_BADGE: Record<TaskPriority, string> = {
    high: 'border-[#FF4444]/40 bg-[#FF4444]/15 text-[#FF4444]',
    medium: 'border-[#FF6B35]/40 bg-[#FF6B35]/15 text-[#FF6B35]',
    low: 'border-zinc-700 bg-zinc-800 text-zinc-400',
};

const CATEGORY_KEYWORDS: Record<TaskCategory, RegExp> = {
    coding: /\b(code|coding|leetcode|dsa|debug|bug|feature|program|react|api|github|deploy)\b/i,
    gym: /\b(gym|workout|lift|cardio|run|push|pull|legs|training)\b/i,
    diet: /\b(diet|meal|protein|calorie|water|food|nutrition|fast)\b/i,
    personal: /\b(read|book|journal|call|family|personal|clean|errand)\b/i,
    work: /\b(work|client|agency|report|deck|presentation|meeting|project)\b/i,
    academics: /\b(study|assignment|exam|college|class|notes|subject|dbms|os|cn|oop)\b/i,
    devotional: /\b(prayer|devotional|meditation)\b/i,
    other: /\b(other|misc)\b/i,
};

const todayISO = (): string => new Date().toISOString().split('T')[0];

const isCompletedStatus = (status: TaskStatus | 'done' | undefined): boolean => status === 'completed' || status === 'done';

const isTodayMission = (task: Task): boolean => task.status === 'today' || task.status === 'in_progress';

const isBacklogMission = (task: Task): boolean => task.status === 'backlog' || task.status === 'this_week';

const isCompletedMission = (task: Task): boolean => task.completed || isCompletedStatus(task.status as TaskStatus | 'done');

const categoryLabel = (category?: string): string => (category ?? 'personal').replace(/_/g, ' ').toUpperCase();

const filterLabel = (filter: MissionFilter): string => FILTERS.find((item) => item.id === filter)?.label ?? 'ALL';

const normalizePriority = (value: unknown): TaskPriority => {
    const priority = String(value ?? '').trim().toLowerCase();
    if (priority === 'high' || priority === 'medium' || priority === 'low') return priority;
    return 'medium';
};

const inferPriority = (text: string): TaskPriority => {
    if (/\b(today|now|urgent|asap|deadline)\b/i.test(text)) return 'high';
    if (/\b(tomorrow|soon|this week)\b/i.test(text)) return 'medium';
    if (/\b(next week|later|eventually|someday)\b/i.test(text)) return 'low';
    return 'medium';
};

const normalizeCategory = (value: unknown, title: string): { category: TaskCategory; displayCategory: string } => {
    const raw = String(value ?? '').trim();
    const lowered = raw.toLowerCase();

    if (lowered === 'agency') {
        return { category: 'work', displayCategory: 'AGENCY' };
    }

    const known = ['coding', 'gym', 'diet', 'personal', 'academics', 'work', 'devotional', 'other'] as TaskCategory[];
    if (known.includes(lowered as TaskCategory)) {
        return { category: lowered as TaskCategory, displayCategory: categoryLabel(lowered) };
    }

    const inferred = known.find((category) => CATEGORY_KEYWORDS[category].test(title)) ?? 'personal';
    return { category: inferred, displayCategory: categoryLabel(inferred) };
};

const cleanMissionTitle = (value: string): string => (
    value
        .replace(/\b(today|now|urgent|asap|deadline|tomorrow|soon|this week|next week|later|eventually|someday)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
);

const missionQuadrant = (priority: TaskPriority) => {
    if (priority === 'high') return 'q1';
    if (priority === 'medium') return 'q2';
    return 'q4';
};

const missionSize = (priority: TaskPriority) => {
    if (priority === 'high') return 'big';
    if (priority === 'medium') return 'medium';
    return 'small';
};

const normalizeParsedMissions = (items: unknown[], sourceText: string): ParsedMission[] => (
    items
        .map((item, index) => {
            const candidate = item as { title?: unknown; priority?: unknown; category?: unknown };
            const rawTitle = String(candidate.title ?? '').trim();
            const title = rawTitle || cleanMissionTitle(sourceText.split(/[,;\n]/)[index] ?? '');
            if (!title) return null;

            const priority = normalizePriority(candidate.priority);
            const category = normalizeCategory(candidate.category, title);
            return {
                id: `${Date.now()}-${index}-${title.slice(0, 8)}`,
                title,
                priority,
                category: category.category,
                displayCategory: category.displayCategory,
                stage: 'today' as const,
                checked: true,
            };
        })
        .filter(Boolean) as ParsedMission[]
);

const parseMissionJson = (raw: string, sourceText: string): ParsedMission[] => {
    const trimmed = raw.trim();
    const start = trimmed.indexOf('[');
    const end = trimmed.lastIndexOf(']');
    const jsonText = start >= 0 && end >= start ? trimmed.slice(start, end + 1) : trimmed;
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) return [];
    return normalizeParsedMissions(parsed, sourceText);
};

const fallbackParseMissions = (sourceText: string): ParsedMission[] => {
    const parts = sourceText
        .split(/(?:,|;|\n|\band\b)+/i)
        .map((part) => part.trim())
        .filter(Boolean);

    return parts.map((part, index) => {
        const priority = inferPriority(part);
        const title = cleanMissionTitle(part) || part;
        const category = normalizeCategory(undefined, title);
        return {
            id: `${Date.now()}-fallback-${index}`,
            title,
            priority,
            category: category.category,
            displayCategory: category.displayCategory,
            stage: 'today',
            checked: true,
        };
    });
};

const requestAnthropicMissionParse = async (sourceText: string): Promise<ParsedMission[]> => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY_MISSING');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5',
            max_tokens: 500,
            system: MISSION_PARSER_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: sourceText }],
        }),
    });

    if (!response.ok) {
        throw new Error('ANTHROPIC_PARSE_FAILED');
    }

    const payload = await response.json();
    const textBlock = Array.isArray(payload.content)
        ? payload.content.find((block: { type?: string; text?: string }) => block.type === 'text')
        : null;

    if (!textBlock?.text) {
        throw new Error('ANTHROPIC_EMPTY_RESPONSE');
    }

    return parseMissionJson(textBlock.text, sourceText);
};

const sortMissions = (a: Task, b: Task): number => {
    const priorityRank: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };
    const statusRank: Record<string, number> = { in_progress: 4, today: 3, this_week: 2, backlog: 1, completed: 0 };
    const statusScore = (statusRank[b.status] ?? 0) - (statusRank[a.status] ?? 0);
    if (statusScore !== 0) return statusScore;
    const priorityScore = (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0);
    if (priorityScore !== 0) return priorityScore;
    return b.updatedAt.localeCompare(a.updatedAt);
};

const EmptyState = ({ icon, title, body }: { icon?: string; title: string; body: string }) => (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-[#141414] px-4 py-6 text-center">
        {icon && <div className="text-2xl">{icon}</div>}
        <h3 className="mt-2 text-sm font-black uppercase tracking-[0.08em] text-white">{title}</h3>
        <p className="mx-auto mt-2 max-w-[260px] text-xs font-semibold leading-5 text-zinc-500">{body}</p>
    </div>
);

interface SmartMissionInputProps {
    isExpanded: boolean;
    text: string;
    preview: ParsedMission[];
    isParsing: boolean;
    isDeploying: boolean;
    isRecording: boolean;
    textAreaRef: React.RefObject<HTMLTextAreaElement>;
    onExpand: () => void;
    onCollapse: () => void;
    onTextChange: (value: string) => void;
    onParse: () => void;
    onDeploy: () => void;
    onMicTap: () => void;
    onManualOpen: () => void;
    onTogglePreview: (id: string) => void;
}

const SmartMissionInput = memo(({
    isExpanded,
    text,
    preview,
    isParsing,
    isDeploying,
    isRecording,
    textAreaRef,
    onExpand,
    onCollapse,
    onTextChange,
    onParse,
    onDeploy,
    onMicTap,
    onManualOpen,
    onTogglePreview,
}: SmartMissionInputProps) => {
    if (!isExpanded) {
        return (
            <motion.button
                type="button"
                layout
                onClick={onExpand}
                className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-[#C8FF00]/45 bg-[#1C1C1C] px-4 text-left shadow-[0_0_26px_rgba(200,255,0,0.08)]"
            >
                <Sparkles className="h-5 w-5 shrink-0 text-[#C8FF00]" />
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-zinc-500">Describe your missions...</span>
                <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                        event.stopPropagation();
                        onMicTap();
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.stopPropagation();
                            onMicTap();
                        }
                    }}
                    className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-zinc-800 bg-[#141414] text-zinc-400 transition-colors',
                        isRecording && 'border-[#FF4444] bg-[#FF4444]/15 text-[#FF4444]',
                    )}
                    aria-label="Start voice input"
                    title="Voice input"
                >
                    <Mic className="h-4 w-4" />
                </span>
            </motion.button>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-[#C8FF00]/45 bg-[#1C1C1C] p-4 shadow-[0_0_30px_rgba(200,255,0,0.08)]"
        >
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#C8FF00]" />
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C8FF00]">SMART TASK INPUT</p>
                </div>
                <button
                    type="button"
                    onClick={onCollapse}
                    aria-label="Collapse smart input"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-800 bg-[#141414] text-zinc-500"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <textarea
                ref={textAreaRef}
                value={text}
                onChange={(event) => onTextChange(event.target.value)}
                placeholder="What do you need to accomplish?"
                rows={4}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-[#141414] px-4 py-3 text-sm font-semibold leading-6 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#C8FF00]/70"
            />

            <div className="mt-3 flex items-center gap-2">
                <button
                    type="button"
                    onClick={onParse}
                    disabled={isParsing}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#C8FF00] px-4 text-[11px] font-black uppercase tracking-[0.16em] text-black disabled:opacity-60"
                >
                    {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    PARSE MISSIONS
                </button>
                <button
                    type="button"
                    onClick={onMicTap}
                    aria-label="Start voice input"
                    className={cn(
                        'grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-zinc-800 bg-[#141414] text-zinc-400',
                        isRecording && 'border-[#FF4444] bg-[#FF4444]/15 text-[#FF4444]',
                    )}
                >
                    <Mic className="h-4 w-4" />
                </button>
            </div>

            <button
                type="button"
                onClick={onManualOpen}
                className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500 underline decoration-zinc-800 underline-offset-4"
            >
                Or tap + for manual entry
            </button>

            <AnimatePresence>
                {preview.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 flex flex-col gap-2">
                            {preview.map((mission, index) => (
                                <motion.button
                                    key={mission.id}
                                    type="button"
                                    onClick={() => onTogglePreview(mission.id)}
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.2 }}
                                    className="flex min-h-12 items-center gap-3 rounded-xl border border-zinc-800 bg-[#141414] px-3 text-left"
                                >
                                    <span
                                        className={cn(
                                            'grid h-5 w-5 shrink-0 place-items-center rounded-md border text-black',
                                            mission.checked
                                                ? 'border-[#C8FF00] bg-[#C8FF00]'
                                                : 'border-zinc-700 bg-transparent text-transparent',
                                        )}
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-sm font-black text-white">{mission.title}</span>
                                    <span className={cn('rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em]', PRIORITY_BADGE[mission.priority])}>
                                        {mission.priority}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={onDeploy}
                            disabled={isDeploying}
                            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C8FF00] text-[11px] font-black uppercase tracking-[0.16em] text-black disabled:opacity-60"
                        >
                            {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                            DEPLOY MISSIONS
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

SmartMissionInput.displayName = 'SmartMissionInput';

interface MissionCardProps {
    task: Task;
    section: MissionSectionType;
    rewardAmount: number | null;
    onStart: (task: Task) => void;
    onDone: (task: Task) => void;
    onMoveToday: (task: Task) => void;
    onOpenDetail: (task: Task) => void;
}

const MissionCard = memo(({ task, section, rewardAmount, onStart, onDone, onMoveToday, onOpenDetail }: MissionCardProps) => {
    const isDone = section === 'completed' || isCompletedMission(task);
    const borderColor = isDone ? '#C8FF00' : PRIORITY_BORDER[task.priority] ?? '#555555';
    const isInProgress = task.status === 'in_progress';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{
                opacity: 1,
                y: 0,
                boxShadow: rewardAmount
                    ? ['0 0 0 rgba(200,255,0,0)', '0 0 24px rgba(200,255,0,0.32)', '0 0 0 rgba(200,255,0,0)']
                    : '0 0 0 rgba(200,255,0,0)',
            }}
            exit={{ opacity: 0, x: 22, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative flex max-h-[72px] min-h-[64px] items-center gap-3 overflow-hidden rounded-xl border border-zinc-800 bg-[#1C1C1C] px-3 py-2"
            style={{ borderLeftColor: borderColor, borderLeftWidth: 4 }}
        >
            <button
                type="button"
                onClick={() => onOpenDetail(task)}
                className={cn(
                    'min-w-0 flex-1 truncate text-left text-sm font-black text-white',
                    isDone && 'text-zinc-500 line-through',
                )}
            >
                {task.title}
            </button>

            <span className="max-w-[86px] shrink-0 truncate rounded-full bg-zinc-800 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-400">
                {categoryLabel(task.category)}
            </span>

            {section === 'today' && (
                <button
                    type="button"
                    onClick={() => (isInProgress ? onDone(task) : onStart(task))}
                    className={cn(
                        'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-[10px] font-black uppercase tracking-[0.1em]',
                        isInProgress
                            ? 'bg-[#C8FF00] text-black'
                            : 'bg-zinc-800 text-zinc-300',
                    )}
                >
                    {isInProgress ? <Check className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                    {isInProgress ? 'DONE' : 'START'}
                </button>
            )}

            {section === 'backlog' && (
                <button
                    type="button"
                    onClick={() => onMoveToday(task)}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-zinc-800 px-3 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-300"
                >
                    <ArrowRight className="h-3.5 w-3.5" />
                    TODAY
                </button>
            )}

            {section === 'completed' && (
                <span className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#22C55E]/15 px-3 text-[10px] font-black uppercase tracking-[0.1em] text-[#22C55E]">
                    <Check className="h-3.5 w-3.5" />
                    DONE
                </span>
            )}

            <AnimatePresence>
                {rewardAmount && (
                    <motion.span
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: -20 }}
                        exit={{ opacity: 0, y: -32 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className={cn(
                            'pointer-events-none absolute right-5 top-2 text-xs font-black uppercase tracking-[0.12em]',
                            task.priority === 'high' ? 'text-[#FF4444]' : 'text-[#C8FF00]',
                        )}
                    >
                        +{rewardAmount} XP
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

MissionCard.displayName = 'MissionCard';

interface MissionSectionProps {
    title: string;
    badgeClassName: string;
    emptyState: React.ReactNode;
    isOpen: boolean;
    tasks: Task[];
    section: MissionSectionType;
    rewardTaskId: string | null;
    rewardAmount: number | null;
    onToggle: () => void;
    onStart: (task: Task) => void;
    onDone: (task: Task) => void;
    onMoveToday: (task: Task) => void;
    onOpenDetail: (task: Task) => void;
    targetId?: string;
}

const MissionSection = memo(({
    title,
    badgeClassName,
    emptyState,
    isOpen,
    tasks,
    section,
    rewardTaskId,
    rewardAmount,
    onToggle,
    onStart,
    onDone,
    onMoveToday,
    onOpenDetail,
    targetId,
}: MissionSectionProps) => (
    <section id={targetId} className="rounded-xl border border-zinc-800 bg-[#141414]">
        <button
            type="button"
            onClick={onToggle}
            className="flex h-14 w-full items-center justify-between gap-3 px-4 text-left"
            aria-expanded={isOpen}
        >
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">{title}</span>
            <span className="flex items-center gap-3">
                <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]', badgeClassName)}>
                    {tasks.length}
                </span>
                <ChevronDown className={cn('h-5 w-5 text-zinc-500 transition-transform', isOpen && 'rotate-180 text-[#C8FF00]')} />
            </span>
        </button>

        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                >
                    <div className="flex flex-col gap-2 border-t border-zinc-800 px-3 py-3">
                        {tasks.length === 0 ? (
                            emptyState
                        ) : (
                            <AnimatePresence>
                                {tasks.map((task) => (
                                    <MissionCard
                                        key={task.id}
                                        task={task}
                                        section={section}
                                        rewardAmount={rewardTaskId === task.id ? rewardAmount : null}
                                        onStart={onStart}
                                        onDone={onDone}
                                        onMoveToday={onMoveToday}
                                        onOpenDetail={onOpenDetail}
                                    />
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </section>
));

MissionSection.displayName = 'MissionSection';

export default function MissionControlPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const webRecognitionRef = useRef<WebSpeechRecognition | null>(null);

    const {
        tasks,
        addTask,
        updateTask,
        updateTaskStage,
        completeTask,
        addXP,
        fetchTasks,
    } = useHabitStore(
        useShallow((state) => ({
            tasks: state.tasks,
            addTask: state.addTask,
            updateTask: state.updateTask,
            updateTaskStage: state.updateTaskStage,
            completeTask: state.completeTask,
            addXP: state.addXP,
            fetchTasks: state.fetchTasks,
        })),
    );

    const [filter, setFilter] = useState<MissionFilter>('all');
    const [isFilterRailOpen, setIsFilterRailOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        today: true,
        backlog: false,
        completed: false,
    });
    const [isSmartInputExpanded, setIsSmartInputExpanded] = useState(false);
    const [smartText, setSmartText] = useState('');
    const [parsedMissions, setParsedMissions] = useState<ParsedMission[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [hasSpeechPermission, setHasSpeechPermission] = useState(false);
    const [isNativeSpeechAvailable, setIsNativeSpeechAvailable] = useState(false);
    const [isManualMissionOpen, setIsManualMissionOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [rewardPulse, setRewardPulse] = useState<{ taskId: string; amount: number } | null>(null);
    const [showTour, setShowTour] = useState(false);

    const { completedTours, markTourComplete } = useAppStore(
        useShallow((state) => ({
            completedTours: state.completedTours,
            markTourComplete: state.markTourComplete,
        })),
    );

    const isNewMissionRoute = location.pathname === '/missions/new';

    useEffect(() => {
        void fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        if (completedTours.includes(MISSIONS_TOUR_KEY)) return undefined;

        const timer = window.setTimeout(() => setShowTour(true), 1000);
        return () => window.clearTimeout(timer);
    }, [completedTours]);

    useEffect(() => {
        if (isSmartInputExpanded) {
            window.requestAnimationFrame(() => textAreaRef.current?.focus());
        }
    }, [isSmartInputExpanded]);

    useEffect(() => {
        let mounted = true;

        const setupSpeech = async () => {
            try {
                const { available } = await SpeechRecognition.available();
                if (!mounted) return;

                setIsNativeSpeechAvailable(available);

                if (available) {
                    const permission = await SpeechRecognition.requestPermissions();
                    if (!mounted) return;
                    setHasSpeechPermission(permission.speechRecognition === 'granted');
                    await SpeechRecognition.addListener('partialResults', (data) => {
                        const transcript = data.matches?.[0] ?? '';
                        setSmartText(transcript);
                        if (transcript) setIsSmartInputExpanded(true);
                    });
                    return;
                }

                const SpeechCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (!SpeechCtor) {
                    setHasSpeechPermission(false);
                    return;
                }

                const recognition: WebSpeechRecognition = new SpeechCtor();
                recognition.lang = 'en-US';
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.onresult = (event) => {
                    let combined = '';
                    for (let index = event.resultIndex; index < event.results.length; index += 1) {
                        combined += event.results[index][0].transcript;
                    }
                    setSmartText(combined.trim());
                    setIsSmartInputExpanded(true);
                };
                webRecognitionRef.current = recognition;
                setHasSpeechPermission(true);
            } catch {
                setHasSpeechPermission(false);
            }
        };

        void setupSpeech();

        return () => {
            mounted = false;
            SpeechRecognition.removeAllListeners();
            webRecognitionRef.current?.stop();
        };
    }, []);

    const filteredTasks = useMemo(
        () => (filter === 'all' ? tasks : tasks.filter((task) => task.category === filter)),
        [filter, tasks],
    );

    const todayTasks = useMemo(
        () => filteredTasks.filter((task) => !isCompletedMission(task) && isTodayMission(task)).sort(sortMissions),
        [filteredTasks],
    );
    const backlogTasks = useMemo(
        () => filteredTasks.filter((task) => !isCompletedMission(task) && isBacklogMission(task)).sort(sortMissions),
        [filteredTasks],
    );
    const completedTasks = useMemo(
        () => filteredTasks.filter(isCompletedMission).sort(sortMissions),
        [filteredTasks],
    );

    const activeCount = useMemo(
        () => tasks.filter((task) => !isCompletedMission(task) && task.status !== 'cancelled').length,
        [tasks],
    );
    const doneCount = useMemo(() => {
        const today = todayISO();
        return tasks.filter((task) => (
            isCompletedMission(task)
            && (!task.completedAt || task.completedAt.startsWith(today) || task.scheduledDate === today)
        )).length;
    }, [tasks]);

    const handleFilterIconTap = useCallback(() => {
        setIsFilterRailOpen((isOpen) => {
            toast.info(isOpen ? 'Category filters collapsed.' : 'Category filters expanded.');
            return !isOpen;
        });
    }, []);

    const handleFilterSelect = useCallback((nextFilter: MissionFilter) => {
        setFilter(nextFilter);
        toast.success(`${filterLabel(nextFilter)} filter active.`);
    }, []);

    const handleSectionToggle = useCallback((section: MissionSectionType) => {
        setExpandedSections((current) => {
            const nextValue = !current[section];
            toast.info(`${section === 'today' ? "TODAY'S MISSIONS" : section.toUpperCase()} ${nextValue ? 'expanded' : 'collapsed'}.`);
            return { ...current, [section]: nextValue };
        });
    }, []);

    const handleSmartExpand = useCallback(() => {
        setIsSmartInputExpanded(true);
        toast.info('Smart task input expanded.');
    }, []);

    const handleSmartCollapse = useCallback(() => {
        setIsSmartInputExpanded(false);
        toast.info('Smart task input collapsed.');
    }, []);

    const handleManualMissionOpen = useCallback(() => {
        setIsManualMissionOpen(true);
        toast.info('Manual mission entry opened.');
    }, []);

    const handleManualMissionClose = useCallback(() => {
        if (isNewMissionRoute) {
            navigate('/tasks', { replace: true });
        }
        setIsManualMissionOpen(false);
    }, [isNewMissionRoute, navigate]);

    const handleManualMissionAdded = useCallback(() => {
        void fetchTasks();
        if (isNewMissionRoute) {
            navigate('/tasks', { replace: true });
        }
        setIsManualMissionOpen(false);
    }, [fetchTasks, isNewMissionRoute, navigate]);

    const handleMicTap = useCallback(async () => {
        setIsSmartInputExpanded(true);

        if (!hasSpeechPermission) {
            toast.error('Speech permission required.');
            return;
        }

        try {
            if (isRecording) {
                if (isNativeSpeechAvailable) {
                    await SpeechRecognition.stop();
                } else {
                    webRecognitionRef.current?.stop();
                }
                setIsRecording(false);
                toast.success('Voice input stopped.');
                return;
            }

            if (isNativeSpeechAvailable) {
                await SpeechRecognition.start({
                    language: 'en-US',
                    maxResults: 1,
                    prompt: 'Say your missions...',
                    partialResults: true,
                    popup: false,
                });
            } else {
                webRecognitionRef.current?.start();
            }
            setIsRecording(true);
            toast.success('Voice input armed.');
        } catch {
            setIsRecording(false);
            toast.error('Voice input failed.');
        }
    }, [hasSpeechPermission, isNativeSpeechAvailable, isRecording]);

    const handleParseMissions = useCallback(async () => {
        const sourceText = smartText.trim();
        if (!sourceText) {
            toast.error('Mission brief required.');
            return;
        }

        setIsParsing(true);
        try {
            let missions: ParsedMission[] = [];
            try {
                missions = await requestAnthropicMissionParse(sourceText);
            } catch {
                missions = fallbackParseMissions(sourceText);
                toast.info('Tactical parser fallback engaged.');
            }

            if (missions.length === 0) {
                toast.error('No missions detected.');
                return;
            }

            setParsedMissions(missions);
            toast.success(`${missions.length} missions parsed. Review payload.`);
        } finally {
            setIsParsing(false);
        }
    }, [smartText]);

    const handleToggleParsedMission = useCallback((id: string) => {
        const mission = parsedMissions.find((item) => item.id === id);
        setParsedMissions((current) => (
            current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
        ));
        if (mission) {
            toast.info(`${mission.checked ? 'Mission held.' : 'Mission armed.'}`);
        }
    }, [parsedMissions]);

    const handleDeployParsedMissions = useCallback(async () => {
        const selectedMissions = parsedMissions.filter((mission) => mission.checked);
        if (selectedMissions.length === 0) {
            toast.error('Select at least one mission.');
            return;
        }

        setIsDeploying(true);
        try {
            const today = todayISO();
            await Promise.all(selectedMissions.map((mission) => addTask({
                title: mission.title,
                description: smartText.trim() || undefined,
                category: mission.category,
                priority: mission.priority,
                status: mission.stage,
                quadrant: missionQuadrant(mission.priority),
                size: missionSize(mission.priority),
                scheduledDate: today,
                isRecurring: false,
                subtasks: [],
            })));
            setParsedMissions([]);
            setSmartText('');
            setIsSmartInputExpanded(false);
            setExpandedSections((current) => ({ ...current, today: true }));
            toast.success(`${selectedMissions.length} missions deployed. Execute.`);
        } catch {
            toast.error('Mission deployment failed.');
        } finally {
            setIsDeploying(false);
        }
    }, [addTask, parsedMissions, smartText]);

    const handleStartMission = useCallback((task: Task) => {
        updateTaskStage(task.id, 'in_progress');
        toast.success('Mission in progress. Execute.');
    }, [updateTaskStage]);

    const handleMoveToday = useCallback((task: Task) => {
        updateTaskStage(task.id, 'today');
        setExpandedSections((current) => ({ ...current, today: true }));
        toast.success('Mission moved to today.');
    }, [updateTaskStage]);

    const handleCompleteMission = useCallback((task: Task) => {
        if (isCompletedMission(task)) {
            toast.info('Mission already complete.');
            return;
        }

        const reward = task.priority === 'high' ? 50 : 25;
        completeTask(task.id);
        updateTask(task.id, { completedAt: new Date().toISOString() });
        if (task.priority === 'high') {
            addXP(25);
        }
        setRewardPulse({ taskId: task.id, amount: reward });
        setExpandedSections((current) => ({ ...current, completed: true }));
        window.setTimeout(() => setRewardPulse(null), 900);
        toast.success(`+${reward} XP. Mission complete.`);
    }, [addXP, completeTask, updateTask]);

    const handleOpenDetail = useCallback((task: Task) => {
        setSelectedTask(task);
        toast.info('Mission detail opened.');
    }, []);

    const handleCloseDetail = useCallback(() => {
        setSelectedTask(null);
    }, []);

    const handleTourComplete = useCallback(() => {
        markTourComplete(MISSIONS_TOUR_KEY);
        setShowTour(false);
    }, [markTourComplete]);

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-[#0A0A0A] text-white">
            {showTour && (
                <GuidedTour
                    steps={MISSIONS_TOUR_STEPS}
                    storageKey={MISSIONS_TOUR_KEY}
                    onComplete={handleTourComplete}
                />
            )}
            <header className="shrink-0 px-5 pb-3 pt-6 pt-safe">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-black uppercase tracking-[0.08em] text-white">MISSION CONTROL</h1>
                        <p className="mt-1 text-xs font-semibold text-zinc-500">
                            {activeCount} active · {doneCount} completed today
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={handleFilterIconTap}
                            aria-label="Toggle category filters"
                            title="Toggle filters"
                            className="grid h-11 w-11 place-items-center rounded-xl border border-zinc-800 bg-[#141414] text-zinc-400 transition-colors active:border-[#C8FF00]/60 active:text-[#C8FF00]"
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleManualMissionOpen}
                            aria-label="Deploy mission manually"
                            title="Add mission"
                            className="grid h-11 w-11 place-items-center rounded-xl bg-[#C8FF00] text-black shadow-[0_0_22px_rgba(200,255,0,0.18)]"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div id="smart-input-bar" className="shrink-0 bg-[#0A0A0A]/95 px-5 pb-4">
                <SmartMissionInput
                    isExpanded={isSmartInputExpanded}
                    text={smartText}
                    preview={parsedMissions}
                    isParsing={isParsing}
                    isDeploying={isDeploying}
                    isRecording={isRecording}
                    textAreaRef={textAreaRef}
                    onExpand={handleSmartExpand}
                    onCollapse={handleSmartCollapse}
                    onTextChange={setSmartText}
                    onParse={handleParseMissions}
                    onDeploy={handleDeployParsedMissions}
                    onMicTap={handleMicTap}
                    onManualOpen={handleManualMissionOpen}
                    onTogglePreview={handleToggleParsedMission}
                />
            </div>

            <main className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-32">
                <AnimatePresence initial={false}>
                    {isFilterRailOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="overflow-hidden"
                        >
                            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-4">
                                {FILTERS.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleFilterSelect(item.id)}
                                        className={cn(
                                            'h-9 shrink-0 rounded-full px-4 text-[10px] font-black uppercase tracking-[0.14em] transition-colors',
                                            filter === item.id
                                                ? 'bg-[#C8FF00] text-black'
                                                : 'border border-zinc-800 bg-[#141414] text-zinc-500',
                                        )}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col gap-3">
                    <MissionSection
                        targetId="today-missions-section"
                        title="TODAY'S MISSIONS"
                        badgeClassName="bg-[#C8FF00] text-black"
                        emptyState={<EmptyState icon="🎯" title="NO ACTIVE MISSIONS" body="Deploy your first mission using the input above." />}
                        isOpen={expandedSections.today}
                        tasks={todayTasks}
                        section="today"
                        rewardTaskId={rewardPulse?.taskId ?? null}
                        rewardAmount={rewardPulse?.amount ?? null}
                        onToggle={() => handleSectionToggle('today')}
                        onStart={handleStartMission}
                        onDone={handleCompleteMission}
                        onMoveToday={handleMoveToday}
                        onOpenDetail={handleOpenDetail}
                    />

                    <MissionSection
                        targetId="backlog-section"
                        title="BACKLOG"
                        badgeClassName="bg-zinc-800 text-zinc-400"
                        emptyState={<EmptyState title="BACKLOG CLEAR" body="All missions accounted for." />}
                        isOpen={expandedSections.backlog}
                        tasks={backlogTasks}
                        section="backlog"
                        rewardTaskId={rewardPulse?.taskId ?? null}
                        rewardAmount={rewardPulse?.amount ?? null}
                        onToggle={() => handleSectionToggle('backlog')}
                        onStart={handleStartMission}
                        onDone={handleCompleteMission}
                        onMoveToday={handleMoveToday}
                        onOpenDetail={handleOpenDetail}
                    />

                    <MissionSection
                        title="COMPLETED"
                        badgeClassName="bg-[#22C55E]/20 text-[#22C55E]"
                        emptyState={<EmptyState title="NO COMPLETED MISSIONS" body="Execute one mission to build the completed log." />}
                        isOpen={expandedSections.completed}
                        tasks={completedTasks}
                        section="completed"
                        rewardTaskId={rewardPulse?.taskId ?? null}
                        rewardAmount={rewardPulse?.amount ?? null}
                        onToggle={() => handleSectionToggle('completed')}
                        onStart={handleStartMission}
                        onDone={handleCompleteMission}
                        onMoveToday={handleMoveToday}
                        onOpenDetail={handleOpenDetail}
                    />
                </div>
            </main>

            <button
                id="mission-fab"
                type="button"
                onClick={handleManualMissionOpen}
                aria-label="Deploy mission manually"
                className="fixed bottom-24 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#C8FF00] text-black shadow-[0_0_28px_rgba(200,255,0,0.28)] active:scale-95"
            >
                <Plus className="h-7 w-7" />
            </button>

            <NewMissionModal
                isOpen={isManualMissionOpen || isNewMissionRoute}
                onClose={handleManualMissionClose}
                onTaskAdded={handleManualMissionAdded}
            />

            <TaskDetailModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={handleCloseDetail}
            />
        </div>
    );
}
