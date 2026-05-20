import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { VoiceNote, ExtractedItem, VoiceNoteStatus } from '../types/voice';
import { voiceService } from '../services/voiceService';
import { NLPService } from '../services/nlpService';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentStoreUserId, getUserScopedStoreName } from './useAppStore';

interface VoiceState {
    isRecording: boolean;
    isProcessing: boolean;
    currentNote: VoiceNote | null;
    pendingItems: ExtractedItem[];
    liveTranscript: string;

    // Actions
    startRecording: () => void;
    stopRecording: (transcript: string, durationSeconds: number) => Promise<void>;
    setLiveTranscript: (text: string) => void;
    processNote: (noteId: string, transcript: string) => Promise<void>;
    confirmItem: (itemId: string) => void;
    removeItem: (itemId: string) => void;
    updateItem: (itemId: string, updates: Partial<ExtractedItem>) => void;
    clearState: () => void;
    clearAll: () => void;
}

export const useVoiceStore = create<VoiceState>()(
    persist(
        (set, get) => ({
            isRecording: false,
            isProcessing: false,
            currentNote: null,
            pendingItems: [],
            liveTranscript: '',

            startRecording: () => set({
                isRecording: true,
                liveTranscript: '',
                currentNote: null,
                pendingItems: []
            }),

            setLiveTranscript: (text) => set({ liveTranscript: text }),

            stopRecording: async (transcript: string, durationSeconds: number) => {
                set({ isRecording: false, isProcessing: true });

                // Sanity Check: Average speaking speed is 2-3 words per second (~15-20 characters)
                // If transcript is extremely short (< 2 chars per second) and duration > 3s, it's likely a capture error
                const isSuspiciouslyShort = durationSeconds > 3 && transcript.length < durationSeconds * 2;

                if (isSuspiciouslyShort) {
                    console.warn(`Transcription might be incomplete. Duration: ${durationSeconds}s, Text: "${transcript}"`);
                }

                // Save the raw note
                const note = await voiceService.saveVoiceNote({
                    raw_transcript: transcript,
                    duration_seconds: durationSeconds,
                    status: 'processing'
                });

                set({ currentNote: note });

                // Automatically start NLP processing
                await get().processNote(note.id, transcript);
            },

            processNote: async (noteId: string, transcript: string) => {
                try {
                    const result = NLPService.processTranscript(transcript, noteId);

                    // Save items to DB for persistence
                    await voiceService.saveExtractedItems(result.items);

                    // Update note status
                    await voiceService.updateVoiceNoteStatus(noteId, 'processed');

                    set({
                        pendingItems: result.items as ExtractedItem[], // Cast because we added IDs in NLP
                        isProcessing: false,
                        currentNote: {
                            ...get().currentNote!,
                            status: 'processed'
                        }
                    });
                } catch (error) {
                    console.error('NLP Processing failed:', error);
                    set({ isProcessing: false });
                }
            },

            confirmItem: (itemId) => {
                set((state) => ({
                    pendingItems: state.pendingItems.map(item =>
                        item.id === itemId ? { ...item, is_approved: true } : item
                    )
                }));
            },

            removeItem: (itemId) => {
                set((state) => ({
                    pendingItems: state.pendingItems.filter(item => item.id !== itemId)
                }));
            },

            updateItem: (itemId, updates) => {
                set((state) => ({
                    pendingItems: state.pendingItems.map(item =>
                        item.id === itemId ? { ...item, ...updates } : item
                    )
                }));
            },

            clearState: () => set({
                isRecording: false,
                isProcessing: false,
                currentNote: null,
                pendingItems: [],
                liveTranscript: ''
            }),

            clearAll: () => set({
                isRecording: false,
                isProcessing: false,
                currentNote: null,
                pendingItems: [],
                liveTranscript: ''
            })
        }),
        {
            name: getUserScopedStoreName('voice-store', getCurrentStoreUserId()),
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                currentNote: state.currentNote,
                pendingItems: state.pendingItems,
                liveTranscript: state.liveTranscript
            })
        }
    )
);
