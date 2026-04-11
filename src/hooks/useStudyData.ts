import { useState, useEffect, useCallback } from 'react';
import { StudySession, SubjectGoal, Subject, WeeklyGoals, TopicItem } from '@/types/study';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, session } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<SubjectGoal[]>(getDefaultGoals());
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoals>(DEFAULT_WEEKLY_GOALS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from database
  useEffect(() => {
    if (!user || !session) {
      setSessions([]);
      setGoals(getDefaultGoals());
      setWeeklyGoals(DEFAULT_WEEKLY_GOALS);
      setIsLoaded(true);
      return;
    }

    const loadData = async () => {
      // Load sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Failed to load sessions:', sessionsError);
      }

      if (sessionsData) {
        setSessions(sessionsData.map(s => ({
          id: s.id,
          date: s.date,
          subject: s.subject as Subject,
          topic: s.topic,
          duration: s.duration,
          difficulty: s.difficulty as StudySession['difficulty'],
          mood: s.mood as StudySession['mood'],
          status: s.status as StudySession['status'],
          imageUrl: s.image_url ?? undefined,
          createdAt: s.created_at,
        })));
      }

      // Load goals + topics
      const { data: goalsData, error: goalsError } = await supabase
        .from('subject_goals')
        .select('*');

      if (goalsError) {
        console.error('Failed to load goals:', goalsError);
      }

      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*');

      if (topicsError) {
        console.error('Failed to load topics:', topicsError);
      }

      const topicsBySubject: Record<string, TopicItem[]> = {};
      topicsData?.forEach(t => {
        if (!topicsBySubject[t.subject]) topicsBySubject[t.subject] = [];
        topicsBySubject[t.subject].push({ id: t.id, text: t.text, completed: t.completed });
      });

      const defaultGoals = getDefaultGoals();
      const mergedGoals = defaultGoals.map(dg => {
        const dbGoal = goalsData?.find(g => g.subject === dg.subject);
        return {
          subject: dg.subject,
          weeklyGoal: dbGoal?.weekly_goal ?? dg.weeklyGoal,
          notes: dbGoal?.notes ?? '',
          topics: topicsBySubject[dg.subject] ?? [],
        };
      });

      setGoals(mergedGoals);
      setWeeklyGoals(prev => {
        const updated = { ...prev };
        goalsData?.forEach(g => {
          if (g.subject in updated) {
            (updated as any)[g.subject] = g.weekly_goal;
          }
        });
        return updated;
      });

      setIsLoaded(true);
    };

    loadData();
  }, [user, session]);

  // Add study session
  const addSession = useCallback(async (session: Omit<StudySession, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newSession: StudySession = { ...session, id, createdAt };

    setSessions(prev => [newSession, ...prev]);

    if (user) {
      const { data } = await supabase.from('study_sessions').insert({
        user_id: user.id,
        date: session.date,
        subject: session.subject,
        topic: session.topic,
        duration: session.duration,
        difficulty: session.difficulty,
        mood: session.mood,
        status: session.status,
        image_url: session.imageUrl ?? null,
      }).select().single();

      if (data) {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, id: data.id, createdAt: data.created_at } : s));
        return { ...newSession, id: data.id, createdAt: data.created_at };
      }
    }

    return newSession;
  }, [user]);

  // Update study session
  const updateSession = useCallback(async (id: string, updates: Partial<StudySession>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

    if (user) {
      const dbUpdates: any = {};
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.subject !== undefined) dbUpdates.subject = updates.subject;
      if (updates.topic !== undefined) dbUpdates.topic = updates.topic;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
      if (updates.mood !== undefined) dbUpdates.mood = updates.mood;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;

      await supabase.from('study_sessions').update(dbUpdates).eq('id', id);
    }
  }, [user]);

  // Delete study session
  const deleteSession = useCallback(async (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (user) {
      await supabase.from('study_sessions').delete().eq('id', id);
    }
  }, [user]);

  // Upsert subject goal helper
  const upsertGoal = useCallback(async (subject: Subject, updates: { weekly_goal?: number; notes?: string }) => {
    if (!user) return;
    await supabase.from('subject_goals').upsert({
      user_id: user.id,
      subject,
      weekly_goal: updates.weekly_goal ?? weeklyGoals[subject],
      notes: updates.notes ?? goals.find(g => g.subject === subject)?.notes ?? '',
    }, { onConflict: 'user_id,subject' });
  }, [user, weeklyGoals, goals]);

  // Update subject notes
  const updateSubjectNotes = useCallback(async (subject: Subject, notes: string) => {
    setGoals(prev => prev.map(g => g.subject === subject ? { ...g, notes } : g));
    await upsertGoal(subject, { notes });
  }, [upsertGoal]);

  // Add topic to subject
  const addTopic = useCallback(async (subject: Subject, text: string) => {
    const tempId = crypto.randomUUID();
    const newTopic: TopicItem = { id: tempId, text, completed: false };

    setGoals(prev => prev.map(g =>
      g.subject === subject ? { ...g, topics: [...g.topics, newTopic] } : g
    ));

    if (user) {
      const { data } = await supabase.from('topics').insert({
        user_id: user.id,
        subject,
        text,
        completed: false,
      }).select().single();

      if (data) {
        setGoals(prev => prev.map(g =>
          g.subject === subject
            ? { ...g, topics: g.topics.map(t => t.id === tempId ? { ...t, id: data.id } : t) }
            : g
        ));
      }
    }
  }, [user]);

  // Toggle topic completion
  const toggleTopic = useCallback(async (subject: Subject, topicId: string) => {
    let newCompleted = false;
    setGoals(prev => prev.map(g =>
      g.subject === subject
        ? {
            ...g,
            topics: g.topics.map(t => {
              if (t.id === topicId) {
                newCompleted = !t.completed;
                return { ...t, completed: newCompleted };
              }
              return t;
            }),
          }
        : g
    ));

    if (user) {
      await supabase.from('topics').update({ completed: newCompleted }).eq('id', topicId);
    }
  }, [user]);

  // Delete topic
  const deleteTopic = useCallback(async (subject: Subject, topicId: string) => {
    setGoals(prev => prev.map(g =>
      g.subject === subject
        ? { ...g, topics: g.topics.filter(t => t.id !== topicId) }
        : g
    ));

    if (user) {
      await supabase.from('topics').delete().eq('id', topicId);
    }
  }, [user]);

  // Update weekly goals
  const updateWeeklyGoal = useCallback(async (subject: Subject, hours: number) => {
    setWeeklyGoals(prev => ({ ...prev, [subject]: hours }));
    await upsertGoal(subject, { weekly_goal: hours });
  }, [upsertGoal]);

  // Get sessions for a subject
  const getSessionsBySubject = useCallback(
    (subject: Subject) => sessions.filter(s => s.subject === subject),
    [sessions]
  );

  // Get sessions for a date
  const getSessionsByDate = useCallback(
    (date: string) => sessions.filter(s => s.date === date),
    [sessions]
  );

  // Get total hours this week
  const getWeeklyHours = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return sessions
      .filter(s => new Date(s.date) >= startOfWeek)
      .reduce((total, s) => total + s.duration, 0) / 60;
  }, [sessions]);

  // Get hours by subject this week
  const getWeeklyHoursBySubject = useCallback(
    (subject: Subject) => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      return sessions
        .filter(s => s.subject === subject && new Date(s.date) >= startOfWeek)
        .reduce((total, s) => total + s.duration, 0) / 60;
    },
    [sessions]
  );

  // Calculate streak
  const getStreak = useCallback(() => {
    if (sessions.length === 0) return 0;

    const sortedDates = [...new Set(sessions.map(s => s.date))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i - 1]);
      const prev = new Date(sortedDates[i]);
      const diffDays = (current.getTime() - prev.getTime()) / 86400000;
      if (diffDays === 1) streak++;
      else break;
    }

    return streak;
  }, [sessions]);

  // Reset all data
  const resetAllData = useCallback(async () => {
    setSessions([]);
    setGoals(getDefaultGoals());
    setWeeklyGoals(DEFAULT_WEEKLY_GOALS);

    if (user) {
      await supabase.from('study_sessions').delete().eq('user_id', user.id);
      await supabase.from('topics').delete().eq('user_id', user.id);
      await supabase.from('subject_goals').delete().eq('user_id', user.id);
    }
  }, [user]);

  // Export as CSV
  const exportToCSV = useCallback(() => {
    const headers = ['Date', 'Subject', 'Topic', 'Duration (min)', 'Difficulty', 'Mood', 'Status'];
    const rows = sessions.map(s => [s.date, s.subject, s.topic, s.duration.toString(), s.difficulty, s.mood, s.status]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studytrack_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessions]);

  // Export all data as JSON string
  const exportData = useCallback(() => {
    return JSON.stringify({ sessions, goals, weeklyGoals }, null, 2);
  }, [sessions, goals, weeklyGoals]);

  // Import data from JSON string
  const importData = useCallback(async (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.sessions) setSessions(data.sessions);
      if (data.goals) setGoals(data.goals);
      if (data.weeklyGoals) setWeeklyGoals(data.weeklyGoals);

      // Sync imported data to DB
      if (user && data.sessions?.length) {
        const dbSessions = data.sessions.map((s: StudySession) => ({
          user_id: user.id,
          date: s.date,
          subject: s.subject,
          topic: s.topic,
          duration: s.duration,
          difficulty: s.difficulty,
          mood: s.mood,
          status: s.status,
          image_url: s.imageUrl ?? null,
        }));
        await supabase.from('study_sessions').insert(dbSessions);
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Invalid data format' };
    }
  }, [user]);

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
    exportData,
    importData,
  };
}
