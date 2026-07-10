import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Trophy, Flag, Users, ArrowRight } from 'lucide-react';
import { ownerApi } from '@/api/ownerApi';
import { toast } from 'sonner';

const statusColor = {
  PUBLISHED: 'bg-green-100 text-green-700',
  DRAFT: 'bg-blue-100 text-blue-700',
  COMPLETE: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function OwnerHome() {
  const [tournaments, setTournaments] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ jockeys: 0, tournaments: 0, races: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentsRes, racesRes, activeTournamentsRes, usersRes] = await Promise.all([
          ownerApi.getAllTournaments(),
          ownerApi.getUpcomingRaces(),
          ownerApi.getFeaturedTournaments(),
          ownerApi.getAllUsers()
        ]);
        
        const totalRaces = (racesRes || []).length;
        const activeTournamentsCount = (activeTournamentsRes || []).length;
        const activeJockeysCount = (usersRes || []).filter(u => u.role?.toUpperCase() === 'JOCKEY' && u.status?.toUpperCase() === 'ACTIVE').length;
        setStats({ jockeys: activeJockeysCount, tournaments: activeTournamentsCount, races: totalRaces });

        // Take top 3 active tournaments
        const activeT = (tournamentsRes || []).filter(t => t.status === 'PUBLISHED');
        setTournaments(activeT.slice(0, 3));
        
        // Filter upcoming/scheduled races and take top 5
        const upcomingRaces = (racesRes || [])
          .filter(r => r.status === 'SCHEDULED' || r.status === 'PENDING_REFEREE')
          .slice(0, 5);
        setRaces(upcomingRaces);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
      {/* Hero */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">Horse Racing Tournament Portal</h1>
        <p className="text-gray-500 text-base max-w-xl">
          Track tournaments, race schedules, and jockey performance across the entire system.
        </p>
        <div className="flex gap-3 pt-1">
          <Link href="/owner-home/tournaments" className="h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-slate-900 text-white hover:bg-slate-900/90 cursor-pointer">
            View Tournaments
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-gray-200 py-6">
        {[
          { icon: Users, label: 'Jockeys', value: stats.jockeys },
          { icon: Trophy, label: 'Active Tournaments', value: stats.tournaments },
          { icon: Flag, label: 'Total Races', value: stats.races },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tournaments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Featured Tournaments</h2>
          <Link href="/owner-home/tournaments" className="text-sm text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y border rounded-lg overflow-hidden bg-white">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : tournaments.length > 0 ? (
            tournaments.map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">Start date: {t.start_date || t.date || 'TBD'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link href={`/owner-home/tournaments/${t.id}`} className="text-xs text-blue-600 hover:underline cursor-pointer">
                    Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No active tournaments found.</div>
          )}
        </div>
      </section>

      {/* Upcoming Races */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Races</h2>
        </div>
        <div className="divide-y border rounded-lg overflow-hidden bg-white">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : races.length > 0 ? (
            races.map(r => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-400">Tournament ID: {r.tournament_id} · {r.date} · {r.distance_m ? `${r.distance_m}m` : ''}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href={`/owner-home/races/${r.id}`} className="text-xs text-blue-600 hover:underline cursor-pointer">
                    Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No upcoming races found.</div>
          )}
        </div>
      </section>
    </div>
  );
}
