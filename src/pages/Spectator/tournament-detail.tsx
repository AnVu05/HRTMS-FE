import React from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, MapPin, Calendar, Trophy, Users, Flag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MOCK_TOURNAMENTS = [
  { id: '1', name: 'Hanoi Grand Prix', location: 'Ho Chi Minh City', status: 'Active', prize: 500000, date: 'Oct 15-20 2023', raceCount: 8, maxParticipants: 24, description: 'The premier event of the season featuring the best horses in Southeast Asia. This tournament tests both speed and endurance across multiple varying conditions.' },
];

const MOCK_RACES = [
  { id: '1', name: 'Opening Sprint', date: 'Oct 15 2023', distance: '1200m', condition: 'Fast', prize: 50000, status: 'Completed' },
  { id: '2', name: 'Middle Distance Challenge', date: 'Oct 17 2023', distance: '1600m', condition: 'Good', prize: 75000, status: 'In Progress' },
  { id: '3', name: 'Grand Prix Final', date: 'Oct 20 2023', distance: '2400m', condition: 'Fast', prize: 200000, status: 'Scheduled' },
];

export default function PortalTournamentDetail() {
  const { id } = useParams();

  // Find tournament or use default
  const tournament = MOCK_TOURNAMENTS.find(t => t.id === id) || MOCK_TOURNAMENTS[0];

  return (
    <div className="pb-20">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 opacity-80"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <Link href="/spectator/tournaments">
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 mb-8 -ml-4" data-testid="btn-back">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tournaments
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={
                  tournament.status === 'Active' ? 'bg-green-500 hover:bg-green-600 border-none' :
                    tournament.status === 'Upcoming' ? 'bg-blue-500 hover:bg-blue-600 border-none' :
                      'bg-slate-600 hover:bg-slate-700 border-none'
                }>
                  {tournament.status}
                </Badge>
                <span className="text-primary font-bold tracking-wide">${tournament.prize.toLocaleString()} Prize Pool</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight text-slate-400">
                {tournament.name}
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                {tournament.description}
              </p>

              <div className="flex flex-wrap gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="font-medium">{tournament.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">{tournament.date}</span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shrink-0">
              <h3 className="text-lg font-bold mb-4 border-b border-slate-700 pb-3">Tournament Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-2"><Trophy className="h-4 w-4" /> Total Races</span>
                  <span className="font-bold text-lg">{tournament.raceCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-2"><Users className="h-4 w-4" /> Max Riders</span>
                  <span className="font-bold text-lg">{tournament.maxParticipants}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-2"><Flag className="h-4 w-4" /> Status</span>
                  <span className="font-bold text-lg text-green-400">{tournament.status}</span>
                </div>
              </div>
              {tournament.status !== 'Completed' && (
                <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-base">
                  Register Interest
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-10 relative z-20">
        <Card className="bg-white shadow-md border-slate-200">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" /> Race Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Race Name</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Specs</th>
                    <th className="px-6 py-4 font-medium text-right">Prize</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_RACES.map((race) => (
                    <tr key={race.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5 font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {race.name}
                      </td>
                      <td className="px-6 py-5 text-slate-600">
                        {race.date}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-slate-50 text-slate-700">{race.distance}</Badge>
                          <Badge variant="outline" className="bg-slate-50 text-slate-700">{race.condition}</Badge>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-amber-600">
                        ${race.prize.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge className={
                          race.status === 'Completed' ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' :
                            race.status === 'In Progress' ? 'bg-green-500 text-white hover:bg-green-600' :
                              'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }>
                          {race.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link href={`/spectator/races/${race.id}`}>
                          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" data-testid={`btn-view-race-${race.id}`}>
                            Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
