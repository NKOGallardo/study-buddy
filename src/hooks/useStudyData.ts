import { useState, useEffect, useCallback } from 'react';
import { StudySession, SubjectGoal, Subject, WeeklyGoals, TopicItem } from '@/types/study';

const STORAGE_KEYS = {
  sessions: 'studytrack_sessions',
  goals: 'studytrack_goals',
  weeklyGoals: 'studytrack_weekly_goals',
  theme: 'studytrack_theme',
};

const DEFAULT_WEEKLY_GOALS: WeeklyGoals = {
  physics: 5,
  math: 5,
  electronics: 4,
  chemistry: 4,
  english: 3,
  zulu: 3,
};

const getDefaultGoals = (): SubjectGoal[] => [
  { subject: 'physics', weeklyGoal: 5, notes: '', topics: [] },
  { subject: 'math', weeklyGoal: 5, notes: '', topics: [] },
  { subject: 'electronics', weeklyGoal: 4, notes: '', topics: [] },
  { subject: 'chemistry', weeklyGoal: 4, notes: '', topics: [] },
  { subject: 'english', weeklyGoal: 3, notes: '', topics: [] },
  { subject: 'zulu', weeklyGoal: 3, notes: '', topics: [] },
];

export function useStudyData() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<SubjectGoal[]>(getDefaultGoals());
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoals>(DEFAULT_WEEKLY_GOALS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const storedSessions = localStorage.getItem(STORAGE_KEYS.sessions);
    const storedGoals = localStorage.getItem(STORAGE_KEYS.goals);
    const storedWeeklyGoals = localStorage.getItem(STORAGE_KEYS.weeklyGoals);

    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
    if (storedWeeklyGoals) {
      setWeeklyGoals(JSON.parse(storedWeeklyGoals));
    }
    setIsLoaded(true);
  }, []);

  // Save sessions
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
    }
  }, [sessions, isLoaded]);

  // Save goals
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
    }
  }, [goals, isLoaded]);

  // Save weekly goals
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.weeklyGoals, JSON.stringify(weeklyGoals));
    }
  }, [weeklyGoals, isLoaded]);

  // Add study session
  const addSession = useCallback((session: Omit<StudySession, 'id' | 'createdAt'>) => {
    const newSession: StudySession = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    return newSession;
  }, []);

  // Update study session
  const updateSession = useCallback((id: string, updates: Partial<StudySession>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  // Delete study session
  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Update subject notes
  const updateSubjectNotes = useCallback((subject: Subject, notes: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.subject === subject ? { ...g, notes } : g))
    );
  }, []);

  // Add topic to subject
  const addTopic = useCallback((subject: Subject, text: string) => {
    const newTopic: TopicItem = {
      id: crypto.randomUUID(),
      text,
      completed: false,
    };
    setGoals((prev) =>
      prev.map((g) =>
        g.subject === subject ? { ...g, topics: [...g.topics, newTopic] } : g
      )
    );
  }, []);

  // Toggle topic completion
  const toggleTopic = useCallback((subject: Subject, topicId: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.subject === subject
          ? {
              ...g,
              topics: g.topics.map((t) =>
                t.id === topicId ? { ...t, completed: !t.completed } : t
              ),
            }
          : g
      )
    );
  }, []);

  // Delete topic
  const deleteTopic = useCallback((subject: Subject, topicId: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.subject === subject
          ? { ...g, topics: g.topics.filter((t) => t.id !== topicId) }
          : g
      )
    );
  }, []);

  // Update weekly goals
  const updateWeeklyGoal = useCallback((subject: Subject, hours: number) => {
    setWeeklyGoals((prev) => ({ ...prev, [subject]: hours }));
  }, []);

  // Get sessions for a subject
  const getSessionsBySubject = useCallback(
    (subject: Subject) => sessions.filter((s) => s.subject === subject),
    [sessions]
  );

  // Get sessions for a date
  const getSessionsByDate = useCallback(
    (date: string) => sessions.filter((s) => s.date === date),
    [sessions]
  );

  // Get total hours this week
  const getWeeklyHours = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return sessions
      .filter((s) => new Date(s.date) >= startOfWeek)
      .reduce((total, s) => total + s.duration, 0) / 60;
  }, [sessions]);

  // Get hours by subject this week
  const getWeeklyHoursBySubject = useCallback(
    (subject: Subject) => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      return (
        sessions
          .filter((s) => s.subject === subject && new Date(s.date) >= startOfWeek)
          .reduce((total, s) => total + s.duration, 0) / 60
      );
    },
    [sessions]
  );

  // Calculate streak
  const getStreak = useCallback(() => {
    if (sessions.length === 0) return 0;

    const sortedDates = [...new Set(sessions.map((s) => s.date))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if studied today or yesterday
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i - 1]);
      const prev = new Date(sortedDates[i]);
      const diffDays = (current.getTime() - prev.getTime()) / 86400000;

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [sessions]);

  // Reset all data
  const resetAllData = useCallback(() => {
    setSessions([]);
    setGoals(getDefaultGoals());
    setWeeklyGoals(DEFAULT_WEEKLY_GOALS);
    localStorage.removeItem(STORAGE_KEYS.sessions);
    localStorage.removeItem(STORAGE_KEYS.goals);
    localStorage.removeItem(STORAGE_KEYS.weeklyGoals);
  }, []);

  // Export as CSV
  const exportToCSV = useCallback(() => {
    const headers = ['Date', 'Subject', 'Topic', 'Duration (min)', 'Difficulty', 'Mood', 'Status'];
    const rows = sessions.map((s) => [
      s.date,
      s.subject,
      s.topic,
      s.duration.toString(),
      s.difficulty,
      s.mood,
      s.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studytrack_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessions]);

  return {
    sessions,
    goals,
    weeklyGoals,
    isLoaded,
    addSession,
    updateSession,
    deleteSession,
    updateSubjectNotes,
    addTopic,
    toggleTopic,
    deleteTopic,
    updateWeeklyGoal,
    getSessionsBySubject,
    getSessionsByDate,
    getWeeklyHours,
    getWeeklyHoursBySubject,
    getStreak,
    resetAllData,
    exportToCSV,
  };
}
