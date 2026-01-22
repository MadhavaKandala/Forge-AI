import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Flame } from 'lucide-react';

interface HeaderProps {
  onCreateChallenge: () => void;
  challengeCount: number;
}

export function Header({ onCreateChallenge, challengeCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-fire flex items-center justify-center shadow-glow">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">100 Days</h1>
              <p className="text-xs text-muted-foreground">Challenge Tracker</p>
            </div>
          </motion.div>

          {challengeCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button 
                onClick={onCreateChallenge}
                className="bg-gradient-fire hover:opacity-90 font-semibold"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Challenge
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
