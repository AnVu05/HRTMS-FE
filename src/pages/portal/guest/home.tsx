import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Trophy, Flag, Users, ArrowRight, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ownerApi } from '@/services/owner.service';
import { jockeyService } from '@/services/jockey.service';

const statusColor: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Upcoming: 'bg-blue-100 text-blue-700',
  Completed: 'bg-gray-100 text-gray-700',
};

export default function PortalHome() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [jockeys, setJockeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const tRes = await ownerApi.getFeaturedTournaments();
      const tList = tRes.data || tRes || [];
      if (Array.isArray(tList)) {
        setTournaments(tList.slice(0, 3).map((t: any) => ({
          id: String(t.id),
          name: t.name,
          location: t.location || 'Vietnam',
          status: t.status === 'ACTIVE' ? 'Active' : t.status === 'UPCOMING' ? 'Upcoming' : 'Completed',
          
          date: t.start_date && t.end_date ? `${t.start_date} - ${t.end_date}` : 'TBD',
          races: t.raceCount || 8
        })));
      } else {
        setTournaments([]);
      }

      const rRes = await ownerApi.getUpcomingRaces();
      const rList = rRes.data || rRes || [];
      if (Array.isArray(rList)) {
        setRaces(rList.slice(0, 3).map((r: any) => ({
          id: String(r.id),
          name: r.name,
          tournament: r.tournament_name || 'Tournament',
          date: r.date || 'TBD',
          distance: r.distance_m ? `${r.distance_m}m` : '1200m',
          
        })));
      } else {
        setRaces([]);
      }

      try {
        const jRes = await ownerApi.getJockeys();
        const jList = jRes.data || jRes || [];
        if (Array.isArray(jList)) {
          const topJockeys = jList.slice(0, 4);
          const detailedJockeys = await Promise.all(
            topJockeys.map(async (j: any) => {
              const jockeyId = j.id || j.jockeyId;
              let completedRaces = 0;
              try {
                const countRes = await jockeyService.getCompletedRacesCount(jockeyId);
                completedRaces = countRes?.data !== undefined ? countRes.data : (countRes || 0);
              } catch (err) {
                console.error(`Failed to fetch completed races count for jockey ${jockeyId}`, err);
              }
              return {
                id: String(jockeyId),
                name: j.jockeyName || j.username || 'Jockey',
                flag: '🇻🇳',
                nationality: j.nationality || 'Vietnam',
                winRate: j.winRate || 65,
                completedRaces: completedRaces
              };
            })
          );
          setJockeys(detailedJockeys);
        } else {
          setJockeys([]);
        }
      } catch (e) {
        setJockeys([]);
      }
    } catch (err) {
      setTournaments([]);
      setRaces([]);
      setJockeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
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
          <Link href="/portal/tournaments">
            <Button size="sm" data-testid="hero-btn-tournaments">View Tournaments</Button>
          </Link>
          <Link href="/portal/races">
            <Button size="sm" variant="outline" data-testid="hero-btn-races">Race Schedule</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="h-10 w-10 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Tournaments */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Featured Tournaments</h2>
              <Link href="/portal/tournaments">
                <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
            <div className="divide-y border rounded-lg overflow-hidden">
              {tournaments.map(t => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.location} · {t.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">

                    <Link href={`/portal/tournaments/${t.id}`}>
                      <button className="text-xs text-blue-600 hover:underline" data-testid={`btn-tournament-${t.id}`}>Details</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Races */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Races</h2>
              <Link href="/portal/races">
                <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  Full Schedule <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
            <div className="divide-y border rounded-lg overflow-hidden">
              {races.map(r => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.tournament} · {r.date} · {r.distance}</p>
                  </div>
                  <div className="flex items-center gap-4">

                    <Link href={`/portal/races/${r.id}`}>
                      <button className="text-xs text-blue-600 hover:underline" data-testid={`btn-race-${r.id}`}>Details</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

    </div>
  );
}
