import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jockeyService } from '@/services/jockey.service';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ChevronRight, Filter, Plus } from 'lucide-react';

// Aligns with JockeyProfileResponse + Jockey entity (extends User)
export interface JockeyRecord {
  id: string;
  username: string;
  email: string;
  jockeyName: string;
  experienceYears: number;
  age: number;
  professionalBio: string;
  // UserStatus enum: ACTIVE | INACTIVE | DELETE
  status: 'ACTIVE' | 'INACTIVE' | 'DELETE';
  avatar: string;
}

const jockeySchema = z.object({
  jockeyName: z.string().min(2, 'Jockey name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Enter a valid email address'),
  age: z.string().min(1, 'Age is required').refine(v => !isNaN(Number(v)) && Number(v) >= 16 && Number(v) <= 70, 'Age must be 16–70'),
  experienceYears: z.string().min(1, 'Experience is required').refine(v => !isNaN(Number(v)) && Number(v) >= 0, 'Must be ≥ 0'),
  professionalBio: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE'], { required_error: 'Status is required' }),
});
type JockeyForm = z.infer<typeof jockeySchema>;

// Mock data removed in favor of real API


const statusBadge = (s: string) =>
  s === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
    s === 'INACTIVE' ? 'bg-red-50 text-red-700 border-red-200' :
      'bg-gray-100 text-gray-700 border-gray-200';

export default function JockeyList() {
  const [jockeys, setJockeys] = useState<JockeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    jockeyService.getAllJockeys()
      .then(response => {
        const list = response.data || response || [];
        const normalized = list.map((j: any) => ({
          id: String(j.id),
          username: j.username || '',
          email: j.email || '',
          jockeyName: j.jockeyName || j.username || 'Unknown',
          experienceYears: j.experienceYears !== null && j.experienceYears !== undefined ? Number(j.experienceYears) : (j.experienceYears || 0),
          age: j.age !== null && j.age !== undefined ? Number(j.age) : (j.age || 0),
          professionalBio: j.professionalBio || '',
          status: j.status || 'ACTIVE',
          avatar: j.avatar || '',
        }));
        setJockeys(normalized);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch jockeys');
        setLoading(false);
      });
  }, []);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<JockeyForm>({
    resolver: zodResolver(jockeySchema),
  });

  const onSubmit = (data: JockeyForm) => {
    setJockeys(prev => [...prev, {
      id: String(prev.length + 1),
      username: data.username,
      email: data.email,
      jockeyName: data.jockeyName,
      experienceYears: Number(data.experienceYears),
      age: Number(data.age),
      professionalBio: data.professionalBio ?? '',
      status: data.status,
      avatar: '',
    }]);
    reset();
    setOpen(false);
  };

  const filtered = jockeys.filter(j => {
    const q = search.toLowerCase();
    const name = j.jockeyName || '';
    const username = j.username || '';
    const email = j.email || '';
    const matchSearch = name.toLowerCase().includes(q) || username.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Jockeys</h2>
          <p className="text-muted-foreground mt-1">Manage jockey profiles, credentials, and status.</p>
        </div>
        <Button className="font-semibold shadow-sm gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Register New Jockey
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center bg-muted/20">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, username or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jockey Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Age</TableHead>
                  <TableHead className="text-center">Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Loading jockeys...</TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-red-500">Error: {error}</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No jockeys found.</TableCell></TableRow>
                ) : filtered.map(j => (
                  <TableRow key={j.id} className="group hover:bg-muted/50">
                    <TableCell className="font-medium">{j.jockeyName}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{j.username}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{j.email}</TableCell>
                    <TableCell className="text-center">{j.age}</TableCell>
                    <TableCell className="text-center">{j.experienceYears} yrs</TableCell>
                    <TableCell><Badge variant="outline" className={statusBadge(j.status)}>{j.status}</Badge></TableCell>
                    <TableCell>
                      <Link href={`/jockeys/${j.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-foreground"><ChevronRight className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Register Dialog */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Register New Jockey</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="jockeyName">Full Name (jockeyName) *</Label>
                <Input id="jockeyName" placeholder="e.g. Nguyễn Văn Minh" {...register('jockeyName')} />
                {errors.jockeyName && <p className="text-xs text-destructive">{errors.jockeyName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="username">Username *</Label>
                <Input id="username" placeholder="e.g. nguyen.minh" {...register('username')} />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="e.g. minh@hrtms.org" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Age *</Label>
                <Input id="age" type="number" min={16} max={70} placeholder="e.g. 32" {...register('age')} />
                {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="experienceYears">Experience (years) *</Label>
                <Input id="experienceYears" type="number" min={0} placeholder="e.g. 10" {...register('experienceYears')} />
                {errors.experienceYears && <p className="text-xs text-destructive">{errors.experienceYears.message}</p>}
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="status">Status *</Label>
                <Select onValueChange={v => setValue('status', v as 'ACTIVE' | 'INACTIVE', { shouldValidate: true })}>
                  <SelectTrigger id="status" className={errors.status ? 'border-destructive' : ''}><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="professionalBio">Professional Bio <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea id="professionalBio" placeholder="Brief professional background…" rows={3} {...register('professionalBio')} />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
              <Button type="submit">Register Jockey</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
