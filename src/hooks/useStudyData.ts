import { useState, useEffect, useCallback } from 'react';
import { StudySession, SubjectGoal, Subject, TopicItem, SubjectDefinition } from '@/types/study';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubjects } from './useSubjects';

export function useStudyData() {
  const { user, session } = useAuth();
  const subjectsApi = useSubjects();
  const { subjects } = subjectsApi;
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<SubjectGoal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load sessions, topics, notes
  useEffect(() => {
    if (!user || !session) {
      setSessions([]);
      setGoals([]);
      setIsLoaded(true);
      return;
    }

    const loadData = async () => {
      const { data: sessionsData } = await supabase
        .from('study_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionsData) {
        setSessions(sessionsData.map((s) => ({
          id: s.id,
          date: s.date,
          subject: s.subject,
          topic: s.topic,
          duration: s.duration,
          difficulty: s.difficulty as StudySession['difficulty'],
          mood: s.mood as StudySession['mood'],
          status: s.status as StudySession['status'],
          imageUrl: s.image_url ?? undefined,
          createdAt: s.created_at,
        })));
      }

      const { data: goalsData } = await supabase.from('subject_goals').select('*');
      const { data: topicsData } = await supabase.from('topics').select('*');

      const topicsBySubject: Record<string, TopicItem[]> = {};
      topicsData?.forEach((t) => {
        if (!topicsBySubject[t.subject]) topicsBySubject[t.subject] = [];
        topicsBySubject[t.subject].push({ id: t.id, text: t.text, completed: t.completed });
      });

      // Build goals indexed by every known subject slug (sessions, topics, notes, subjects)
      const allSlugs = new Set<string>();
      sessionsData?.forEach((s) => allSlugs.add(s.subject));
      topicsData?.forEach((t) => allSlugs.add(t.subject));
      goalsData?.forEach((g) => allSlugs.add(g.subject));

      const builtGoals: SubjectGoal[] = Array.from(allSlugs).map((slug) => {
        const dbGoal = goalsData?.find((g) => g.subject === slug);
        return {
          subject: slug,
          weeklyGoal: dbGoal?.weekly_goal ?? 0,
          notes: dbGoal?.notes ?? '',
          topics: topicsBySubject[slug] ?? [],
        };
      });

      setGoals(builtGoals);
      setIsLoaded(true);
    };

    loadData();
  }, [user, session]);

  // Helper to ensure a goals row exists for a slug
  const ensureGoalRow = useCallback((subject: Subject) => {
    setGoals((prev) => {
      if (prev.some((g) => g.subject === subject)) return prev;
      return [...prev, { subject, weeklyGoal: 0, notes: '', topics: [] }];
    });
  }, []);

  const addSession = useCallback(
    async (newSession: Omit<StudySession, 'id' | 'createdAt'>) => {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const optimistic: StudySession = { ...newSession, id, createdAt };
      setSessions((prev) => [optimistic, ...prev]);

      if (user) {
        const { data } = await supabase
          .from('study_sessions')
          .insert({
            user_id: user.id,
            date: newSession.date,
            subject: newSession.subject,
            topic: newSession.topic,
            duration: newSession.duration,
            difficulty: newSession.difficulty,
            mood: newSession.mood,
            status: newSession.status,
            image_url: newSession.imageUrl ?? null,
          })
          .select()
          .single();

        if (data) {
          setSessions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, id: data.id, createdAt: data.created_at } : s))
          );
          return { ...optimistic, id: data.id, createdAt: data.created_at };
        }
      }

      return optimistic;
    },
    [user]
  );

  const updateSession = useCallback(
    async (id: string, updates: Partial<StudySession>) => {
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      if (user) {
        const dbUpdates: Record<string, unknown> = {};
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
    },
    [user]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (user) await supabase.from('study_sessions').delete().eq('id', id);
    },
    [user]
  );

  const upsertGoalRow = useCallback(
    async (subject: Subject, updates: { weekly_goal?: number; notes?: string }) => {
      if (!user) return;
      const current = goals.find((g) => g.subject === subject);
      await supabase.from('subject_goals').upsert(
        {
          user_id: user.id,
          subject,
          weekly_goal: updates.weekly_goal ?? current?.weeklyGoal ?? 0,
          notes: updates.notes ?? current?.notes ?? '',
        },
        { onConflict: 'user_id,subject' }
      );
    },
    [user, goals]
  );

  const updateSubjectNotes = useCallback(
    async (subject: Subject, notes: string) => {
      ensureGoalRow(subject);
      setGoals((prev) => prev.map((g) => (g.subject === subject ? { ...g, notes } : g)));
      await upsertGoalRow(subject, { notes });
    },
    [ensureGoalRow, upsertGoalRow]
  );

  const addTopic = useCallback(
    async (subject: Subject, text: string) => {
      const tempId = crypto.randomUUID();
      const newTopic: TopicItem = { id: tempId, text, completed: false };
      ensureGoalRow(subject);
      setGoals((prev) =>
        prev.map((g) => (g.subject === subject ? { ...g, topics: [...g.topics, newTopic] } : g))
      );

      if (user) {
        const { data } = await supabase
          .from('topics')
          .insert({ user_id: user.id, subject, text, completed: false })
          .select()
          .single();
        if (data) {
          setGoals((prev) =>
            prev.map((g) =>
              g.subject === subject
                ? { ...g, topics: g.topics.map((t) => (t.id === tempId ? { ...t, id: data.id } : t)) }
                : g
            )
          );
        }
      }
    },
    [user, ensureGoalRow]
  );

  const toggleTopic = useCallback(
    async (subject: Subject, topicId: string) => {
      let newCompleted = false;
      setGoals((prev) =>
        prev.map((g) =>
          g.subject === subject
            ? {
                ...g,
                topics: g.topics.map((t) => {
                  if (t.id === topicId) {
                    newCompleted = !t.completed;
                    return { ...t, completed: newCompleted };
                  }
                  return t;
                }),
              }
            : g
        )
      );
      if (user) {
        await supabase.from('topics').update({ completed: newCompleted }).eq('id', topicId);
      }
    },
    [user]
  );

  const deleteTopic = useCallback(
    async (subject: Subject, topicId: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.subject === subject ? { ...g, topics: g.topics.filter((t) => t.id !== topicId) } : g
        )
      );
      if (user) await supabase.from('topics').delete().eq('id', topicId);
    },
    [user]
  );

  // ----- Queries -----
  const getSessionsBySubject = useCallback(
    (subject: Subject) => sessions.filter((s) => s.subject === subject),
    [sessions]
  );

  const getSessionsByDate = useCallback(
    (date: string) => sessions.filter((s) => s.date === date),
    [sessions]
  );

  const getWeeklyHours = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return (
      sessions
        .filter((s) => new Date(s.date) >= startOfWeek)
        .reduce((total, s) => total + s.duration, 0) / 60
    );
  }, [sessions]);

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

  const getStreak = useCallback(() => {
    if (sessions.length === 0) return 0;
    const sortedDates = [...new Set(sessions.map((s) => s.date))].sort(
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

  const resetAllData = useCallback(async () => {
    setSessions([]);
    setGoals([]);
    if (user) {
      await supabase.from('study_sessions').delete().eq('user_id', user.id);
      await supabase.from('topics').delete().eq('user_id', user.id);
      await supabase.from('subject_goals').delete().eq('user_id', user.id);
      await supabase.from('subjects').delete().eq('user_id', user.id);
    }
  }, [user]);

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

  const exportData = useCallback(() => {
    return JSON.stringify({ sessions, goals, subjects }, null, 2);
  }, [sessions, goals, subjects]);

  const importData = useCallback(
    async (jsonString: string) => {
      try {
        const data = JSON.parse(jsonString);
        if (data.sessions) setSessions(data.sessions);
        if (data.goals) setGoals(data.goals);

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
    },
    [user]
  );

  return {
    // Subject management (delegated)
    subjects,
    subjectsLoaded: subjectsApi.isLoaded,
    addSubject: subjectsApi.addSubject,
    updateSubject: subjectsApi.updateSubject,
    deleteSubject: subjectsApi.deleteSubject,
    getSubjectBySlug: subjectsApi.getSubjectBySlug,

    // Sessions / topics / notes
    sessions,
    goals,
    isLoaded,
    addSession,
    updateSession,
    deleteSession,
    updateSubjectNotes,
    addTopic,
    toggleTopic,
    deleteTopic,
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
