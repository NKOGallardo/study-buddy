import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useStudy } from '@/contexts/StudyContext';
import { useReminders } from '@/hooks/useReminders';
import { SUBJECTS, Subject } from '@/types/study';
import { ReminderDialog } from '@/components/reminders/ReminderDialog';
import { ReminderList } from '@/components/reminders/ReminderList';
import { Download, Trash2, Moon, Sun, Bell, BellRing, Copy, ClipboardPaste, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const SettingsPage = () => {
  const { weeklyGoals, updateWeeklyGoal, resetAllData, exportToCSV, exportData, importData } = useStudy();
  const [importText, setImportText] = useState('');
  const { 
    reminders, 
    notificationPermission, 
    requestPermission, 
    addReminder, 
    toggleReminder, 
    deleteReminder 
  } = useReminders();
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('studytrack_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('studytrack_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('studytrack_theme', 'light');
    }
  };

  const handleReset = () => {
    resetAllData();
    toast.success('All data has been reset');
  };

  const handleExport = () => {
    exportToCSV();
    toast.success('Study history exported successfully!');
  };

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Customize your study tracker</p>
      </div>

      {/* Study Reminders */}
      <Card className="shadow-notion border-border/50">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Study Reminders
          </CardTitle>
          <div className="flex items-center gap-2">
            {notificationPermission !== 'granted' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEnableNotifications}
                className="gap-2"
              >
                <BellRing className="h-4 w-4" />
                <span className="hidden sm:inline">Enable Notifications</span>
                <span className="sm:hidden">Enable</span>
              </Button>
            )}
            <ReminderDialog onAdd={addReminder} />
          </div>
        </CardHeader>
        <CardContent>
          {notificationPermission === 'denied' && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              Notifications are blocked. Please enable them in your browser settings.
            </div>
          )}
          <ReminderList 
            reminders={reminders} 
            onToggle={toggleReminder} 
            onDelete={deleteReminder} 
          />
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="shadow-notion border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">🎨 Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Toggle between light and dark theme
                </p>
              </div>
            </div>
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goals */}
      <Card className="shadow-notion border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">🎯 Weekly Study Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set your target study hours per subject for each week.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SUBJECTS.map((subject) => (
              <div key={subject.id} className="flex items-center gap-3">
                <span className="text-xl">{subject.icon}</span>
                <Label htmlFor={`goal-${subject.id}`} className="flex-1 text-sm sm:text-base">
                  {subject.name}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`goal-${subject.id}`}
                    type="number"
                    min="0"
                    max="40"
                    className="w-16 sm:w-20 text-center"
                    value={weeklyGoals[subject.id as Subject]}
                    onChange={(e) =>
                      updateWeeklyGoal(subject.id as Subject, parseInt(e.target.value) || 0)
                    }
                  />
                  <span className="text-sm text-muted-foreground">hrs</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="shadow-notion border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">💾 Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-medium">Export Study History</p>
              <p className="text-sm text-muted-foreground">
                Download all your study sessions as a CSV file
              </p>
            </div>
            <Button variant="outline" onClick={handleExport} className="gap-2 w-full sm:w-auto">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <Separator />

          {/* Transfer Data */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <div>
                <p className="font-medium">Transfer Between Devices</p>
                <p className="text-sm text-muted-foreground">
                  Copy your data on one device, paste it on another
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="gap-2 flex-1"
                onClick={() => {
                  const data = exportData();
                  navigator.clipboard.writeText(data);
                  toast.success('Data copied to clipboard! Paste it on your other device.');
                }}
              >
                <Copy className="h-4 w-4" />
                Copy My Data
              </Button>
            </div>

            <Textarea
              placeholder="Paste your data here from another device..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={3}
              className="text-xs font-mono"
            />
            <Button
              variant="outline"
              className="gap-2 w-full"
              disabled={!importText.trim()}
              onClick={() => {
                const result = importData(importText);
                if (result.success) {
                  toast.success('Data imported successfully!');
                  setImportText('');
                } else {
                  toast.error('Invalid data. Make sure you copied the full text.');
                }
              }}
            >
              <ClipboardPaste className="h-4 w-4" />
              Import Data
            </Button>
          </div>

          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-medium text-destructive">Reset All Data</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all your study data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2 w-full sm:w-auto">
                  <Trash2 className="h-4 w-4" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your
                    study sessions, notes, topics, and reset all goals to defaults.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto">
                    Yes, reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="shadow-notion border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">ℹ️ About StudyTrack</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            StudyTrack is a Notion-style study tracker that helps you stay organized
            and focused on your learning goals. Track your study sessions, manage
            topics, and visualize your progress.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Data is stored locally in your browser using LocalStorage.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
