import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Flag, MapPin, Trophy, Timer, ClipboardList, Activity, DollarSign } from 'lucide-react';
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
      toast.error('Please select both a horse and a jockey.', { style: { backgroundColor: '#ffcccc', color: 'black' } });
      return;
    }
    
    setSubmitting(true);
    try {
      const currentOwnerId = localStorage.getItem("user_id");
      await ownerApi.createRegistration({
        ownerId: parseInt(currentOwnerId),
        horseId: parseInt(formData.horseId),
        jockeyId: parseInt(formData.jockeyId),
        tournamentId: race.tournament_id || race.tournamentId,
        raceId: race.id
      });
      toast.success(`Successfully registered for ${race.name}!`, { style: { backgroundColor: '#4caf50', color: 'white' } });
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
  const [raceFormat, setRaceFormat] = useState(null);

  useEffect(() => {
    const fetchRaceDetails = async () => {
      try {
        const raceData = await ownerApi.getRaceById(id);
        setRace(raceData);
        
        if (raceData) {
          const tId = raceData.tournament_id || raceData.tournamentId;
          if (tId) {
            try {
              const currentOwnerId = localStorage.getItem("user_id");
              const [tournData, horsesData, jockeysData] = await Promise.all([
                ownerApi.getTournamentById(tId),
                ownerApi.getWorkingHorsesByOwner(currentOwnerId),
                ownerApi.getJockeys()
              ]);
              setTournament(tournData);
              setHorses(horsesData || []);
              setJockeys(jockeysData || []);
            } catch (e) {
              console.error("Failed to fetch tournament details", e);
            }
          }
          
          const rulesId = raceData.race_rules_id || raceData.raceRulesId;
          if (rulesId) {
            try {
              const formatData = await ownerApi.getRaceFormatById(rulesId);
              setRaceFormat(formatData);
            } catch (e) {
              console.error("Failed to fetch race format", e);
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
        {/* Race Format */}
        <Card className="bg-white shadow-md border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" /> 
              Race Format
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {raceFormat ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Horse Requirements */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Flag className="h-4 w-4 text-slate-500" /> Horse Requirements
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Allowed Breed</span>
                      <span className="font-medium text-slate-900">{raceFormat.allowedBreed || 'Any'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Allowed Age</span>
                      <span className="font-medium text-slate-900">{raceFormat.allowedHorseAge ? `${raceFormat.allowedHorseAge} years` : 'Any'}</span>
                    </div>
                  </div>
                </div>

                {/* Jockey & Weight Rules */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-slate-500" /> Jockey & Weight
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Min. Experience</span>
                      <span className="font-medium text-slate-900">{raceFormat.minJockeyExperience || 0} races</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Weight Range</span>
                      <span className="font-medium text-slate-900">{raceFormat.minWeight || 0}kg - {raceFormat.maxWeight || 'Max'}kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Base Weight</span>
                      <span className="font-medium text-slate-900">{raceFormat.baseWeight || 0}kg</span>
                    </div>
                    {raceFormat.applyFemaleAllowance > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Female Allowance</span>
                        <span className="font-medium text-green-600">-{raceFormat.applyFemaleAllowance}kg</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fees & Prizes */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" /> Fees & Prizes
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Entry Fee</span>
                      <span className="font-medium text-amber-600">${raceFormat.entryFee || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">1st Prize</span>
                      <span className="font-medium text-slate-900">{raceFormat.firstPrizePercent || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">2nd Prize</span>
                      <span className="font-medium text-slate-900">{raceFormat.secondPrizePercent || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">3rd Prize</span>
                      <span className="font-medium text-slate-900">{raceFormat.thirdPrizePercent || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No race format information available.
              </div>
            )}
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}
