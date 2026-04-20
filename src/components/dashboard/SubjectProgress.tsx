import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStudy } from '@/contexts/StudyContext';
import { SubjectIcon } from '@/components/subjects/SubjectIcon';

export function SubjectProgress() {
  const { getWeeklyHoursBySubject, subjects } = useStudy();

  return (
    <Card className="shadow-notion border-border/50">
      <CardContent className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
          Weekly Progress by Subject
        </h3>
        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No subjects yet. Add one from the sidebar to track your progress.
          </p>
        ) : (
          <div className="space-y-4">
            {subjects.map((subject) => {
              const hours = getWeeklyHoursBySubject(subject.slug);
              const goal = subject.weeklyGoal || 1;
              const percentage = Math.min((hours / goal) * 100, 100);

              return (
                <div key={subject.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-5 w-5 rounded flex items-center justify-center text-white"
                        style={{ backgroundColor: `hsl(${subject.color})` }}
                      >
                        <SubjectIcon name={subject.icon} className="h-3 w-3" />
                      </span>
                      <span className="font-medium">{subject.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {hours.toFixed(1)}h / {subject.weeklyGoal}h
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: `hsl(${subject.color})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
