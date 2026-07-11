import { Link } from 'wouter';
import { Trophy, Flag, Users, ArrowRight, Award, Calendar, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOCK_REFEREE_RACES = [
  { id: '3', name: 'Grand Prix Final', tournament: 'Hanoi Grand Prix', date: 'Oct 20, 2023', role: 'Chief Referee' },
  { id: '4', name: 'Sprint Heat 1', tournament: 'Saigon Sprint Series', date: 'Nov 5, 2023', role: 'Track Judge' },
];

export default function RefereeHome() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white space-y-4 shadow-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">
          <Award className="w-3.5 h-3.5" /> Referee Portal
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, Referee!</h1>
          <p className="text-blue-100 text-sm max-w-md">
            Oversee fair plays, manage race outcomes, accept judging invitations, and review tournament fixtures.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Link href="/portal/referee/profile">
            <Button size="sm" variant="secondary" className="text-blue-700 bg-white hover:bg-blue-50 font-bold">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/portal/referee/races">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 font-bold border border-white/20">
              Assigned Races
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-2">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Assigned Tournaments</span>
          <p className="text-3xl font-bold text-blue-600">4</p>
          <p className="text-xs text-muted-foreground">In active or upcoming status</p>
        </div>
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-2">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Judged Races</span>
          <p className="text-3xl font-bold text-gray-900">18</p>
          <p className="text-xs text-muted-foreground">Successfully finalized outcomes</p>
        </div>
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-2">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pending Invitations</span>
          <p className="text-3xl font-bold text-amber-600">2</p>
          <p className="text-xs text-muted-foreground">Requires response in Dashboard</p>
        </div>
      </div>

      {/* Assigned Races */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Judging Schedule</h2>
          <Link href="/portal/referee/races">
            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View All Assigned Races <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
        <div className="divide-y border rounded-lg overflow-hidden bg-white">
          {MOCK_REFEREE_RACES.map(r => (
            <div key={r.id} className="flex items-center justify-between px-4 py-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.tournament} · {r.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {r.role}
                </span>
                <Link href={`/portal/referee/races/${r.id}`}>
                  <button className="text-xs text-blue-600 hover:underline">Details</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
