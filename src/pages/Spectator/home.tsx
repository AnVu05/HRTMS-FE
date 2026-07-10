import { Link } from 'wouter';
import { Trophy, Flag, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MOCK_TOURNAMENTS = [
  { id: '1', name: 'Hanoi Grand Prix', location: 'Ho Chi Minh City', status: 'Active', prize: '$500,000', date: 'Oct 15–20, 2023', races: 8 },
  { id: '2', name: 'Saigon Sprint Series', location: 'Hanoi', status: 'Upcoming', prize: '$350,000', date: 'Nov 5–8, 2023', races: 6 },
  { id: '3', name: 'Mekong Valley Classic', location: 'Da Nang', status: 'Completed', prize: '$280,000', date: 'Sep 10–14, 2023', races: 5 },
];

const MOCK_RACES = [
  { id: '2', name: 'Middle Distance Challenge', tournament: 'Hanoi Grand Prix', date: 'Oct 17, 2023', distance: '1600m', prize: '$75,000' },
  { id: '3', name: 'Grand Prix Final', tournament: 'Hanoi Grand Prix', date: 'Oct 20, 2023', distance: '2400m', prize: '$200,000' },
  { id: '4', name: 'Sprint Heat 1', tournament: 'Saigon Sprint Series', date: 'Nov 5, 2023', distance: '1000m', prize: '$30,000' },
];

const MOCK_JOCKEYS = [
  { id: '7', name: 'Park Ji-won', flag: '🇰🇷', nationality: 'Korea', winRate: 74, earnings: '$890,000' },
  { id: '2', name: "James O'Brien", flag: '🇮🇪', nationality: 'Ireland', winRate: 71, earnings: '$520,000' },
  { id: '1', name: 'Nguyễn Văn Minh', flag: '🇻🇳', nationality: 'Vietnam', winRate: 68, earnings: '$340,000' },
  { id: '8', name: 'Luca Bianchi', flag: '🇮🇹', nationality: 'Italy', winRate: 66, earnings: '$445,000' },
];

const statusColor: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Upcoming: 'bg-blue-100 text-blue-700',
  Completed: 'bg-gray-100 text-gray-600',
};

export default function PortalHome() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">

      {/* Hero */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">Horse Racing Tournament Portal</h1>
        <p className="text-gray-500 text-base max-w-xl">
          Track tournaments, race schedules, and jockey performance across the entire system.
        </p>
        <div className="flex gap-3 pt-1">
          <Link href="/portal/spectator/tournaments">
            <Button size="sm" data-testid="hero-btn-tournaments">View Tournaments</Button>
          </Link>
          <Link href="/portal/spectator/races">
            <Button size="sm" variant="outline" data-testid="hero-btn-races">Race Schedule</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-gray-200 py-6">
        {[
          { icon: Users, label: 'Jockeys', value: '48' },
          { icon: Trophy, label: 'Active Tournaments', value: '3' },
          { icon: Flag, label: 'Total Races', value: '142' },
          { icon: Trophy, label: 'Prize Money', value: '$2.4M' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div> */}

      {/* Tournaments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Featured Tournaments</h2>
          <Link href="/portal/spectator/tournaments">
            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
        <div className="divide-y border rounded-lg overflow-hidden">
          {MOCK_TOURNAMENTS.map(t => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[t.status]}`}>{t.status}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.location} · {t.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">{t.prize}</span>
                <Link href={`/portal/spectator/tournaments/${t.id}`}>
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
          <Link href="/portal/spectator/races">
            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Full Schedule <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
        <div className="divide-y border rounded-lg overflow-hidden">
          {MOCK_RACES.map(r => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-400">{r.tournament} · {r.date} · {r.distance}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">{r.prize}</span>
                <Link href={`/portal/spectator/races/${r.id}`}>
                  <button className="text-xs text-blue-600 hover:underline" data-testid={`btn-race-${r.id}`}>Details</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Jockeys */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Jockeys</h2>
          <Link href="/portal/spectator/jockeys">
            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
        <div className="divide-y border rounded-lg overflow-hidden">
          {MOCK_JOCKEYS.map((j, i) => (
            <div key={j.id} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-5 text-center">{i + 1}</span>
                <span className="text-lg">{j.flag}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{j.name}</p>
                  <p className="text-xs text-gray-400">{j.nationality}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{j.winRate}%</p>
                  <p className="text-xs text-gray-400">Win Rate</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{j.earnings}</p>
                  <p className="text-xs text-gray-400">Earnings</p>
                </div>
                <Link href={`/portal/spectator/jockeys/${j.id}`}>
                  <button className="text-xs text-blue-600 hover:underline" data-testid={`btn-jockey-${j.id}`}>Profile</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
