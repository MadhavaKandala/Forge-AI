import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VoiceResultsScreen } from '../components/voice/VoiceResultsScreen';

vi.mock('@/store/useVoiceStore', () => ({
    useVoiceStore: () => ({
        pendingItems: [
            { id: '1', title: 'Task 1', type: 'task', is_approved: false },
            { id: '2', title: 'Task 2', type: 'task', is_approved: false }
        ],
        currentNote: null,
        confirmItem: vi.fn(),
        removeItem: vi.fn(),
        updateItem: vi.fn(),
        clearState: vi.fn()
    })
}));

vi.mock('@/store/useTaskStore', () => ({
    useTaskStore: () => ({ addTask: vi.fn() })
}));

vi.mock('@/store/useScheduleStore', () => ({
    useScheduleStore: () => ({ addSchedule: vi.fn() })
}));

describe('VoiceResultsScreen', () => {
    it('renders without crashing and triggers Confirm All', async () => {
        const onBack = vi.fn();
        render(<VoiceResultsScreen onBack={onBack} />);

        expect(screen.getByText('2 Extracted Items')).toBeInTheDocument();

        const confirmAllButton = screen.getByText('Confirm All');
        await act(async () => {
            fireEvent.click(confirmAllButton);
        });

        // At this point we know the updated code runs without throwing.
    });
});
