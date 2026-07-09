import { useState } from 'react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronRight, Plus } from 'lucide-react';

// Aligns with RaceResponse DTO
// RaceStatus enum: PENDING_REFEREE | PREPARE | PUBLISHED | ONGOING | COMPLETE | CANCELLED | DELETE
export interface RaceRecord {
  id: string;
  tournamentId: number;   // @JsonProperty("tournament_id")
  name: string;
  date: string;           // LocalDate → "YYYY-MM-DD"
  startTime: string;      // LocalTime → "HH:mm"
  endTime: string | null;
  distanceM: number;      // @JsonProperty("distance_m") — integer, metres
  numHorse: number;       // @JsonProperty("num_horse")
  refereeId: number | null;
  raceRulesId: number | null;
  expectedDurationMinutes: number | null;
  status: 'PENDING_REFEREE' | 'PREPARE' | 'PUBLISHED' | 'ONGOING' | 'COMPLETE' | 'CANCELLED' | 'DELETE';
  reason: string | null;
  canceledAt: string | null;
}

const raceSchema = z.object({
  name: z.string().min(3, 'Race name must be at least 3 characters'),
  tournamentId: z.string().min(1, 'Tournament ID is required').refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be a valid ID'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  distanceM: z.string().min(1, 'Distance is required').refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number (metres)'),
  numHorse: z.string().min(1, 'No. of horses is required').refine(v => !isNaN(Number(v)) && Number(v) >= 2, 'Minimum 2 horses'),
  expectedDurationMinutes: z.string().optional(),
  status: z.enum(['PENDING_REFEREE', 'PREPARE', 'PUBLISHED', 'ONGOING', 'COMPLETE', 'CANCELLED'], { required_error: 'Status is required' }),
});
type RaceForm = z.infer<typeof raceSchema>;

// Mock data matching RaceResponse shape
const INITIAL_RACES: RaceRecord[] = [
  { id: '101', tournamentId: 1, name: 'Opening Sprint', date: '2023-10-15', startTime: '08:00', endTime: '08:20', distanceM: 1200, numHorse: 8, refereeId: 1, raceRulesId: 1, expectedDurationMinutes: 20, status: 'COMPLETE', reason: null, canceledAt: null },
  { id: '102', tournamentId: 1, name: 'Midday Classic', date: '2023-10-15', startTime: '12:00', endTime: '12:25', distanceM: 1600, numHorse: 10, refereeId: 1, raceRulesId: 1, expectedDurationMinutes: 25, status: 'COMPLETE', reason: null, canceledAt: null },
  { id: '103', tournamentId: 1, name: 'Sunset Derby', date: '2023-10-16', startTime: '17:00', endTime: null, distanceM: 2400, numHorse: 12, refereeId: 1, raceRulesId: 2, expectedDurationMinutes: 40, status: 'ONGOING', reason: null, canceledAt: null },
  { id: '104', tournamentId: 1, name: 'Grand Finale', date: '2023-10-20', startTime: '15:00', endTime: null, distanceM: 3200, numHorse: 14, refereeId: null, raceRulesId: 2, expectedDurationMinutes: 55, status: 'PENDING_REFEREE', reason: null, canceledAt: null },
  { id: '201', tournamentId: 2, name: 'Sprint Qualifier', date: '2023-11-05', startTime: '09:00', endTime: null, distanceM: 1000, numHorse: 8, refereeId: null, raceRulesId: 1, expectedDurationMinutes: 15, status: 'PREPARE', reason: null, canceledAt: null },
  { id: '202', tournamentId: 2, name: 'Middle Distance', date: '2023-11-06', startTime: '11:00', endTime: null, distanceM: 1800, numHorse: 10, refereeId: null, raceRulesId: 1, expectedDurationMinutes: 30, status: 'PREPARE', reason: null, canceledAt: null },
  { id: '301', tournamentId: 3, name: 'Championship', date: '2023-09-05', startTime: '14:00', endTime: '14:38', distanceM: 2000, numHorse: 12, refereeId: 2, raceRulesId: 2, expectedDurationMinutes: 35, status: 'COMPLETE', reason: null, canceledAt: null },
  { id: '401', tournamentId: 4, name: 'Coast Run', date: '2023-12-12', startTime: '10:00', endTime: null, distanceM: 1400, numHorse: 8, refereeId: null, raceRulesId: 1, expectedDurationMinutes: 22, status: 'PUBLISHED', reason: null, canceledAt: null },
  { id: '501', tournamentId: 5, name: 'Summer Special', date: '2023-07-15', startTime: '08:30', endTime: '09:05', distanceM: 1600, numHorse: 10, refereeId: 3, raceRulesId: 1, expectedDurationMinutes: 25, status: 'COMPLETE', reason: null, canceledAt: null },
  { id: '601', tournamentId: 6, name: 'Masters Final', date: '2023-06-25', startTime: '16:00', endTime: '16:42', distanceM: 2400, numHorse: 14, refereeId: 2, raceRulesId: 3, expectedDurationMinutes: 40, status: 'COMPLETE', reason: null, canceledAt: null },
];

