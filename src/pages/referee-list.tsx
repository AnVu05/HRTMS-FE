import { useState } from 'react';
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
import { Mail, Plus } from 'lucide-react';

// Aligns with Referee entity (extends User) + RefereeResponse DTO
// UserStatus enum: ACTIVE | INACTIVE | DELETE
export interface RefereeRecord {
  id: string;
  name: string;        // Referee's own `name` field
  username: string;    // From User entity
  email: string;       // From User entity
  status: 'ACTIVE' | 'INACTIVE' | 'DELETE';
  createdAt: string;
}

const refereeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Enter a valid email address'),
  status: z.enum(['ACTIVE', 'INACTIVE'], { required_error: 'Status is required' }),
});
type RefereeForm = z.infer<typeof refereeSchema>;

// Mock data matching Referee entity shape (RefereeResponse only returns id + name;
// full profile mirrors User + Referee combined fields)
const INITIAL_REFEREES: RefereeRecord[] = [
  { id: '1', name: 'Thomas Wayne', username: 'thomas.w', email: 't.wayne@hrtms.org', status: 'ACTIVE', createdAt: '2020-01-15T09:00:00' },
  { id: '2', name: 'Lê Văn Hiếu', username: 'hieu.lv', email: 'hieu.lv@hrtms.org', status: 'ACTIVE', createdAt: '2021-03-20T09:00:00' },
  { id: '3', name: 'Sarah Jenkins', username: 'sarah.j', email: 's.jenkins@hrtms.org', status: 'ACTIVE', createdAt: '2019-06-10T09:00:00' },
  { id: '4', name: 'Marco Silva', username: 'marco.s', email: 'm.silva@hrtms.org', status: 'INACTIVE', createdAt: '2018-11-05T09:00:00' },
  { id: '5', name: 'Kenji Sato', username: 'kenji.s', email: 'k.sato@hrtms.org', status: 'ACTIVE', createdAt: '2022-01-01T09:00:00' },
];

export default function RefereeList() {
  const [referees, setReferees] = useState(INITIAL_REFEREES);
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<RefereeForm>({
    resolver: zodResolver(refereeSchema),
  });

  const onSubmit = (data: RefereeForm) => {
    setReferees(prev => [...prev, {
      id: String(prev.length + 1),
      name: data.name,
      username: data.username,
      email: data.email,
      status: data.status,
      createdAt: new Date().toISOString(),
    }]);
    reset();
    setOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Referees & Stewards</h2>
          <p className="text-muted-foreground mt-1">Officials overseeing the tournaments and races.</p>
        </div>
        <Button className="font-semibold shadow-sm gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add Official
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referees.map(ref => (
                <TableRow key={ref.id} className="group">
                  <TableCell className="font-medium">{ref.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{ref.username}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ref.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      ref.status === 'ACTIVE' ? 'bg-primary/10 text-primary border-primary/20' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }>
                      {ref.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(ref.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title={ref.email}>
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Official Dialog */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Official</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="e.g. Thomas Wayne" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">Username *</Label>
              <Input id="username" placeholder="e.g. thomas.w" {...register('username')} />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="e.g. official@hrtms.org" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
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
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
              <Button type="submit">Add Official</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
