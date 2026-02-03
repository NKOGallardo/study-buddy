import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudy } from '@/contexts/StudyContext';
import { SUBJECTS } from '@/types/study';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { sessions, getSessionsByDate } = useStudy();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSessionsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessions.filter((s) => s.date === dateStr);
  };

  const getTotalMinutesForDay = (date: Date) => {
    const daySessions = getSessionsForDay(date);
    return daySessions.reduce((sum, s) => sum + s.duration, 0);
  };

  const selectedDateSessions = selectedDate
    ? getSessionsForDay(selectedDate)
    : [];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-1">View your study history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="shadow-notion border-border/50 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const daySessions = getSessionsForDay(day);
                const totalMinutes = getTotalMinutesForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                // Intensity based on study time
                let intensity = '';
                if (totalMinutes > 120) intensity = 'bg-success/40';
                else if (totalMinutes > 60) intensity = 'bg-success/25';
                else if (totalMinutes > 0) intensity = 'bg-success/10';

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'aspect-square p-1 rounded-lg flex flex-col items-center justify-start transition-all',
                      !isCurrentMonth && 'opacity-30',
                      isToday && 'ring-2 ring-primary',
                      isSelected && 'bg-primary text-primary-foreground',
                      !isSelected && intensity,
                      !isSelected && 'hover:bg-muted'
                    )}
                  >
                    <span className="text-sm font-medium">{format(day, 'd')}</span>
                    {daySessions.length > 0 && !isSelected && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {daySessions.slice(0, 3).map((session) => {
                          const subject = SUBJECTS.find((s) => s.id === session.subject);
                          return (
                            <span key={session.id} className="text-xs">
                              {subject?.icon}
                            </span>
                          );
                        })}
                        {daySessions.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{daySessions.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected day details */}
        <Card className="shadow-notion border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {selectedDate
                ? format(selectedDate, 'EEEE, MMMM d')
                : 'Select a day'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateSessions.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedDateSessions.reduce((sum, s) => sum + s.duration, 0)} minutes
                    studied
                  </p>
                  {selectedDateSessions.map((session) => {
                    const subject = SUBJECTS.find((s) => s.id === session.subject);
                    return (
                      <div
                        key={session.id}
                        className="p-3 rounded-lg bg-muted/30 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span>{subject?.icon}</span>
                          <span className="font-medium">{subject?.name}</span>
                          <Badge variant="secondary" className="ml-auto">
                            {session.duration} min
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.topic}
                        </p>
                        <div className="flex gap-2 text-sm">
                          <Badge
                            variant="outline"
                            className={cn(
                              session.difficulty === 'easy' && 'border-success text-success',
                              session.difficulty === 'medium' && 'border-warning text-warning',
                              session.difficulty === 'hard' && 'border-destructive text-destructive'
                            )}
                          >
                            {session.difficulty}
                          </Badge>
                          <span>
                            {session.mood === 'good' && '😊'}
                            {session.mood === 'tired' && '😴'}
                            {session.mood === 'stressed' && '😰'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No study sessions on this day.
                </p>
              )
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Click on a day to see details.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
