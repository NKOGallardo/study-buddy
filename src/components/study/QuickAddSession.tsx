import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useStudy } from '@/contexts/StudyContext';
import { Subject, Difficulty, Mood, Status } from '@/types/study';
import { SubjectIcon } from '@/components/subjects/SubjectIcon';

interface QuickAddSessionProps {
  defaultSubject?: Subject;
}

export function QuickAddSession({ defaultSubject }: QuickAddSessionProps) {
  const { addSession, subjects } = useStudy();
  const [open, setOpen] = useState(false);
  const initialSubject = defaultSubject || subjects[0]?.slug || '';
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: initialSubject,
    topic: '',
    duration: 30,
    difficulty: 'medium' as Difficulty,
    mood: 'good' as Mood,
    status: 'done' as Status,
  });

  // Keep subject in sync if subjects load after mount
  useEffect(() => {
    if (!formData.subject && subjects.length > 0) {
      setFormData((prev) => ({ ...prev, subject: defaultSubject || subjects[0].slug }));
    }
  }, [subjects, defaultSubject, formData.subject]);

  const noSubjects = subjects.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject) return;
    addSession(formData);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      subject: defaultSubject || subjects[0]?.slug || '',
      topic: '',
      duration: 30,
      difficulty: 'medium',
      mood: 'good',
      status: 'done',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={noSubjects}
          className="gap-2 shadow-notion hover:shadow-notion-hover transition-shadow w-full sm:w-auto"
          title={noSubjects ? 'Create a subject first' : undefined}
        >
          <Plus className="h-4 w-4" />
          <span className="sm:inline">
            {noSubjects ? 'Add a subject first' : 'Quick Add Session'}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Study Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.slug} value={s.slug}>
                      <span className="inline-flex items-center gap-2">
                        <SubjectIcon name={s.icon} className="h-3.5 w-3.5" style={{ color: `hsl(${s.color})` }} />
                        {s.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic Studied</Label>
            <Input
              id="topic"
              placeholder="e.g., Newton's Laws of Motion"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value as Difficulty })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">🟢 Easy</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="hard">🔴 Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mood">Mood</Label>
              <Select
                value={formData.mood}
                onValueChange={(value) => setFormData({ ...formData, mood: value as Mood })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">😊 Good</SelectItem>
                  <SelectItem value="tired">😴 Tired</SelectItem>
                  <SelectItem value="stressed">😰 Stressed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Status })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="done">✅ Done</SelectItem>
                  <SelectItem value="in-progress">🔄 In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Add Session
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
