import React from 'react';
import { useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { ExtractedItemCard } from './ExtractedItemCard';
import { EditExtractedItemModal } from './EditExtractedItemModal';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft, Check, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const VoiceResultsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { pendingItems, currentNote, confirmItem, removeItem, updateItem, clearState } = useVoiceStore();
    const { addTask } = useTaskStore();
    const { addSchedule } = useScheduleStore();
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    const editingItem = editingItemId ? pendingItems.find(i => i.id === editingItemId) || null : null;

    const handleConfirmItem = async (itemId: string) => {
        const item = pendingItems.find(i => i.id === itemId);
        if (!item) return;

        try {
            if (item.type === 'task') {
                await addTask({
                    user_id: 'default-user',
                    title: item.title,
                    description: item.description || '',
                    category: item.category || item.program_name || 'personal',
                    priority: item.priority || 'medium',
                    status: 'todo',
                    size: 'small',
                    quadrant: 'q4',
                    estimated_minutes: item.duration_minutes || 0,
                    is_recurring: 0,
                    has_subtasks: 0,
                    completed_subtasks: 0,
                    total_subtasks: 0,
                    xp_value: 10,
                    difficulty_multiplier: 1,
                    notes: `Added from voice note: ${currentNote?.id}`
                });
            } else if (item.type === 'event' || item.type === 'reminder') {
                if (addSchedule) {
                    await addSchedule({
                        user_id: 'default-user',
                        schedulable_type: item.type === 'event' ? 'task' : 'habit',
                        schedulable_id: item.id,
                        scheduled_date: new Date().toISOString().split('T')[0],
                        scheduled_time: '12:00',
                        estimated_duration_minutes: item.duration_minutes || 30,
                        buffer_before_minutes: 0,
                        buffer_after_minutes: 0,
                        status: 'scheduled',
                        notification_sent: 0,
                        notification_time_minutes: 10
                    });
                }
            }

            confirmItem(itemId);
            toast.success(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} added!`);
        } catch (error) {
            console.error('Failed to add item:', error);
            toast.error('Failed to add item to your system.');
        }
    };

    const handleConfirmAll = async () => {
        const unapproved = pendingItems.filter(i => !i.is_approved);
        for (const item of unapproved) {
            await handleConfirmItem(item.id);
        }
        toast.success('All items processed!');
    };

    if (pendingItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-zinc-700" />
                </div>
                <div>
                    <h3 className="text-white font-bold">No Items Extracted</h3>
                    <p className="text-zinc-500 text-sm">Nothing was found in your voice note. Try speaking more clearly!</p>
                </div>
                <Button variant="outline" onClick={onBack}>Try Again</Button>
            </div>
        );
    }

    const isSuspicious = currentNote && currentNote.duration_seconds &&
        currentNote.raw_transcript.length < currentNote.duration_seconds * 2;

    return (
        <div className="flex flex-col h-full bg-[#09090b]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-900">
                <Button variant="ghost" size="sm" onClick={onBack} className="text-zinc-400">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">Extractions</span>
                </div>
                <div className="w-12" /> {/* Spacer */}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {isSuspicious && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-black">!</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-red-200">Transcription might be incomplete</p>
                            <p className="text-[10px] text-red-300/70">The text seems too short for a {currentNote.duration_seconds}s recording.</p>
                        </div>
                    </div>
                )}

                {currentNote?.raw_transcript && (
                    <section className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">What I Heard</h3>
                        <p className="text-zinc-200 text-sm italic leading-relaxed">
                            "{currentNote.raw_transcript}"
                        </p>
                    </section>
                )}

                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                            {pendingItems.filter(i => !i.is_approved).length} Extracted Items
                        </h2>
                        {pendingItems.length > 0 && (
                            <Button
                                variant="link"
                                size="sm"
                                onClick={handleConfirmAll}
                                className="text-primary text-xs h-auto p-0"
                                disabled={pendingItems.every(i => i.is_approved)}
                            >
                                Confirm All
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {pendingItems.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                layout
                            >
                                <ExtractedItemCard
                                    item={item}
                                    onConfirm={handleConfirmItem}
                                    onRemove={removeItem}
                                    onEdit={(id) => setEditingItemId(id)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex gap-3">
                <Button
                    variant="outline"
                    className="flex-1 border-zinc-800 text-zinc-400"
                    onClick={() => {
                        clearState();
                        onBack();
                    }}
                >
                    Discard All
                </Button>
                <Button
                    className="flex-1 bg-primary text-black"
                    onClick={() => {
                        toast.success('System updated!');
                        onBack();
                    }}
                >
                    Finish
                </Button>
            </div>

            <EditExtractedItemModal
                item={editingItem}
                isOpen={!!editingItemId}
                onClose={() => setEditingItemId(null)}
                onSave={(id, updates) => updateItem(id, updates)}
            />
        </div>
    );
};
