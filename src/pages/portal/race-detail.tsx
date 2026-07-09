import React from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Flag, MapPin, Trophy, Timer, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MOCK_RACES = [
  { id: '1', name: 'Opening Sprint', tournamentId: '1', tournamentName: 'Hanoi Grand Prix', date: 'Oct 15 2023', distance: '1200m', condition: 'Fast', prize: 50000, status: 'Completed' },
];

const MOCK_RESULTS = [
  { position: 1, jockey: 'Nguyễn Văn Minh', horse: 'Thunderbolt', time: '1:08.45', prize: 25000, medal: 'gold' },
  { position: 2, jockey: 'James O\'Brien', horse: 'Crimson Sky', time: '1:08.92', prize: 12500, medal: 'silver' },
  { position: 3, jockey: 'Takeshi Yamamoto', horse: 'River Spirit', time: '1:09.15', prize: 7500, medal: 'bronze' },
  { position: 4, jockey: 'Emma Richardson', horse: 'Ocean Whisper', time: '1:09.50', prize: 3000, medal: null },
  { position: 5, jockey: 'Luca Bianchi', horse: 'Desert Wind', time: '1:10.02', prize: 2000, medal: null },
];

export default function PortalRaceDetail() {
  const { id } = useParams();
  
  // For demo, just use the first mock race
  const race = MOCK_RACES.find(r => r.id === id) || MOCK_RACES[0];

  return (
    <div className="pb-20">
      {/* Race Header Banner */}
      <div className="bg-slate-950 text-white border-b border-slate-800">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <Link href="/portal/races">
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 mb-6 -ml-4" data-testid="btn-back">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schedule
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="text-primary border-primary bg-primary/10">
                  {race.tournamentName}
                </Badge>
                <Badge className={
                  race.status === 'Completed' ? 'bg-slate-700' :
                  race.status === 'In Progress' ? 'bg-green-500' : 'bg-blue-500'
                }>
                  {race.status}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 text-slate-400">{race.name}</h1>
              <p className="text-slate-400 text-lg flex items-center gap-2">
                <Timer className="h-5 w-5" /> {race.date}
              </p>
            </div>
            
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 w-full md:w-auto shrink-0 flex gap-8">
              <div>
                <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Prize Purse</div>
                <div className="text-2xl font-bold text-amber-500">${race.prize.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Distance</div>
                <div className="text-2xl font-bold">{race.distance}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        
        {/* Race Conditions Info Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-wrap gap-8 items-center">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Flag className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Track Condition</div>
              <div className="font-bold text-lg">{race.condition}</div>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
          <div className="flex items-center gap-3 text-slate-700">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Location</div>
              <div className="font-bold text-lg">Hanoi Turf Club</div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <Card className="bg-white shadow-md border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" /> 
              {race.status === 'Completed' ? 'Official Results' : 'Starting Lineup'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white text-slate-500 text-sm uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-24 text-center">Pos</th>
                    <th className="px-6 py-4 font-semibold">Jockey</th>
                    <th className="px-6 py-4 font-semibold">Horse</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                    <th className="px-6 py-4 font-semibold text-right">Prize</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_RESULTS.map((result) => (
                    <tr key={result.position} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5 text-center">
                        {result.medal ? (
                          <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center shadow-sm font-bold text-white ${
                            result.medal === 'gold' ? 'bg-amber-400' :
                            result.medal === 'silver' ? 'bg-slate-400' :
                            'bg-amber-700/60'
                          }`}>
                            {result.position}
                          </div>
                        ) : (
                          <div className="mx-auto h-8 w-8 flex items-center justify-center font-bold text-slate-500">
                            {result.position}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <Link href="/portal/jockeys/1" className="font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer">
                          {result.jockey}
                        </Link>
                      </td>
                      <td className="px-6 py-5 font-medium text-slate-700">
                        {result.horse}
                      </td>
                      <td className="px-6 py-5 font-mono text-slate-600">
                        {result.time}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-green-600">
                        ${result.prize.toLocaleString()}
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
