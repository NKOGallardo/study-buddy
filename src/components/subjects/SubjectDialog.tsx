import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SUBJECT_ICONS, SUBJECT_COLORS, SubjectDefinition } from '@/types/study';
import { SubjectIcon } from './SubjectIcon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: SubjectDefinition;
  onSubmit: (values: { name: string; icon: string; color: string; weeklyGoal: number }) => Promise<void> | void;
}

export function SubjectDialog({ open, onOpenChange, initial, onSubmit }: SubjectDialogProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(SUBJECT_ICONS[0]);
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setIcon(initial?.icon ?? SUBJECT_ICONS[0]);
      setColor(initial?.color ?? SUBJECT_COLORS[0]);
      setWeeklyGoal(initial?.weeklyGoal ?? 5);
    }
  }, [open, initial]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 40) {
      toast.error('Name must be 1–40 characters');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name: trimmed, icon, color, weeklyGoal });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Subject' : 'New Subject'}</DialogTitle>
          <DialogDescription>
            Customize the name, icon, color, and weekly study goal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Live preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: `hsl(${color})` }}
            >
              <SubjectIcon name={icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{name || 'Subject name'}</p>
              <p className="text-xs text-muted-foreground">{weeklyGoal}h weekly goal</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-name">Name</Label>
            <Input
              id="subject-name"
              placeholder="e.g. Biology"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-2">
              {SUBJECT_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    'h-9 w-9 rounded-md flex items-center justify-center border transition-all',
                    icon === iconName
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted text-muted-foreground'
                  )}
                  aria-label={iconName}
                >
                  <SubjectIcon name={iconName} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-10 gap-2">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                    color === c ? 'border-foreground' : 'border-transparent'
                  )}
                  style={{ backgroundColor: `hsl(${c})` }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Weekly goal</Label>
              <span className="text-sm font-medium">{weeklyGoal}h</span>
            </div>
            <Slider
              value={[weeklyGoal]}
              min={1}
              max={40}
              step={1}
              onValueChange={(v) => setWeeklyGoal(v[0])}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto">
            {initial ? 'Save changes' : 'Create subject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
