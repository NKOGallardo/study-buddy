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
import { SUBJECTS, Subject } from '@/types/study';
import { Download, Trash2, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { weeklyGoals, updateWeeklyGoal, resetAllData, exportToCSV } = useStudy();
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

  return (
    <div className="space-y-6 animate-fade-up max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your study tracker</p>
      </div>

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
                <p className="text-sm text-muted-foreground">
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
                <Label htmlFor={`goal-${subject.id}`} className="flex-1">
                  {subject.name}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`goal-${subject.id}`}
                    type="number"
                    min="0"
                    max="40"
                    className="w-20 text-center"
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
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Study History</p>
              <p className="text-sm text-muted-foreground">
                Download all your study sessions as a CSV file
              </p>
            </div>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <Separator />

          {/* Reset */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Reset All Data</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all your study data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your
                    study sessions, notes, topics, and reset all goals to defaults.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
