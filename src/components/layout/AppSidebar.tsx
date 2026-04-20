import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  Search,
  Timer,
  LogOut,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SubjectIcon } from '@/components/subjects/SubjectIcon';
import { SubjectDialog } from '@/components/subjects/SubjectDialog';
import { toast } from 'sonner';

const mainNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Calendar', url: '/calendar', icon: Calendar },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
];

const toolsItems = [
  { title: 'Pomodoro Timer', url: '/pomodoro', icon: Timer },
  { title: 'Search', url: '/search', icon: Search },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const { subjects, addSubject } = useStudy();
  const isCollapsed = state === 'collapsed';
  const [createOpen, setCreateOpen] = useState(false);

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">S</span>
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg text-sidebar-foreground">StudyTrack</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4 mb-2">
              Main
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Subjects */}
        <SidebarGroup className="mt-4">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-4 mb-2">
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground p-0 h-auto">
                Subjects
              </SidebarGroupLabel>
              <button
                onClick={() => setCreateOpen(true)}
                className="text-muted-foreground hover:text-sidebar-foreground transition-colors"
                aria-label="Add subject"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {subjects.length === 0 && !isCollapsed && (
                <div className="px-4 py-2">
                  <button
                    onClick={() => setCreateOpen(true)}
                    className="text-xs text-muted-foreground hover:text-sidebar-foreground text-left"
                  >
                    No subjects yet — click + to add one
                  </button>
                </div>
              )}
              {subjects.length === 0 && isCollapsed && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => setCreateOpen(true)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 w-full"
                      aria-label="Add subject"
                    >
                      <Plus className="h-4 w-4 flex-shrink-0" />
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {subjects.map((subject) => (
                <SidebarMenuItem key={subject.id}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={`/subject/${subject.slug}`}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                        )
                      }
                    >
                      <span
                        className="h-5 w-5 rounded flex items-center justify-center flex-shrink-0 text-white"
                        style={{ backgroundColor: `hsl(${subject.color})` }}
                      >
                        <SubjectIcon name={subject.icon} className="h-3 w-3" />
                      </span>
                      {!isCollapsed && <span className="truncate">{subject.name}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup className="mt-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4 mb-2">
              Tools
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )
                }
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                onClick={signOut}
                className="w-full justify-start gap-3 px-4 py-2 h-auto text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {!isCollapsed && (
          <>
            <SidebarTrigger className="mt-2 w-full justify-start px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg">
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </SidebarTrigger>
            <div className="mt-4 pt-3 border-t border-sidebar-border">
              <a
                href="https://nkogallardo.link"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Created by NKOgallardo.link
              </a>
            </div>
          </>
        )}
      </SidebarFooter>

      <SubjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (values) => {
          const created = await addSubject(values.name, values.icon, values.color, values.weeklyGoal);
          if (created) toast.success(`Created "${values.name}"`);
        }}
      />
    </Sidebar>
  );
}
