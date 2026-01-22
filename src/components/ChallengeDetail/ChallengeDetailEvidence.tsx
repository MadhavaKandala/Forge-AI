import { useState, useMemo } from 'react';
import { Challenge } from '@/types/challenge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

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

  return (
    <div className="space-y-6">
      {/* Filters & Upload */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'photos', 'links', 'notes'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="capitalize"
                >
                  {type === 'all' && <Filter className="w-4 h-4 mr-1" />}
                  {type === 'photos' && <Image className="w-4 h-4 mr-1" />}
                  {type === 'links' && <LinkIcon className="w-4 h-4 mr-1" />}
                  {type === 'notes' && <MessageSquare className="w-4 h-4 mr-1" />}
                  {type}
                </Button>
              ))}
            </div>

            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto gap-2">
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
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  className={cn("p-3 pointer-events-auto")}
                />
                {dateRange && (
                  <div className="p-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setDateRange(undefined)}
                    >
                      Clear filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Retroactive Upload Card */}
      <Card className="border-dashed border-2">
        <CardContent className="p-6 text-center">
          <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-medium mb-1">Add Retroactive Evidence</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload photos or add links for past check-ins
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm">
              <Image className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
            <Button variant="outline" size="sm">
              <LinkIcon className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Evidence List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Evidence Timeline</CardTitle>
            <Badge variant="secondary">
              {filteredEvidence.length} items
            </Badge>
          </div>
          <CardDescription>
            Your check-in history with notes, links, and photos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEvidence.length === 0 ? (
            <div className="text-center py-8">
              <Image className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No evidence found</p>
              <p className="text-sm text-muted-foreground">
                {filterType !== 'all' || dateRange 
                  ? 'Try adjusting your filters'
                  : 'Start adding notes and links to your check-ins'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {filteredEvidence.map((item) => (
                  <div 
                    key={item.id}
                    className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    {/* Type Icon */}
                    <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.type === 'photo' ? 'bg-purple-500/10 text-purple-500' :
                      item.type === 'link' ? 'bg-blue-500/10 text-blue-500' :
                      item.type === 'note' ? 'bg-green-500/10 text-green-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {getTypeIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(item.date), 'MMM d, yyyy')}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.type}
                        </Badge>
                      </div>

                      {/* Photo */}
                      {item.type === 'photo' && item.url && (
                        <div className="mt-2">
                          <img 
                            src={item.url} 
                            alt={item.caption || 'Evidence photo'}
                            className="w-full max-w-sm rounded-lg object-cover"
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
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
