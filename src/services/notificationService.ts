import { Challenge } from '@/types/challenge';

export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  streakWarningsEnabled: boolean;
  milestoneAlertsEnabled: boolean;
  burnoutDetectionEnabled: boolean;
  weeklyRecapEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export type NotificationType = 
  | 'daily_reminder'
  | 'streak_warning_6h'
  | 'streak_warning_1h'
  | 'milestone'
  | 'burnout'
  | 'weekly_recap'
  | 're_engagement';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }

  isGranted(): boolean {
    return this.permission === 'granted';
  }

  private isInQuietHours(settings: NotificationSettings): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = settings.quietHoursEnd.split(':').map(Number);
    
    const quietStart = startHour * 60 + startMin;
    const quietEnd = endHour * 60 + endMin;
    
    if (quietStart <= quietEnd) {
      return currentTime >= quietStart && currentTime <= quietEnd;
    } else {
      // Quiet hours span midnight
      return currentTime >= quietStart || currentTime <= quietEnd;
    }
  }

  async send(payload: NotificationPayload, settings?: NotificationSettings): Promise<boolean> {
    if (!this.isGranted()) {
      console.warn('Notification permission not granted');
      return false;
    }

    if (settings && this.isInQuietHours(settings)) {
      console.log('Notification blocked: quiet hours');
      return false;
    }

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192.png',
        badge: payload.badge || '/icons/icon-192.png',
        tag: payload.tag || payload.type,
        data: payload.data,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  // Daily reminder notification
  sendDailyReminder(challenges: Challenge[], streak: number): Promise<boolean> {
    const pendingCount = challenges.filter(c => c.status === 'active').length;
    
    return this.send({
      type: 'daily_reminder',
      title: '🔥 Time to check in!',
      body: pendingCount === 1 
        ? `Your ${streak}-day streak is waiting! Just one check-in today.`
        : `${pendingCount} challenges need your attention. Keep that ${streak}-day streak going!`,
      tag: 'daily-reminder',
    });
  }

  // Streak warning (6 hours left)
  sendStreakWarning6h(challengeName: string, streak: number): Promise<boolean> {
    return this.send({
      type: 'streak_warning_6h',
      title: '⚠️ 6 hours left!',
      body: `Don't lose your ${streak}-day streak on "${challengeName}"! Check in before midnight.`,
      tag: `streak-warning-${challengeName}`,
    });
  }

  // Streak warning (1 hour left)
  sendStreakWarning1h(challengeName: string, streak: number): Promise<boolean> {
    return this.send({
      type: 'streak_warning_1h',
      title: '🚨 1 hour left!',
      body: `URGENT: Your ${streak}-day streak on "${challengeName}" is about to end! Check in NOW!`,
      tag: `streak-warning-${challengeName}`,
    });
  }

  // Milestone celebration
  sendMilestoneAlert(challengeName: string, day: number, badgeName: string): Promise<boolean> {
    return this.send({
      type: 'milestone',
      title: '🎉 Milestone unlocked!',
      body: `Day ${day} on "${challengeName}"! You earned the "${badgeName}" badge! 🏆`,
      tag: `milestone-${challengeName}-${day}`,
    });
  }

  // Burnout detection / re-engagement
  sendBurnoutAlert(challengeName: string, daysMissed: number): Promise<boolean> {
    return this.send({
      type: 'burnout',
      title: '💙 We miss you!',
      body: `It's been ${daysMissed} days since you checked in on "${challengeName}". Every journey has bumps - come back when you're ready!`,
      tag: `burnout-${challengeName}`,
    });
  }

  // Weekly recap
  sendWeeklyRecap(stats: { 
    daysCompleted: number; 
    totalDays: number; 
    consistency: number;
    bestStreak: number;
  }): Promise<boolean> {
    const emoji = stats.consistency >= 80 ? '🔥' : stats.consistency >= 50 ? '💪' : '📈';
    
    return this.send({
      type: 'weekly_recap',
      title: `${emoji} Your Weekly Recap`,
      body: `This week: ${stats.daysCompleted}/${stats.totalDays} days (${stats.consistency}% consistency). Best streak: ${stats.bestStreak} days!`,
      tag: 'weekly-recap',
    });
  }

  // Test notification
  sendTestNotification(): Promise<boolean> {
    return this.send({
      type: 'daily_reminder',
      title: '🔔 Test Notification',
      body: 'Notifications are working! You\'ll receive reminders to keep your streaks going.',
      tag: 'test',
    });
  }
}

export const notificationService = NotificationService.getInstance();
