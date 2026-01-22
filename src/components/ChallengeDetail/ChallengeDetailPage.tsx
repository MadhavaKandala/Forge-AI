import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Challenge, CATEGORY_CONFIG } from '@/types/challenge';
import { useChallenges } from '@/hooks/useChallenges';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ProgressRing } from '@/components/ProgressRing';
import { GlassCard } from '@/components/dashboard/GlassCard';
import { ChallengeDetailToday } from './ChallengeDetailToday';
import { ChallengeDetailProgress } from './ChallengeDetailProgress';
import { ChallengeDetailEvidence } from './ChallengeDetailEvidence';
import { ChallengeDetailInsights } from './ChallengeDetailInsights';
import { ChallengeDetailCommunity } from './ChallengeDetailCommunity';
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  Image, 
  BarChart3, 
  Users,
  Flame,
  Target,
  Clock,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

interface ChallengeDetailPageProps {
  challenge: Challenge;
  onBack: () => void;
  onCheckIn: (notes?: string, link?: string) => void;
}

export function ChallengeDetailPage({ challenge, onBack, onCheckIn }: ChallengeDetailPageProps) {
  const [activeTab, setActiveTab] = useState('today');
  const { getStreak, getBestStreak, getProgress, hasCheckedInToday, getDaysRemaining } = useChallenges();
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const streak = getStreak(challenge);
  const bestStreak = getBestStreak(challenge);
  const progress = getProgress(challenge);
  const checkedIn = hasCheckedInToday(challenge.id);
  const daysRemaining = getDaysRemaining(challenge);
  const categoryConfig = CATEGORY_CONFIG[challenge.category];

  // GSAP entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, []);

  const tabs = [
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'evidence', label: 'Evidence', icon: Image },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'community', label: 'Community', icon: Users },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background-deep">
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[100px]"
          style={{ background: `hsl(var(--category-${challenge.category === 'coding' ? 'code' : challenge.category}))` }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-[80px]"
          style={{ background: 'hsl(var(--secondary))' }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 glass-nav border-b border-white/5">
        <div ref={headerRef} className="container max-w-4xl mx-auto px-4 py-4">
          {/* Back button & Category */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack} 
              className="gap-2 hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <CategoryBadge category={challenge.category} />
          </div>

          {/* Challenge Title & Quick Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Progress Ring */}
            <motion.div 
              className="shrink-0 hidden sm:block"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <div className="relative">
                <ProgressRing progress={progress} size={80} strokeWidth={6}>
                  <span className="text-lg font-bold">{progress}%</span>
                </ProgressRing>
                {progress >= 50 && (
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-primary animate-pulse" />
                )}
              </div>
            </motion.div>

            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <motion.span 
                  className="text-2xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {categoryConfig.emoji}
                </motion.span>
                <h1 className="text-xl sm:text-2xl font-display font-bold truncate text-gradient-flame">
                  {challenge.name}
                </h1>
              </div>
              {challenge.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {challenge.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Started {format(new Date(challenge.startDate), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {daysRemaining} days left
                </span>
              </div>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <motion.div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-primary text-sm font-medium shadow-glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Flame className="w-4 h-4" />
                <span>{streak} streak</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-secondary text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Target className="w-4 h-4" />
                <span>Day {challenge.checkIns.length}/100</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="container max-w-4xl mx-auto px-4 py-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tab List */}
          <TabsList className="hidden sm:grid w-full grid-cols-5 h-14 glass p-1.5 rounded-2xl">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white/10 data-[state=active]:shadow-lg data-[state=active]:text-foreground transition-all duration-300"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Mobile Tab List */}
          <div className="sm:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide">
            <TabsList className="inline-flex w-auto h-12 p-1.5 glass rounded-2xl">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="flex items-center gap-1.5 px-4 rounded-xl data-[state=active]:bg-white/10 data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Contents with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="today" className="mt-0">
                <ChallengeDetailToday 
                  challenge={challenge}
                  streak={streak}
                  bestStreak={bestStreak}
                  progress={progress}
                  checkedIn={checkedIn}
                  onCheckIn={onCheckIn}
                />
              </TabsContent>

              <TabsContent value="progress" className="mt-0">
                <ChallengeDetailProgress challenge={challenge} />
              </TabsContent>

              <TabsContent value="evidence" className="mt-0">
                <ChallengeDetailEvidence challenge={challenge} />
              </TabsContent>

              <TabsContent value="insights" className="mt-0">
                <ChallengeDetailInsights challenge={challenge} />
              </TabsContent>

              <TabsContent value="community" className="mt-0">
                <ChallengeDetailCommunity challenge={challenge} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
