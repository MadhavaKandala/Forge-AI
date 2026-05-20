import React, { useState } from 'react';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { VoiceResultsScreen } from '@/components/voice/VoiceResultsScreen';
import { useVoiceStore } from '@/store/useVoiceStore';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceNotePage: React.FC = () => {
    const { currentNote, pendingItems } = useVoiceStore();
    const [view, setView] = useState<'record' | 'results'>('record');

    // Automatically switch to results when note is processed
    React.useEffect(() => {
        if (currentNote && currentNote.status === 'processed' && pendingItems.length > 0) {
            setView('results');
        }
    }, [currentNote, pendingItems]);

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <AnimatePresence mode="wait">
                {view === 'record' ? (
                    <motion.div
                        key="record"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col items-center justify-center min-h-[80vh] px-6"
                    >
                        <VoiceRecorder />

                        <div className="mt-12 text-center space-y-4 max-w-xs">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">Usage Tips</h3>
                            <div className="grid grid-cols-1 gap-3 text-left">
                                <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50 flex gap-3">
                                    <span className="text-primary text-xs font-bold">01</span>
                                    <p className="text-zinc-400 text-xs leading-relaxed">"Add a task to complete LeetCode problem 13 tomorrow"</p>
                                </div>
                                <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50 flex gap-3">
                                    <span className="text-primary text-xs font-bold">02</span>
                                    <p className="text-zinc-400 text-xs leading-relaxed">"Schedule a meeting with client on Friday at 3 PM"</p>
                                </div>
                                <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50 flex gap-3">
                                    <span className="text-primary text-xs font-bold">03</span>
                                    <p className="text-zinc-400 text-xs leading-relaxed">"Remind me to buy groceries this weekend for 30 minutes"</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-screen"
                    >
                        <VoiceResultsScreen onBack={() => setView('record')} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VoiceNotePage;
