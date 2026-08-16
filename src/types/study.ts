// Subject is now a dynamic slug string (per-user custom subjects)
export type Subject = string;

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Mood = 'good' | 'tired' | 'stressed';
export type Status = 'done' | 'in-progress';

export interface SubjectDefinition {
  id: string;
  slug: string;
  name: string;
  icon: string; // Lucide icon name e.g. "Atom"
  color: string; // HSL components e.g. "217 91% 60%"
  weeklyGoal: number;
  sortOrder: number;
}

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
  weeklyGoal: number;
  notes: string;
  topics: TopicItem[];
}

export interface TopicItem {
  id: string;
  text: string;
  completed: boolean;
}

// Study Reminders
export interface StudyReminder {
  id: string;
  subject: Subject | 'any';
  time: string; // HH:MM format
  days: number[];
  message: string;
  enabled: boolean;
  createdAt: string;
}

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun', full: 'Sunday' },
  { value: 1, label: 'Mon', full: 'Monday' },
  { value: 2, label: 'Tue', full: 'Tuesday' },
  { value: 3, label: 'Wed', full: 'Wednesday' },
  { value: 4, label: 'Thu', full: 'Thursday' },
  { value: 5, label: 'Fri', full: 'Friday' },
  { value: 6, label: 'Sat', full: 'Saturday' },
];

// Curated icon set for the subject picker
export const SUBJECT_ICONS = [
  'Atom', 'Calculator', 'Wrench', 'FlaskConical', 'BookOpen', 'Globe',
  'Code', 'Music', 'Palette', 'Dumbbell', 'Brain', 'Microscope',
  'Languages', 'PenTool', 'Camera', 'Film', 'Heart', 'Leaf',
  'Rocket', 'Stethoscope', 'Scale', 'Briefcase', 'Hammer', 'Cpu',
  'Telescope', 'Pi', 'Sigma', 'Pencil', 'Map', 'Lightbulb',
];

// Curated color palette (HSL components)
export const SUBJECT_COLORS = [
  '217 91% 60%', // blue
  '142 71% 45%', // green
  '271 91% 65%', // purple
  '25 95% 53%',  // orange
  '340 82% 52%', // pink
  '199 89% 48%', // sky
  '0 84% 60%',   // red
  '47 96% 53%',  // yellow
  '173 80% 40%', // teal
  '262 83% 58%', // violet
];
