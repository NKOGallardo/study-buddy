import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudy } from '@/contexts/StudyContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

const AnalyticsPage = () => {
  const { sessions, subjects, getWeeklyHoursBySubject } = useStudy();

  const weeklyData = subjects.map((subject) => ({
    name: subject.name,
    hours: getWeeklyHoursBySubject(subject.slug),
    color: `hsl(${subject.color})`,
  }));

  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const dailyData = last7Days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const daySessions = sessions.filter((s) => s.date === dayStr);
    const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
    return { date: format(day, 'EEE'), hours: totalMinutes / 60 };
  });

  const totalBySubject = subjects
    .map((subject) => {
      const subjectSessions = sessions.filter((s) => s.subject === subject.slug);
      const totalMinutes = subjectSessions.reduce((sum, s) => sum + s.duration, 0);
      return {
        name: subject.name,
        value: totalMinutes / 60,
        color: `hsl(${subject.color})`,
      };
    })
    .filter((s) => s.value > 0);

  const performanceData = last7Days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const daySessions = sessions.filter((s) => s.date === dayStr);
    const avgDifficulty =
      daySessions.length > 0
        ? daySessions.reduce((sum, s) => {
            const score = s.difficulty === 'easy' ? 1 : s.difficulty === 'medium' ? 2 : 3;
            return sum + score;
          }, 0) / daySessions.length
        : 0;
    const goodMoodCount = daySessions.filter((s) => s.mood === 'good').length;
    const moodScore = daySessions.length > 0 ? (goodMoodCount / daySessions.length) * 100 : 0;
    return { date: format(day, 'EEE'), difficulty: avgDifficulty, mood: moodScore };
  });

  const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
  const mostStudied = [...weeklyData].sort((a, b) => b.hours - a.hours)[0];
  const avgSessionLength =
    sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Insights into your study habits</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="shadow-notion border-border/50">
          <CardContent className="pt-4 sm:pt-6 pb-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Study Time</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1">{totalHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card className="shadow-notion border-border/50">
          <CardContent className="pt-4 sm:pt-6 pb-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Most Studied This Week</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1 truncate">{mostStudied?.name || 'None'}</p>
          </CardContent>
        </Card>
        <Card className="shadow-notion border-border/50">
          <CardContent className="pt-4 sm:pt-6 pb-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Avg Session Length</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1">{avgSessionLength.toFixed(0)} min</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="shadow-notion border-border/50">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base font-medium">Weekly Hours by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} layout="vertical" margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" unit="h" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}h`, 'Hours']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                      {weeklyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No subjects yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-notion border-border/50">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base font-medium">Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              {totalBySubject.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={totalBySubject}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {totalBySubject.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}h`, 'Total']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-notion border-border/50">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base font-medium">Daily Study Time (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ left: -15, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis unit="h" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}h`, 'Hours']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-notion border-border/50">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base font-medium">Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ left: -15, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" domain={[0, 3]} ticks={[1, 2, 3]} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="difficulty"
                    stroke="hsl(var(--warning))"
                    strokeWidth={2}
                    name="Difficulty (1-3)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="mood"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    name="Good Mood %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
