import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Stethoscope, Bell, LogOut } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import doctorApi from '@/api/doctorApi';
import { authApi } from '@/api/authApi';
import { ScrollArea } from '@/components/ui/scroll-area';

const doctorMenuItems = [
  { title: "Health Checking", url: "/doctor/health-check", icon: Stethoscope },
];

export function DoctorLayout({ children }) {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const doctorId = localStorage.getItem("user_id");

  const { data: notificationsPage } = useQuery({
    queryKey: ['doctorNotifications', doctorId],
    queryFn: () => doctorApi.getNotifications(doctorId)
  });

  const notifications = notificationsPage?.content || [];

  const handleMarkAllRead = () => {
    doctorApi.markAllNotificationsRead(doctorId).then(() => {
      queryClient.invalidateQueries({ queryKey: ['doctorNotifications', doctorId] });
    });
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_id');
      window.location.href = '/login';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup className="pt-2">
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {doctorMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location === item.url || location === '/doctor'}>
                        <Link href={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full justify-start cursor-pointer">
                  <button onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-y-auto bg-muted/20">
          <header className="flex h-14 items-center justify-between border-b bg-background px-6">
            <h1 className="text-lg font-semibold capitalize">
              {doctorMenuItems.find(item => item.url === location)?.title || "Dashboard"}
            </h1>
            <div className="flex items-center gap-4">
              <Popover onOpenChange={(open) => {
                if (open) {
                  handleMarkAllRead();
                }
              }}>
                <PopoverTrigger asChild>
                  <button className="relative p-2 hover:bg-accent rounded-full transition-colors">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {notifications.filter(n => !n.isRead && n.status === 'UNREAD').length > 0 && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                        {notifications.filter(n => !n.isRead && n.status === 'UNREAD').length}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                  </div>
                  <ScrollArea className="h-80">
                    <div className="flex flex-col">
                      {notifications.map(notification => (
                        <div key={notification.id} className={`flex flex-col gap-1 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer ${notification.status === 'UNREAD' || !notification.isRead ? 'bg-muted/20' : ''}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{notification.title}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{notification.content}</span>
                          <span className="text-xs text-muted-foreground/80 mt-1">{notification.createdAt}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <span className="text-sm font-medium">DR</span>
              </div>
            </div>
          </header>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
