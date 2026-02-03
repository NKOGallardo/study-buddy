import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Menu } from 'lucide-react';

const quotes = [
  "The only way to do great work is to love what you do. – Steve Jobs",
  "Education is the passport to the future. – Malcolm X",
  "The beautiful thing about learning is that no one can take it away from you. – B.B. King",
  "Success is the sum of small efforts repeated day in and day out. – Robert Collier",
  "The more that you read, the more things you will know. – Dr. Seuss",
  "Study hard what interests you the most. – Richard Feynman",
];

function getRandomQuote() {
  const today = new Date().toDateString();
  const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return quotes[hash % quotes.length];
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          {/* Top bar */}
          <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <SidebarTrigger className="p-2 hover:bg-accent rounded-lg transition-colors">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <p className="text-sm text-muted-foreground italic truncate flex-1">
              "{getRandomQuote()}"
            </p>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="container max-w-6xl mx-auto p-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
