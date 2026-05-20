import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Challenge } from '@/types/challenge';
import { GlassCard } from '@/components/dashboard/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Image, 
  Link as LinkIcon, 
  MessageSquare, 
  Calendar as CalendarIcon,
  Upload,
  Filter,
  ExternalLink,
  Clock,
  FileText,
  Mic,
  Camera,
  Plus,
} from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

interface ChallengeDetailEvidenceProps {
  challenge: Challenge;
}

// Mock evidence data for demonstration
const MOCK_EVIDENCE = [
  {
    date: '2026-01-20',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
    caption: 'Working on the new React component',
  },
  {
    date: '2026-01-18',
    type: 'link',
    url: 'https://github.com/user/repo/commit/abc123',
    caption: 'Merged PR for authentication feature',
  },
  {
    date: '2026-01-15',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    caption: 'Late night coding session',
  },
];

export function ChallengeDetailEvidence({ challenge }: ChallengeDetailEvidenceProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filterType, setFilterType] = useState<'all' | 'photos' | 'links' | 'notes'>('all');

  // Combine real check-ins with mock evidence for demo
  const allEvidence = useMemo(() => {
    const evidence: Array<{
      id: string;
      date: string;
      type: 'note' | 'link' | 'photo' | 'voice';
      content?: string;
      url?: string;
      caption?: string;
    }> = [];

    // Add real check-ins
    challenge.checkIns.forEach((checkIn) => {
      if (checkIn.notes) {
        evidence.push({
          id: checkIn.id + '-note',
          date: checkIn.date,
          type: 'note',
          content: checkIn.notes,
        });
      }
      if (checkIn.link) {
        evidence.push({
          id: checkIn.id + '-link',
          date: checkIn.date,
          type: 'link',
          url: checkIn.link,
        });
      }
    });

    // Add mock evidence for demo
    MOCK_EVIDENCE.forEach((item, index) => {
      evidence.push({
        id: `mock-${index}`,
        date: item.date,
        type: item.type as 'photo' | 'link',
        url: item.url,
        caption: item.caption,
      });
    });

    // Sort by date descending
    return evidence.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [challenge.checkIns]);

  // Filter evidence
  const filteredEvidence = useMemo(() => {
    return allEvidence.filter((item) => {
      // Type filter
      if (filterType !== 'all') {
        const typeMap = {
          photos: 'photo',
          links: 'link',
          notes: 'note',
        };
        if (item.type !== typeMap[filterType]) return false;
      }

      // Date range filter
      if (dateRange?.from) {
        const itemDate = parseISO(item.date);
        const from = startOfDay(dateRange.from);
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        if (!isWithinInterval(itemDate, { start: from, end: to })) return false;
      }

      return true;
    });
  }, [allEvidence, filterType, dateRange]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Image className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'note': return <MessageSquare className="w-4 h-4" />;
      case 'voice': return <Mic className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filterButtons = [
    { type: 'all' as const, icon: Filter, label: 'All' },
    { type: 'photos' as const, icon: Image, label: 'Photos' },
    { type: 'links' as const, icon: LinkIcon, label: 'Links' },
    { type: 'notes' as const, icon: MessageSquare, label: 'Notes' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters & Upload */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Type Filter */}
          <div className="flex gap-2 flex-wrap">
            {filterButtons.map((btn) => (
              <motion.div key={btn.type} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant={filterType === btn.type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(btn.type)}
                  className={cn(
                    "gap-1.5 rounded-xl transition-all",
                    filterType === btn.type 
                      ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30" 
                      : "glass hover:bg-white/10"
                  )}
                >
                  <btn.icon className="w-4 h-4" />
                  {btn.label}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto gap-2 glass rounded-xl hover:bg-white/10">
                <CalendarIcon className="w-4 h-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd')} - {format(dateRange.to, 'LLL dd')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  'Filter by date'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 glass border-white/10" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
                className="p-3 pointer-events-auto"
              />
              {dateRange && (
                <div className="p-2 border-t border-white/10">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full hover:bg-white/5"
                    onClick={() => setDateRange(undefined)}
                  >
                    Clear filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </GlassCard>

      {/* Retroactive Upload Card */}
      <GlassCard className="border-dashed border-2 border-white/10">
        <div className="text-center py-4">
          <motion.div 
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Upload className="w-7 h-7 text-primary" />
          </motion.div>
          <h3 className="font-semibold mb-1">Add Retroactive Evidence</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Upload photos or add links for past check-ins
          </p>
          <div className="flex gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                className="glass rounded-xl hover:bg-white/10 gap-2"
                onClick={() => toast.success('Feature coming soon')}
              >
                <Camera className="w-4 h-4" />
                Upload Photo
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                className="glass rounded-xl hover:bg-white/10 gap-2"
                onClick={() => toast.success('Feature coming soon')}
              >
                <Plus className="w-4 h-4" />
                Add Link
              </Button>
            </motion.div>
          </div>
        </div>
      </GlassCard>

      {/* Evidence List */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold">Evidence Timeline</h3>
              <p className="text-sm text-muted-foreground">Your check-in history</p>
            </div>
          </div>
          <Badge variant="outline" className="glass">
            {filteredEvidence.length} items
          </Badge>
        </div>

        {filteredEvidence.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">No evidence found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filterType !== 'all' || dateRange 
                ? 'Try adjusting your filters'
                : 'Start adding notes and links to your check-ins'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredEvidence.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-3 p-4 rounded-xl glass border border-white/5 hover:border-white/10 transition-all"
                  whileHover={{ x: 4 }}
                >
                  {/* Type Icon */}
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.type === 'photo' ? 'bg-purple-500/20 text-purple-400' :
                    item.type === 'link' ? 'bg-blue-500/20 text-blue-400' :
                    item.type === 'note' ? 'bg-green-500/20 text-green-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {getTypeIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(parseISO(item.date), 'MMM d, yyyy')}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize glass">
                        {item.type}
                      </Badge>
                    </div>

                    {/* Photo */}
                    {item.type === 'photo' && item.url && (
                      <div className="mt-2">
                        <img 
                          src={item.url} 
                          alt={item.caption || 'Evidence photo'}
                          className="w-full max-w-sm rounded-xl object-cover border border-white/10"
                        />
                        {item.caption && (
                          <p className="text-sm text-muted-foreground mt-2">{item.caption}</p>
                        )}
                      </div>
                    )}

                    {/* Link */}
                    {item.type === 'link' && item.url && (
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline mt-1"
                      >
                        <span className="truncate">{item.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    )}

                    {/* Note */}
                    {item.type === 'note' && item.content && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {item.content}
                      </p>
                    )}

                    {item.caption && item.type !== 'photo' && (
                      <p className="text-sm text-muted-foreground mt-1">{item.caption}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </GlassCard>
    </div>
  );
}
