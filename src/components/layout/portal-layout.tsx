import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Trophy, Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { jockeyService } from '@/services/jockey.service';

const MOCK_NOTIFICATIONS = [
  {
    id: 201,
    title: "Tournament Updated",
    content: "The Hanoi Grand Prix tournament schedule has been updated. Please review the new times.",
    type: "TOURNAMENT_UPDATE",
    status: "UNREAD",
    created_at: "2026-07-10T08:12:16.379Z"
  },
  {
    id: 202,
    title: "Certificate Rejected",
    content: "Your Medical clearance certificate was rejected because the image was blurry. Please upload again.",
    type: "REJECT_CERTIFICATE",
    status: "UNREAD",
    created_at: "2026-07-09T11:00:00.000Z"
  },
  {
    id: 203,
    title: "Registration Approved",
    content: "Congratulations! Your registration for Race #3 has been verified by the Admin.",
    type: "REGISTRATION_APPROVED",
    status: "READ",
    created_at: "2026-07-08T15:45:00.000Z"
  }
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const [location] = useLocation();

  // Detect active role prefix
  let rolePrefix = '/portal';
  if (location.startsWith('/portal/jockey/')) {
    rolePrefix = '/portal/jockey';
  } else if (location.startsWith('/portal/referee/')) {
    rolePrefix = '/portal/referee';
  } else if (location.startsWith('/portal/spectator/')) {
    rolePrefix = '/portal/spectator';
  }

  const activeNavItems = [
    { href: rolePrefix === '/portal' ? '/portal' : `${rolePrefix}/home`, label: 'Home' },
    { href: `${rolePrefix}/jockeys`, label: 'Jockeys' },
    { href: `${rolePrefix}/tournaments`, label: 'Tournaments' },
    { href: `${rolePrefix}/races`, label: 'Race Schedule' },
  ];

  return (
    <>
      {activeNavItems.map((item) => {
        const isHomePath = item.href === '/portal' || item.href === '/portal/jockey/home' || item.href === '/portal/referee/home' || item.href === '/portal/spectator/home';
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

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [notifications, setNotifications] = useState<any[]>([]);

  let role: 'jockey' | 'referee' | 'spectator' | null = null;
  let profilePath = '';

  if (location.startsWith('/portal/jockey/')) {
    role = 'jockey';
    profilePath = '/portal/jockey/profile';
  } else if (location.startsWith('/portal/referee/')) {
    role = 'referee';
    profilePath = '/portal/referee/profile';
  } else if (location.startsWith('/portal/spectator/')) {
    role = 'spectator';
    profilePath = '/portal/spectator/profile';
  }

  useEffect(() => {
    if (role === 'jockey') {
      const jockeyId = Number(localStorage.getItem('jockey_id') || '1');
      jockeyService.getNotifications(jockeyId, 0, 100)
        .then(response => {
          const notifData = response.data?.content || response.content || [];
          const others = notifData.filter((n: any) => n.type !== 'JOCKEY_INVITATION');
          setNotifications(others.length > 0 ? others : MOCK_NOTIFICATIONS);
        })
        .catch(() => {
          setNotifications(MOCK_NOTIFICATIONS);
        });
    }
  }, [role, location]);

  const handleLogout = () => {
    setLocation('/portal');
  };

  const notificationBell = role === 'jockey' ? (
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
  ) : null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=2s">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="portal-logo">
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
            <div className="hidden sm:flex items-center gap-2">
              {notificationBell}
              {role ? (
                <>
                  <Link href={profilePath}>
                    <Button variant="ghost" size="sm" className="font-medium">Trang cá nhân</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="font-medium">Đăng xuất</Button>
                </>
              ) : (
                <>
                  <Link href="/portal/login">
                    <Button variant="outline" size="sm" data-testid="portal-nav-login">Login</Button>
                  </Link>
                  <Link href="/portal/register">
                    <Button size="sm" data-testid="portal-nav-register">Register</Button>
                  </Link>
                </>
              )}
            </div>
            {notificationBell && <div className="flex sm:hidden">{notificationBell}</div>}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="portal-mobile-menu">
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
                    {role ? (
                      <>
                        <Link href={profilePath}>
                          <Button variant="ghost" className="w-full justify-start font-medium">Trang cá nhân</Button>
                        </Link>
                        <Button variant="outline" className="w-full justify-start font-medium" onClick={handleLogout}>Đăng xuất</Button>
                      </>
                    ) : (
                      <>
                        <Link href="/portal/login">
                          <Button variant="outline" className="w-full justify-start" data-testid="portal-mobile-login">Login</Button>
                        </Link>
                        <Link href="/portal/register">
                          <Button className="w-full justify-start" data-testid="portal-mobile-register">Register</Button>
                        </Link>
                      </>
                    )}
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
