import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Flag, MapPin, Trophy, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ownerApi } from '@/api/ownerApi';

const ownerId = localStorage.getItem("user_id");

function RegistrationFormDialog({ race, tournamentName, trigger, horses, jockeys }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    horseId: '',
    jockeyId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.horseId || !formData.jockeyId) {
      toast.error('Please select both a horse and a jockey.');
      return;
    }
    
    setSubmitting(true);
    try {
      await ownerApi.createRegistration({
        ownerId: parseInt(ownerId),
        horseId: parseInt(formData.horseId),
        jockeyId: parseInt(formData.jockeyId),
        tournamentId: race.tournament_id || race.tournamentId,
        raceId: race.id
      });
      toast.success(`Successfully registered for ${race.name}!`);
      setIsOpen(false);
      setFormData({ horseId: '', jockeyId: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Race Registration</DialogTitle>
          <DialogDescription>
            Register for {race.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-slate-500">Tournament</Label>
            <div className="col-span-3 font-medium text-slate-900">{tournamentName}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-slate-500">Race</Label>
            <div className="col-span-3 font-medium text-slate-900">{race.name}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="horse" className="text-right">Horse</Label>
            <Select value={formData.horseId} onValueChange={v => setFormData(p => ({ ...p, horseId: v }))}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Horse" />
              </SelectTrigger>
              <SelectContent>
                {horses.map(h => (
                  <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>
                ))}
                {horses.length === 0 && <SelectItem value="none" disabled>No horses available</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jockey" className="text-right">Jockey</Label>
            <Select value={formData.jockeyId} onValueChange={v => setFormData(p => ({ ...p, jockeyId: v }))}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Jockey" />
              </SelectTrigger>
              <SelectContent>
                {jockeys.map(j => (
                  <SelectItem key={j.id} value={j.id.toString()}>{j.jockeyName || j.username}</SelectItem>
                ))}
                {jockeys.length === 0 && <SelectItem value="none" disabled>No jockeys available</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
              {submitting ? 'Registering...' : 'Confirm Registration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function OwnerRaceDetail() {
  const { id } = useParams();
  const [race, setRace] = useState(null);
  const [lineup, setLineup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [horses, setHorses] = useState([]);
  const [jockeys, setJockeys] = useState([]);
  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    const fetchRaceDetails = async () => {
      try {
        const raceData = await ownerApi.getRaceById(id);
        setRace(raceData);
        
        if (raceData) {
          const tId = raceData.tournament_id || raceData.tournamentId;
          if (tId) {
            try {
              const [tournData, horsesData, jockeysData] = await Promise.all([
                ownerApi.getTournamentById(tId),
                ownerApi.getHorsesByOwner(ownerId),
                ownerApi.getJockeys()
              ]);
              setTournament(tournData);
              setHorses(horsesData || []);
              setJockeys(jockeysData || []);
            } catch (e) {
              console.error("Failed to fetch tournament details", e);
            }
          }
        }
        
        // If completed, we should ideally fetch results. Since we don't know the exact results format, 
        // or if it exists, we'll try to fetch results first, fallback to lineup
        if (raceData && raceData.status === 'COMPLETED') {
          try {
            const resultsData = await ownerApi.getRaceResults(id);
            setLineup(resultsData || []);
          } catch (e) {
            console.error("Failed to fetch results, trying lineup", e);
            const lineupData = await ownerApi.getRaceStartingLineup(id);
            setLineup(lineupData || []);
          }
        } else {
          const lineupData = await ownerApi.getRaceStartingLineup(id);
          setLineup(lineupData || []);
        }
      } catch (err) {
        console.error("Failed to load race details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRaceDetails();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading race details...</div>;
  }

  if (!race) {
    return <div className="p-12 text-center text-red-500">Race not found.</div>;
  }

  return (
    <div className="pb-20">
      {/* Race Header Banner */}
      <div className="bg-slate-950 text-white border-b border-slate-800">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <Link href={`/owner-home/tournaments/${race.tournament_id}`}>
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 mb-6 -ml-4" data-testid="btn-back">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tournament
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="text-primary border-primary bg-primary/10">
                  Tournament ID: {race.tournament_id}
                </Badge>
                <Badge className={
                  race.status === 'COMPLETED' ? 'bg-slate-700' :
                  race.status === 'IN_PROGRESS' || race.status === 'RACING' ? 'bg-green-500' : 'bg-blue-500'
                }>
                  {race.status}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 text-white drop-shadow-lg" style={{ color: '#ffffff', opacity: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{race.name}</h1>
              <p className="text-slate-400 text-lg flex items-center gap-2">
                <Timer className="h-5 w-5" /> {race.date} {race.start_time ? ` ${race.start_time}` : ''}
              </p>
            </div>
            
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 w-full md:w-auto shrink-0 flex gap-4">
              <div>
                <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Distance</div>
                <div className="text-2xl font-bold text-white" style={{ color: '#ffffff' }}>{race.distance_m || race.distanceM ? `${race.distance_m || race.distanceM}m` : 'N/A'}</div>
              </div>
              <div className="flex items-end ml-4 border-l border-slate-800 pl-4">
                <RegistrationFormDialog 
                  race={race}
                  tournamentName={tournament?.name}
                  horses={horses}
                  jockeys={jockeys}
                  trigger={
                    <Button size="lg" className="bg-[#f59e0b] hover:bg-[#d97706] text-white" disabled={!tournament || tournament.status !== 'PUBLISHED' || race.status === 'COMPLETED' || race.status === 'IN_PROGRESS' || race.status === 'RACING'}>
                      Register Now
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Leaderboard */}
        <Card className="bg-white shadow-md border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" /> 
              {race.status === 'COMPLETED' ? 'Official Results' : 'Starting Lineup'}
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineup.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No lineup or results available yet.</td>
                    </tr>
                  ) : lineup.map((result, idx) => (
                    <tr key={result.id || idx} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5 text-center">
                        {race.status === 'COMPLETED' && (idx === 0 || idx === 1 || idx === 2) ? (
                          <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center shadow-sm font-bold text-white ${
                            idx === 0 ? 'bg-amber-400' :
                            idx === 1 ? 'bg-slate-400' :
                            'bg-amber-700/60'
                          }`}>
                            {idx + 1}
                          </div>
                        ) : (
                          <div className="mx-auto h-8 w-8 flex items-center justify-center font-bold text-slate-500">
                            {idx + 1}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <Link href="/owner-home/jockeys" className="font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer">
                          {result.jockeyName || result.jockey_name || 'Unknown'}
                        </Link>
                      </td>
                      <td className="px-6 py-5 font-medium text-slate-700">
                        {result.horseName || result.horse_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-5 font-mono text-slate-600">
                        {result.time || result.finish_time || '--:--'}
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
