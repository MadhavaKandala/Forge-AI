import { useEffect, useRef, useMemo, useState } from 'react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Challenge } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import {
    Book as BookIcon,
    Flame,
    Clock,
    Target,
    Plus,
    ArrowRight,
    TrendingUp,
    Bookmark,
    CheckCircle2,
    Library,
    MoreVertical,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Book } from '@/types/challenge';
import { format } from 'date-fns';

interface ReadingHubProps {
    challenges: Challenge[];
    onNavigateBack?: () => void;
}

export function ReadingHub({ challenges, onNavigateBack }: ReadingHubProps) {
    const { userProfile, updateUserProfile } = useChallenges();
    const containerRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);

    const [addBookOpen, setAddBookOpen] = useState(false);
    const [logSessionOpen, setLogSessionOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    // New book form state
    const [newBook, setNewBook] = useState<Partial<Book>>({
        title: '',
        author: '',
        totalPages: 0,
        currentPage: 0,
        status: 'to-read'
    });

    // Log session form state
    const [sessionPages, setSessionPages] = useState(0);

    // GSAP Animation
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
            );
        }
    }, []);

    const readingStats = useMemo(() => {
        const booksRead = userProfile.reading?.books.filter(b => b.status === 'completed').length || 0;
        const totalPages = userProfile.reading?.books.reduce((sum, b) => sum + b.currentPage, 0) || 0;
        const currentlyReading = userProfile.reading?.books.filter(b => b.status === 'reading') || [];

        return { booksRead, totalPages, currentlyReading };
    }, [userProfile.reading]);

    const handleAddBook = () => {
        if (!newBook.title || !newBook.totalPages) return;

        const book: Book = {
            id: crypto.randomUUID(),
            title: newBook.title,
            author: newBook.author || 'Unknown Author',
            totalPages: Number(newBook.totalPages),
            currentPage: 0,
            status: 'to-read',
            ...newBook
        } as Book;

        updateUserProfile(prev => ({
            ...prev,
            reading: {
                ...prev.reading,
                books: [...prev.reading.books, book]
            }
        }));

        setAddBookOpen(false);
        setNewBook({ title: '', author: '', totalPages: 0, currentPage: 0, status: 'to-read' });
    };

    const handleLogSession = () => {
        if (!selectedBook || !sessionPages) return;

        const updatedBook = {
            ...selectedBook,
            currentPage: Math.min(selectedBook.totalPages, selectedBook.currentPage + Number(sessionPages)),
            status: (selectedBook.currentPage + Number(sessionPages)) >= selectedBook.totalPages ? 'completed' as const : 'reading' as const,
            finishedAt: (selectedBook.currentPage + Number(sessionPages)) >= selectedBook.totalPages ? new Date().toISOString() : undefined,
            startedAt: selectedBook.currentPage === 0 ? new Date().toISOString() : selectedBook.startedAt
        };

        updateUserProfile(prev => ({
            ...prev,
            reading: {
                ...prev.reading,
                books: prev.reading.books.map(b => b.id === selectedBook.id ? updatedBook : b),
                sessions: [
                    ...prev.reading.sessions,
                    {
                        id: crypto.randomUUID(),
                        bookId: selectedBook.id,
                        pagesRead: Number(sessionPages),
                        date: new Date().toISOString()
                    }
                ]
            }
        }));

        setLogSessionOpen(false);
        setSessionPages(0);
        setSelectedBook(null);
    };

    return (
        <div ref={containerRef} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_15px_rgba(196,248,42,0.3)]">
                        <BookIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-heading uppercase tracking-wide">Reading Hub</h1>
                        <p className="text-sm text-muted-foreground font-mono">Track your reading journey</p>
                    </div>
                </div>
                {onNavigateBack && (
                    <Button variant="outline" onClick={onNavigateBack} className="w-full sm:w-auto font-mono text-xs uppercase tracking-wider border-zinc-800 hover:bg-zinc-800 hover:text-primary">
                        ← Back to Challenges
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div ref={statsRef} className="grid grid-cols-3 gap-3 sm:gap-4">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 text-center">
                        <Library className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-primary mb-2" />
                        <p className="text-xl sm:text-2xl font-bold font-heading">{readingStats.booksRead}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase">Books Read</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 text-center">
                        <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-primary mb-2" />
                        <p className="text-xl sm:text-2xl font-bold font-heading">{readingStats.totalPages}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase">Pages Read</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 text-center">
                        <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-primary mb-2" />
                        <p className="text-xl sm:text-2xl font-bold font-heading">{userProfile.reading?.annualGoalBooks || 12}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase">Annual Goal</p>
                    </CardContent>
                </Card>
            </div>

            {/* Currently Reading */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                    <div>
                        <CardTitle className="text-lg font-heading uppercase">Currently Reading</CardTitle>
                        <CardDescription className="font-mono text-xs">Keep up the momentum!</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setAddBookOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold font-mono text-xs">
                        <Plus className="w-4 h-4 mr-1" /> ADD BOOK
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    {readingStats.currentlyReading.length > 0 ? (
                        readingStats.currentlyReading.map(book => (
                            <div key={book.id} className="flex gap-4 p-3 rounded-lg border border-border bg-zinc-900/50 hover:border-primary/30 transition-colors group">
                                <div className="w-16 h-24 bg-zinc-800 rounded shadow-sm flex items-center justify-center shrink-0 border border-zinc-700">
                                    <BookIcon className="w-8 h-8 text-zinc-600 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="font-bold font-heading truncate text-lg">{book.title}</h3>
                                        <p className="text-xs font-mono text-muted-foreground truncate uppercase">{book.author}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-muted-foreground font-mono">
                                            <span>{Math.round((book.currentPage / book.totalPages) * 100)}%</span>
                                            <span>{book.currentPage} / {book.totalPages} PGS</span>
                                        </div>
                                        <Progress value={(book.currentPage / book.totalPages) * 100} className="h-1 bg-zinc-800" indicatorClassName="bg-primary" />
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="self-center shrink-0 ml-2 border-zinc-700 hover:border-primary hover:text-primary"
                                    onClick={() => {
                                        setSelectedBook(book);
                                        setLogSessionOpen(true);
                                    }}
                                >
                                    LOG
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                            <p>NO BOOKS IN PROGRESS.</p>
                            <Button variant="link" onClick={() => setAddBookOpen(true)} className="text-primary">Start reading</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bookshelf */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-heading uppercase">Bookshelf</CardTitle>
                    <CardDescription className="font-mono text-xs">Your reading list</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {userProfile.reading?.books.map(book => (
                            <div key={book.id} className="group relative aspect-[2/3] bg-zinc-800 rounded-lg shadow-none border border-zinc-700 overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 hover:border-primary hover:shadow-[0_4px_20px_rgba(196,248,42,0.1)]">
                                <div className={`absolute inset-0 p-3 flex flex-col justify-between ${book.status === 'completed' ? 'bg-zinc-800' :
                                        book.status === 'reading' ? 'bg-zinc-800' : 'bg-zinc-900'
                                    }`}>
                                    <div className="space-y-1 z-10">
                                        <h4 className="font-heading font-bold text-sm leading-tight line-clamp-3 text-white">{book.title}</h4>
                                        <p className="text-[10px] font-mono text-zinc-400 line-clamp-1 uppercase">{book.author}</p>
                                    </div>
                                    {book.status === 'completed' && (
                                        <Badge variant="secondary" className="self-start text-[10px] bg-primary/20 text-primary border border-primary/20">READ</Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div
                            className="aspect-[2/3] rounded-lg border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors group"
                            onClick={() => setAddBookOpen(true)}
                        >
                            <Plus className="w-8 h-8 text-zinc-600 group-hover:text-primary mb-2 transition-colors" />
                            <span className="text-xs text-muted-foreground font-mono font-medium group-hover:text-primary transition-colors">ADD BOOK</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add Book Dialog */}
            <Dialog open={addBookOpen} onOpenChange={setAddBookOpen}>
                <DialogContent className="bg-card border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="font-heading uppercase">Add New Book</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="font-mono text-xs uppercase text-zinc-400">Title</Label>
                            <Input
                                value={newBook.title}
                                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                placeholder="BOOK TITLE"
                                className="bg-zinc-900 border-zinc-800 focus:border-primary font-heading"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-mono text-xs uppercase text-zinc-400">Author</Label>
                            <Input
                                value={newBook.author}
                                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                                placeholder="AUTHOR NAME"
                                className="bg-zinc-900 border-zinc-800 focus:border-primary font-heading"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-mono text-xs uppercase text-zinc-400">Total Pages</Label>
                                <Input
                                    type="number"
                                    value={newBook.totalPages || ''}
                                    onChange={(e) => setNewBook({ ...newBook, totalPages: Number(e.target.value) })}
                                    className="bg-zinc-900 border-zinc-800 focus:border-primary font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-mono text-xs uppercase text-zinc-400">Status</Label>
                                <Select
                                    value={newBook.status}
                                    onValueChange={(v: any) => setNewBook({ ...newBook, status: v })}
                                >
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800 font-mono text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                        <SelectItem value="to-read" className="focus:bg-zinc-800 focus:text-primary">TO READ</SelectItem>
                                        <SelectItem value="reading" className="focus:bg-zinc-800 focus:text-primary">READING</SelectItem>
                                        <SelectItem value="completed" className="focus:bg-zinc-800 focus:text-primary">COMPLETED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddBookOpen(false)} className="border-zinc-800 hover:bg-zinc-800 hover:text-white font-mono">CANCEL</Button>
                        <Button onClick={handleAddBook} disabled={!newBook.title || !newBook.totalPages} className="bg-primary text-primary-foreground font-bold font-mono">ADD BOOK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Log Session Dialog */}
            <Dialog open={logSessionOpen} onOpenChange={setLogSessionOpen}>
                <DialogContent className="bg-card border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="font-heading uppercase">Log Session</DialogTitle>
                        <DialogDescription className="font-mono text-primary">{selectedBook?.title}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="font-mono text-xs uppercase text-zinc-400">Pages Read Today</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    autoFocus
                                    value={sessionPages || ''}
                                    onChange={(e) => setSessionPages(Number(e.target.value))}
                                    className="bg-zinc-900 border-zinc-800 focus:border-primary font-mono text-lg"
                                />
                                <span className="text-sm text-muted-foreground font-mono">PAGES</span>
                            </div>
                            {selectedBook && (
                                <div className="text-xs text-muted-foreground mt-1 font-mono">
                                    CURRENT: {selectedBook.currentPage} / {selectedBook.totalPages}
                                    {sessionPages > 0 && ` → ${Math.min(selectedBook.totalPages, selectedBook.currentPage + sessionPages)}`}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLogSessionOpen(false)} className="border-zinc-800 hover:bg-zinc-800 hover:text-white font-mono">CANCEL</Button>
                        <Button onClick={handleLogSession} disabled={sessionPages <= 0} className="bg-primary text-primary-foreground font-bold font-mono">LOG SESSION</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
