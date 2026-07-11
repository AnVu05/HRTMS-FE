import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ownerApi } from '@/api/ownerApi';
import { toast } from 'sonner';

const statusColor = {
  WORK: 'bg-green-100 text-green-700',
  INJURED: 'bg-red-100 text-red-700',
  RETIRED: 'bg-gray-100 text-gray-600',
};

const ownerId = localStorage.getItem("user_id");

function HorseFormDialog({ mode = 'add', initialData = null, trigger, onSave }) {
  const isEdit = mode === 'edit';
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', breed: '', sex: '', age: '', weightKg: '', status: 'WORK'
  });
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({ name: '', breed: '', sex: '', age: '', weightKg: '', status: 'WORK' });
      }
    }
  }, [isOpen, isEdit, initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(formData);
      setIsOpen(false);
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
          <DialogTitle>{isEdit ? 'Edit Horse' : 'Add New Horse'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="breed" className="text-right">Breed</Label>
            <Input id="breed" value={formData.breed} onChange={e => handleChange('breed', e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sex" className="text-right">Sex</Label>
            <Input id="sex" value={formData.sex} onChange={e => handleChange('sex', e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="age" className="text-right">Age</Label>
            <Input id="age" type="number" value={formData.age} onChange={e => handleChange('age', e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weightKg" className="text-right">Weight (kg)</Label>
            <Input id="weightKg" type="number" value={formData.weightKg} onChange={e => handleChange('weightKg', e.target.value)} className="col-span-3" required />
          </div>
          {isEdit && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WORK">Work</SelectItem>
                  <SelectItem value="INJURED">Injured</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="bg-slate-900 hover:bg-slate-800 text-white">
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function OwnerHorses() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHorses = async () => {
    try {
      setLoading(true);
      const data = await ownerApi.getHorsesByOwner(ownerId);
      setHorses(data || []);
    } catch (err) {
      console.error("Failed to load horses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorses();
  }, []);

  const handleSave = async (horseData) => {
    const payload = {
      ...horseData,
      ownerId: parseInt(ownerId),
      age: parseInt(horseData.age),
      weightKg: parseFloat(horseData.weightKg)
    };

    if (horseData.id) {
      await ownerApi.updateHorse(horseData.id, payload);
      toast.success("Horse updated successfully");
    } else {
      await ownerApi.createHorse(payload);
      toast.success("Horse created successfully");
    }
    // Refresh the list
    fetchHorses();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Horses</CardTitle>
          <HorseFormDialog 
            mode="add" 
            onSave={handleSave}
            trigger={
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Horse
              </Button>
            } 
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading horses...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {horses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="7" className="text-center text-slate-500 py-6">No horses found.</TableCell>
                  </TableRow>
                ) : horses.map(horse => (
                  <TableRow key={horse.id}>
                    <TableCell className="font-medium">{horse.name}</TableCell>
                    <TableCell>{horse.breed || 'N/A'}</TableCell>
                    <TableCell>{horse.sex || 'N/A'}</TableCell>
                    <TableCell>{horse.age || 'N/A'}</TableCell>
                    <TableCell>{horse.weightKg || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColor[horse.status || 'WORK']} border-transparent`}>
                        {horse.status || 'WORK'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <HorseFormDialog 
                        mode="edit" 
                        initialData={horse}
                        onSave={handleSave}
                        trigger={
                          <Button variant="ghost" size="sm" className="text-blue-600">
                            <Edit2 className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        } 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
