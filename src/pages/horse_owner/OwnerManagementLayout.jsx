import React, { useState, useEffect } from 'react';
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
import { LogOut, Bell, Navigation, List, Home } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ownerApi } from '@/api/ownerApi';
import { authApi } from '@/api/authApi';

const managementMenuItems = [
  { title: "Horse Management", url: "/owner-management/horses", icon: List },
  { title: "Registrations", url: "/owner-management/registrations", icon: Navigation },
];

export function OwnerManagementLayout({ children }) {
  const [location] = useLocation();

  const [notifications, setNotifications] = useState([]);
  const ownerId = localStorage.getItem("user_id");

  const fetchNotifications = async () => {
    try {
      if (!ownerId || ownerId === "null") return;
      const data = await ownerApi.getNotifications(ownerId);
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    if (!ownerId || ownerId === "null") {
      localStorage.clear();
      window.location.href = "/portal/login";
      return;
    }
    fetchNotifications();
  }, [ownerId]);

  const handleMarkAllRead = async () => {
    try {
      await ownerApi.markNotificationsAsRead(ownerId);
      setNotifications(notifications.map(n => ({ ...n, status: 'READ' })));
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
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
      window.location.href = '/portal/login';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup className="pt-2">
              <SidebarGroupLabel>Owner Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managementMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location === item.url}>
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
                <SidebarMenuButton asChild className="hover:bg-accent">
                  <Link href="/owner-home" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>Back to Portal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
              {managementMenuItems.find(item => item.url === location)?.title || "Management"}
            </h1>
            <div className="flex items-center gap-4">
              <Popover onOpenChange={(open) => {
                if (open) handleMarkAllRead();
              }}>
                <PopoverTrigger asChild>
                  <button className="relative p-2 hover:bg-accent rounded-full transition-colors">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {notifications.filter(n => n.status === 'UNREAD').length > 0 && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                        {notifications.filter(n => n.status === 'UNREAD').length}
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
                      {notifications.length > 0 ? notifications.map(notification => (
                        <div key={notification.notification_id || notification.id} className={`flex flex-col gap-1 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer ${notification.status === 'UNREAD' ? 'bg-muted/20' : ''}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{notification.title}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{notification.content}</span>
                          <span className="text-xs text-muted-foreground/80 mt-1">
                            {notification.created_at ? new Date(notification.created_at).toLocaleString() : notification.createdAt}
                          </span>
                        </div>
                      )) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium">OW</span>
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
