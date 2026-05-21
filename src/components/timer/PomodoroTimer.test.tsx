import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PomodoroTimer } from './PomodoroTimer';

describe('PomodoroTimer', () => {
    const defaultProps = {
        timeLeft: 1500, // 25 minutes
        totalTime: 1500,
        isActive: false,
        onToggle: vi.fn(),
        onReset: vi.fn(),
        onSkip: vi.fn(),
        mode: 'work' as const,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders default state correctly', () => {
        render(<PomodoroTimer {...defaultProps} />);

        expect(screen.getByText('Focus Time')).toBeInTheDocument();
        expect(screen.getByText('25:00')).toBeInTheDocument();
    });

    it('calls onToggle when play button is clicked', () => {
        render(<PomodoroTimer {...defaultProps} />);
        const toggleButton = screen.getAllByRole('button')[0];
        fireEvent.click(toggleButton);
        expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
    });

    it('shows pause button when isActive is true and calls onToggle when clicked', () => {
        render(<PomodoroTimer {...defaultProps} isActive={true} />);
        const toggleButton = screen.getAllByRole('button')[0];
        fireEvent.click(toggleButton);
        expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
    });

    it('shows reset button when isActive is true and calls onReset when clicked', () => {
        render(<PomodoroTimer {...defaultProps} isActive={true} />);
        // Reset button is the second button
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(2);

        const resetButton = buttons[1];
        fireEvent.click(resetButton);
        expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
    });

    it('shows skip button when onSkip is provided, not active, and timeLeft !== totalTime', () => {
        render(<PomodoroTimer {...defaultProps} timeLeft={1400} />);
        // Toggle, Skip buttons should be rendered
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(2);

        const skipButton = buttons[buttons.length - 1]; // last button
        fireEvent.click(skipButton);
        expect(defaultProps.onSkip).toHaveBeenCalledTimes(1);
    });

    it('renders short_break mode correctly', () => {
        render(<PomodoroTimer {...defaultProps} mode="short_break" timeLeft={300} totalTime={300} />);
        expect(screen.getByText('Short Break')).toBeInTheDocument();
        expect(screen.getByText('05:00')).toBeInTheDocument();
    });

    it('renders long_break mode correctly', () => {
        render(<PomodoroTimer {...defaultProps} mode="long_break" timeLeft={900} totalTime={900} />);
        expect(screen.getByText('Long Break')).toBeInTheDocument();
        expect(screen.getByText('15:00')).toBeInTheDocument();
    });
});
