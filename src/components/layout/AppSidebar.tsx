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
} from 'lucide-react';
import { SUBJECTS, Subject } from '@/types/study';
import { useAuth } from '@/contexts/AuthContext';
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

const subjectIcons: Record<Subject, string> = {
  physics: '⚛️',
  math: '📐',
  electronics: '🔧',
  chemistry: '🧪',
  english: '📚',
  zulu: '🌍',
};

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
  const isCollapsed = state === 'collapsed';

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
          {!isCollapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4 mb-2">Main</SidebarGroupLabel>}
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
          {!isCollapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4 mb-2">Subjects</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {SUBJECTS.map((subject) => (
                <SidebarMenuItem key={subject.id}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={`/subject/${subject.id}`}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                        )
                      }
                    >
                      <span className="text-base flex-shrink-0">{subjectIcons[subject.id]}</span>
                      {!isCollapsed && <span>{subject.name}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup className="mt-4">
          {!isCollapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4 mb-2">Tools</SidebarGroupLabel>}
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
        {/* User Info */}
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.email}
              </p>
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

          {/* Logout Button */}
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
    </Sidebar>
  );
}
