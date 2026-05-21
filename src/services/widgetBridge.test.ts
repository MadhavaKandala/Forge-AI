import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Capacitor } from '@capacitor/core';
import { widgetBridge } from './widgetBridge';

const { mockSaveOps, mockGetCompletedIds, mockClearCompletedIds } = vi.hoisted(() => ({
    mockSaveOps: vi.fn(),
    mockGetCompletedIds: vi.fn(),
    mockClearCompletedIds: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
    Capacitor: {
        isNativePlatform: vi.fn(),
    },
    registerPlugin: vi.fn(() => ({
        saveOps: mockSaveOps,
        getCompletedIds: mockGetCompletedIds,
        clearCompletedIds: mockClearCompletedIds,
    })),
}));

describe('widgetBridge', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('saveOps', () => {
        it('should return early if not on native platform', async () => {
            vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

            await widgetBridge.saveOps([], 'steady');

            expect(mockSaveOps).not.toHaveBeenCalled();
        });

        it('should slice ops to a maximum of 6 items', async () => {
            vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

            const ops: any[] = Array.from({ length: 10 }, (_, i) => ({
                id: `id-${i}`,
                title: `Task ${i}`,
                completed: false,
            }));

            await widgetBridge.saveOps(ops, 'strong');

            expect(mockSaveOps).toHaveBeenCalledTimes(1);
            const callArgs = mockSaveOps.mock.calls[0][0];
            expect(callArgs.ops).toHaveLength(6);
            expect(callArgs.ops[5].id).toBe('id-5');
            expect(callArgs.status).toBe('strong');
        });

        it('should truncate titles longer than 28 characters to 25 chars + "..."', async () => {
            vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

            const longTitle = 'This is a very long title that exceeds the 28 character limit';
            const shortTitle = 'Short title';

            const ops: any[] = [
                { id: '1', title: longTitle, completed: false },
                { id: '2', title: shortTitle, completed: false },
            ];

            await widgetBridge.saveOps(ops, 'low');

            expect(mockSaveOps).toHaveBeenCalledTimes(1);
            const callArgs = mockSaveOps.mock.calls[0][0];
            expect(callArgs.ops[0].title).toBe('This is a very long title...');
            expect(callArgs.ops[1].title).toBe(shortTitle);
            expect(callArgs.status).toBe('low');
        });

        it('should pass exactly 28 characters without truncating', async () => {
            vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

            const exactly28Chars = '1234567890123456789012345678';

            const ops: any[] = [
                { id: '1', title: exactly28Chars, completed: false },
            ];

            await widgetBridge.saveOps(ops, 'steady');

            expect(mockSaveOps).toHaveBeenCalledTimes(1);
            const callArgs = mockSaveOps.mock.calls[0][0];
            expect(callArgs.ops[0].title).toBe(exactly28Chars);
        });
    });
});
