import { useState, useEffect, useCallback } from 'react';
import { SubjectDefinition } from '@/types/study';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || `subject-${Date.now()}`;

export function useSubjects() {
  const { user, session } = useAuth();
  const [subjects, setSubjects] = useState<SubjectDefinition[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user || !session) {
      setSubjects([]);
      setIsLoaded(true);
      return;
    }

    const load = async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to load subjects:', error);
      }

      if (data) {
        setSubjects(
          data.map((s) => ({
            id: s.id,
            slug: s.slug,
            name: s.name,
            icon: s.icon,
            color: s.color,
            weeklyGoal: s.weekly_goal,
            sortOrder: s.sort_order,
          }))
        );
      }
      setIsLoaded(true);
    };

    load();
  }, [user, session]);

  const addSubject = useCallback(
    async (name: string, icon: string, color: string, weeklyGoal: number) => {
      if (!user) return null;

      // Generate unique slug
      let baseSlug = slugify(name);
      let slug = baseSlug;
      let suffix = 1;
      while (subjects.some((s) => s.slug === slug)) {
        suffix += 1;
        slug = `${baseSlug}-${suffix}`;
      }

      const sortOrder = subjects.length;

      const { data, error } = await supabase
        .from('subjects')
        .insert({
          user_id: user.id,
          name,
          slug,
          icon,
          color,
          weekly_goal: weeklyGoal,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to add subject:', error);
        return null;
      }

      const newSubject: SubjectDefinition = {
        id: data.id,
        slug: data.slug,
        name: data.name,
        icon: data.icon,
        color: data.color,
        weeklyGoal: data.weekly_goal,
        sortOrder: data.sort_order,
      };
      setSubjects((prev) => [...prev, newSubject]);
      return newSubject;
    },
    [user, subjects]
  );

  const updateSubject = useCallback(
    async (id: string, updates: Partial<Omit<SubjectDefinition, 'id' | 'slug' | 'sortOrder'>>) => {
      setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));

      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.weeklyGoal !== undefined) dbUpdates.weekly_goal = updates.weeklyGoal;

      const { error } = await supabase.from('subjects').update(dbUpdates).eq('id', id);
      if (error) console.error('Failed to update subject:', error);
    },
    []
  );

  const deleteSubject = useCallback(
    async (id: string) => {
      const subject = subjects.find((s) => s.id === id);
      if (!subject || !user) return;

      setSubjects((prev) => prev.filter((s) => s.id !== id));

      // Cascade delete sessions, topics, goals for this subject slug
      await Promise.all([
        supabase.from('subjects').delete().eq('id', id),
        supabase.from('study_sessions').delete().eq('user_id', user.id).eq('subject', subject.slug),
        supabase.from('topics').delete().eq('user_id', user.id).eq('subject', subject.slug),
        supabase.from('subject_goals').delete().eq('user_id', user.id).eq('subject', subject.slug),
      ]);
    },
    [subjects, user]
  );

  const getSubjectBySlug = useCallback(
    (slug: string) => subjects.find((s) => s.slug === slug),
    [subjects]
  );

  return {
    subjects,
    isLoaded,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectBySlug,
  };
}
