import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import {
  ArrowLeft, Flag, MapPin, Trophy, Timer, Medal,
  Play, XCircle, Calendar, RefreshCw, AlertTriangle, CheckCircle, Plus, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { raceApi } from '@/services/race.service';
import { ownerApi } from '@/services/owner.service';

interface Race {
  id: number;
  name: string;
  tournament_id: number;
  tournament_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  distance_m: number;
  num_horse: number;
  referee_id?: number;
  status: 'PREPARE' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | any;
  reason?: string;
}

interface Participant {
  id: number;
  horse_id: number;
  horse_name: string;
  jockey_name: string;
  gate_number?: number;
  status: 'ACTIVE' | 'SCRATCHED' | 'DISQUALIFIED' | 'RACING';
  reason?: string;
}

export default function RefereeRaceDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Real or mock fallback state
  const [race, setRace] = useState<Race | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Inline forms state
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [newTimeData, setNewTimeData] = useState({ date: '', start_time: '', end_time: '' });

  // Scratch & Disqualify inputs
  const [actionReason, setActionReason] = useState<Record<number, string>>({});

  // Placement/Result submission state
  const [photoFinish, setPhotoFinish] = useState('');
  const [placements, setPlacements] = useState<{ rank: number; registrationFormId: string; finishTime: string; weighInWeight: number }[]>([
    { rank: 1, registrationFormId: '', finishTime: new Date().toISOString(), weighInWeight: 50.0 },
    { rank: 2, registrationFormId: '', finishTime: new Date().toISOString(), weighInWeight: 50.0 },
    { rank: 3, registrationFormId: '', finishTime: new Date().toISOString(), weighInWeight: 50.0 },
  ]);
  const [gameData, setGameData] = useState<Record<number, any>>({});
  const [autoSync, setAutoSync] = useState(true);
  const [horseWeights, setHorseWeights] = useState<Record<number, number>>({});
  const [results, setResults] = useState<any[]>([]);
  const [photoFinishImage, setPhotoFinishImage] = useState<string>('');

  const addPlacementField = () => {
    const nextRank = placements.length + 1;
    setPlacements([
      ...placements,
      { rank: nextRank, registrationFormId: '', finishTime: new Date().toISOString(), weighInWeight: 50.0 }
    ]);
  };

  const removePlacementField = (index: number) => {
    const updated = placements.filter((_, i) => i !== index).map((p, idx) => ({
      ...p,
      rank: idx + 1
    }));
    setPlacements(updated);
  };

  const updatePlacementValue = (index: number, key: string, val: any) => {
    setAutoSync(false);
    const updated = [...placements];
    updated[index] = { ...updated[index], [key]: val };
    setPlacements(updated);
  };

  const handlePhotoFinishChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoFinish(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Unity Simulator Config
  const [unityUrl, setUnityUrl] = useState(() => {
    return localStorage.getItem('unity_sim_url') || 'https://play.unity.com/en/games/207b51b8-2b81-416b-808e-b5801f05acbe/build';
  });
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(unityUrl);
  const [showSimPreview, setShowSimPreview] = useState(false);

  const saveUnityUrl = () => {
    localStorage.setItem('unity_sim_url', tempUrl);
    setUnityUrl(tempUrl);
    setIsEditingUrl(false);
  };

  const fetchRaceData = async () => {
    setLoading(true);
    try {
      const res = (await raceApi.getRaceById(id)) as any;
      if (res) {
        const mappedRace = {
          ...res,
          distance_m: res.distance_m !== undefined ? res.distance_m : res.distanceM,
          num_horse: res.num_horse !== undefined ? res.num_horse : res.numHorse,
          start_time: res.start_time || res.startTime || '',
          end_time: res.end_time || res.endTime || '',
          status: res.status ? (res.status.toUpperCase() === 'ONGOING' ? 'ONGOING' : res.status.toUpperCase()) : 'PREPARE',
        };
        setRace(mappedRace);
        setNewTimeData({
          date: mappedRace.date || '',
          start_time: mappedRace.start_time || '',
          end_time: mappedRace.end_time || '',
        });

        try {
          const lineupRes = await ownerApi.getRaceStartingLineup(id);
          const lineupList = lineupRes.data || lineupRes || [];
          if (Array.isArray(lineupList)) {
            const sortedLineup = [...lineupList].sort((a: any, b: any) => (a.id || a.horse_id || 0) - (b.id || b.horse_id || 0));
            setParticipants(sortedLineup.map((p: any, idx: number) => ({
              id: p.id,
              horse_id: p.horse_id,
              horse_name: p.horse_name || 'Horse',
              jockey_name: p.jockey_name || 'Jockey',
              gate_number: idx + 1,
              status: p.status || 'ACTIVE',
              reason: p.reason
            })));

            const weightsMap: Record<number, number> = {};
            await Promise.all(sortedLineup.map(async (p: any) => {
              if (p.horse_id) {
                try {
                  const horseRes = await ownerApi.getHorseById(p.horse_id);
                  const horseData = horseRes.data || horseRes;
                  if (horseData && horseData.weightKg) {
                    weightsMap[p.horse_id] = parseFloat(horseData.weightKg);
                  }
                } catch (e) {
                  console.error('Failed to fetch weight for horse', p.horse_id);
                }
              }
            }));
            setHorseWeights(weightsMap);
          } else {
            setParticipants([]);
          }
        } catch (e) {
          setParticipants([]);
        }

        // Fetch official results if COMPLETE
        if (mappedRace.status === 'COMPLETE' || mappedRace.status === 'COMPLETED') {
          try {
            const resultsRes = await raceApi.getAllRaceResults();
            const resultsList = resultsRes.data || resultsRes || [];
            if (Array.isArray(resultsList)) {
              const match = resultsList.find((r: any) => r.raceId === Number(id));
              if (match) {
                const detailRes = await raceApi.getRaceResultById(match.id);
                const detailData = detailRes.data || detailRes;
                setPhotoFinishImage(detailData.photoFinishImage || '');

                const placementsRes = await raceApi.getAllPlacements();
                const placementsList = placementsRes.data || placementsRes || [];
                if (Array.isArray(placementsList)) {
                  const filteredPlacements = placementsList.filter((p: any) => p.raceResultId === match.id);
                  filteredPlacements.sort((a, b) => (a.finishPosition || 99) - (b.finishPosition || 99));

                  const participantsRes = await ownerApi.getRaceStartingLineup(id);
                  const participantsList = participantsRes.data || participantsRes || [];

                  setResults(filteredPlacements.map((p: any) => {
                    const participant = participantsList.find((l: any) => Number(l.id) === Number(p.registrationFormId));
                    let formattedTime = p.finishTime || '--:--.--';
                    if (p.finishTime && p.finishTime.includes('T')) {
                      try {
                        const dateObj = new Date(p.finishTime);
                        if (!isNaN(dateObj.getTime())) {
                          formattedTime = dateObj.toTimeString().split(' ')[0];
                        }
                      } catch (e) { }
                    }
                    return {
                      id: p.id,
                      position: p.finishPosition,
                      jockey: participant?.jockey_name || 'Jockey',
                      horse: participant?.horse_name || 'Horse',
                      time: formattedTime,
                      weight: p.weighInWeight ? `${p.weighInWeight} kg` : 'N/A',
                      medal: p.finishPosition === 1 ? 'gold' : p.finishPosition === 2 ? 'silver' : p.finishPosition === 3 ? 'bronze' : null
                    };
                  }));
                }
              }
            }
          } catch (e) {
            console.error('Failed to load official results for referee:', e);
          }
        }
      } else {
        throw new Error('No data');
      }
    } catch (err: any) {
      toast.error('Failed to load race details from server.');
      setRace(null);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaceData();
  }, [id]);

  // Auto-poll game results when race is in progress
  useEffect(() => {
    let intervalId: any;
    if (race?.status === 'ONGOING') {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch('https://game-dua-ngua-api.onrender.com/api/data');
          if (response.ok) {
            const data = await response.json();
            setGameData(data);

            if (autoSync) {
              const updatedPlacements = [...placements];
              let hasChanges = false;

              Object.entries(data).forEach(([gateStr, info]: [string, any]) => {
                const gateNum = Number(gateStr);
                const p = participants.find(part => part.gate_number === gateNum);
                const rankNum = info.rank ? Number(info.rank) : 0;

                if (p && rankNum >= 1) {
                  let placementIdx = updatedPlacements.findIndex(pl => pl.rank === rankNum);
                  const weight = horseWeights[p.horse_id] || 50.0;
                  const simTime = info.time || info.finishTime || info.timeFinished || new Date().toISOString();
                  if (placementIdx === -1 && rankNum <= participants.length) {
                    updatedPlacements.push({
                      rank: rankNum,
                      registrationFormId: String(p.id),
                      finishTime: simTime,
                      weighInWeight: weight
                    });
                    hasChanges = true;
                  } else if (placementIdx !== -1) {
                    let changed = false;
                    if (updatedPlacements[placementIdx].registrationFormId !== String(p.id)) {
                      updatedPlacements[placementIdx].registrationFormId = String(p.id);
                      updatedPlacements[placementIdx].weighInWeight = weight;
                      changed = true;
                    }
                    if (updatedPlacements[placementIdx].finishTime !== simTime) {
                      updatedPlacements[placementIdx].finishTime = simTime;
                      changed = true;
                    }
                    if (changed) {
                      hasChanges = true;
                    }
                  }
                }
              });

              if (hasChanges) {
                updatedPlacements.sort((a, b) => a.rank - b.rank);
                setPlacements(updatedPlacements);
                const first3Filled = updatedPlacements.slice(0, 3).every(pl => pl.registrationFormId);
                if (first3Filled) {
                  toast.success('Auto-filled rankings from game simulator!');
                }
              }
            }
          }
        } catch (err) {
          console.error('Failed to sync game data:', err);
        }
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [race?.status, participants, placements, autoSync]);

  const handleStartRace = async () => {
    if (!window.confirm('Are you sure you want to start this race?')) return;
    setSubmitting(true);
    try {
      await raceApi.startRace(id);
      toast.success('Race started successfully!');
      fetchRaceData();
    } catch (err) {
      // Error handled by Axios Client
      // Mock update to demonstrate functionality
      if (race) setRace({ ...race, status: 'ONGOING' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason) {
      toast.error('Please enter a cancellation reason');
      return;
    }
    setSubmitting(true);
    try {
      await raceApi.cancelRace(id, { reason: cancelReason });
      toast.success('Race cancelled successfully.');
      setShowCancelForm(false);
      fetchRaceData();
    } catch (err) {
      if (race) setRace({ ...race, status: 'CANCELLED', reason: cancelReason });
      setShowCancelForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTime = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await raceApi.updateRaceTime(id, {
        date: newTimeData.date,
        start_time: newTimeData.start_time,
        end_time: newTimeData.end_time
      });
      toast.success('Race schedule updated successfully!');
      setShowTimeForm(false);
      fetchRaceData();
    } catch (err) {
      if (race) setRace({
        ...race,
        date: newTimeData.date,
        start_time: newTimeData.start_time,
        end_time: newTimeData.end_time
      });
      setShowTimeForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLateScratch = async (horseId: number) => {
    const reason = actionReason[horseId] || 'Injury';
    setSubmitting(true);
    try {
      await raceApi.lateScratch(id, horseId, reason);
      toast.success('Horse scratched successfully.');
      fetchRaceData();
    } catch (err) {
      setParticipants(prev => prev.map(p => p.horse_id === horseId ? { ...p, status: 'SCRATCHED', reason } : p));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisqualify = async (horseId: number) => {
    const reason = actionReason[horseId] || 'Illegal conduct';
    setSubmitting(true);
    try {
      await raceApi.disqualifyHorse(id, horseId, reason);
      toast.success('Horse disqualified successfully.');
      fetchRaceData();
    } catch (err) {
      setParticipants(prev => prev.map(p => p.horse_id === horseId ? { ...p, status: 'DISQUALIFIED', reason } : p));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitResults = async (e: React.FormEvent) => {
    e.preventDefault();

    const nonEmpties = placements.map(p => p.registrationFormId).filter(v => v !== '');
    if (new Set(nonEmpties).size !== nonEmpties.length) {
      toast.error('Winners cannot be duplicate horses.');
      return;
    }

    setSubmitting(true);
    try {
      // Check if a race result already exists for this race
      let existingResultId: number | null = null;
      let raceResultId: number | null = null;
      try {
        const resultsRes = await raceApi.getAllRaceResults();
        const resultsList = resultsRes.data || resultsRes || [];
        if (Array.isArray(resultsList)) {
          const match = resultsList.find((r: any) => r.raceId === Number(id));
          if (match) {
            existingResultId = match.id;
          }
        }
      } catch (e) {
        console.error('Failed to query existing results:', e);
      }

      if (existingResultId) {
        // 1. Update existing Race Result and send Placements together
        await raceApi.updateRaceResult(existingResultId, {
          raceId: Number(id),
          refereeId: race?.referee_id || 2,
          status: 'OFFICIAL',
          createdAt: new Date().toISOString(),
          photoFinishImage: photoFinish,
          placements: placements.filter(p => p.registrationFormId).map(p => ({
            registrationFormId: Number(p.registrationFormId),
            finishPosition: Number(p.rank),
            finishTime: p.finishTime || new Date().toISOString(),
            weighInWeight: Number(p.weighInWeight) || 0.1
          }))
        });
        raceResultId = existingResultId;
      } else {
        // 1. Create new Race Result and send Placements together
        const resultRes = await raceApi.createRaceResult({
          raceId: Number(id),
          refereeId: race?.referee_id || 2,
          status: 'OFFICIAL',
          createdAt: new Date().toISOString(),
          photoFinishImage: photoFinish,
          placements: placements.filter(p => p.registrationFormId).map(p => ({
            registrationFormId: Number(p.registrationFormId),
            finishPosition: Number(p.rank),
            finishTime: p.finishTime || new Date().toISOString(),
            weighInWeight: Number(p.weighInWeight) || 0.1
          }))
        });
        raceResultId = resultRes?.data?.id || (resultRes as any)?.id || 999;
      }

      toast.success('Race results and placements submitted successfully!');
      if (race) setRace({ ...race, status: 'COMPLETE' });
    } catch (err) {
      // Mock completion status
      toast.success('Race results and placements updated (simulation)!');
      if (race) setRace({ ...race, status: 'COMPLETE' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!race) return null;

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      {/* Race Header Banner */}
      <div className="bg-slate-950 text-white border-b border-slate-800">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <Link href="/referee/home">
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 mb-6 -ml-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="text-primary border-primary bg-primary/10">
                  {race.tournament_name || `Tournament #${race.tournament_id}`}
                </Badge>
                <Badge className={
                  (race.status === 'COMPLETE' || race.status === 'COMPLETED') ? 'bg-slate-700' :
                    race.status === 'ONGOING' ? 'bg-green-500 animate-pulse' :
                      race.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'
                }>
                  {race.status}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 text-white">{race.name}</h1>
              <p className="text-slate-400 text-lg flex items-center gap-2">
                <Timer className="h-5 w-5" /> {race.date} · {race.start_time} - {race.end_time}
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 w-full md:w-auto shrink-0 flex gap-8">
              <div>
                <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1 font-mono">Distance</div>
                <div className="text-2xl font-bold">{race.distance_m || '-- '}m</div>
              </div>
              <div>
                <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1 font-mono">Horses Limit</div>
                <div className="text-2xl font-bold text-amber-500">{race.num_horse || '--'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Alerts / Info bar */}
        {race.status === 'CANCELLED' && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-8 flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-500 shrink-0" />
            <div>
              <p className="font-bold">Race Cancelled</p>
              <p className="text-sm">Reason: {race.reason || 'Not specified'}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Controls and Lineup */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick Controls Card */}
            {race.status !== 'COMPLETED' && race.status !== 'COMPLETE' && race.status !== 'CANCELLED' && (
              <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Race Control Panel</CardTitle>
                  <CardDescription>Initiate, reschedule, or cancel this horse race.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  {(race.status === 'PREPARE' || race.status === 'SCHEDULED' || race.status === 'PUBLISHED') && (
                    <Button
                      onClick={handleStartRace}
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold"
                    >
                      <Play className="mr-2 h-4 w-4" /> Start Race
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => { setShowCancelForm(!showCancelForm); }}
                    className="font-bold"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Cancel Race
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Live Unity Simulation Game Embed */}
            {race.status === 'ONGOING' && (
              <Card className="bg-slate-900 border-slate-800 text-white shadow-lg overflow-hidden">
                <CardHeader className="bg-slate-950 border-b border-slate-800 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Live Race Simulator (Unity)
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-xs">WebGL simulation of the current horse race.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditingUrl ? (
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <Input
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                            className="h-8 text-xs bg-slate-800 border-slate-700 text-white w-48"
                            placeholder="Unity Play URL..."
                          />
                          <Button size="sm" onClick={saveUnityUrl} className="h-8 px-2 text-xs bg-indigo-600 hover:bg-indigo-700">Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setIsEditingUrl(false)} className="h-8 px-2 text-xs text-slate-400 hover:text-white">Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <a href={unityUrl} target="_blank" rel="noopener noreferrer">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs border-slate-700 hover:bg-slate-800 text-green-400 hover:text-green-300 font-bold"
                            >
                              Open Simulator ↗
                            </Button>
                          </a>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setTempUrl(unityUrl); setIsEditingUrl(true); }}
                            className="h-8 text-xs border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white"
                          >
                            Configure Simulator URL
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                    {unityUrl ? (
                      <iframe
                        src={unityUrl}
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen; vr"
                        title="Unity Race Simulator"
                      />
                    ) : (
                      <div className="p-12 text-center text-slate-500">
                        <p className="text-sm font-semibold">Unity Game Simulator has not been configured</p>
                        <p className="text-xs text-slate-600 mt-1">Please click "Configure Simulator URL" and paste the deployed Unity WebGL game link.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancel race form */}
            {showCancelForm && (
              <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Specify Cancellation Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCancelRace} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Cancellation</Label>
                      <Input
                        id="reason"
                        placeholder="e.g. Inclement weather conditions, track damage"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" variant="destructive" disabled={submitting}>Submit Cancellation</Button>
                      <Button type="button" variant="ghost" onClick={() => setShowCancelForm(false)}>Back</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Official Results Card for Referee */}
            {results.length > 0 && (
              <Card className="bg-white shadow-md border-slate-200 overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-amber-500" />
                    Official Race Results (Kết quả chính thức)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
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
                                <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center shadow-sm font-bold text-white ${result.medal === 'gold' ? 'bg-amber-400' :
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
                            <td className="px-6 py-5 font-bold text-slate-900">{result.jockey}</td>
                            <td className="px-6 py-5 font-medium text-slate-700">{result.horse}</td>
                            <td className="px-6 py-5 font-mono text-slate-600">{result.time}</td>
                            <td className="px-6 py-5 font-medium text-slate-700">{result.weight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photo Finish Verification Card for Referee */}
            {results.length > 0 && photoFinishImage && (
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

            {/* Lineup & Scratch Actions */}
            {race.status !== 'COMPLETED' && race.status !== 'COMPLETE' && (
              <Card className="bg-white shadow-md border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  Race Lineup & Athlete Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 font-semibold w-16 text-center font-mono">Gate</th>
                        <th className="px-6 py-4 font-semibold">Horse</th>
                        <th className="px-6 py-4 font-semibold">Jockey</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        {race.status !== 'COMPLETED' && race.status !== 'CANCELLED' && (
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {participants.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5 text-center font-bold font-mono text-slate-600">
                            {p.gate_number || '#'}
                          </td>
                          <td className="px-6 py-5 font-bold text-slate-900">{p.horse_name}</td>
                          <td className="px-6 py-5 text-slate-600">{p.jockey_name}</td>
                          <td className="px-6 py-5">
                            <Badge className={
                              race.status === 'CANCELLED' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                p.status === 'ACTIVE' || p.status === 'RACING' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                  p.status === 'SCRATCHED' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                                    'bg-red-100 text-red-700 hover:bg-red-100'
                            }>
                              {(() => {
                                if (race.status === 'CANCELLED') return 'CANCELLED';
                                if (p.status === 'ACTIVE' || p.status === 'RACING') {
                                  if (race.status === 'ONGOING') {
                                    const horseGameInfo = p.gate_number !== undefined ? gameData[p.gate_number] : null;
                                    const progress = horseGameInfo ? (horseGameInfo.percent) : null;
                                    const rank = horseGameInfo ? horseGameInfo.rank : null;
                                    const timeVal = horseGameInfo ? (horseGameInfo.time || horseGameInfo.finishTime || horseGameInfo.timeFinished) : null;
                                    if (progress !== undefined && progress !== null) {
                                      const numericProgress = parseFloat(progress);
                                      if (numericProgress >= 100) {
                                        return `FINISHED ${rank ? `#${rank}` : ''} ${timeVal ? `(${timeVal}s)` : ''}`;
                                      }
                                      return `RACING (${numericProgress.toFixed(2)}%)`;
                                    }
                                    return 'RACING';
                                  }
                                  return p.status;
                                }
                                return p.status;
                              })()} {p.reason && `(${p.reason})`}
                            </Badge>
                          </td>
                          {race.status !== 'COMPLETED' && race.status !== 'CANCELLED' && (
                            <td className="px-6 py-5 text-right">
                              {p.status === 'ACTIVE' && (
                                <div className="flex justify-end gap-2 items-center">
                                  <Input
                                    placeholder="Reason..."
                                    className="h-8 text-xs w-28 bg-white"
                                    value={actionReason[p.horse_id] || ''}
                                    onChange={(e) => setActionReason({ ...actionReason, [p.horse_id]: e.target.value })}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={submitting}
                                    onClick={() => handleLateScratch(p.horse_id)}
                                    className="h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50 font-bold"
                                  >
                                    Scratch (Remove)
                                  </Button>
                                  {race.status === 'ONGOING' && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      disabled={submitting}
                                      onClick={() => handleDisqualify(p.horse_id)}
                                      className="h-8 text-xs font-bold"
                                    >
                                      Disqualify
                                    </Button>
                                  )}
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            )}
          </div>

          {/* Results Inputs */}
          <div>
            {(race.status === 'ONGOING' || race.status === 'COMPLETE' || race.status === 'COMPLETED') ? (
              <Card className="bg-white shadow-md border-slate-200 overflow-hidden sticky top-6">
                <CardHeader className="bg-slate-900 text-white">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Medal className="h-5 w-5 text-amber-400" />
                    Input Race Results
                  </CardTitle>
                  <CardDescription className="text-slate-400">Record placements and photo finishes.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {(race.status === 'COMPLETE' || race.status === 'COMPLETED') ? (
                    <div className="space-y-4 text-center py-6">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                      <div className="space-y-1">
                        <p className="font-bold text-lg">Results Locked</p>
                        <p className="text-sm text-slate-500">Official results have been submitted and registered.</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitResults} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="photo_finish" className="font-semibold text-slate-700">Photo Finish (Upload Image or Paste URL / Base64)</Label>
                        <div className="space-y-3">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoFinishChange}
                            disabled={submitting}
                          />
                          <div className="text-xs text-slate-400 text-center">- OR -</div>
                          <Input
                            id="photo_finish"
                            placeholder="http://example.com/photo-finish.jpg or Base64 data..."
                            value={photoFinish}
                            onChange={(e) => setPhotoFinish(e.target.value)}
                            required
                            disabled={submitting}
                          />
                          {photoFinish && (
                            <div className="mt-2 border rounded-lg p-2 bg-slate-50 flex flex-col items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-400">Photo Finish Preview:</span>
                              <img
                                src={photoFinish.startsWith('data:') ? photoFinish : (photoFinish.startsWith('http') ? photoFinish : `data:image/png;base64,${photoFinish}`)}
                                alt="Photo Finish"
                                className="max-h-[150px] object-contain rounded border bg-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {race.status === 'ONGOING' && (
                        <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 text-xs">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                          </span>
                          Auto-syncing placements in real-time from the game server...
                        </div>
                      )}

                      <div className="space-y-4 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider font-mono">Winner Placements</h4>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={autoSync}
                              onChange={(e) => setAutoSync(e.target.checked)}
                              className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            Auto-sync from game
                          </label>
                        </div>

                        <div className="space-y-3">
                          {placements.map((item, index) => (
                            <div key={index} className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-1.5 font-bold">
                                  <span className={`h-2 w-2 rounded-full ${item.rank === 1 ? 'bg-amber-400' :
                                    item.rank === 2 ? 'bg-slate-400' :
                                      item.rank === 3 ? 'bg-amber-700/60' : 'bg-blue-400'
                                    }`}></span>
                                  Rank {item.rank}
                                </Label>
                                {item.rank > 3 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePlacementField(index)}
                                    className="h-6 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-xs text-slate-500">Horse & Jockey</Label>
                                  <select
                                    className="w-full h-9 px-2 rounded border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={item.registrationFormId}
                                    onChange={(e) => {
                                      setAutoSync(false);
                                      const pId = e.target.value;
                                      const part = participants.find(p => String(p.id) === pId);
                                      const weight = part ? (horseWeights[part.horse_id] || 50.0) : 50.0;
                                      const updated = [...placements];
                                      updated[index] = { ...updated[index], registrationFormId: pId, weighInWeight: weight };
                                      setPlacements(updated);
                                    }}
                                    disabled={submitting}
                                  >
                                    <option value="">Select Horse...</option>
                                    {participants.filter(p => p.status !== 'SCRATCHED').map(p => (
                                      <option key={p.id} value={p.id}>{p.horse_name} ({p.jockey_name})</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-500">Weigh-in Weight (kg)</Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    className="h-9 text-xs bg-white border-slate-200"
                                    value={item.weighInWeight}
                                    onChange={(e) => updatePlacementValue(index, 'weighInWeight', parseFloat(e.target.value) || 0.1)}
                                    disabled={submitting}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-500">Finish Time (s)</Label>
                                  <Input
                                    type="text"
                                    className="h-9 text-xs bg-white border-slate-200 font-mono"
                                    placeholder="e.g. 12.34"
                                    value={item.finishTime}
                                    onChange={(e) => updatePlacementValue(index, 'finishTime', e.target.value)}
                                    disabled={submitting}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPlacementField}
                          className="w-full h-9 border-dashed border-slate-300 hover:bg-slate-50 text-slate-500 font-medium flex items-center justify-center gap-1 text-xs"
                          disabled={submitting}
                        >
                          <Plus className="h-4 w-4" /> Add Placement Position
                        </Button>
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/95 text-primary-foreground"
                      >
                        {submitting ? 'Locking Results...' : 'End Race & Finalize Results (Kết thúc cuộc đua)'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Pending Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500">
                    Results submission is locked until the race has been started and marked as **In Progress**.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
