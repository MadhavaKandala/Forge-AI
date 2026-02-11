import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumericInputProps {
    value: number;
    goal?: number;
    unit?: string;
    step?: number;
    onChange: (val: number) => void;
}

export const NumericInput = ({ value, goal, unit, step = 1, onChange }: NumericInputProps) => {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onChange(value + step);
            }}
            className="w-12 h-12 rounded-full flex flex-col items-center justify-center border-2 border-zinc-700 bg-[#27272A] text-white hover:border-zinc-600 transition-all font-bold"
        >
            <span className="text-sm leading-none">
                {value}{goal ? <span className="text-zinc-500 text-[10px]">/{goal}</span> : ''}
            </span>
            {unit && <span className="text-[8px] text-zinc-500 leading-none mt-0.5 uppercase">{unit}</span>}
        </button>
    );
};
