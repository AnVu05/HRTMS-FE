import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Trophy, Menu, Bell, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ownerApi } from '@/api/ownerApi';
import { authApi } from '@/api/authApi';


const navItems = [
  { href: '/owner-home', label: 'Home' },
  { href: '/owner-home/jockeys', label: 'Jockeys' },
  { href: '/owner-home/tournaments', label: 'Tournaments' },
];

function NavLinks({ onClick }) {
  const [location] = useLocation();

  return (
    <>
      {navItems.map((item) => {
        const isActive = location === item.href || (item.href !== '/owner-home' && location.startsWith(item.href + '/'));
        return (
          <Link key={item.href} href={item.href} onClick={onClick}>
            <div
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary cursor-pointer px-3 py-2 rounded-md block",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              {item.label}
            </div>
          </Link>
        );
      })}
    </>
  );
}

export function OwnerLayout({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
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

  const fetchProfile = async () => {
    try {
      if (!ownerId) return;
      const response = await ownerApi.getProfile(ownerId);
      // The API response format is usually wrapped in data
      setProfile(response?.data || response || null);
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  useEffect(() => {
    if (!ownerId || ownerId === "null") {
      localStorage.clear();
      window.location.href = "/portal/login";
      return;
    }
    fetchNotifications();
    fetchProfile();
  }, [ownerId]);

  const handleMarkAllRead = async () => {
    try {
      await ownerApi.markNotificationsAsRead(ownerId);
      setNotifications(notifications.map(n => ({ ...n, status: 'READ' })));
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/owner-home">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-bold tracking-tight leading-none text-foreground">HRTMS</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Racing Portal</span>
                </div>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              <NavLinks />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Popover onOpenChange={(open) => {
              if (open) handleMarkAllRead();
            }}>
              <PopoverTrigger asChild>
                <button className="relative p-2 hover:bg-accent rounded-full transition-colors mr-2">
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

            <div className="hidden sm:flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-1">
                  <div className="flex flex-col">
                    <Link href="/owner-management/horses">
                      <Button variant="ghost" className="w-full justify-start text-sm font-medium">Management</Button>
                    </Link>
                    <Link href="/owner-home/profile">
                      <Button variant="ghost" className="w-full justify-start text-sm font-medium">Profile</Button>
                    </Link>
                    <div className="h-px bg-slate-200 my-1" />
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={async () => {
                        try {
                          await authApi.logout();
                        } catch (err) {
                          console.error("Logout API failed", err);
                        } finally {
                          localStorage.removeItem("user_id");
                          localStorage.removeItem("user_role");
                          localStorage.removeItem("access_token");
                          window.location.href = "/portal/login";
                        }
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-left">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <span>HRTMS Portal</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 py-6">
                  <nav className="flex flex-col gap-2">
                    <NavLinks />
                  </nav>
                  
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    <Link href="/owner-management/horses">
                      <Button className="w-full justify-start bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium shadow-sm">Management</Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full bg-slate-50/50">
        {children}
      </main>

      <footer className="border-t bg-muted/30">
        <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Elite Horse Racing Tournament Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
