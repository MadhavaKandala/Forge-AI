import { describe, it, expect } from 'vitest';
import { timerService } from '../services/timerService';

describe('timerService', () => {
    describe('startSession', () => {
        it('should return a valid UUID', async () => {
            const taskId = 'test-task';
            const habitId = 'test-habit';
            const type = 'work';
            const duration = 25;

            const sessionId = await timerService.startSession(taskId, habitId, type, duration);

            // UUID v4 regex
            const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

            expect(sessionId).toMatch(uuidV4Regex);
        });
    });
});
