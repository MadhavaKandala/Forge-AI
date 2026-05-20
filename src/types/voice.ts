export type VoiceNoteStatus = 'new' | 'processing' | 'processed' | 'confirmed';

export interface VoiceNote {
    id: string;
    audio_url?: string;
    duration_seconds?: number;
    raw_transcript: string;
    processed_transcript?: string;
    status: VoiceNoteStatus;
    recorded_at: string;
}

export type ExtractedItemType = 'task' | 'event' | 'reminder';

export interface ExtractedItem {
    id: string;
    voice_note_id: string;
    type: ExtractedItemType;
    title: string;
    description?: string;

    // Extracted details
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    time_info?: string;
    duration_minutes?: number;
    contact_info?: string;
    program_name?: string;

    // Status
    is_approved: boolean;

    created_at: string;
}

export interface NLPProcessingResult {
    transcript: string;
    items: Partial<ExtractedItem>[];
    summary: {
        total_items: number;
        tasks: number;
        events: number;
        reminders: number;
    };
}
