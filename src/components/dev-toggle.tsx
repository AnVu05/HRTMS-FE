import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Settings, X, ShieldAlert, Award, User, Flame, Compass } from 'lucide-react';
import { Button } from './ui/button';

export function DevToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();

  // Only render during development or if explicitly allowed
  if (import.meta.env.PROD) {
    return null;
  }

  const routes = [
    {
      group: 'Auth',
      icon: ShieldAlert,
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
      items: [
        { label: 'Login', path: '/portal/login' },
        { label: 'Register', path: '/portal/register' },
      ],
    },
    {
      group: 'Guest / Vãng Lai',
      icon: Compass,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      items: [
        { label: 'Home', path: '/portal' },
        { label: 'Tournaments', path: '/portal/tournaments' },
        { label: 'Races', path: '/portal/races' },
        { label: 'Jockeys list', path: '/portal/jockeys' },
      ],
    },
    {
      group: 'Jockey Portal',
      icon: Flame,
      color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      items: [
        { label: 'Home', path: '/portal/jockey/home' },
        { label: 'Profile', path: '/portal/jockey/profile' },
        { label: 'Tournaments', path: '/portal/jockey/tournaments' },
        { label: 'Races', path: '/portal/jockey/races' },
        { label: 'Jockeys list', path: '/portal/jockey/jockeys' },
      ],
    },
    {
      group: 'Referee Portal',
      icon: Award,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      items: [
        { label: 'Home', path: '/portal/referee/home' },
        { label: 'Profile', path: '/portal/referee/profile' },
        { label: 'Tournaments', path: '/portal/referee/tournaments' },
        { label: 'Races', path: '/portal/referee/races' },
        { label: 'Jockeys list', path: '/portal/referee/jockeys' },
      ],
    },
    {
      group: 'Spectator Portal',
      icon: User,
      color: 'text-green-500 bg-green-500/10 border-green-500/20',
      items: [
        { label: 'Home', path: '/portal/spectator/home' },
        { label: 'Profile', path: '/portal/spectator/profile' },
        { label: 'Tournaments', path: '/portal/spectator/tournaments' },
        { label: 'Races', path: '/portal/spectator/races' },
        { label: 'Jockeys list', path: '/portal/spectator/jockeys' },
      ],
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 font-sans">
      {isOpen && (
        <div className="bg-background border rounded-lg shadow-2xl p-4 w-80 max-h-[80vh] overflow-y-auto flex flex-col gap-4 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-bold text-sm tracking-tight flex items-center gap-1.5 text-foreground">
              <Settings className="w-4 h-4 text-primary" />
              Developer Router Toggle
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {routes.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.group} className="flex flex-col gap-1.5">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold border ${group.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{group.group}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pl-1">
                    {group.items.map((route) => {
                      const isActive = location === route.path;
                      return (
                        <button
                          key={route.path}
                          onClick={() => {
                            setLocation(route.path);
                          }}
                          className={`text-left text-xs px-2.5 py-1.5 rounded transition-all truncate border ${
                            isActive
                              ? 'bg-primary text-primary-foreground font-semibold border-primary shadow-sm'
                              : 'bg-muted/40 hover:bg-muted/90 text-muted-foreground border-transparent'
                          }`}
                        >
                          {route.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Button
        size="icon"
        className="h-10 w-10 rounded-full shadow-lg border"
        variant={isOpen ? 'outline' : 'default'}
        onClick={() => setIsOpen(!isOpen)}
        title="Developer Route Toggle"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
      </Button>
    </div>
  );
}
