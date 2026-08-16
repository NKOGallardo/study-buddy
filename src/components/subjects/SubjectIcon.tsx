import { icons, BookOpen, LucideProps } from 'lucide-react';

interface SubjectIconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

export function SubjectIcon({ name, ...props }: SubjectIconProps) {
  const Icon = (icons as Record<string, typeof BookOpen>)[name] || BookOpen;
  return <Icon {...props} />;
}
