import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Plus, BookOpen } from 'lucide-react';
import { useStudy } from '@/contexts/StudyContext';
import { SubjectDialog } from './SubjectDialog';
import { SubjectIcon } from './SubjectIcon';
import { SubjectDefinition } from '@/types/study';
import { toast } from 'sonner';

export function SubjectManager() {
  const { subjects, addSubject, updateSubject, deleteSubject } = useStudy();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectDefinition | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<SubjectDefinition | null>(null);

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (subject: SubjectDefinition) => {
    setEditing(subject);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: { name: string; icon: string; color: string; weeklyGoal: number }) => {
    if (editing) {
      await updateSubject(editing.id, values);
      toast.success(`Updated "${values.name}"`);
    } else {
      const created = await addSubject(values.name, values.icon, values.color, values.weeklyGoal);
      if (created) toast.success(`Created "${values.name}"`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteSubject(deleteTarget.id);
    toast.success(`Deleted "${deleteTarget.name}"`);
    setDeleteTarget(null);
  };

  return (
    <Card className="shadow-notion border-border/50">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          My Subjects
        </CardTitle>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Subject</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No subjects yet</p>
            <p className="text-sm mt-1">Click "Add Subject" to create your first one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: `hsl(${subject.color})` }}
                >
                  <SubjectIcon name={subject.icon} className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">{subject.weeklyGoal}h / week goal</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(subject)}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-destructive"
                  onClick={() => setDeleteTarget(subject)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <SubjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also remove all study sessions, topics, and goals for this subject.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
