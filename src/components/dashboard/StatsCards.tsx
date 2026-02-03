import { Card, CardContent } from '@/components/ui/card';
import { Clock, Flame, Target, TrendingUp } from 'lucide-react';
import { useStudy } from '@/contexts/StudyContext';
import { SUBJECTS } from '@/types/study';

export function StatsCards() {
  const { getWeeklyHours, getStreak, sessions, getWeeklyHoursBySubject, weeklyGoals } = useStudy();

  const weeklyHours = getWeeklyHours();
  const streak = getStreak();
  
  // Calculate total weekly goal
  const totalWeeklyGoal = SUBJECTS.reduce((sum, s) => sum + weeklyGoals[s.id], 0);
  const overallProgress = Math.min((weeklyHours / totalWeeklyGoal) * 100, 100);

  // Most studied subject this week
  const subjectHours = SUBJECTS.map((s) => ({
    subject: s,
    hours: getWeeklyHoursBySubject(s.id),
  })).sort((a, b) => b.hours - a.hours);
  const mostStudied = subjectHours[0];

  const stats = [
    {
      title: 'Weekly Hours',
      value: `${weeklyHours.toFixed(1)}h`,
      subtitle: `of ${totalWeeklyGoal}h goal`,
      icon: Clock,
      color: 'bg-info/10 text-info',
    },
    {
      title: 'Study Streak',
      value: `${streak}`,
      subtitle: streak === 1 ? 'day' : 'days in a row',
      icon: Flame,
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Weekly Progress',
      value: `${overallProgress.toFixed(0)}%`,
      subtitle: 'of weekly goals',
      icon: Target,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Most Studied',
      value: mostStudied?.subject.name || 'None',
      subtitle: `${mostStudied?.hours.toFixed(1) || 0}h this week`,
      icon: TrendingUp,
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="shadow-notion border-border/50 hover:shadow-notion-hover transition-shadow animate-fade-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold mt-1 truncate">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{stat.subtitle}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${stat.color} flex-shrink-0`}>
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
