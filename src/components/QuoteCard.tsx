import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MOTIVATIONAL_QUOTES } from '@/types/challenge';
import { Quote } from 'lucide-react';

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
      className="relative p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted border border-border/50 overflow-hidden"
    >
      <Quote className="absolute top-4 right-4 w-8 h-8 text-muted-foreground/20" />
      <p className="text-lg font-medium leading-relaxed relative z-10">
        "{quote.text}"
      </p>
      <p className="text-sm text-muted-foreground mt-3">— {quote.author}</p>
    </motion.div>
  );
}
