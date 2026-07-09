import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '@/api/adminApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { UserPlus } from 'lucide-react';

function AssignDoctorDialog({ registrationId }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: adminApi.getDoctors
  });

  const { handleSubmit, control } = useForm({
    defaultValues: {
      doctorId: '',
    }
  });

  const assignMutation = useMutation({
    mutationFn: adminApi.assignDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrationForms'] });
      setOpen(false);
    }
  });

  const onSubmit = (data) => {
    assignMutation.mutate({
      registrationFormId: registrationId,
      doctorId: parseInt(data.doctorId, 10),
      status: 'PENDING_DOCTOR'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
          <UserPlus className="mr-2 h-4 w-4" /> Add Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Doctor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="doctorId">Select Doctor</Label>
            <Controller
              name="doctorId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doc => (
                      <SelectItem key={doc.userId} value={doc.userId.toString()}>{doc.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-[#f59e0b] hover:bg-[#d97706] text-white" disabled={assignMutation.isPending}>
              {assignMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Medical() {
  const { data: registrationForms = [], isLoading } = useQuery({
    queryKey: ['registrationForms'],
    queryFn: adminApi.getRegistrationForms
  });

  const prepareRegistrations = registrationForms.filter(reg => reg.status === 'PREPARE');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Medical Clearance</h2>
        <p className="text-muted-foreground mt-2">Health check evaluations linked to registration forms.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reg. Form ID</TableHead>
                <TableHead>Tournament</TableHead>
                <TableHead>Race</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : prepareRegistrations.length > 0 ? prepareRegistrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">{reg.id}</TableCell>
                  <TableCell>{reg.tournament_name}</TableCell>
                  <TableCell>{reg.race_name}</TableCell>
                  <TableCell>{reg.owner_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      {reg.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <AssignDoctorDialog registrationId={reg.id} />
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No prepare registration forms found.
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
