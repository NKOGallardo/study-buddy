import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { StudyReminder, DAYS_OF_WEEK } from '@/types/study';
import { useStudy } from '@/contexts/StudyContext';
import { SubjectIcon } from '@/components/subjects/SubjectIcon';
import { Bell, BellOff, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReminderListProps {
  reminders: StudyReminder[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ReminderList({ reminders, onToggle, onDelete }: ReminderListProps) {
  const { getSubjectBySlug } = useStudy();

  if (reminders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BellOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No reminders set</p>
        <p className="text-sm mt-1">Add a reminder to stay on track with your studies!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => {
        const subject = reminder.subject === 'any' ? null : getSubjectBySlug(reminder.subject);

        return (
          <div
            key={reminder.id}
            className={cn(
              'p-4 rounded-lg border transition-all',
              reminder.enabled ? 'bg-card border-border' : 'bg-muted/30 border-border/50 opacity-60'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Bell
                  className={cn(
                    'h-5 w-5',
                    reminder.enabled ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-lg">{reminder.time}</span>
                  <Badge variant="secondary" className="text-xs inline-flex items-center gap-1">
                    {subject ? (
                      <>
                        <SubjectIcon
                          name={subject.icon}
                          className="h-3 w-3"
                          style={{ color: `hsl(${subject.color})` }}
                        />
                        {subject.name}
                      </>
                    ) : (
                      <>📚 Any</>
                    )}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mt-1 truncate">{reminder.message}</p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {reminder.days
                    .sort((a, b) => a - b)
                    .map((day) => (
                      <span
                        key={day}
                        className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {DAYS_OF_WEEK.find((d) => d.value === day)?.label}
                      </span>
                    ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch
                  checked={reminder.enabled}
                  onCheckedChange={() => onToggle(reminder.id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(reminder.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
