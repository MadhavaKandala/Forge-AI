import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AddTaskModal } from '@/components/habit-tracker/AddTaskModal';

interface NewMissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskAdded?: () => void;
}

export const NewMissionModal: React.FC<NewMissionModalProps> = ({ isOpen, onClose, onTaskAdded }) => {
    const [searchParams] = useSearchParams();
    const prefillTitle = searchParams.get('title') ?? '';

    return (
        <AddTaskModal
            isOpen={isOpen}
            onClose={onClose}
            onTaskAdded={onTaskAdded}
            initialTitle={prefillTitle}
        />
    );
};
