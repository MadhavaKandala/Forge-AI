import { VoiceNote, ExtractedItem, VoiceNoteStatus } from '../types/voice';
import { v4 as uuidv4 } from 'uuid';

export const voiceService = {
    async saveVoiceNote(note: Partial<VoiceNote>): Promise<VoiceNote> {
        const fullNote: VoiceNote = {
            id: note.id || uuidv4(),
            audio_url: note.audio_url || '',
            duration_seconds: note.duration_seconds || 0,
            raw_transcript: note.raw_transcript || '',
            processed_transcript: note.processed_transcript || '',
            status: note.status || 'new',
            recorded_at: new Date().toISOString()
        };

        return fullNote;
    },

    async updateVoiceNoteStatus(id: string, status: VoiceNoteStatus): Promise<void> {
        console.log(`Updated voice note ${id} status to ${status}`);
    },

    async saveExtractedItems(items: Partial<ExtractedItem>[]): Promise<void> {
        console.log(`Saved ${items.length} extracted items`);
    },

    async getVoiceNotes(): Promise<VoiceNote[]> {
        return [];
    },

    async getExtractedItems(voiceNoteId: string): Promise<ExtractedItem[]> {
        return [];
    },

    async deleteExtractedItem(id: string): Promise<void> {
        console.log(`Deleted extracted item ${id}`);
    }
};
