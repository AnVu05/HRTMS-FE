import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Flag, MapPin, Trophy, Timer, Medal, CircleDollarSign, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { spectatorService } from '@/services/spectator.service';
import { ownerApi } from '@/services/owner.service';
import { raceApi } from '@/services/race.service';

export default function PortalRaceDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [race, setRace] = useState<any>(null);
  const [lineup, setLineup] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [photoFinishImage, setPhotoFinishImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Retrieve spectatorId dynamically from localStorage or default to 2
  const [spectatorId] = useState<number>(() => {
    return Number(localStorage.getItem('user_id') || '2');
  });

  const [userRole] = useState<string | null>(() => {
    return localStorage.getItem('user_role');
  });

  // Betting state
  const [selectedHorseId, setSelectedHorseId] = useState<number | null>(null);
  const [points, setPoints] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRaceData = async () => {
    setLoading(true);
    try {
      const res = await ownerApi.getRaceById(id);
      const raceData = res.data || res;
      if (raceData && raceData.name) {
        setRace({
          id: String(raceData.id),
          name: raceData.name,
          tournamentId: String(raceData.tournament_id),
          tournamentName: raceData.tournament_name || 'Tournament',
          date: raceData.date || 'TBD',
          distance: raceData.distance_m ? `${raceData.distance_m}m` : '1200m',
          condition: raceData.condition || 'Good',
          
          status: (raceData.status === 'COMPLETE' || raceData.status === 'COMPLETED') ? 'Completed' : (raceData.status === 'ONGOING' || raceData.status === 'IN_PROGRESS') ? 'In Progress' : raceData.status === 'CANCELLED' ? 'Cancelled' : 'Scheduled',
          reason: raceData.reason
        });

        if (raceData.status === 'COMPLETE' || raceData.status === 'COMPLETED') {
          // Fetch lineup first so we can map names
          const lineupRes = await ownerApi.getRaceStartingLineup(id);
          const lineupList = lineupRes.data || lineupRes || [];
          const mappedLineup = Array.isArray(lineupList) ? lineupList.map((p: any) => ({
            id: p.id,
            horse_id: p.horseId || p.horse_id,
            jockey: p.jockeyName || p.jockey_name || 'Jockey',
            horse: p.horseName || p.horse_name || 'Horse'
          })) : [];
          setLineup(mappedLineup);

          // Fetch results from /raceresults
          try {
            const resultsRes = await raceApi.getAllRaceResults();
            const resultsList = resultsRes.data || resultsRes || [];
            if (Array.isArray(resultsList)) {
              const match = resultsList.find((r: any) => r.raceId === Number(id));
              if (match) {
                // Fetch detail: /api/raceresults/{id}
                const detailRes = await raceApi.getRaceResultById(match.id);
                const detailData = detailRes.data || detailRes;
                setPhotoFinishImage(detailData.photoFinishImage || '');

                // Fetch placements
                const placementsRes = await raceApi.getAllPlacements();
                const placementsList = placementsRes.data || placementsRes || [];
                if (Array.isArray(placementsList)) {
                  const filteredPlacements = placementsList.filter((p: any) => p.raceResultId === match.id);
                  
                  // Sort by position ascending
                  filteredPlacements.sort((a, b) => (a.finishPosition || 99) - (b.finishPosition || 99));

                  setResults(filteredPlacements.map((p: any) => {
                    const participant = mappedLineup.find(l => Number(l.id) === Number(p.registrationFormId));
                    let formattedTime = '--:--.--';
                    if (p.finishTime) {
                      try {
                        const dateObj = new Date(p.finishTime);
                        if (!isNaN(dateObj.getTime())) {
                          formattedTime = dateObj.toTimeString().split(' ')[0];
                        }
                      } catch (e) {}
                    }
                    return {
                      id: p.id,
                      position: p.finishPosition,
                      jockey: participant?.jockey || 'Jockey',
                      horse: participant?.horse || 'Horse',
                      time: formattedTime,
                      weight: p.weighInWeight ? `${p.weighInWeight} kg` : 'N/A',
                      medal: p.finishPosition === 1 ? 'gold' : p.finishPosition === 2 ? 'silver' : p.finishPosition === 3 ? 'bronze' : null
                    };
                  }));
                }
              } else {
                // Fallback to basic results API if no raceresults row matches
                const resultRes = await ownerApi.getRaceResults(id);
                const resultList = resultRes.data || resultRes || [];
                if (Array.isArray(resultList)) {
                  setResults(resultList.map((r: any) => ({
                    id: r.pos || r.position,
                    position: r.pos || r.position,
                    jockey: r.jockeyName || r.jockey || 'Jockey',
                    horse: r.horseName || r.horse || 'Horse',
                    time: r.finishTime || '--:--.--',
                    weight: 'N/A',
                    medal: (r.pos === 1 || r.position === 1) ? 'gold' : (r.pos === 2 || r.position === 2) ? 'silver' : (r.pos === 3 || r.position === 3) ? 'bronze' : null
                  })));
                }
              }
            }
          } catch (e) {
            console.error('Failed to load official results:', e);
          }
        } else {
          // Fetch lineup
          const lineupRes = await ownerApi.getRaceStartingLineup(id);
          const lineupList = lineupRes.data || lineupRes || [];
          if (Array.isArray(lineupList)) {
            setLineup(lineupList.map((p: any) => ({
              id: p.horseId || p.horse_id,
              jockey: p.jockeyName || p.jockey_name || 'Jockey',
              horse: p.horseName || p.horse_name || 'Horse'
            })));
          }
        }
      }
    } catch (err) {
      toast({
        title: 'Error loading race',
        description: 'Failed to fetch details from the backend.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaceData();
  }, [id]);

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
    const selectedHorse = lineup.find(h => h.id === selectedHorseId);
    
    const payload = {
      spectatorId: spectatorId,
      raceId: Number(id),
      predictedHorseId: selectedHorseId,
      pointsInvested: points,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await spectatorService.createPrediction(payload);
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

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <RefreshCw className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!race) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
        <h3 className="text-lg font-medium text-slate-900">Race not found</h3>
      </div>
    );
  }

  const isSpectator = userRole === 'SPECTATOR';

  return (
    <div className="pb-20">
      {/* Race Header Banner */}
      <div className="bg-slate-950 text-white border-b border-slate-800">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <Link href={isSpectator ? "/spectator/races" : "/portal/races"}>
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
                  race.status === 'In Progress' ? 'bg-green-500' : 
                  race.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'
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
                <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Distance</div>
                <div className="text-2xl font-bold">{race.distance}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {race.status === 'Cancelled' && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-8 flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-500 shrink-0" />
            <div>
              <p className="font-bold">Race Cancelled</p>
              <p className="text-sm">Reason: {race.reason || 'Not specified'}</p>
            </div>
          </div>
        )}
        
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
                  {race.status === 'Completed' ? (
                    <table className="w-full text-left">
                      <thead className="bg-white text-slate-500 text-sm uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 font-semibold w-24 text-center">Pos</th>
                          <th className="px-6 py-4 font-semibold">Jockey</th>
                          <th className="px-6 py-4 font-semibold">Horse</th>
                          <th className="px-6 py-4 font-semibold">Time</th>
                          <th className="px-6 py-4 font-semibold">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {results.map((result) => (
                          <tr key={result.id} className="hover:bg-slate-50 transition-colors group">
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
                            </td>
                            <td className="px-6 py-5 font-mono text-slate-600">
                              {result.time}
                            </td>
                            <td className="px-6 py-5 font-medium text-slate-700">
                              {result.weight}
                            </td>
                          </tr>
                        ))}
                        {results.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-10 text-slate-400">No results recorded</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-white text-slate-500 text-sm uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Horse</th>
                          <th className="px-6 py-4 font-semibold">Jockey</th>
                          {isSpectator && <th className="px-6 py-4 font-semibold text-right">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lineup.map((participant) => (
                          <tr 
                            key={participant.id} 
                            onClick={() => isSpectator && setSelectedHorseId(participant.id)}
                            className={`transition-colors group ${
                              isSpectator ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50'
                            } ${selectedHorseId === participant.id ? 'bg-primary/5 hover:bg-primary/5' : ''}`}
                          >
                            <td className="px-6 py-5 font-medium text-slate-700">
                              {participant.horse}
                              {selectedHorseId === participant.id && (
                                <Badge className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold">Selected</Badge>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                {participant.jockey}
                              </span>
                            </td>
                            {isSpectator && (
                              <td className="px-6 py-5 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-primary hover:bg-primary/10"
                                >
                                  Predict
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                        {lineup.length === 0 && (
                          <tr>
                            <td colSpan={isSpectator ? 3 : 2} className="text-center py-10 text-slate-400">Lineup has not been published</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>

            {photoFinishImage && (
              <Card className="bg-white shadow-md border-slate-200 overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Flag className="h-5 w-5 text-red-500" /> Photo Finish Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <img 
                    src={photoFinishImage} 
                    alt="Photo Finish" 
                    className="max-h-96 rounded border border-slate-200 object-contain shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Place Prediction Card */}
          {isSpectator && (
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
                                {lineup.find(h => h.id === selectedHorseId)?.horse}
                              </div>
                              <div className="text-xs text-slate-500">
                                Ridden by {lineup.find(h => h.id === selectedHorseId)?.jockey}
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
          )}
        </div>
        
      </div>
    </div>
  );
}
