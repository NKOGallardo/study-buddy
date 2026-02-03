import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudy } from '@/contexts/StudyContext';
import { SUBJECTS } from '@/types/study';
import { formatDistanceToNow } from 'date-fns';

export function RecentActivity() {
  const { sessions } = useStudy();

  const recentSessions = sessions.slice(0, 5);

  if (recentSessions.length === 0) {
    return (
      <Card className="shadow-notion border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No study sessions yet.</p>
            <p className="text-sm mt-1">Add your first session to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-notion border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentSessions.map((session) => {
          const subject = SUBJECTS.find((s) => s.id === session.subject);
          return (
            <div
              key={session.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <span className="text-xl">{subject?.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{session.topic}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>{subject?.name}</span>
                  <span>•</span>
                  <span>{session.duration} min</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {session.difficulty === 'easy' && <span>🟢</span>}
                {session.difficulty === 'medium' && <span>🟡</span>}
                {session.difficulty === 'hard' && <span>🔴</span>}
                {session.mood === 'good' && <span>😊</span>}
                {session.mood === 'tired' && <span>😴</span>}
                {session.mood === 'stressed' && <span>😰</span>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
