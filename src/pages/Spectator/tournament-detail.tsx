import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, MapPin, Calendar, Trophy, Users, Flag, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ownerApi } from '@/services/owner.service';

export default function PortalTournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<any>(null);
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      // Fetch tournament detail
      const tRes = await ownerApi.getTournamentById(id);
      const tData = tRes.data || tRes;
      if (tData && tData.name) {
        setTournament({
          id: String(tData.id),
          name: tData.name,
          location: tData.location || 'Vietnam',
          status: tData.status === 'ACTIVE' ? 'Active' : tData.status === 'UPCOMING' ? 'Upcoming' : tData.status === 'COMPLETED' ? 'Completed' : tData.status || 'Upcoming',
          prize: tData.prizePool || tData.prize || 500000,
          date: tData.start_date && tData.end_date ? `${tData.start_date} - ${tData.end_date}` : 'TBD',
          raceCount: tData.raceCount || 8,
          maxParticipants: tData.maxParticipants || 24,
          description: tData.description || 'Professional horse racing tournament.'
        });
      } else {
        setTournament(null);
      }

      // Fetch races for this tournament
      const rRes = await ownerApi.getRacesByTournament(id);
      const rData = rRes.data || rRes;
      const rList = rData?.races || (Array.isArray(rData) ? rData : []);
      if (Array.isArray(rList)) {
        setRaces(rList.map((r: any) => ({
          id: String(r.id),
          name: r.name,
          date: r.date || 'TBD',
          distance: r.distanceM ? `${r.distanceM}m` : r.distance_m ? `${r.distance_m}m` : '1200m',
          condition: r.condition || 'Good',
          prize: r.prize || 50000,
          status: r.status === 'COMPLETED' ? 'Completed' : r.status === 'IN_PROGRESS' ? 'In Progress' : r.status === 'CANCELLED' ? 'Cancelled' : 'Scheduled'
        })));
      } else {
        setRaces([]);
      }
    } catch (err) {
      setTournament(null);
      setRaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <RefreshCw className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!tournament) return null;

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
                    <th className="px-6 py-4 font-medium">Distance</th>
                    <th className="px-6 py-4 font-medium text-right">Prize</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {races.map((race) => (
                    <tr key={race.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5 font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {race.name}
                      </td>
                      <td className="px-6 py-5 text-slate-600">
                        {race.date}
                      </td>
                      <td className="px-6 py-5 text-slate-600">
                        {race.distance}
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
