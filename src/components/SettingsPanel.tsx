import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun,
  Volume2,
  Download,
  Trash2,
  Clock,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserSettings {
  darkMode: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  streakWarningsEnabled: boolean;
  milestoneAlertsEnabled: boolean;
  soundEffectsEnabled: boolean;
  animationsEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: false,
  dailyReminderEnabled: true,
  dailyReminderTime: '19:00',
  streakWarningsEnabled: true,
  milestoneAlertsEnabled: true,
  soundEffectsEnabled: true,
  animationsEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export function SettingsPanel() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem('challenge-tracker-settings');
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }

    // Apply dark mode
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('challenge-tracker-settings', JSON.stringify(settings));
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings]);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Settings updated');
  };

  const exportData = () => {
    const data = localStorage.getItem('challenge-tracker-data');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `challenge-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } else {
      toast.error('No data to export');
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to delete ALL your data? This cannot be undone!')) {
      localStorage.removeItem('challenge-tracker-data');
      toast.success('All data has been deleted');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
            </div>
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSetting('darkMode', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="animations">Animations</Label>
              <p className="text-xs text-muted-foreground">Enable celebration effects and transitions</p>
            </div>
            <Switch
              id="animations"
              checked={settings.animationsEnabled}
              onCheckedChange={(checked) => updateSetting('animationsEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dailyReminder">Daily Reminders</Label>
              <p className="text-xs text-muted-foreground">Get reminded to check in every day</p>
            </div>
            <Switch
              id="dailyReminder"
              checked={settings.dailyReminderEnabled}
              onCheckedChange={(checked) => updateSetting('dailyReminderEnabled', checked)}
            />
          </div>

          {settings.dailyReminderEnabled && (
            <div className="flex items-center gap-4 ml-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Input
                type="time"
                value={settings.dailyReminderTime}
                onChange={(e) => updateSetting('dailyReminderTime', e.target.value)}
                className="w-32"
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="streakWarnings">Streak Warnings</Label>
              <p className="text-xs text-muted-foreground">Alert when you're about to lose your streak</p>
            </div>
            <Switch
              id="streakWarnings"
              checked={settings.streakWarningsEnabled}
              onCheckedChange={(checked) => updateSetting('streakWarningsEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="milestoneAlerts">Milestone Alerts</Label>
              <p className="text-xs text-muted-foreground">Celebrate when you hit achievements</p>
            </div>
            <Switch
              id="milestoneAlerts"
              checked={settings.milestoneAlertsEnabled}
              onCheckedChange={(checked) => updateSetting('milestoneAlertsEnabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="soundEffects">Sound Effects</Label>
              <p className="text-xs text-muted-foreground">Play sounds for achievements and check-ins</p>
            </div>
            <Switch
              id="soundEffects"
              checked={settings.soundEffectsEnabled}
              onCheckedChange={(checked) => updateSetting('soundEffectsEnabled', checked)}
            />
          </div>

          <Separator />

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              Quiet Hours
            </Label>
            <p className="text-xs text-muted-foreground mb-3">No notifications during these hours</p>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                className="w-28"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                className="w-28"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5" />
            Data & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Timezone</Label>
              <p className="text-xs text-muted-foreground">{settings.timezone}</p>
            </div>
            <Select 
              value={settings.timezone} 
              onValueChange={(v) => updateSetting('timezone', v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                <SelectItem value="Asia/Kolkata">India</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-3">
            <Button variant="outline" className="w-full gap-2" onClick={exportData}>
              <Download className="w-4 h-4" />
              Export All Data (JSON)
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full gap-2"
              onClick={clearAllData}
            >
              <Trash2 className="w-4 h-4" />
              Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
