import { cn } from '@/lib/utils';
import { ChallengeCategory, CATEGORY_CONFIG } from '@/types/challenge';

interface CategoryBadgeProps {
  category: ChallengeCategory;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function CategoryBadge({ category, size = 'md', showLabel = true, className }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      'bg-muted/80 text-foreground border border-border/50',
      sizeClasses[size],
      className
    )}>
      <span>{config.emoji}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
