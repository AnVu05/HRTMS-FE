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
import { Plus } from 'lucide-react';

// Aligns with HorseResponse DTO
// HorseStatus enum: WORK | INJURED | RETIRED
export interface HorseRecord {
  id: string;
  ownerId: number;
  ownerName: string;
  name: string;
  age: number;
  breed: string;
  sex: string;           // 'Male' | 'Female' — mapped from `sex` field
  weightKg: number;      // BigDecimal in backend
  status: 'WORK' | 'INJURED' | 'RETIRED';
}

const horseSchema = z.object({
  name: z.string().min(2, 'Horse name must be at least 2 characters'),
  breed: z.string().min(2, 'Breed is required'),
  age: z.string().min(1, 'Age is required').refine(v => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 30, 'Age must be 1–30'),
  sex: z.enum(['Male', 'Female'], { required_error: 'Sex is required' }),
  weightKg: z.string().min(1, 'Weight is required').refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number'),
  ownerName: z.string().min(2, 'Owner name is required'),
  status: z.enum(['WORK', 'INJURED', 'RETIRED'], { required_error: 'Status is required' }),
});
type HorseForm = z.infer<typeof horseSchema>;

// Mock data matching HorseResponse shape
const INITIAL_HORSES: HorseRecord[] = [
  { id: '1', ownerId: 101, ownerName: 'Trần Văn An', name: 'Thunderbolt', breed: 'Thoroughbred', age: 5, sex: 'Male', weightKg: 480, status: 'WORK' },
  { id: '2', ownerId: 102, ownerName: 'Green Valley Stables', name: 'Golden Flash', breed: 'Arabian', age: 4, sex: 'Male', weightKg: 450, status: 'WORK' },
  { id: '3', ownerId: 103, ownerName: 'Pacific Racing', name: 'Storm Rider', breed: 'Quarter Horse', age: 6, sex: 'Female', weightKg: 510, status: 'WORK' },
  { id: '4', ownerId: 104, ownerName: 'Al-Rashid Stables', name: 'Desert Wind', breed: 'Arabian', age: 3, sex: 'Male', weightKg: 420, status: 'WORK' },
  { id: '5', ownerId: 101, ownerName: 'Trần Văn An', name: 'Majestic Star', breed: 'Thoroughbred', age: 7, sex: 'Female', weightKg: 490, status: 'WORK' },
  { id: '6', ownerId: 105, ownerName: 'Mendez Equestrian', name: 'Crimson Tide', breed: 'Quarter Horse', age: 5, sex: 'Male', weightKg: 505, status: 'INJURED' },
  { id: '7', ownerId: 102, ownerName: 'Green Valley Stables', name: 'Silver Bullet', breed: 'Thoroughbred', age: 4, sex: 'Male', weightKg: 460, status: 'WORK' },
  { id: '8', ownerId: 106, ownerName: 'Park Heritage Farm', name: 'Night Fury', breed: 'Andalusian', age: 8, sex: 'Female', weightKg: 520, status: 'RETIRED' },
];

const statusBadge = (s: string) =>
  s === 'WORK' ? 'bg-green-50 text-green-700 border-green-200' :
  s === 'INJURED' ? 'bg-red-50 text-red-700 border-red-200' :
  'bg-gray-100 text-gray-700 border-gray-200';

export default function HorseList() {
  const [horses, setHorses] = useState(INITIAL_HORSES);
  const [statusFilter, setStatusFilter] = useState('All');
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<HorseForm>({
    resolver: zodResolver(horseSchema),
  });

  const onSubmit = (data: HorseForm) => {
    setHorses(prev => [...prev, {
      id: String(prev.length + 1),
      ownerId: 0,
      ownerName: data.ownerName,
      name: data.name,
      breed: data.breed,
      age: Number(data.age),
      sex: data.sex,
      weightKg: Number(data.weightKg),
      status: data.status,
    }]);
    reset();
    setOpen(false);
  };

  const filtered = horses.filter(h => statusFilter === 'All' || h.status === statusFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Horses</h2>
          <p className="text-muted-foreground mt-1">Registry of all competing and resting horses.</p>
        </div>
        <Button className="font-semibold shadow-sm gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Register Horse
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex justify-end bg-muted/20">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="WORK">WORK</SelectItem>
                <SelectItem value="INJURED">INJURED</SelectItem>
                <SelectItem value="RETIRED">RETIRED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horse Name</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead className="text-center">Age</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead className="text-right">Weight (kg)</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No horses found.</TableCell></TableRow>
                ) : filtered.map(h => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.name}</TableCell>
                    <TableCell className="text-muted-foreground">{h.breed}</TableCell>
                    <TableCell className="text-center">{h.age} yrs</TableCell>
                    <TableCell>{h.sex}</TableCell>
                    <TableCell className="text-right font-mono">{h.weightKg} kg</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{h.ownerName}</TableCell>
                    <TableCell><Badge variant="outline" className={statusBadge(h.status)}>{h.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Register Dialog — fields match HorseRequest */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Register Horse</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="name">Horse Name *</Label>
                <Input id="name" placeholder="e.g. Thunderbolt" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="breed">Breed *</Label>
                <Input id="breed" placeholder="e.g. Thoroughbred" {...register('breed')} />
                {errors.breed && <p className="text-xs text-destructive">{errors.breed.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Age (years) *</Label>
                <Input id="age" type="number" min={1} max={30} placeholder="e.g. 5" {...register('age')} />
                {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sex">Sex *</Label>
                <Select onValueChange={v => setValue('sex', v as 'Male' | 'Female', { shouldValidate: true })}>
                  <SelectTrigger id="sex" className={errors.sex ? 'border-destructive' : ''}><SelectValue placeholder="Select sex" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sex && <p className="text-xs text-destructive">{errors.sex.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weightKg">Weight (kg) *</Label>
                <Input id="weightKg" type="number" step="0.01" min={1} placeholder="e.g. 480" {...register('weightKg')} />
                {errors.weightKg && <p className="text-xs text-destructive">{errors.weightKg.message}</p>}
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input id="ownerName" placeholder="e.g. Trần Văn An" {...register('ownerName')} />
                {errors.ownerName && <p className="text-xs text-destructive">{errors.ownerName.message}</p>}
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="status">Status *</Label>
                <Select onValueChange={v => setValue('status', v as HorseForm['status'], { shouldValidate: true })}>
                  <SelectTrigger id="status" className={errors.status ? 'border-destructive' : ''}><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORK">WORK</SelectItem>
                    <SelectItem value="INJURED">INJURED</SelectItem>
                    <SelectItem value="RETIRED">RETIRED</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
              <Button type="submit">Register Horse</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
