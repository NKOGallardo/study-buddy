import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

type TimerMode = 'work' | 'break';

const WORK_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes

const PomodoroPage = () => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? WORK_DURATION : BREAK_DURATION);
  }, [mode]);

  const switchMode = useCallback(() => {
    const newMode = mode === 'work' ? 'break' : 'work';
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? WORK_DURATION : BREAK_DURATION);
    setIsRunning(false);
    if (mode === 'work') {
      setSessions((prev) => prev + 1);
    }
  }, [mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      switchMode();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, switchMode]);

  const progress = mode === 'work' 
    ? ((WORK_DURATION - timeLeft) / WORK_DURATION) * 100
    : ((BREAK_DURATION - timeLeft) / BREAK_DURATION) * 100;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Pomodoro Timer</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Stay focused with the Pomodoro Technique</p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
        <Card className="shadow-notion border-border/50 w-full max-w-md">
          <CardHeader className="text-center pb-2 sm:pb-4">
            <div className="flex justify-center gap-2 mb-3 sm:mb-4">
              <Button
                variant={mode === 'work' ? 'default' : 'ghost'}
                onClick={() => {
                  setMode('work');
                  setTimeLeft(WORK_DURATION);
                  setIsRunning(false);
                }}
                className="gap-1 sm:gap-2 text-sm"
                size="sm"
              >
                <Brain className="h-4 w-4" />
                Focus
              </Button>
              <Button
                variant={mode === 'break' ? 'default' : 'ghost'}
                onClick={() => {
                  setMode('break');
                  setTimeLeft(BREAK_DURATION);
                  setIsRunning(false);
                }}
                className="gap-1 sm:gap-2 text-sm"
                size="sm"
              >
                <Coffee className="h-4 w-4" />
                Break
              </Button>
            </div>
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {mode === 'work' ? 'Focus Time' : 'Break Time'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 sm:space-y-8 pb-6">
            {/* Timer display */}
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-48 h-48 sm:w-64 sm:h-64 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke={mode === 'work' ? 'hsl(var(--primary))' : 'hsl(var(--success))'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="283"
                  strokeDashoffset={283 * (1 - progress / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl sm:text-6xl font-bold tabular-nums">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full"
              >
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                size="lg"
                onClick={() => setIsRunning(!isRunning)}
                className={cn(
                  "h-14 w-14 sm:h-16 sm:w-16 rounded-full text-lg",
                  mode === 'break' && "bg-success hover:bg-success/90"
                )}
              >
                {isRunning ? <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-1" />}
              </Button>
              <div className="h-10 w-10 sm:h-12 sm:w-12" /> {/* Spacer for symmetry */}
            </div>

            {/* Sessions count */}
            <div className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{sessions}</span> pomodoro sessions completed today
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="shadow-notion border-border/50 w-full max-w-md mt-4 sm:mt-6">
          <CardContent className="pt-4 sm:pt-6 pb-4">
            <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">💡 How it works</h3>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-2">
              <li>1. Focus on your task for 25 minutes</li>
              <li>2. Take a 5-minute break</li>
              <li>3. After 4 sessions, take a longer break</li>
              <li>4. Track your sessions and stay productive!</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PomodoroPage;
