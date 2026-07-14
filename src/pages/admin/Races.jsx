import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, MapPin, DollarSign, Plus, AlertTriangle, Ruler, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '@/api/adminApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';

const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/;

function RaceFormDialog({ mode = 'add', initialData = null, tournamentId, trigger }) {
  const isEdit = mode === 'edit';
  
  const formatDateForForm = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      tournamentId: tournamentId || initialData?.tournament_id || initialData?.tournamentId,
      date: formatDateForForm(initialData?.date),
      startTime: initialData?.startTime || initialData?.start_time || '',
      endTime: initialData?.endTime || initialData?.end_time || '',
      distanceM: initialData?.distanceM || initialData?.distance_m || '',
      numHorse: initialData?.numHorse || initialData?.num_horse || '',
      refereeId: initialData?.refereeId?.toString() || initialData?.referee?.id?.toString() || '',
      status: initialData?.status || 'PENDING_REFEREE',
      raceRulesId: initialData?.raceRulesId?.toString() || initialData?.raceRules?.id?.toString() || '',
      expectedDurationMinutes: initialData?.expectedDurationMinutes || initialData?.expected_duration_minutes || '',
      breakTimeMinutes: initialData?.breakTimeMinutes || initialData?.break_time_minutes || '',
      canceledAt: initialData?.canceledAt || new Date().toISOString()
    }
  });

  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: fullRace } = useQuery({
    queryKey: ['raceDetails', initialData?.id],
    queryFn: () => adminApi.getRaceById(initialData.id),
    enabled: isEdit && isOpen && !!initialData?.id,
  });

  useEffect(() => {
    if (fullRace && isEdit) {
      const data = fullRace.data || fullRace;
      reset({
        name: data.name || '',
        tournamentId: data.tournament_id || data.tournamentId,
        date: formatDateForForm(data.date),
        startTime: data.start_time || data.startTime || '',
        endTime: data.end_time || data.endTime || '',
        distanceM: data.distance_m || data.distanceM || '',
        numHorse: data.num_horse || data.numHorse || '',
        refereeId: data.referee_id?.toString() || data.referee?.id?.toString() || data.refereeId?.toString() || '',
        status: data.status || 'PENDING_REFEREE',
        raceRulesId: data.race_rules_id?.toString() || data.raceRules?.id?.toString() || data.raceRulesId?.toString() || '',
        expectedDurationMinutes: data.expected_duration_minutes || data.expectedDurationMinutes || '',
        breakTimeMinutes: data.break_time_minutes || data.breakTimeMinutes || '',
        canceledAt: data.canceledAt || new Date().toISOString()
      });
    } else if (!isEdit && isOpen) {
      reset({
        name: '',
        tournamentId: tournamentId,
        date: '',
        startTime: '',
        endTime: '',
        distanceM: '',
        numHorse: '',
        refereeId: '',
        status: 'PENDING_REFEREE',
        raceRulesId: '',
        expectedDurationMinutes: '',
        breakTimeMinutes: '',
        canceledAt: new Date().toISOString()
      });
    }
  }, [fullRace, isEdit, isOpen, reset, tournamentId]);

  const { data: formats = [] } = useQuery({ queryKey: ['raceFormats'], queryFn: adminApi.getRaceFormats });
  const { data: referees = [] } = useQuery({ queryKey: ['referees'], queryFn: adminApi.getReferees });

  const saveMutation = useMutation({
    mutationFn: isEdit ? (data) => adminApi.updateRace(initialData.id, data) : (data) => adminApi.createRace(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['races', tournamentId]);
      setIsOpen(false);
    },
    onError: (error) => {
      console.error(`Failed to ${mode} race:`, error);
    }
  });

  const onSubmit = (data) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      const [dd, mm, yyyy] = dateStr.split('/');
      return `${yyyy}-${mm}-${dd}`;
    };

    const payload = {
      name: data.name,
      tournament_id: data.tournamentId ? parseInt(data.tournamentId) : null,
      date: formatDate(data.date),
      start_time: data.startTime + (data.startTime && data.startTime.length === 5 ? ":00" : ""),
      end_time: data.endTime + (data.endTime && data.endTime.length === 5 ? ":00" : ""),
      distance_m: data.distanceM ? parseInt(data.distanceM) : null,
      num_horse: data.numHorse ? parseInt(data.numHorse) : null,
      referee_id: data.refereeId ? parseInt(data.refereeId) : null,
      status: data.status,
      race_rules_id: data.raceRulesId ? parseInt(data.raceRulesId) : null,
      expected_duration_minutes: data.expectedDurationMinutes ? parseInt(data.expectedDurationMinutes) : null,
      break_time_minutes: data.breakTimeMinutes ? parseInt(data.breakTimeMinutes) : null
    };

    saveMutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Update Race' : 'Add New Race'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <input type="hidden" {...register("tournamentId")} />
          <input type="hidden" {...register("status")} />
          <input type="hidden" {...register("canceledAt")} />
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" data-testid="race-name" className="col-span-3" {...register("name", { required: true })} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Date</Label>
            <div className="col-span-3">
              <Input 
                id="date" 
                data-testid="race-date"
                type="text" 
                placeholder="DD/MM/YYYY"
                {...register("date", { 
                  required: "Date is required",
                  pattern: { value: dateRegex, message: "Invalid date format. Use DD/MM/YYYY" }
                })} 
              />
              {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">Start Time</Label>
            <Input id="startTime" data-testid="race-start-time" type="time" step="1" className="col-span-3" {...register("startTime")} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">End Time</Label>
            <Input id="endTime" data-testid="race-end-time" type="time" step="1" className="col-span-3" {...register("endTime")} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="distanceM" className="text-right">Distance (m)</Label>
            <Input id="distanceM" data-testid="race-distance" type="number" className="col-span-3" {...register("distanceM")} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="numHorse" className="text-right">No. of Horses</Label>
            <Input id="numHorse" data-testid="race-num-horse" type="number" className="col-span-3" {...register("numHorse")} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="raceRulesId" className="text-right">Race Rule ID</Label>
            <Controller
              name="raceRulesId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Rule Format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map(fmt => (
                      <SelectItem key={fmt.id} value={fmt.id.toString()}>{fmt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="refereeId" className="text-right">Referee</Label>
            <Controller
              name="refereeId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Referee" />
                  </SelectTrigger>
                  <SelectContent>
                    {referees.map(ref => (
                      <SelectItem key={ref.id} value={ref.id.toString()}>{ref.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expectedDurationMinutes" className="text-right">Expected Duration (min)</Label>
            <Input id="expectedDurationMinutes" type="number" className="col-span-3" {...register("expectedDurationMinutes")} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="breakTimeMinutes" className="text-right">Break Time (min)</Label>
            <Input id="breakTimeMinutes" type="number" className="col-span-3" {...register("breakTimeMinutes")} />
          </div>

          <DialogFooter>
            <Button type="submit" data-testid="race-submit-btn" className="bg-[#f59e0b] hover:bg-[#d97706] text-white">Save Race</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CancelRaceDialog({ race, tournamentId, trigger }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => adminApi.cancelRace(race.id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['races', tournamentId]);
      setIsOpen(false);
      setReason("");
    },
    onError: (error) => {
      console.error("Failed to cancel race:", error);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Race</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel "{race.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="cancel-reason">Reason for cancellation</Label>
          <Textarea 
            id="cancel-reason" 
            placeholder="Enter reason..." 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending || !reason.trim()}>
            {cancelMutation.isPending ? 'Canceling...' : 'Confirm Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Races() {
  const queryClient = useQueryClient();
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedRace, setSelectedRace] = useState(null);

  const { data: tournaments = [], isLoading: loadingTournaments } = useQuery({
    queryKey: ['tournamentsDashboard'],
    queryFn: adminApi.getTournamentsDashboard
  });

  const { data: races = [], isLoading: loadingRaces } = useQuery({
    queryKey: ['races', selectedTournament?.id],
    queryFn: () => adminApi.getRacesByTournament(selectedTournament.id),
    enabled: !!selectedTournament,
    select: (data) => data.races || []
  });

  const { data: fullSelectedRace } = useQuery({
    queryKey: ['raceDetails', selectedRace?.id],
    queryFn: () => adminApi.getRaceById(selectedRace.id),
    enabled: !!selectedRace,
    select: (data) => data.data || data
  });

  const { data: officialResults = [] } = useQuery({
    queryKey: ['officialResults', selectedRace?.id],
    queryFn: () => adminApi.getRaceOfficialResults(selectedRace.id),
    enabled: !!selectedRace,
    select: (data) => Array.isArray(data) ? data : (data?.data || [])
  });

  if (selectedRace) {
    const displayRace = fullSelectedRace || selectedRace;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setSelectedRace(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold">{displayRace.name}</h2>
            <Badge variant="outline">{displayRace.status}</Badge>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-6">
          {selectedTournament.name} • {displayRace.date}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                 <Ruler className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="text-xl font-bold">{displayRace.distance_m || displayRace.distanceM || displayRace.distance}m</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                 <Clock className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Winning Time</p>
                <p className="text-xl font-bold">
                  {displayRace.status === 'COMPLETE' && officialResults.length > 0 
                    ? officialResults.find(r => r.pos === 1)?.finishTime || '--:--:--'
                    : '--:--:--'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Official Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pos</TableHead>
                  <TableHead>Jockey</TableHead>
                  <TableHead>Horse</TableHead>
                  <TableHead>Finish Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {officialResults.length > 0 ? (
                  officialResults.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{result.pos}</TableCell>
                      <TableCell>{result.jockey}</TableCell>
                      <TableCell>{result.horse}</TableCell>
                      <TableCell>{result.finishTime}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No results available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedTournament) {
    return (
      <div className="space-y-6">
        {/* Tournament Detail Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setSelectedTournament(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold">{selectedTournament.name}</h2>
            <Badge variant={selectedTournament.status === 'PUBLISHED' ? 'default' : 'secondary'}>
              {selectedTournament.status}
            </Badge>
          </div>
        </div>

        <div className="flex gap-6 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {selectedTournament.start_date} - {selectedTournament.end_date}</span>
        </div>

        <Tabs defaultValue="races" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="races">Races ({races.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="races">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Schedule & Results</CardTitle>
                <RaceFormDialog 
                  mode="add" 
                  tournamentId={selectedTournament.id} 
                  trigger={
                    <Button 
                      data-testid="create-race-btn"
                      className="bg-[#f59e0b] hover:bg-[#d97706] text-white"
                      disabled={['COMPLETE', 'CANCELLED'].includes(selectedTournament.status)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Race
                    </Button>
                  } 
                />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Race Name</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {races.length > 0 ? races.map((race) => (
                      <TableRow key={race.id}>
                        <TableCell className="font-medium">{race.name}</TableCell>
                        <TableCell>{race.date} - {race.startTime}</TableCell>
                        <TableCell>{race.distanceM || race.distance}m</TableCell>
                        <TableCell>
                          <Badge variant="outline">{race.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => setSelectedRace(race)}>Details</Button>
                            <RaceFormDialog 
                              mode="edit" 
                              tournamentId={selectedTournament.id}
                              initialData={race}
                              trigger={
                                <Button data-testid="edit-race-btn" variant="outline" size="sm" disabled={!['PENDING_REFEREE', 'PREPARE', 'PUBLISHED', 'WALK_OVER'].includes(race.status)}>Update</Button>
                              }
                            />
                            <CancelRaceDialog 
                              race={race} 
                              tournamentId={selectedTournament.id}
                              trigger={
                                <Button variant="destructive" size="sm" disabled={!['PENDING_REFEREE', 'PREPARE', 'PUBLISHED', 'WALK_OVER'].includes(race.status)}>Cancel</Button>
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No races found for this tournament.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Races Management</h2>
      {loadingTournaments ? (<div>Loading tournaments...</div>) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map(t => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Badge variant={t.status === 'PUBLISHED' ? 'default' : t.status === 'DRAFT' ? 'outline' : 'secondary'} className="mb-2">
                {t.status}
              </Badge>
              <span className="text-xs text-muted-foreground">ID #{t.id}</span>
            </CardHeader>
            <CardContent>
              <h3 className="font-bold text-lg mb-2 truncate">{t.name}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Calendar className="h-3 w-3"/> {t.start_date} - {t.end_date}</p>
                <p className="flex items-center gap-2"><span className="h-3 w-3 text-xs">P</span> Published: {t.published_date}</p>
                <p className="flex items-center gap-2"><span className="h-3 w-3 text-xs">R</span> Predictions: {t.open_prediction_date}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setSelectedTournament(t)}>
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
