import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useStudy } from '@/contexts/StudyContext';
import { SubjectIcon } from '@/components/subjects/SubjectIcon';
import { Search as SearchIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const { sessions, goals, getSubjectBySlug } = useStudy();
  const navigate = useNavigate();

  const searchResults = query.trim()
    ? {
        sessions: sessions.filter(
          (s) =>
            s.topic.toLowerCase().includes(query.toLowerCase()) ||
            s.subject.toLowerCase().includes(query.toLowerCase())
        ),
        topics: goals.flatMap((g) =>
          g.topics
            .filter((t) => t.text.toLowerCase().includes(query.toLowerCase()))
            .map((t) => ({ ...t, subject: g.subject }))
        ),
        notes: goals.filter(
          (g) =>
            g.notes.toLowerCase().includes(query.toLowerCase()) && g.notes.length > 0
        ),
      }
    : null;

  const totalResults = searchResults
    ? searchResults.sessions.length + searchResults.topics.length + searchResults.notes.length
    : 0;

  const renderSubjectChip = (slug: string) => {
    const subject = getSubjectBySlug(slug);
    return (
      <span
        className="h-5 w-5 rounded flex items-center justify-center text-white"
        style={{ backgroundColor: subject ? `hsl(${subject.color})` : 'hsl(var(--muted))' }}
      >
        <SubjectIcon name={subject?.icon || 'BookOpen'} className="h-3 w-3" />
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-1">Find sessions, topics, and notes</p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for topics, sessions, notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 h-12 text-lg"
          autoFocus
        />
      </div>

      {searchResults && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
          </p>

          {searchResults.sessions.length > 0 && (
            <Card className="shadow-notion border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-medium">📊 Study Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {searchResults.sessions.map((session) => {
                  const subject = getSubjectBySlug(session.subject);
                  return (
                    <div
                      key={session.id}
                      className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/subject/${session.subject}`)}
                    >
                      <div className="flex items-center gap-2">
                        {renderSubjectChip(session.subject)}
                        <span className="font-medium">{session.topic}</span>
                        <span className="text-sm text-muted-foreground ml-auto">
                          {format(new Date(session.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {session.duration} min • {subject?.name || session.subject}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {searchResults.topics.length > 0 && (
            <Card className="shadow-notion border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-medium">✅ Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {searchResults.topics.map((topic) => {
                  const subject = getSubjectBySlug(topic.subject);
                  return (
                    <div
                      key={topic.id}
                      className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/subject/${topic.subject}`)}
                    >
                      <div className="flex items-center gap-2">
                        {renderSubjectChip(topic.subject)}
                        <span className={topic.completed ? 'line-through text-muted-foreground' : ''}>
                          {topic.text}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {subject?.name || topic.subject}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {searchResults.notes.length > 0 && (
            <Card className="shadow-notion border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-medium">📝 Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {searchResults.notes.map((goal) => {
                  const subject = getSubjectBySlug(goal.subject);
                  return (
                    <div
                      key={goal.subject}
                      className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/subject/${goal.subject}`)}
                    >
                      <div className="flex items-center gap-2">
                        {renderSubjectChip(goal.subject)}
                        <span className="font-medium">{subject?.name || goal.subject}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.notes}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {totalResults === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try searching for different keywords</p>
            </div>
          )}
        </div>
      )}

      {!searchResults && (
        <div className="text-center py-12 text-muted-foreground">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Start typing to search</p>
          <p className="text-sm mt-1">Search through your sessions, topics, and notes</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