const statusClass = (s: string) =>
  s === 'COMPLETE' ? 'bg-gray-100 text-gray-700 border-gray-200' :
  s === 'ONGOING' ? 'bg-primary/10 text-primary border-primary/20' :
  s === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
  s === 'PENDING_REFEREE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
  'bg-blue-50 text-blue-700 border-blue-200';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function RaceList() {
  const [races, setRaces] = useState(INITIAL_RACES);
  const [statusFilter, setStatusFilter] = useState('All');
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<RaceForm>({
    resolver: zodResolver(raceSchema),
  });

  const onSubmit = (data: RaceForm) => {
    setRaces(prev => [...prev, {
      id: String(Number(prev[prev.length - 1]?.id ?? 0) + 1),
      tournamentId: Number(data.tournamentId),
      name: data.name,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime || null,
      distanceM: Number(data.distanceM),
      numHorse: Number(data.numHorse),
      refereeId: null,
      raceRulesId: null,
      expectedDurationMinutes: data.expectedDurationMinutes ? Number(data.expectedDurationMinutes) : null,
      status: data.status,
      reason: null,
      canceledAt: null,
    }]);
    reset();
    setOpen(false);
  };

  const filtered = races.filter(r => statusFilter === 'All' || r.status === statusFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Races</h2>
          <p className="text-muted-foreground mt-1">Monitor race schedules, status, and results.</p>
        </div>
        <Button className="font-semibold shadow-sm gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Schedule Race
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex justify-end bg-muted/20">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] bg-background"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="PENDING_REFEREE">PENDING_REFEREE</SelectItem>
                <SelectItem value="PREPARE">PREPARE</SelectItem>
                <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                <SelectItem value="ONGOING">ONGOING</SelectItem>
                <SelectItem value="COMPLETE">COMPLETE</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Race Name</TableHead>
                  <TableHead className="text-center">Tournament ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead className="text-right">Distance (m)</TableHead>
                  <TableHead className="text-center">Horses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No races found.</TableCell></TableRow>
                ) : filtered.map(r => (
                  <TableRow key={r.id} className="group hover:bg-muted/50">
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-center text-muted-foreground font-mono text-xs">{r.tournamentId}</TableCell>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell className="font-mono text-sm">{r.startTime}</TableCell>
                    <TableCell className="text-right font-mono">{r.distanceM.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{r.numHorse}</TableCell>
                    <TableCell><Badge variant="outline" className={statusClass(r.status)}>{r.status}</Badge></TableCell>
                    <TableCell>
                      <Link href={`/races/${r.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Race Dialog — fields match RaceCreateRequest */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Schedule Race</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="name">Race Name *</Label>
                <Input id="name" placeholder="e.g. Opening Sprint" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tournamentId">Tournament ID *</Label>
                <Input id="tournamentId" type="number" min={1} placeholder="e.g. 1" {...register('tournamentId')} />
                {errors.tournamentId && <p className="text-xs text-destructive">{errors.tournamentId.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Race Date *</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="startTime">Start Time (start_time) *</Label>
                <Input id="startTime" type="time" {...register('startTime')} />
                {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endTime">End Time (end_time) <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input id="endTime" type="time" {...register('endTime')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="distanceM">Distance in metres (distance_m) *</Label>
                <Input id="distanceM" type="number" min={1} placeholder="e.g. 1600" {...register('distanceM')} />
                {errors.distanceM && <p className="text-xs text-destructive">{errors.distanceM.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="numHorse">No. of Horses (num_horse) *</Label>
                <Input id="numHorse" type="number" min={2} placeholder="e.g. 8" {...register('numHorse')} />
                {errors.numHorse && <p className="text-xs text-destructive">{errors.numHorse.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expectedDurationMinutes">Expected Duration (min) <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input id="expectedDurationMinutes" type="number" min={1} placeholder="e.g. 25" {...register('expectedDurationMinutes')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status *</Label>
                <Select onValueChange={v => setValue('status', v as RaceForm['status'], { shouldValidate: true })}>
                  <SelectTrigger id="status" className={errors.status ? 'border-destructive' : ''}><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING_REFEREE">PENDING_REFEREE</SelectItem>
                    <SelectItem value="PREPARE">PREPARE</SelectItem>
                    <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
              <Button type="submit">Schedule Race</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
