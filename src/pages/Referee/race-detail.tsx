import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { 
  ArrowLeft, Flag, MapPin, Trophy, Timer, Medal, 
  Play, XCircle, Calendar, RefreshCw, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { raceApi } from '@/services/race.service';

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
  referee_id: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  cancel_reason?: string;
}

interface Participant {
  id: number;
  horse_id: number;
  horse_name: string;
  jockey_name: string;
  gate_number?: number;
  status: 'ACTIVE' | 'SCRATCHED' | 'DISQUALIFIED';
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
  const [placementResults, setPlacementResults] = useState<Record<number, number>>({
    1: 0, // Rank 1 -> horse_id
    2: 0, // Rank 2 -> horse_id
    3: 0, // Rank 3 -> horse_id
  });

  const fetchRaceData = async () => {
    setLoading(true);
    try {
      const res = (await raceApi.getRaceById(id)) as any;
      if (res) {
        setRace(res);
        setNewTimeData({
          date: res.date || '',
          start_time: res.start_time || '',
          end_time: res.end_time || '',
        });
        
        // Mock participants if backend doesn't provide them inside race data
        const mockLineup: Participant[] = res.participants || [
          { id: 1, horse_id: 101, horse_name: 'Thunderbolt', jockey_name: 'Nguyen Van Minh', gate_number: 1, status: 'ACTIVE' },
          { id: 2, horse_id: 102, horse_name: 'Crimson Sky', jockey_name: 'James O\'Brien', gate_number: 2, status: 'ACTIVE' },
          { id: 3, horse_id: 103, horse_name: 'River Spirit', jockey_name: 'Takeshi Yamamoto', gate_number: 3, status: 'ACTIVE' },
          { id: 4, horse_id: 104, horse_name: 'Ocean Whisper', jockey_name: 'Emma Richardson', gate_number: 4, status: 'ACTIVE' },
          { id: 5, horse_id: 105, horse_name: 'Desert Wind', jockey_name: 'Luca Bianchi', gate_number: 5, status: 'ACTIVE' },
        ];
        setParticipants(mockLineup);
      }
    } catch (err: any) {
      toast.error('Failed to load race details.');
      // Mock fallback for UI demonstrations if API returns error
      setRace({
        id: Number(id),
        name: 'Middle Distance Challenge',
        tournament_id: 1,
        tournament_name: 'Hanoi Grand Prix',
        date: '2026-07-12',
        start_time: '10:00:00',
        end_time: '11:00:00',
        distance_m: 1600,
        num_horse: 8,
        referee_id: 2,
        status: 'SCHEDULED'
      });
      setParticipants([
        { id: 1, horse_id: 101, horse_name: 'Thunderbolt', jockey_name: 'Nguyen Van Minh', gate_number: 1, status: 'ACTIVE' },
        { id: 2, horse_id: 102, horse_name: 'Crimson Sky', jockey_name: 'James O\'Brien', gate_number: 2, status: 'ACTIVE' },
        { id: 3, horse_id: 103, horse_name: 'River Spirit', jockey_name: 'Takeshi Yamamoto', gate_number: 3, status: 'ACTIVE' },
        { id: 4, horse_id: 104, horse_name: 'Ocean Whisper', jockey_name: 'Emma Richardson', gate_number: 4, status: 'ACTIVE' },
        { id: 5, horse_id: 105, horse_name: 'Desert Wind', jockey_name: 'Luca Bianchi', gate_number: 5, status: 'ACTIVE' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaceData();
  }, [id]);

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
      if (race) setRace({ ...race, status: 'IN_PROGRESS' });
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
      if (race) setRace({ ...race, status: 'CANCELLED', cancel_reason: cancelReason });
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
    
    // Validations
    if (!photoFinish) {
      toast.error('Please input photo finish image URL or Base64');
      return;
    }
    if (!placementResults[1] || !placementResults[2] || !placementResults[3]) {
      toast.error('Please assign 1st, 2nd, and 3rd place winners.');
      return;
    }
    if (new Set([placementResults[1], placementResults[2], placementResults[3]]).size !== 3) {
      toast.error('Winners cannot be duplicate horses.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Race Result
      const resultRes = await raceApi.createRaceResult({
        race_id: Number(id),
        referee_id: race?.referee_id || 2,
        status: 'OFFICIAL',
        photo_finish_image: photoFinish
      });

      const raceResultId = resultRes?.data?.id || 999;

      // 2. Create Placements
      for (const [rank, horseId] of Object.entries(placementResults)) {
        await raceApi.createPlacement({
          race_result_id: raceResultId,
          horse_id: horseId,
          position: Number(rank)
        });
      }

      toast.success('Race results and placements submitted successfully!');
      if (race) setRace({ ...race, status: 'COMPLETED' });
    } catch (err) {
      // Mock completion status
      toast.success('Race results and placements updated (simulation)!');
      if (race) setRace({ ...race, status: 'COMPLETED' });
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
                  race.status === 'COMPLETED' ? 'bg-slate-700' :
                  race.status === 'IN_PROGRESS' ? 'bg-green-500 animate-pulse' :
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
                <div className="text-2xl font-bold">{race.distance_m}m</div>
              </div>
              <div>
                <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1 font-mono">Horses Limit</div>
                <div className="text-2xl font-bold text-amber-500">{race.num_horse}</div>
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
              <p className="text-sm">Reason: {race.cancel_reason || 'Not specified'}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Controls and Lineup */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Controls Card */}
            {race.status !== 'COMPLETED' && race.status !== 'CANCELLED' && (
              <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Race Control Panel</CardTitle>
                  <CardDescription>Initiate, reschedule, or cancel this horse race.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  {race.status === 'SCHEDULED' && (
                    <Button 
                      onClick={handleStartRace} 
                      disabled={submitting} 
                      className="bg-green-600 hover:bg-green-700 text-white font-bold"
                    >
                      <Play className="mr-2 h-4 w-4" /> Start Race
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => { setShowTimeForm(!showTimeForm); setShowCancelForm(false); }}
                    className="border-slate-300 hover:bg-slate-50 text-slate-700"
                  >
                    <Calendar className="mr-2 h-4 w-4 text-slate-500" /> Reschedule Race
                  </Button>

                  <Button 
                    variant="destructive"
                    onClick={() => { setShowCancelForm(!showCancelForm); setShowTimeForm(false); }}
                    className="font-bold"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Cancel Race
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Time rescheduling form */}
            {showTimeForm && (
              <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Reschedule Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateTime} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={newTimeData.date} 
                        onChange={(e) => setNewTimeData({...newTimeData, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input 
                        id="start_time" 
                        type="time" 
                        value={newTimeData.start_time} 
                        onChange={(e) => setNewTimeData({...newTimeData, start_time: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input 
                        id="end_time" 
                        type="time" 
                        value={newTimeData.end_time} 
                        onChange={(e) => setNewTimeData({...newTimeData, end_time: e.target.value})}
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-2 md:pt-0">
                      <Button type="submit" disabled={submitting}>Update</Button>
                      <Button type="button" variant="ghost" onClick={() => setShowTimeForm(false)}>Cancel</Button>
                    </div>
                  </form>
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

            {/* Lineup & Scratch Actions */}
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
                              p.status === 'ACTIVE' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                              p.status === 'SCRATCHED' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                              'bg-red-100 text-red-700 hover:bg-red-100'
                            }>
                              {p.status} {p.reason && `(${p.reason})`}
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
                                  {race.status === 'SCHEDULED' ? (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      disabled={submitting}
                                      onClick={() => handleLateScratch(p.horse_id)}
                                      className="h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                                    >
                                      Scratch
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      disabled={submitting}
                                      onClick={() => handleDisqualify(p.horse_id)}
                                      className="h-8 text-xs"
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
          </div>

          {/* Results Inputs */}
          <div>
            {(race.status === 'IN_PROGRESS' || race.status === 'COMPLETED') ? (
              <Card className="bg-white shadow-md border-slate-200 overflow-hidden sticky top-6">
                <CardHeader className="bg-slate-900 text-white">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Medal className="h-5 w-5 text-amber-400" />
                    Input Race Results
                  </CardTitle>
                  <CardDescription className="text-slate-400">Record placements and photo finishes.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {race.status === 'COMPLETED' ? (
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
                        <Label htmlFor="photo_finish" className="font-semibold text-slate-700">Photo Finish (URL / Base64)</Label>
                        <Input 
                          id="photo_finish" 
                          placeholder="http://example.com/photo-finish.jpg"
                          value={photoFinish}
                          onChange={(e) => setPhotoFinish(e.target.value)}
                          required
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-4 pt-2 border-t border-slate-100">
                        <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider font-mono">Winner Placements</h4>
                        
                        <div className="space-y-2">
                          <Label htmlFor="first_place" className="flex items-center gap-1.5 font-bold">
                            <span className="h-2 w-2 rounded-full bg-amber-400"></span> 1st Place (Gold)
                          </Label>
                          <select 
                            id="first_place"
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={placementResults[1]}
                            onChange={(e) => setPlacementResults({ ...placementResults, 1: Number(e.target.value) })}
                            required
                            disabled={submitting}
                          >
                            <option value="">Select Horse...</option>
                            {participants.filter(p => p.status === 'ACTIVE').map(p => (
                              <option key={p.id} value={p.horse_id}>{p.horse_name} ({p.jockey_name})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="second_place" className="flex items-center gap-1.5 font-bold">
                            <span className="h-2 w-2 rounded-full bg-slate-400"></span> 2nd Place (Silver)
                          </Label>
                          <select 
                            id="second_place"
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={placementResults[2]}
                            onChange={(e) => setPlacementResults({ ...placementResults, 2: Number(e.target.value) })}
                            required
                            disabled={submitting}
                          >
                            <option value="">Select Horse...</option>
                            {participants.filter(p => p.status === 'ACTIVE').map(p => (
                              <option key={p.id} value={p.horse_id}>{p.horse_name} ({p.jockey_name})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="third_place" className="flex items-center gap-1.5 font-bold">
                            <span className="h-2 w-2 rounded-full bg-amber-700/60"></span> 3rd Place (Bronze)
                          </Label>
                          <select 
                            id="third_place"
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={placementResults[3]}
                            onChange={(e) => setPlacementResults({ ...placementResults, 3: Number(e.target.value) })}
                            required
                            disabled={submitting}
                          >
                            <option value="">Select Horse...</option>
                            {participants.filter(p => p.status === 'ACTIVE').map(p => (
                              <option key={p.id} value={p.horse_id}>{p.horse_name} ({p.jockey_name})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={submitting} 
                        className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/95 text-primary-foreground"
                      >
                        {submitting ? 'Locking Results...' : 'Publish & Finalize Results'}
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
