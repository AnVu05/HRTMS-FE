import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Trophy, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';

const navItems = [
  { href: '/portal', label: 'Home' },
  { href: '/portal/jockeys', label: 'Jockeys' },
  { href: '/portal/tournaments', label: 'Tournaments' },
  { href: '/portal/races', label: 'Race Schedule' },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const [location] = useLocation();

  return (
    <>
      {navItems.map((item) => {
        const isActive = location === item.href || (item.href !== '/portal' && location.startsWith(item.href + '/'));
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
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/portal">
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
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="portal-nav-admin">Admin Panel</Button>
              </Link>
              <Link href="/portal/profile">
                <Button variant="ghost" size="sm" data-testid="portal-nav-profile">My Profile</Button>
              </Link>
              <Link href="/portal/jockey-profile">
                <Button variant="ghost" size="sm" data-testid="portal-nav-jockey-profile">Jockey Profile</Button>
              </Link>

              <Link href="/portal/login">
                <Button variant="outline" size="sm" data-testid="portal-nav-login">Login</Button>
              </Link>
              <Link href="/portal/register">
                <Button size="sm" data-testid="portal-nav-register">Register</Button>
              </Link>
            </div>

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
                    <Link href="/">
                      <Button variant="ghost" className="w-full justify-start" data-testid="portal-mobile-admin">Admin Panel</Button>
                    </Link>
                    <Link href="/portal/profile">
                      <Button variant="ghost" className="w-full justify-start" data-testid="portal-mobile-profile">My Profile</Button>
                    </Link>
                    <Link href="/portal/jockey-profile">
                      <Button variant="ghost" className="w-full justify-start" data-testid="portal-mobile-jockey-profile">Jockey Profile</Button>
                    </Link>
                    <Link href="/portal/login">
                      <Button variant="outline" className="w-full justify-start" data-testid="portal-mobile-login">Login</Button>
                    </Link>
                    <Link href="/portal/register">
                      <Button className="w-full justify-start" data-testid="portal-mobile-register">Register</Button>
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
