import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Trophy, Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { jockeyService } from '@/services/jockey.service';
import { authApi } from '@/services/auth.service';
import { toast } from 'sonner';

function NavLinks({ onClick }: { onClick?: () => void }) {
  const [location] = useLocation();
  const rolePrefix = '/jockey';

  const activeNavItems = [
    { href: `${rolePrefix}/home`, label: 'Home' },
    { href: `${rolePrefix}/jockeys`, label: 'Jockeys' },
    { href: `${rolePrefix}/tournaments`, label: 'Tournaments' },
    { href: `${rolePrefix}/races`, label: 'Race Schedule' },
  ];

  return (
    <>
      {activeNavItems.map((item) => {
        const isHomePath = item.href === '/jockey/home';
        const isActive = location === item.href || (!isHomePath && location.startsWith(item.href + '/'));
        return (
          <Link key={item.href} href={item.href} onClick={onClick}>
            <div
              data-testid={`portal-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
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

export function JockeyLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [notifications, setNotifications] = useState<any[]>([]);

  const role = 'jockey';
  const profilePath = '/jockey/profile';

  useEffect(() => {
    const jockeyId = Number(localStorage.getItem('user_id') || '1');
    jockeyService.getNotifications(jockeyId, 0, 100)
      .then(response => {
        const notifData = response.data?.content || response.content || [];
        const others = notifData.filter((n: any) => n.type !== 'JOCKEY_INVITATION');
        setNotifications(others);
      })
      .catch(() => {
        setNotifications([]);
      });
  }, [location]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_id");
      toast.success('Đăng xuất thành công!');
      setLocation('/portal');
    }
  };

  const notificationBell = (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {notifications.filter(n => n.status === 'UNREAD').length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Jockey Notifications
          </DialogTitle>
          <DialogDescription>
            Here are your updates and system notifications.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3 my-2">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">No notifications found.</p>
          ) : (
            notifications.map((n: any) => (
              <div key={n.id} className="p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-900">{n.title}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.created_at || n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">{n.content}</p>
                <div className="flex items-center justify-between">
                  <Badge className="text-[9px] uppercase tracking-wider bg-slate-200 text-slate-700 hover:bg-slate-200">
                    {n.type}
                  </Badge>
                  {n.status === 'UNREAD' && (
                    <Badge className="text-[9px] bg-blue-500/20 text-blue-700 hover:bg-blue-500/20">
                      Unread
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/jockey/home">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="portal-logo">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-bold tracking-tight leading-none text-foreground">HRTMS</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Jockey Portal</span>
                </div>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <NavLinks />
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              {notificationBell}
              <Link href={profilePath}>
                <Button variant="ghost" size="sm" className="font-medium">Profile</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="font-medium">Đăng xuất</Button>
            </div>
            
            {/* Mobile Nav */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="text-left border-b pb-4 mb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" /> HRTMS
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2">
                  <NavLinks />
                  <div className="h-px bg-slate-100 my-4"></div>
                  <Link href={profilePath}>
                    <Button className="w-full justify-start font-medium" variant="ghost">Profile</Button>
                  </Link>
                  <Button onClick={handleLogout} className="w-full justify-start font-medium text-red-600 hover:text-red-700 hover:bg-red-50" variant="ghost">Đăng xuất</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50/50">
        {children}
      </main>
    </div>
  );
}
