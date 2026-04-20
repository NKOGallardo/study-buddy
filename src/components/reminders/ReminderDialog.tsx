import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Subject, DAYS_OF_WEEK, StudyReminder } from '@/types/study';
import { useStudy } from '@/contexts/StudyContext';
import { SubjectIcon } from '@/components/subjects/SubjectIcon';
import { Bell, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReminderDialogProps {
  onAdd: (reminder: Omit<StudyReminder, 'id' | 'createdAt'>) => void;
  trigger?: React.ReactNode;
}

export function ReminderDialog({ onAdd, trigger }: ReminderDialogProps) {
  const { subjects } = useStudy();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState<Subject | 'any'>('any');
  const [time, setTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [message, setMessage] = useState('');

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = () => {
    if (selectedDays.length === 0) return;

    onAdd({
      subject,
      time,
      days: selectedDays,
      message: message || 'Time to study!',
      enabled: true,
    });

    setSubject('any');
    setTime('09:00');
    setSelectedDays([1, 2, 3, 4, 5]);
    setMessage('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Reminder</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            New Study Reminder
          </DialogTitle>
          <DialogDescription>
            Set up a reminder to help you stay on track with your studies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={subject} onValueChange={(v) => setSubject(v as Subject | 'any')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">📚 Any Subject</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    <span className="inline-flex items-center gap-2">
                      <SubjectIcon name={s.icon} className="h-3.5 w-3.5" style={{ color: `hsl(${s.color})` }} />
                      {s.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Days</Label>
            <div className="flex flex-wrap gap-1">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'w-10 h-10 p-0 text-xs',
                    selectedDays.includes(day.value) && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Message (optional)</Label>
            <Input
              placeholder="Time to study!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selectedDays.length === 0} className="w-full sm:w-auto">
            Add Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
