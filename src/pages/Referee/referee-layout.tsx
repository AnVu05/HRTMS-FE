import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Trophy, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { authApi } from '@/services/auth.service';
import { toast } from 'sonner';

function NavLinks({ onClick }: { onClick?: () => void }) {
  const [location] = useLocation();
  const rolePrefix = '/referee';

  const activeNavItems = [
    { href: `${rolePrefix}/home`, label: 'Home' },
    { href: `${rolePrefix}/jockeys`, label: 'Jockeys' },
    { href: `${rolePrefix}/tournaments`, label: 'Tournaments' },
    { href: `${rolePrefix}/races`, label: 'Race Schedule' },
  ];

  return (
    <>
      {activeNavItems.map((item) => {
        const isHomePath = item.href === '/referee/home';
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

export function RefereeLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const role = 'referee';
  const profilePath = '/referee/profile';

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

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/referee/home">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="portal-logo">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-bold tracking-tight leading-none text-foreground">HRTMS</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Referee Portal</span>
                </div>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <NavLinks />
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
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
