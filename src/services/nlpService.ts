import { ExtractedItemType, NLPProcessingResult, ExtractedItem } from '../types/voice';
import { v4 as uuidv4 } from 'uuid';

export class NLPService {
    private static taskKeywords = [
        'complete', 'finish', 'do', 'make', 'buy', 'call',
        'read', 'study', 'review', 'write', 'send', 'fix',
        'need to', 'should', 'have to', 'must', 'gotta', 'add a task',
        'i want to', 'i need to', 'please add', 'set a task', 'create a task'
    ];

    private static eventKeywords = [
        'meeting', 'appointment', 'class', 'event',
        'reservation', 'flight', 'dinner', 'dance class',
        'schedule', 'plan to meet', 'set up a meeting',
        'calendar', 'on my schedule'
    ];

    private static reminderKeywords = [
        'remind', 'remember', 'don\'t forget', 'alert',
        'flag', 'heads up', 'note this', 'remind me to'
    ];

    static processTranscript(transcript: string, voiceNoteId: string): NLPProcessingResult {
        const items: Partial<ExtractedItem>[] = [];
        const cleanTranscript = transcript.trim();

        if (!cleanTranscript) {
            return {
                transcript: '',
                items: [],
                summary: { total_items: 0, tasks: 0, events: 0, reminders: 0 }
            };
        }

        // Advanced splitting: Split by punctuation OR transition phrases
        // Phrases like "and then", "next I need to", "also", "another mission is"
        const segments = cleanTranscript.split(/[,;\.]|(?:\s+and\s+then\s+)|(?:\s+next\s+)|(?:\s+also\s+)|(?:\s+another\s+)/i);

        segments.forEach(segment => {
            let trimmed = segment.trim();

            // Further sub-split if we see repeated "I need to" or "Remind me" within one segment
            const subSegments = trimmed.split(/(?=i need to|remind me|next|add a task|mission:|another)/i);

            subSegments.forEach(sub => {
                const finalSub = sub.trim();
                if (!finalSub || finalSub.length < 2) return;

                const intent = this.detectIntent(finalSub);
                const extracted = this.extractEntities(finalSub, intent, voiceNoteId);
                items.push(extracted);
            });
        });

        // FALLBACK: If no items were extracted but transcript exists, treat whole thing as one task
        if (items.length === 0 && cleanTranscript.length > 5) {
            items.push(this.extractEntities(cleanTranscript, 'task', voiceNoteId));
        }

        return {
            transcript: cleanTranscript,
            items,
            summary: {
                total_items: items.length,
                tasks: items.filter(i => i.type === 'task').length,
                events: items.filter(i => i.type === 'event').length,
                reminders: items.filter(i => i.type === 'reminder').length
            }
        };
    }

    private static detectIntent(segment: string): ExtractedItemType {
        const lower = segment.toLowerCase();

        if (this.eventKeywords.some(k => lower.includes(k))) return 'event';
        if (this.reminderKeywords.some(k => lower.includes(k))) return 'reminder';

        return 'task'; // Default to task
    }

    private static extractEntities(segment: string, type: ExtractedItemType, voiceNoteId: string): Partial<ExtractedItem> {
        const lower = segment.toLowerCase();
        let isMission = lower.includes('mission');

        // 1. Extract Title (clean up prefixes) - More robust cleaning
        let title = segment.replace(/^(?:i want to|i need to|i should|you should|please add|add a task to|remind me to|schedule a|can you|please|could you|mission:|mission is to|next)\s+/gi, '').trim();

        // Final cleaning of common filler words at the start
        title = title.replace(/^(?:and|also|then|moreover|well|so)\s+/gi, '').trim();

        if (!title) title = segment; // Fallback to raw segment if cleaning removed everything
        title = title.charAt(0).toUpperCase() + title.slice(1);

        // 2. Extract Duration
        const durationMatch = lower.match(/(?:for\s+)?(\d+)\s*(hour|minute|min|hr|h|m)s?/i);
        let durationMinutes: number | undefined;
        if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();
            durationMinutes = (unit.startsWith('h')) ? value * 60 : value;
        }

        // 3. Extract Time Info
        const timeMatch = segment.match(/(?:at|on|this|next|tomorrow|today|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+([^,.;]+)/i);
        const timeInfo = timeMatch ? timeMatch[0].trim() : undefined;

        // 4. Extract Contact
        const contactMatch = lower.match(/(?:call|email|text|message|contact|reach out to)\s+([a-z]+)/i);
        const contactInfo = contactMatch ? contactMatch[1] : undefined;

        // 5. Detect Priority
        let priority: 'low' | 'medium' | 'high' = 'medium';
        if (isMission || lower.includes('urgent') || lower.includes('asap') || lower.includes('important') || lower.includes('critical')) {
            priority = 'high';
        } else if (lower.includes('someday') || lower.includes('low priority') || lower.includes('whenever')) {
            priority = 'low';
        }

        // 6. Program Linking
        const programs = ['leetcode', 'coding', 'gym', 'fitness', 'reading', 'gita', 'diet', 'meditation'];
        const programName = programs.find(p => lower.includes(p));

        return {
            id: uuidv4(),
            voice_note_id: voiceNoteId,
            type,
            title,
            duration_minutes: durationMinutes,
            time_info: timeInfo,
            contact_info: contactInfo,
            priority,
            program_name: programName,
            is_approved: false
        };
    }
}
