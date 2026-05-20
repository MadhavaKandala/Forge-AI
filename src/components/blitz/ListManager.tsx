import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { PillButton } from '@/components/ui/PillButton';
import { Input } from '@/components/ui/input';
import { useBlitzStore } from '@/store/useBlitzStore';

const COLORS = [
    '#dfff4f', // Blitz Green
    '#2fb58f', // Teal
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#10b981', // Emerald
    '#06b6d4', // Cyan
];

interface ListManagerProps {
    onClose: () => void;
}

export const ListManager: React.FC<ListManagerProps> = ({ onClose }) => {
    const { lists, addList, updateList, deleteList } = useBlitzStore();
    const [title, setTitle] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSave = async () => {
        if (!title) return;

        if (editingId) {
            await updateList(editingId, { title, color: selectedColor });
            setEditingId(null);
        } else {
            await addList({
                title,
                color: selectedColor,
                initial: title.charAt(0).toUpperCase()
            });
        }
        setTitle('');
        setSelectedColor(COLORS[0]);
        onClose();
    };

    const startEdit = (list: any) => {
        setEditingId(list.id);
        setTitle(list.title);
        setSelectedColor(list.color || COLORS[0]);
    };

    return (
        <div className="space-y-8">
            {/* Create/Edit Form */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-muted-foreground text-sm uppercase tracking-widest">List Title</label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Work, Fitness, Coding..."
                        className="bg-transparent border-[#262626] text-xl h-14"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-muted-foreground text-sm uppercase tracking-widest">Color</label>
                    <div className="flex flex-wrap gap-3">
                        {COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={cn(
                                    "w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center",
                                    selectedColor === color ? "border-white scale-110 shadow-lg" : "border-transparent"
                                )}
                                style={{ backgroundColor: color }}
                            >
                                {selectedColor === color && <Check className="w-5 h-5 text-black" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    {editingId && (
                        <button
                            onClick={() => { setEditingId(null); setTitle(''); }}
                            className="flex-1 py-4 font-bold text-muted-foreground"
                        >
                            Cancel
                        </button>
                    )}
                    <PillButton onClick={handleSave} className="flex-1 py-4">
                        {editingId ? 'UPDATE LIST' : 'CREATE LIST'}
                    </PillButton>
                </div>
            </div>

            {/* List entries */}
            <div className="space-y-3">
                <label className="text-muted-foreground text-sm uppercase tracking-widest">Your Lists</label>
                {lists.length === 0 ? (
                    <p className="text-muted-foreground italic">No lists created yet.</p>
                ) : (
                    lists.map(list => (
                        <div
                            key={list.id}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-bold text-sm"
                                    style={{ backgroundColor: list.color }}
                                >
                                    {list.initial}
                                </div>
                                <span className="text-lg font-medium">{list.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => startEdit(list)} className="text-muted-foreground p-2 px-3 bg-white/5 rounded-xl text-sm font-bold">Edit</button>
                                <button onClick={() => deleteList(list.id)} className="text-destructive p-2 px-3 bg-destructive/10 rounded-xl text-sm font-bold">Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
