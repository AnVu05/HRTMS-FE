import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Zap,
  Trophy,
  Flag,
  AlertTriangle,
  Heart,
  Bell,
  CheckCircle,
  Shield,
  Menu,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jockeys', label: 'Jockeys', icon: Users },
  { href: '/horses', label: 'Horses', icon: Zap },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/races', label: 'Races', icon: Flag },
  { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { href: '/medical', label: 'Medical', icon: Heart },
  { href: '/notifications', label: 'Notifications', icon: Bell, badge: 3 },
  { href: '/verifications', label: 'Verifications', icon: CheckCircle },
  { href: '/referees', label: 'Referees', icon: Shield },
];

function NavContent({ onClick }: { onClick?: () => void }) {
  const [location] = useLocation();

  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">HRTMS</h1>
              <p className="text-xs text-sidebar-foreground/70 font-medium">Racing Management</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={onClick}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer group",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground")} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                      isActive ? "bg-primary-foreground text-primary" : "bg-destructive text-destructive-foreground"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link href="/portal">
          <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer transition-colors">
            <Globe className="h-4 w-4 text-sidebar-foreground/50" />
            <span className="flex-1">User Portal</span>
          </div>
        </Link>
        <div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-sidebar-accent cursor-pointer transition-colors">
          <Avatar className="h-8 w-8 border border-sidebar-border">
            <AvatarFallback className="bg-primary/20 text-primary">AU</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">Admin User</span>
            <span className="text-xs text-sidebar-foreground/60">Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r border-sidebar-border bg-sidebar z-50">
        <NavContent />
      </aside>

      {/* Mobile Sidebar & Header */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r-sidebar-border">
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">HRTMS</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
