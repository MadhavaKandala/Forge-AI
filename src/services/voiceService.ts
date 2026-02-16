import { dbService } from '../lib/db';
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

        await dbService.run(
            `INSERT INTO voice_notes (id, audio_url, duration_seconds, raw_transcript, processed_transcript, status, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [fullNote.id, fullNote.audio_url, fullNote.duration_seconds, fullNote.raw_transcript, fullNote.processed_transcript, fullNote.status, fullNote.recorded_at]
        );

        return fullNote;
    },

    async updateVoiceNoteStatus(id: string, status: VoiceNoteStatus): Promise<void> {
        await dbService.run(
            'UPDATE voice_notes SET status = ? WHERE id = ?',
            [status, id]
        );
    },

    async saveExtractedItems(items: Partial<ExtractedItem>[]): Promise<void> {
        for (const item of items) {
            await dbService.run(
                `INSERT INTO extracted_items (id, voice_note_id, type, title, description, category, priority, time_info, duration_minutes, contact_info, program_name, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    item.id || uuidv4(),
                    item.voice_note_id,
                    item.type,
                    item.title,
                    item.description || '',
                    item.category || '',
                    item.priority || 'medium',
                    item.time_info || '',
                    item.duration_minutes || 0,
                    item.contact_info || '',
                    item.program_name || '',
                    item.is_approved ? 1 : 0
                ]
            );
        }
    },

    async getVoiceNotes(): Promise<VoiceNote[]> {
        return await dbService.query('SELECT * FROM voice_notes ORDER BY recorded_at DESC');
    },

    async getExtractedItems(voiceNoteId: string): Promise<ExtractedItem[]> {
        const results = await dbService.query(
            'SELECT * FROM extracted_items WHERE voice_note_id = ?',
            [voiceNoteId]
        );
        return results.map(item => ({
            ...item,
            is_approved: !!item.is_approved
        }));
    },

    async deleteExtractedItem(id: string): Promise<void> {
        await dbService.run('DELETE FROM extracted_items WHERE id = ?', [id]);
    }
};
