import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStudy } from '@/contexts/StudyContext';
import { SUBJECTS, Subject, SUBJECT_COLORS } from '@/types/study';
import { cn } from '@/lib/utils';

export function SubjectProgress() {
  const { getWeeklyHoursBySubject, weeklyGoals } = useStudy();

  return (
    <Card className="shadow-notion border-border/50">
      <CardContent className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
          Weekly Progress by Subject
        </h3>
        <div className="space-y-4">
          {SUBJECTS.map((subject) => {
            const hours = getWeeklyHoursBySubject(subject.id);
            const goal = weeklyGoals[subject.id];
            const percentage = Math.min((hours / goal) * 100, 100);

            return (
              <div key={subject.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{subject.icon}</span>
                    <span className="font-medium">{subject.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {hours.toFixed(1)}h / {goal}h
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={percentage} 
                    className="h-2 bg-muted"
                  />
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                      SUBJECT_COLORS[subject.id]
                    )}
                    style={{ width: `${percentage}%`, height: '100%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
