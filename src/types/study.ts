export type Subject = 'physics' | 'math' | 'electronics' | 'chemistry' | 'english' | 'zulu';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Mood = 'good' | 'tired' | 'stressed';
export type Status = 'done' | 'in-progress';

export interface StudySession {
  id: string;
  date: string;
  subject: Subject;
  topic: string;
  duration: number; // minutes
  difficulty: Difficulty;
  mood: Mood;
  status: Status;
  imageUrl?: string;
  createdAt: string;
}

export interface SubjectGoal {
  subject: Subject;
  weeklyGoal: number; // hours
  notes: string;
  topics: TopicItem[];
}

export interface TopicItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface WeeklyGoals {
  physics: number;
  math: number;
  electronics: number;
  chemistry: number;
  english: number;
  zulu: number;
}

export const SUBJECTS: { id: Subject; name: string; icon: string; color: string }[] = [
  { id: 'physics', name: 'Physics', icon: '⚛️', color: 'physics' },
  { id: 'math', name: 'Math', icon: '📐', color: 'math' },
  { id: 'electronics', name: 'Electronics', icon: '💡', color: 'electronics' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'chemistry' },
  { id: 'english', name: 'English', icon: '📚', color: 'english' },
  { id: 'zulu', name: 'Zulu', icon: '🌍', color: 'zulu' },
];

export const SUBJECT_COLORS: Record<Subject, string> = {
  physics: 'bg-physics',
  math: 'bg-math',
  electronics: 'bg-electronics',
  chemistry: 'bg-chemistry',
  english: 'bg-english',
  zulu: 'bg-zulu',
};

export const SUBJECT_TEXT_COLORS: Record<Subject, string> = {
  physics: 'text-physics',
  math: 'text-math',
  electronics: 'text-electronics',
  chemistry: 'text-chemistry',
  english: 'text-english',
  zulu: 'text-zulu',
};
