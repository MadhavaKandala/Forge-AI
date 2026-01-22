import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MOTIVATIONAL_QUOTES } from '@/types/challenge';
import { Quote, Sparkles } from 'lucide-react';

export function QuoteCard() {
  const quote = useMemo(() => {
    const today = new Date().toDateString();
    const index = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return MOTIVATIONAL_QUOTES[index % MOTIVATIONAL_QUOTES.length];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 relative overflow-hidden group"
    >
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Daily Inspiration</span>
        </div>
        
        <Quote className="w-6 h-6 text-primary/20 mb-2" />
        
        <p className="text-base font-medium leading-relaxed">
          {quote.text}
        </p>
        
        <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1">
          <span className="w-4 h-px bg-muted-foreground/30" />
          {quote.author}
        </p>
      </div>
    </motion.div>
  );
}
