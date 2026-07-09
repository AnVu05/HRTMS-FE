import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HeartPulse, Check, X, Clock, Plus } from 'lucide-react';

// Aligns with HealthCheckResponse DTO
// HealthCheckStatus enum: PENDING_DOCTOR | ACCEPT | REJECT | DELETE | READY
export interface HealthCheckRecord {
  id: string;
  registrationFormId: number;
  doctorId: number;
  // display-only fields resolved from related entities
  doctorName: string;
  jockeyName: string;
  checkDate: string;          // LocalDateTime
  status: 'PENDING_DOCTOR' | 'ACCEPT' | 'REJECT' | 'READY' | 'DELETE';
  medicalNotes: string | null;
}

const evalSchema = z.object({
  registrationFormId: z.string().min(1, 'Registration Form ID is required').refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be a valid ID'),
  doctorName: z.string().min(2, 'Doctor name is required'),
  jockeyName: z.string().min(2, 'Jockey name is required'),
  checkDate: z.string().min(1, 'Date is required'),
  medicalNotes: z.string().optional(),
});
type EvalForm = z.infer<typeof evalSchema>;

// Mock data matching HealthCheckResponse shape
const INITIAL_RECORDS: HealthCheckRecord[] = [
  { id: '1', registrationFormId: 10, doctorId: 1, doctorName: 'Dr. Tran', jockeyName: 'Nguyễn Văn Minh', checkDate: '2023-10-12T08:00:00', status: 'ACCEPT', medicalNotes: 'All vitals normal.' },
  { id: '2', registrationFormId: 11, doctorId: 2, doctorName: 'Dr. Smith', jockeyName: "James O'Brien", checkDate: '2023-10-12T09:30:00', status: 'ACCEPT', medicalNotes: 'Cleared for racing.' },
  { id: '3', registrationFormId: 12, doctorId: 2, doctorName: 'Dr. Smith', jockeyName: 'Carlos Mendez', checkDate: '2023-10-14T14:00:00', status: 'REJECT', medicalNotes: 'Wrist injury requires rest.' },
  { id: '4', registrationFormId: 13, doctorId: 1, doctorName: 'Dr. Tran', jockeyName: 'Takeshi Yamamoto', checkDate: '2023-10-18T10:00:00', status: 'PENDING_DOCTOR', medicalNotes: null },
  { id: '5', registrationFormId: 14, doctorId: 1, doctorName: 'Dr. Tran', jockeyName: 'Emma Richardson', checkDate: '2023-10-18T11:00:00', status: 'PENDING_DOCTOR', medicalNotes: null },
  { id: '6', registrationFormId: 15, doctorId: 2, doctorName: 'Dr. Smith', jockeyName: 'Ahmed Al-Rashid', checkDate: '2023-10-10T09:00:00', status: 'ACCEPT', medicalNotes: 'Annual physical passed.' },
  { id: '7', registrationFormId: 16, doctorId: 1, doctorName: 'Dr. Tran', jockeyName: 'Park Ji-won', checkDate: '2023-10-17T13:00:00', status: 'READY', medicalNotes: 'Post-incident evaluation complete.' },
  { id: '8', registrationFormId: 17, doctorId: 2, doctorName: 'Dr. Smith', jockeyName: 'Luca Bianchi', checkDate: '2023-10-14T08:30:00', status: 'ACCEPT', medicalNotes: 'Cleared.' },
];

const StatusBadge = ({ status }: { status: HealthCheckRecord['status'] }) => {
  if (status === 'ACCEPT') return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 pl-1"><Check className="h-3 w-3" /> ACCEPT</Badge>;
  if (status === 'READY') return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 pl-1"><HeartPulse className="h-3 w-3" /> READY</Badge>;
  if (status === 'PENDING_DOCTOR') return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 pl-1"><Clock className="h-3 w-3" /> PENDING_DOCTOR</Badge>;
  if (status === 'REJECT') return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 pl-1"><X className="h-3 w-3" /> REJECT</Badge>;
  return <Badge variant="outline">{status}</Badge>;
};

export default function MedicalList() {
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [statusFilter, setStatusFilter] = useState('All');
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EvalForm>({
    resolver: zodResolver(evalSchema),
  });

  const onSubmit = (data: EvalForm) => {
    setRecords(prev => [...prev, {
      id: String(prev.length + 1),
      registrationFormId: Number(data.registrationFormId),
      doctorId: 0,
      doctorName: data.doctorName,
      jockeyName: data.jockeyName,
      checkDate: new Date(data.checkDate).toISOString(),
      status: 'PENDING_DOCTOR',
      medicalNotes: data.medicalNotes || null,
    }]);
    reset();
    setOpen(false);
  };

  const filtered = records.filter(r => statusFilter === 'All' || r.status === statusFilter);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Medical Clearance</h2>
          <p className="text-muted-foreground mt-1">Health check evaluations linked to registration forms.</p>
        </div>
        <Button className="font-semibold shadow-sm gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Schedule Evaluation
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex justify-end bg-muted/20">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] bg-background"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="PENDING_DOCTOR">PENDING_DOCTOR</SelectItem>
                <SelectItem value="ACCEPT">ACCEPT</SelectItem>
                <SelectItem value="REJECT">REJECT</SelectItem>
                <SelectItem value="READY">READY</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jockey</TableHead>
                  <TableHead className="text-center">Reg. Form ID</TableHead>
                  <TableHead>Check Date</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Medical Notes</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No records found.</TableCell></TableRow>
                ) : filtered.map(rec => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{rec.jockeyName}</TableCell>
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">{rec.registrationFormId}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(rec.checkDate)}</TableCell>
                    <TableCell>{rec.doctorName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{rec.medicalNotes ?? '—'}</TableCell>
                    <TableCell><StatusBadge status={rec.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Evaluation Dialog — fields match HealthCheckRequest */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Schedule Evaluation</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="registrationFormId">Registration Form ID *</Label>
              <Input id="registrationFormId" type="number" min={1} placeholder="e.g. 18" {...register('registrationFormId')} />
              {errors.registrationFormId && <p className="text-xs text-destructive">{errors.registrationFormId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jockeyName">Jockey Name *</Label>
              <Input id="jockeyName" placeholder="e.g. Emma Richardson" {...register('jockeyName')} />
              {errors.jockeyName && <p className="text-xs text-destructive">{errors.jockeyName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="checkDate">Check Date *</Label>
                <Input id="checkDate" type="date" {...register('checkDate')} />
                {errors.checkDate && <p className="text-xs text-destructive">{errors.checkDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doctorName">Doctor *</Label>
                <Input id="doctorName" placeholder="e.g. Dr. Tran" {...register('doctorName')} />
                {errors.doctorName && <p className="text-xs text-destructive">{errors.doctorName.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="medicalNotes">Medical Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea id="medicalNotes" placeholder="Initial notes or reason for evaluation…" rows={3} {...register('medicalNotes')} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
              <Button type="submit">Schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
