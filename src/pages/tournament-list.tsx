import { useState } from 'react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Tag } from 'lucide-react';

// Aligns with TournamentResponse DTO
// TournamentStatus enum: DRAFT | PUBLISHED | COMPLETE | CANCELLED | DELETE
export interface TournamentRecord {
  id: string;
  adminId: number;
  name: string;
  createdAt: string;
  startDate: string;       // LocalDate → ISO string "YYYY-MM-DD"
  endDate: string;
  publishedDate: string | null;
  openPredictionDate: string | null;
  closePredictionDate: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETE' | 'CANCELLED' | 'DELETE';
  canceledAt: string | null;
  reason: string | null;
}

const tournamentSchema = z.object({
  name: z.string().min(3, 'Tournament name must be at least 3 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  publishedDate: z.string().optional(),
  openPredictionDate: z.string().optional(),
  closePredictionDate: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'COMPLETE', 'CANCELLED'], { required_error: 'Status is required' }),
}).refine(d => !d.endDate || !d.startDate || new Date(d.endDate) >= new Date(d.startDate), {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});
type TournamentForm = z.infer<typeof tournamentSchema>;

// Mock data matching TournamentResponse (JSON field names use snake_case from @JsonProperty)
const INITIAL_TOURNAMENTS: TournamentRecord[] = [
  { id: '1', adminId: 1, name: 'Hanoi Grand Prix', createdAt: '2023-09-01T08:00:00', startDate: '2023-10-15', endDate: '2023-10-20', publishedDate: '2023-09-10', openPredictionDate: '2023-10-10', closePredictionDate: '2023-10-14', status: 'PUBLISHED', canceledAt: null, reason: null },
  { id: '2', adminId: 1, name: 'Ho Chi Minh Classic', createdAt: '2023-09-20T08:00:00', startDate: '2023-11-05', endDate: '2023-11-10', publishedDate: '2023-10-01', openPredictionDate: '2023-11-01', closePredictionDate: '2023-11-04', status: 'PUBLISHED', canceledAt: null, reason: null },
  { id: '3', adminId: 1, name: 'Saigon Sprint', createdAt: '2023-07-01T08:00:00', startDate: '2023-09-01', endDate: '2023-09-05', publishedDate: '2023-07-15', openPredictionDate: '2023-08-25', closePredictionDate: '2023-08-31', status: 'COMPLETE', canceledAt: null, reason: null },
  { id: '4', adminId: 1, name: 'Da Nang Derby', createdAt: '2023-10-01T08:00:00', startDate: '2023-12-12', endDate: '2023-12-18', publishedDate: null, openPredictionDate: null, closePredictionDate: null, status: 'DRAFT', canceledAt: null, reason: null },
  { id: '5', adminId: 1, name: 'Summer Cup', createdAt: '2023-05-01T08:00:00', startDate: '2023-07-10', endDate: '2023-07-15', publishedDate: '2023-05-20', openPredictionDate: '2023-07-05', closePredictionDate: '2023-07-09', status: 'COMPLETE', canceledAt: null, reason: null },
  { id: '6', adminId: 1, name: 'Asian Masters', createdAt: '2023-04-01T08:00:00', startDate: '2023-06-18', endDate: '2023-06-25', publishedDate: '2023-04-15', openPredictionDate: '2023-06-15', closePredictionDate: '2023-06-17', status: 'COMPLETE', canceledAt: null, reason: null },
];

const statusClass = (s: string) =>
  s === 'PUBLISHED' ? 'bg-primary/10 text-primary border-primary/20' :
  s === 'DRAFT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
  s === 'COMPLETE' ? 'bg-gray-100 text-gray-700 border-gray-200' :
  s === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
  'bg-gray-50 text-gray-500 border-gray-200';

const formatDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function TournamentList() {
  const [tournaments, setTournaments] = useState(INITIAL_TOURNAMENTS);
  const [statusFilter, setStatusFilter] = useState('All');
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<TournamentForm>({
    resolver: zodResolver(tournamentSchema),
  });

  const onSubmit = (data: TournamentForm) => {
    setTournaments(prev => [...prev, {
      id: String(prev.length + 1),
      adminId: 1,
      name: data.name,
      createdAt: new Date().toISOString(),
      startDate: data.startDate,
      endDate: data.endDate,
      publishedDate: data.publishedDate || null,
      openPredictionDate: data.openPredictionDate || null,
      closePredictionDate: data.closePredictionDate || null,
      status: data.status,
      canceledAt: null,
      reason: null,
    }]);
    reset();
    setOpen(false);
  };

  const filtered = tournaments.filter(t => statusFilter === 'All' || t.status === statusFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tournaments</h2>
          <p className="text-muted-foreground mt-1">Manage racing events and series.</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-background"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="DRAFT">DRAFT</SelectItem>
              <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
              <SelectItem value="COMPLETE">COMPLETE</SelectItem>
              <SelectItem value="CANCELLED">CANCELLED</SelectItem>
            </SelectContent>
          </Select>
          <Button className="font-semibold shadow-sm gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Create Tournament
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(t => (
          <Card key={t.id} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className={statusClass(t.status)}>{t.status}</Badge>
                <span className="text-xs text-muted-foreground font-mono">ID #{t.id}</span>
              </div>
              <CardTitle className="text-xl">{t.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(t.startDate)} – {formatDate(t.endDate)}</span>
              </div>
              {t.publishedDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Published: {formatDate(t.publishedDate)}</span>
                </div>
              )}
              {t.openPredictionDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Predictions: {formatDate(t.openPredictionDate)} – {formatDate(t.closePredictionDate)}</span>
                </div>
              )}
              {t.status === 'CANCELLED' && t.reason && (
                <p className="text-xs text-red-600 mt-1">Reason: {t.reason}</p>
              )}
            </CardContent>
            <CardFooter className="pt-4 border-t border-border mt-auto">
              <Link href={`/tournaments/${t.id}`} className="w-full">
                <Button variant="secondary" className="w-full">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create Tournament Dialog — fields match TournamentCreateRequest */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create Tournament</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="name">Tournament Name *</Label>
                <Input id="name" placeholder="e.g. Northern Championship" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date (start_date) *</Label>
                <Input id="startDate" type="date" {...register('startDate')} />
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End Date (end_date) *</Label>
                <Input id="endDate" type="date" {...register('endDate')} />
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="publishedDate">Published Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input id="publishedDate" type="date" {...register('publishedDate')} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="status">Status *</Label>
                <Select onValueChange={v => setValue('status', v as TournamentForm['status'], { shouldValidate: true })}>
                  <SelectTrigger id="status" className={errors.status ? 'border-destructive' : ''}><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                    <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="openPredictionDate">Open Prediction Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input id="openPredictionDate" type="date" {...register('openPredictionDate')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="closePredictionDate">Close Prediction Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input id="closePredictionDate" type="date" {...register('closePredictionDate')} />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
              <Button type="submit">Create Tournament</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
