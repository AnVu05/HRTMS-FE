import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, MapPin, Calendar, Trophy, Users, Flag, Clock } from 'lucide-react';
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
      toast.error('Please select both a horse and a jockey.');
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
      toast.success(`Successfully registered for ${race.name}!`);
      setIsOpen(false);
      setFormData({ horseId: '', jockeyId: '' });
    } catch (err) {
      // Error is handled by axios interceptor
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

export default function OwnerTournamentDetail() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [races, setRaces] = useState([]);
  const [horses, setHorses] = useState([]);
  const [jockeys, setJockeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const currentOwnerId = localStorage.getItem("user_id");
        const [tournData, racesData, horsesData, jockeysData] = await Promise.all([
          ownerApi.getTournamentById(id),
          ownerApi.getRacesByTournament(id),
          ownerApi.getWorkingHorsesByOwner(currentOwnerId),
          ownerApi.getJockeys()
        ]);
        setTournament(tournData);
        setRaces(racesData?.races || []);
        setHorses(horsesData || []);
        setJockeys(jockeysData || []);
      } catch (err) {
        console.error("Failed to fetch tournament details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading tournament details...</div>;
  }

  if (!tournament) {
    return <div className="p-12 text-center text-red-500">Tournament not found.</div>;
  }

  return (
    <div className="pb-20">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 opacity-80"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <Button asChild variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 mb-8 -ml-4" data-testid="btn-back">
            <Link href="/owner-home/tournaments">
              <span className="flex items-center"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Tournaments</span>
            </Link>
          </Button>
          
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={
                  tournament.status === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600 border-none' :
                  tournament.status === 'UPCOMING' ? 'bg-blue-500 hover:bg-blue-600 border-none' : 
                  'bg-slate-600 hover:bg-slate-700 border-none'
                }>
                  {tournament.status}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight text-white drop-shadow-lg" style={{ color: '#ffffff', opacity: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {tournament.name}
              </h1>
              
              <div className="flex flex-wrap gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">{tournament.startDate || tournament.date}</span>
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
                    <th className="px-6 py-4 font-medium">Specs</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {races.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No races found for this tournament.</td>
                    </tr>
                  ) : races.map((race) => (
                    <tr key={race.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5 font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {race.name}
                      </td>
                      <td className="px-6 py-5 text-slate-600">
                        {race.date} {race.start_time ? ` ${race.start_time}` : ''}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          {(race.distance_m || race.distanceM) && <Badge variant="outline" className="bg-slate-50 text-slate-700">{race.distance_m || race.distanceM}m</Badge>}
                          {(race.condition || race.raceCondition) && <Badge variant="outline" className="bg-slate-50 text-slate-700">{race.condition || race.raceCondition}</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge className={
                          race.status === 'COMPLETED' ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' :
                          race.status === 'IN_PROGRESS' || race.status === 'RACING' ? 'bg-green-500 text-white hover:bg-green-600' :
                          'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }>
                          {race.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/10" data-testid={`btn-view-race-${race.id}`}>
                            <Link href={`/owner-home/races/${race.id}`}>
                              Details
                            </Link>
                          </Button>
                            <RegistrationFormDialog 
                              race={race}
                              tournamentName={tournament.name}
                            horses={horses}
                            jockeys={jockeys}
                            trigger={
                              <Button size="sm" className="bg-[#f59e0b] hover:bg-[#d97706] text-white" disabled={tournament.status !== 'PUBLISHED' || race.status === 'COMPLETED' || race.status === 'IN_PROGRESS' || race.status === 'RACING'} data-testid={`btn-register-race-${race.id}`}>
                                Register
                              </Button>
                            }
                          />
                        </div>
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
