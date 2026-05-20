import { useMemo, useState } from 'react';
import { BellRing, CheckCircle2, Clock3, Target, Zap } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface OpsWidgetItem {
    id: string;
    type: 'habit' | 'task';
    title: string;
    time: string;
    category: string;
    completed: boolean;
    sortTime: number;
}

interface OpsWidgetProps {
    items: OpsWidgetItem[];
    onComplete: (item: OpsWidgetItem) => void;
    onOpenOps: () => void;
}

const formatClock = (minutes: number): string => {
    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const suffix = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
};

const isTimedOp = (item: OpsWidgetItem): boolean => item.sortTime >= 0 && item.sortTime < 1440;

export default function OpsWidget({ items, onComplete, onOpenOps }: OpsWidgetProps) {
    const [isArming, setIsArming] = useState(false);
    const completedCount = items.filter((item) => item.completed).length;
    const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    const nextOp = useMemo(
        () => items.find((item) => !item.completed && item.sortTime >= nowMinutes)
            ?? items.find((item) => !item.completed)
            ?? null,
        [items, nowMinutes],
    );

    const urgencyLabel = nextOp && isTimedOp(nextOp)
        ? `${Math.max(nextOp.sortTime - nowMinutes, 0)} MIN TO DEPLOY`
        : 'STANDING BY';

    const armOps = async () => {
        setIsArming(true);
        try {
            const permission = await LocalNotifications.requestPermissions();
            if (permission.display !== 'granted') {
                toast.error('Notification permission denied.');
                return;
            }

            const today = new Date();
            const pendingTimedOps = items.filter((item) => !item.completed && isTimedOp(item) && item.sortTime > nowMinutes);
            if (pendingTimedOps.length === 0) {
                toast.error('No timed ops left to arm today.');
                return;
            }

            await LocalNotifications.cancel({
                notifications: pendingTimedOps.map((item) => ({
                    id: Math.abs(`${item.type}-${item.id}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)),
                })),
            });

            await LocalNotifications.schedule({
                notifications: pendingTimedOps.map((item) => {
                    const at = new Date(today);
                    at.setHours(Math.floor(item.sortTime / 60), item.sortTime % 60, 0, 0);
                    return {
                        id: Math.abs(`${item.type}-${item.id}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)),
                        title: 'FORGE OPS WINDOW',
                        body: `${formatClock(item.sortTime)} - ${item.title}`,
                        schedule: { at },
                        channelId: 'schedule-channel',
                        smallIcon: 'ic_stat_icon_config_sample',
                    };
                }),
            });

            toast.success(`${pendingTimedOps.length} ops armed.`);
        } catch {
            toast.error('Unable to arm ops reminders.');
        } finally {
            setIsArming(false);
        }
    };

    return (
        <section className="mt-6 overflow-hidden rounded-xl border border-[#C8FF00]/30 bg-[#141414]">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 p-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#C8FF00] text-black">
                            <Zap className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8FF00]">OPS WIDGET</p>
                            <h2 className="truncate text-lg font-black uppercase text-white">Next Deployment</h2>
                        </div>
                    </div>
                </div>
                <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#C8FF00 ${progress * 3.6}deg, #2A2A2A 0deg)` }}>
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[#0A0A0A] text-[10px] font-black text-white">{progress}%</div>
                </div>
            </div>

            <div className="p-4">
                {nextOp ? (
                    <button
                        type="button"
                        onClick={() => onComplete(nextOp)}
                        className="flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-[#1C1C1C] p-3 text-left"
                    >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#C8FF00]/30 text-[#C8FF00]">
                            <Target className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-black uppercase text-white">{nextOp.title}</span>
                            <span className="mt-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                                <Clock3 className="h-3 w-3" />
                                {nextOp.time} · {urgencyLabel}
                            </span>
                        </span>
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#C8FF00]" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onOpenOps}
                        className="w-full rounded-lg border border-zinc-800 bg-[#1C1C1C] p-4 text-left text-sm font-black uppercase text-[#C8FF00]"
                    >
                        All ops clear. Deploy a new mission.
                    </button>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => { void armOps(); }}
                        disabled={isArming}
                        className={cn(
                            'flex h-11 items-center justify-center gap-2 rounded-lg bg-[#C8FF00] text-xs font-black uppercase tracking-[0.14em] text-black',
                            isArming && 'opacity-60',
                        )}
                    >
                        <BellRing className="h-4 w-4" />
                        {isArming ? 'ARMING' : 'ARM OPS'}
                    </button>
                    <button
                        type="button"
                        onClick={onOpenOps}
                        className="h-11 rounded-lg border border-zinc-800 bg-[#1C1C1C] text-xs font-black uppercase tracking-[0.14em] text-white"
                    >
                        OPEN OPS
                    </button>
                </div>
            </div>
        </section>
    );
}
