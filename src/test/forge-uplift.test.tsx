import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import DailyBrief from '@/components/DailyBrief';
import CreateProgramModal from '@/components/CreateProgramModal';
import HomePage from '@/pages/HomePage';
import { PROGRAM_TEMPLATES } from '@/lib/programs';
import { useAppStore } from '@/store/useAppStore';
import { useHabitStore } from '@/store/useHabitStore';
import { useProgramStore } from '@/store/useProgramStore';

vi.mock('@/services/widgetBridge', () => ({
    widgetBridge: {
        saveOps: vi.fn().mockResolvedValue(undefined),
        consumeCompletedIds: vi.fn().mockResolvedValue([]),
    },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
});

const resetStores = () => {
    useAppStore.setState({
        isAuthenticated: true,
        user: {
            id: 'test-user',
            email: 'operator@forge.test',
            name: 'Madhava Operator',
            avatar: '',
            totalXP: 120,
        },
        supabaseUserId: 'test-user',
        onboardingComplete: true,
        dailyBriefShown: '2026-01-01',
    });

    useHabitStore.setState({
        user: {
            name: 'Madhava Operator',
            level: 1,
            xp: 120,
            notificationsEnabled: true,
        },
        habits: [
            {
                id: 'habit-1',
                title: 'Code block',
                time: '9:00 AM',
                streak: 9,
                completedDates: [],
                type: 'checkbox',
                category: 'coding',
                history: {},
            },
        ],
        tasks: [
            {
                id: 'mission-1',
                title: 'Solve hardest graph problem',
                category: 'coding',
                priority: 'high',
                status: 'today',
                completed: false,
                size: 'medium',
                quadrant: 'q1',
                isRecurring: false,
                subtasks: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ],
        streakShields: 2,
        lastStreakDate: new Date().toISOString().split('T')[0],
        selectedDate: new Date(),
        moodHistory: [],
        todayMood: null,
        dismissedMotivationDate: null,
    });

    useProgramStore.setState({
        activePrograms: [
            {
                id: 'program-active',
                name: 'LeetCode 75',
                description: 'Placement grind',
                programType: 'leetcode_75',
                totalDays: 75,
                currentDay: 12,
                status: 'active',
                category: 'learning',
                difficulty: 'advanced',
                dailyRequirements: ['Complete 1 LeetCode problem'],
                totalXpPotential: 7500,
                completionPercentage: 16,
                icon: '⚡',
            },
        ],
        completedPrograms: [],
        availablePrograms: PROGRAM_TEMPLATES,
        customPrograms: [],
        enrollments: [],
    });
};

const renderNode = async (node: React.ReactNode) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
        root.render(<>{node}</>);
    });
    return {
        container,
        unmount: async () => {
            await act(async () => root.unmount());
            container.remove();
        },
    };
};

const textContent = () => document.body.textContent ?? '';

const setInputValue = async (placeholder: string, value: string) => {
    const input = document.querySelector<HTMLInputElement>(`input[placeholder="${placeholder}"]`);
    expect(input).toBeTruthy();
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    await act(async () => {
        setter?.call(input, value);
        input!.dispatchEvent(new Event('input', { bubbles: true }));
        input!.dispatchEvent(new Event('change', { bubbles: true }));
    });
};

const clickButton = async (label: string) => {
    const button = Array.from(document.querySelectorAll('button')).find((item) => item.textContent?.trim().includes(label));
    expect(button).toBeTruthy();
    await act(async () => {
        button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
};

describe('Forge uplift smoke checks', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        resetStores();
    });

    it('shows the daily brief with streak, program, and primary mission intel', async () => {
        const view = await renderNode(<DailyBrief />);

        expect(textContent()).toContain('Madhava');
        expect(textContent()).toContain('🔥 9 DAY STREAK');
        expect(textContent()).toContain('LeetCode 75 · Day 12');
        expect(textContent()).toContain('Solve hardest graph problem');

        await view.unmount();
    });

    it('creates a custom program and deploys its requirement into habits', async () => {
        const view = await renderNode(<CreateProgramModal open onOpenChange={vi.fn()} />);

        await setInputValue('Program Name', 'Placement Sprint');
        await setInputValue('Description', 'Custom DSA grind');
        await setInputValue('Requirement title', 'Solve 3 DSA problems');
        await clickButton('CREATE PROGRAM');

        const customProgram = useProgramStore.getState().availablePrograms.find((program) => program.name === 'Placement Sprint');
        expect(customProgram).toBeTruthy();
        expect(customProgram?.isCustom).toBe(true);

        await useProgramStore.getState().enrollInProgram(customProgram!.type, '09:00');
        expect(useHabitStore.getState().habits.some((habit) => habit.title === 'Solve 3 DSA problems')).toBe(true);

        await view.unmount();
    });

    it('renders shield indicators on the home streak display without console errors', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const view = await renderNode(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>,
        );

        expect(document.querySelector('[aria-label="2 streak shields available"]')).toBeTruthy();
        expect(consoleError).not.toHaveBeenCalled();

        await view.unmount();
        consoleError.mockRestore();
    });
});
