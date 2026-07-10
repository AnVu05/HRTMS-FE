import { Link } from 'wouter';
import { Trophy, Flag, Users, ArrowRight, ShieldAlert, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOCK_MY_RACES = [
  { id: '1', name: 'Sprint Heat 2', tournament: 'Saigon Sprint Series', date: 'Nov 6, 2023', status: 'Scheduled', position: '--' },
  { id: '2', name: 'Middle Distance Challenge', tournament: 'Hanoi Grand Prix', date: 'Oct 17, 2023', status: 'Completed', position: '3rd' },
];

export default function JockeyHome() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
      {/* Hero */}
      <div className="bg-gradient-to-r  from-amber-600 to-orange-500 rounded-2xl p-8 text-white space-y-4 shadow-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">
          <Award className="w-3.5 h-3.5" /> Jockey Portal
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, Jockey!</h1>
          <p className="text-orange-100 text-sm max-w-md">
            View your upcoming race schedule, check tournament details, and manage invitations directly from your dashboard.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Link href="/portal/jockey/profile">
            <Button size="sm" variant="secondary" className="text-orange-700 bg-white hover:bg-orange-50 font-bold">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/portal/jockey/races">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 font-bold border border-white/20">
              My Races
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-2">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Win Rate</span>
          <p className="text-3xl font-bold text-orange-600">68%</p>
          <p className="text-xs text-muted-foreground">Top 10% in this season</p>
        </div>
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-2">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Completed Races</span>
          <p className="text-3xl font-bold text-gray-900">42</p>
          <p className="text-xs text-muted-foreground">Across 5 different tournaments</p>
        </div>
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-2">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Earnings</span>
          <p className="text-3xl font-bold text-green-600">$340,000</p>
          <p className="text-xs text-muted-foreground">Based on prize distributions</p>
        </div>
      </div>

      {/* My Upcoming / Recent Races */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Participation Summary</h2>
          <Link href="/portal/jockey/races">
            <button className="text-sm text-orange-600 hover:underline flex items-center gap-1">
              View All My Races <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
        <div className="divide-y border rounded-lg overflow-hidden bg-white">
          {MOCK_MY_RACES.map(r => (
            <div key={r.id} className="flex items-center justify-between px-4 py-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.tournament} · {r.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  r.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>{r.status}</span>
                {r.position !== '--' && (
                  <span className="text-sm font-bold text-gray-700">Pos: {r.position}</span>
                )}
                <Link href={`/portal/jockey/races/${r.id}`}>
                  <button className="text-xs text-orange-600 hover:underline">Details</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
