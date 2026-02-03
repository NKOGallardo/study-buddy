import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save } from 'lucide-react';
import { useStudy } from '@/contexts/StudyContext';
import { SUBJECTS, Subject, SUBJECT_TEXT_COLORS } from '@/types/study';
import { QuickAddSession } from '@/components/study/QuickAddSession';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SubjectPage = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const subject = SUBJECTS.find((s) => s.id === subjectId) || SUBJECTS[0];
  const {
    goals,
    getSessionsBySubject,
    updateSubjectNotes,
    addTopic,
    toggleTopic,
    deleteTopic,
    deleteSession,
    weeklyGoals,
    getWeeklyHoursBySubject,
  } = useStudy();

  const subjectGoal = goals.find((g) => g.subject === subject.id);
  const sessions = getSessionsBySubject(subject.id as Subject);
  const weeklyHours = getWeeklyHoursBySubject(subject.id as Subject);
  const goal = weeklyGoals[subject.id as Subject];
  const progress = Math.min((weeklyHours / goal) * 100, 100);

  const [newTopic, setNewTopic] = useState('');
  const [notes, setNotes] = useState(subjectGoal?.notes || '');
  const [notesSaved, setNotesSaved] = useState(true);

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      addTopic(subject.id as Subject, newTopic.trim());
      setNewTopic('');
    }
  };

  const handleSaveNotes = () => {
    updateSubjectNotes(subject.id as Subject, notes);
    setNotesSaved(true);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{subject.icon}</span>
          <div>
            <h1 className={cn("text-3xl font-bold", SUBJECT_TEXT_COLORS[subject.id as Subject])}>
              {subject.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {weeklyHours.toFixed(1)}h / {goal}h this week ({progress.toFixed(0)}%)
            </p>
          </div>
        </div>
        <QuickAddSession defaultSubject={subject.id as Subject} />
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500", `bg-${subject.color}`)}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes Section */}
        <Card className="shadow-notion border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">📝 Notes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveNotes}
              disabled={notesSaved}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {notesSaved ? 'Saved' : 'Save'}
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write your study notes, formulas, key concepts..."
              className="min-h-[200px] resize-none border-0 bg-muted/30 focus-visible:ring-1"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setNotesSaved(false);
              }}
            />
          </CardContent>
        </Card>

        {/* Topics Checklist */}
        <Card className="shadow-notion border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">✅ Topics to Study</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a topic..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
              />
              <Button onClick={handleAddTopic} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {subjectGoal?.topics.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No topics added yet. Start adding topics to track!
                </p>
              )}
              {subjectGoal?.topics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <Checkbox
                    checked={topic.completed}
                    onCheckedChange={() => toggleTopic(subject.id as Subject, topic.id)}
                  />
                  <span
                    className={cn(
                      'flex-1',
                      topic.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {topic.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => deleteTopic(subject.id as Subject, topic.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Sessions Table */}
      <Card className="shadow-notion border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">📊 Study Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No study sessions recorded for {subject.name}.</p>
              <p className="text-sm mt-1">Add your first session to start tracking!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Mood</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {format(new Date(session.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{session.topic}</TableCell>
                      <TableCell>{session.duration} min</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            session.difficulty === 'easy' && 'bg-green-100 text-green-700',
                            session.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700',
                            session.difficulty === 'hard' && 'bg-red-100 text-red-700'
                          )}
                        >
                          {session.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {session.mood === 'good' && '😊'}
                        {session.mood === 'tired' && '😴'}
                        {session.mood === 'stressed' && '😰'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={session.status === 'done' ? 'default' : 'secondary'}>
                          {session.status === 'done' ? '✅ Done' : '🔄 In Progress'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteSession(session.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectPage;
