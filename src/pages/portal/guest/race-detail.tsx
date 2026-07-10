import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Flag, MapPin, Trophy, Timer, Medal, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { spectatorService } from '@/services/spectator.service';

const MOCK_RACES = [
  { id: '1', name: 'Opening Sprint', tournamentId: '1', tournamentName: 'Hanoi Grand Prix', date: 'Oct 15 2023', distance: '1200m', condition: 'Fast', prize: 50000, status: 'Completed' },
  { id: '2', name: 'Middle Distance Challenge', tournamentId: '1', tournamentName: 'Hanoi Grand Prix', date: 'Oct 17 2023', distance: '1600m', condition: 'Good', prize: 75000, status: 'In Progress' },
  { id: '3', name: 'Grand Prix Final', tournamentId: '1', tournamentName: 'Hanoi Grand Prix', date: 'Oct 20 2023', distance: '2400m', condition: 'Fast', prize: 200000, status: 'Scheduled' },
  { id: '4', name: 'Sprint Heat 1', tournamentId: '2', tournamentName: 'Saigon Sprint Series', date: 'Nov 5 2023', distance: '1000m', condition: 'Good', prize: 30000, status: 'Scheduled' },
  { id: '5', name: 'Sprint Heat 2', tournamentId: '2', tournamentName: 'Saigon Sprint Series', date: 'Nov 6 2023', distance: '1000m', condition: 'Good', prize: 30000, status: 'Scheduled' },
  { id: '6', name: 'Valley Qualifier', tournamentId: '3', tournamentName: 'Mekong Valley Classic', date: 'Sep 10 2023', distance: '1400m', condition: 'Yielding', prize: 40000, status: 'Completed' },
  { id: '7', name: 'Valley Cup', tournamentId: '3', tournamentName: 'Mekong Valley Classic', date: 'Sep 14 2023', distance: '2000m', condition: 'Soft', prize: 100000, status: 'Completed' },
  { id: '8', name: 'Highlands Opener', tournamentId: '4', tournamentName: 'Central Highlands Derby', date: 'Dec 1 2023', distance: '1600m', condition: 'Fast', prize: 60000, status: 'Scheduled' },
];

const MOCK_RESULTS = [
  { id: 1, position: 1, jockey: 'Nguyễn Văn Minh', horse: 'Thunderbolt', time: '1:08.45', prize: 25000, medal: 'gold' },
  { id: 2, position: 2, jockey: 'James O\'Brien', horse: 'Crimson Sky', time: '1:08.92', prize: 12500, medal: 'silver' },
  { id: 3, position: 3, jockey: 'Takeshi Yamamoto', horse: 'River Spirit', time: '1:09.15', prize: 7500, medal: 'bronze' },
  { id: 4, position: 4, jockey: 'Emma Richardson', horse: 'Ocean Whisper', time: '1:09.50', prize: 3000, medal: null },
  { id: 5, position: 5, jockey: 'Luca Bianchi', horse: 'Desert Wind', time: '1:10.02', prize: 2000, medal: null },
];

export default function PortalRaceDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  
  // Find matching race
  const race = MOCK_RACES.find(r => r.id === id) || MOCK_RACES[0];

  // Retrieve spectatorId dynamically from localStorage or default to 2
  const [spectatorId, setSpectatorId] = useState<number>(() => {
    return Number(localStorage.getItem('spectator_id') || '2');
  });

  // Betting state
  const [selectedHorseId, setSelectedHorseId] = useState<number | null>(null);
  const [points, setPoints] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceBet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHorseId) {
      toast({
        title: 'Error',
        description: 'Please select a horse to predict.',
        variant: 'destructive',
      });
      return;
    }

    if (points <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount of points.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const selectedHorse = MOCK_RESULTS.find(h => h.id === selectedHorseId);
    
    const payload = {
      spectatorId: spectatorId,
      raceId: Number(race.id),
      predictedHorseId: selectedHorseId,
      pointsInvested: points,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await spectatorService.createPrediction(payload);
      
      // If backend returns an object that has success: false, throw it
      if (response && response.success === false) {
        throw new Error(response.message || 'Failed to place prediction');
      }

      toast({
        title: 'Success',
        description: response?.message || `Successfully placed a prediction of ${points} points on ${selectedHorse?.horse}!`,
      });
    } catch (err: any) {
      toast({
        title: 'Error Placing Prediction',
        description: err.message || 'Failed to connect to the backend server.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lineup / Results */}
          <div className="lg:col-span-2 space-y-8">
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
                        <tr 
                          key={result.id} 
                          onClick={() => race.status !== 'Completed' && setSelectedHorseId(result.id)}
                          className={`transition-colors group ${
                            race.status !== 'Completed' ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50'
                          } ${selectedHorseId === result.id ? 'bg-primary/5 hover:bg-primary/5' : ''}`}
                        >
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
                            <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                              {result.jockey}
                            </span>
                          </td>
                          <td className="px-6 py-5 font-medium text-slate-700">
                            {result.horse}
                            {selectedHorseId === result.id && (
                              <Badge className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold">Selected</Badge>
                            )}
                          </td>
                          <td className="px-6 py-5 font-mono text-slate-600">
                            {race.status === 'Completed' ? result.time : '--:--.--'}
                          </td>
                          <td className="px-6 py-5 text-right font-bold text-green-600">
                            ${race.status === 'Completed' ? result.prize.toLocaleString() : '0'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Place Prediction Card */}
          <div className="lg:col-span-1">
            {race.status !== 'Completed' ? (
              <Card className="bg-white border-slate-200 shadow-md sticky top-24 overflow-hidden">
                <div className="bg-slate-950 p-6 text-white border-b border-slate-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <CircleDollarSign className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">Place Prediction</CardTitle>
                  </div>
                  <CardDescription className="text-slate-400 text-sm">
                    Select a horse from the lineup and invest points to predict the race.
                  </CardDescription>
                </div>
                <CardContent className="p-6 pt-6">
                  <form onSubmit={handlePlaceBet} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold text-sm">Selected Horse</Label>
                      {selectedHorseId ? (
                        <div className="p-4 bg-slate-50 border rounded-xl flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-900">
                              {MOCK_RESULTS.find(h => h.id === selectedHorseId)?.horse}
                            </div>
                            <div className="text-xs text-slate-500">
                              Ridden by {MOCK_RESULTS.find(h => h.id === selectedHorseId)?.jockey}
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-transparent"
                            onClick={() => setSelectedHorseId(null)}
                          >
                            Clear
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 border border-dashed rounded-xl text-center text-slate-400 text-sm">
                          Click a horse in the lineup table to select it
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bet-amount" className="text-slate-700 font-semibold text-sm">Points to Invest</Label>
                      <div className="relative">
                        <Input 
                          id="bet-amount"
                          type="number"
                          min="1"
                          value={points}
                          onChange={(e) => setPoints(Number(e.target.value))}
                          className="h-12 text-lg font-bold"
                          placeholder="100"
                        />
                        <span className="absolute right-4 top-3 text-slate-400 font-semibold text-sm">PTS</span>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-bold transition-all"
                      disabled={isSubmitting || !selectedHorseId}
                    >
                      {isSubmitting ? 'Placing Prediction...' : 'Submit Prediction'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border-slate-200 shadow-md p-6 text-center">
                <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Predictions Closed</h3>
                <p className="text-slate-500 text-sm">
                  This race is completed. Predictions can only be placed on upcoming or live races.
                </p>
              </Card>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
