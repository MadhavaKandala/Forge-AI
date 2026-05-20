import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumericInputProps {
    value: number;
    unit?: string;
    step?: number;
    onChange: (val: number) => void;
}

export const NumericInput = ({ value, unit, step = 1, onChange }: NumericInputProps) => {
    return (
        <div className="flex items-center gap-3 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <button
                onClick={(e) => { e.stopPropagation(); onChange(Math.max(0, value - step)); }}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
            >
                <Minus className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center w-16">
                <span className="text-white font-bold text-lg leading-none">{value}</span>
                {unit && <span className="text-[10px] text-zinc-500 font-medium uppercase">{unit}</span>}
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onChange(value + step); }}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
};
