import React from 'react';
import {
    CheckCircle2,
    Trash2,
    Calendar,
    Clock,
    User,
    Tag,
    Circle,
    AlertCircle
} from 'lucide-react';
import { ExtractedItem } from '@/types/voice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExtractedItemCardProps {
    item: ExtractedItem;
    onConfirm: (id: string) => void;
    onRemove: (id: string) => void;
    onEdit: (id: string) => void;
}

export const ExtractedItemCard: React.FC<ExtractedItemCardProps> = ({
    item,
    onConfirm,
    onRemove,
    onEdit
}) => {
    const isApproved = item.is_approved;

    const getTypeIcon = () => {
        switch (item.type) {
            case 'task': return <CheckCircle2 className="w-5 h-5 text-blue-400" />;
            case 'event': return <Calendar className="w-5 h-5 text-purple-400" />;
            case 'reminder': return <Clock className="w-5 h-5 text-orange-400" />;
        }
    };

    const getPriorityColor = () => {
        switch (item.priority) {
            case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    };

    return (
        <div className={cn(
            "group relative bg-zinc-900/40 rounded-2xl border transition-all duration-300 overflow-hidden",
            isApproved ? "border-primary/30 opacity-60" : "border-zinc-800 hover:border-zinc-700"
        )}>
            {isApproved && (
                <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-primary text-black">Added</Badge>
                </div>
            )}

            <div className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="mt-1">{getTypeIcon()}</div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate group-hover:text-primary transition-colors">
                            {item.title}
                        </h3>
                        {item.description && (
                            <p className="text-zinc-500 text-xs mt-1 line-clamp-2 italic">
                                {item.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {item.time_info && (
                        <Badge variant="outline" className="text-[10px] border-zinc-800 bg-zinc-900/60 text-zinc-400 gap-1 capitalize">
                            <Clock className="w-3 h-3" />
                            {item.time_info}
                        </Badge>
                    )}
                    {item.duration_minutes && (
                        <Badge variant="outline" className="text-[10px] border-zinc-800 bg-zinc-900/60 text-zinc-400 gap-1">
                            <Tag className="w-3 h-3" />
                            {item.duration_minutes}m
                        </Badge>
                    )}
                    {item.contact_info && (
                        <Badge variant="outline" className="text-[10px] border-zinc-800 bg-zinc-900/60 text-zinc-400 gap-1 capitalize">
                            <User className="w-3 h-3" />
                            {item.contact_info}
                        </Badge>
                    )}
                    {item.program_name && (
                        <Badge variant="outline" className="text-[10px] border-zinc-800 bg-zinc-900/60 text-primary gap-1 capitalize">
                            <Circle className="w-2 h-2 fill-primary" />
                            {item.program_name}
                        </Badge>
                    )}
                    {item.priority && (
                        <Badge variant="outline" className={cn("text-[10px] gap-1 capitalize", getPriorityColor())}>
                            <AlertCircle className="w-3 h-3" />
                            {item.priority}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(item.id)}
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        {!isApproved && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(item.id)}
                                    className="h-8 text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => onConfirm(item.id)}
                                    className="h-8 text-xs bg-primary text-black hover:bg-primary/90"
                                >
                                    Confirm
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
