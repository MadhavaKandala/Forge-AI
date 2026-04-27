import { Challenge, ChallengeCheckIn } from '../types/challenge';
import { differenceInDays, format, parseISO } from 'date-fns';

export interface ReflectionWhisper {
  type: 'momentum' | 'recovery' | 'milestone' | 'consistency' | 'insight';
  title: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'encouraging';
  icon: string;
}

export interface JourneyMilestone {
  day: number;
  date: string;
  type: 'start' | 'streak' | 'achievement' | 'big_push';
  label: string;
  description: string;
  evidenceCount: number;
  featuredPhoto?: string;
}

export interface ReflectionResult {
  whisper: ReflectionWhisper;
  milestones: JourneyMilestone[];
  summary: {
    totalEvidence: number;
    mostProductiveDay: string;
    averageMood?: string;
    intensityGrowth: number;
  };
}

class ReflectionService {
  /**
   * Generates a narrative "Whisper" and a list of key milestones for a challenge journey.
   */
  generateReflection(challenge: Challenge): ReflectionResult {
    const checkIns = challenge.checkIns.sort((a, b) => 
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );

    const whisper = this.generateWhisper(challenge, checkIns);
    const milestones = this.extractMilestones(challenge, checkIns);
    
    return {
      whisper,
      milestones,
      summary: {
        totalEvidence: checkIns.filter(c => c.evidenceLink || c.evidencePhoto).length,
        mostProductiveDay: this.calculateMostProductiveDay(checkIns),
        intensityGrowth: this.calculateIntensityGrowth(checkIns),
      }
    };
  }

  private generateWhisper(challenge: Challenge, checkIns: ChallengeCheckIn[]): ReflectionWhisper {
    const totalDays = checkIns.length;
    const recentCheckIns = checkIns.slice(-7);
    const hasEvidence = recentCheckIns.some(c => c.notes && c.notes.length > 20);
    
    // Logic for "Zen Master" style insights
    if (totalDays === 1) {
      return {
        type: 'milestone',
        title: 'The First Spark',
        content: "Every legendary journey starts with a single, intentional step. You've struck the match. Now, keep the flame shielded as it grows.",
        sentiment: 'positive',
        icon: '✨'
      };
    }

    if (this.isOnHotStreak(checkIns)) {
      return {
        type: 'momentum',
        title: 'Unstoppable Momentum',
        content: `You've checked in for ${this.getCurrentStreak(checkIns)} days straight. Your rhythm is becoming a second nature. Remember: the hardest part isn't the work, it's the showing up—and you're mastering that.`,
        sentiment: 'positive',
        icon: '🔥'
      };
    }

    if (this.isRecovering(checkIns)) {
      return {
        type: 'recovery',
        title: 'The Grace of Return',
        content: "You missed a beat, but you're back. That's where real growth happens—not in perfection, but in the decision to continue when the path gets narrow.",
        sentiment: 'encouraging',
        icon: '🌱'
      };
    }

    if (hasEvidence) {
       return {
        type: 'insight',
        title: 'Depth Over Distance',
        content: "I've been reading your notes. You're not just checking boxes; you're building depth. Your recent reflections show a growing mastery that simple numbers can't capture.",
        sentiment: 'positive',
        icon: '🧠'
      };
    }

    return {
      type: 'consistency',
      title: 'Steady Progress',
      content: `Day ${totalDays}. You're ${Math.round((totalDays/100)*100)}% through this transformation. The quiet days are the ones that build the loudest results.`,
      sentiment: 'neutral',
      icon: '🛡️'
    };
  }

  private extractMilestones(challenge: Challenge, checkIns: ChallengeCheckIn[]): JourneyMilestone[] {
    const milestones: JourneyMilestone[] = [];
    
    // 1. The Start
    if (checkIns.length > 0) {
      milestones.push({
        day: 1,
        date: format(parseISO(checkIns[0].date), 'MMM d'),
        type: 'start',
        label: 'The Beginning',
        description: 'You committed to this 100-day transformation.',
        evidenceCount: checkIns[0].notes ? 1 : 0
      });
    }

    // 2. Week One
    if (checkIns.length >= 7) {
      milestones.push({
        day: 7,
        date: format(parseISO(checkIns[6].date), 'MMM d'),
        type: 'streak',
        label: 'First Horizon',
        description: 'Seven days of showing up. The habit is taking root.',
        evidenceCount: checkIns.slice(0, 7).filter(c => c.notes).length
      });
    }

    // 3. High Intensity/Big Push (Longest note or photo)
    const bigPush = [...checkIns].sort((a, b) => (b.notes?.length || 0) - (a.notes?.length || 0))[0];
    if (bigPush && checkIns.indexOf(bigPush) > 7) {
        milestones.push({
            day: checkIns.indexOf(bigPush) + 1,
            date: format(parseISO(bigPush.date), 'MMM d'),
            type: 'big_push',
            label: 'Deep Focus',
            description: 'This was one of your most detailed sessions. You went beyond the surface.',
            evidenceCount: 1
        });
    }

    // Add more milestones as needed (21 days, 50 days, etc.)
    return milestones.sort((a, b) => a.day - b.day);
  }

  private isOnHotStreak(checkIns: ChallengeCheckIn[]): boolean {
    return this.getCurrentStreak(checkIns) >= 5;
  }

  private getCurrentStreak(checkIns: ChallengeCheckIn[]): number {
    let streak = 0;
    const today = new Date();
    // Simplified streak logic for mock
    return checkIns.length > 5 ? 7 : checkIns.length;
  }

  private isRecovering(checkIns: ChallengeCheckIn[]): boolean {
      if (checkIns.length < 2) return false;
      const last = parseISO(checkIns[checkIns.length - 1].date);
      const prev = parseISO(checkIns[checkIns.length - 2].date);
      return differenceInDays(last, prev) > 1;
  }

  private calculateMostProductiveDay(checkIns: ChallengeCheckIn[]): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts: Record<string, number> = {};
    checkIns.forEach(c => {
      const day = days[parseISO(c.date).getDay()];
      counts[day] = (counts[day] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
  }

  private calculateIntensityGrowth(checkIns: ChallengeCheckIn[]): number {
    if (checkIns.length < 5) return 0;
    const firstHalf = checkIns.slice(0, Math.floor(checkIns.length / 2));
    const secondHalf = checkIns.slice(Math.floor(checkIns.length / 2));
    
    const avg1 = firstHalf.reduce((acc, c) => acc + (c.notes?.length || 0), 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((acc, c) => acc + (c.notes?.length || 0), 0) / secondHalf.length;
    
    return Math.round(((avg2 - avg1) / (avg1 || 1)) * 100);
  }
}

export const reflectionService = new ReflectionService();
