import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  start_date: z.string().regex(dateRegex, "Invalid date format. Use DD/MM/YYYY"),
  end_date: z.string().regex(dateRegex, "Invalid date format. Use DD/MM/YYYY"),
  published_date: z.string().regex(dateRegex, "Invalid date format. Use DD/MM/YYYY").or(z.literal("")).optional(),
  open_prediction_date: z.string().regex(dateRegex, "Invalid date format. Use DD/MM/YYYY").or(z.literal("")).optional(),
  close_prediction_date: z.string().regex(dateRegex, "Invalid date format. Use DD/MM/YYYY").or(z.literal("")).optional(),
  status: z.string().optional(),
  reason: z.string().optional(),
});

function TournamentFormDialog({ mode, initialData, trigger }) {
  const isEdit = mode === 'edit';
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      start_date: initialData?.start_date ? initialData.start_date.split('-').reverse().join('/') : "",
      end_date: initialData?.end_date ? initialData.end_date.split('-').reverse().join('/') : "",
      published_date: initialData?.published_date ? initialData.published_date.split('-').reverse().join('/') : "",
      open_prediction_date: initialData?.open_prediction_date ? initialData.open_prediction_date.split('-').reverse().join('/') : "",
      close_prediction_date: initialData?.close_prediction_date ? initialData.close_prediction_date.split('-').reverse().join('/') : "",
      status: initialData?.status || "DRAFT",
      reason: initialData?.reason || "",
    },
  });

  const { data: fullTournament } = useQuery({
    queryKey: ['tournamentDetails', initialData?.id],
    queryFn: () => adminApi.getTournamentById(initialData.id),
    enabled: isEdit && isOpen && !!initialData?.id,
  });

  React.useEffect(() => {
    if (fullTournament && isEdit) {
      form.reset({
        name: fullTournament.name || "",
        start_date: fullTournament.start_date ? fullTournament.start_date.split('-').reverse().join('/') : "",
        end_date: fullTournament.end_date ? fullTournament.end_date.split('-').reverse().join('/') : "",
        published_date: fullTournament.published_date ? fullTournament.published_date.split('-').reverse().join('/') : "",
        open_prediction_date: fullTournament.open_prediction_date ? fullTournament.open_prediction_date.split('-').reverse().join('/') : "",
        close_prediction_date: fullTournament.close_prediction_date ? fullTournament.close_prediction_date.split('-').reverse().join('/') : "",
        status: fullTournament.status || "DRAFT",
        reason: fullTournament.reason || "",
      });
    } else if (!isEdit && isOpen) {
      form.reset({
        name: "",
        start_date: "",
        end_date: "",
        published_date: "",
        open_prediction_date: "",
        close_prediction_date: "",
        status: "DRAFT",
        reason: "",
      });
    }
  }, [fullTournament, isEdit, isOpen, form]);

  const createMutation = useMutation({
    mutationFn: (data) => adminApi.createTournament(1, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tournamentsDashboard']);
      setIsOpen(false);
      form.reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => adminApi.updateTournament(initialData.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tournamentsDashboard']);
      setIsOpen(false);
    }
  });

  const watchedStatus = form.watch("status");

  const onSubmit = (data) => {
    // Convert DD/MM/YYYY to YYYY-MM-DD
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      const [dd, mm, yyyy] = dateStr.split('/');
      return `${yyyy}-${mm}-${dd}`;
    };

    const payload = {
      ...(isEdit ? { tournament_name: data.name } : { name: data.name }),
      start_date: formatDate(data.start_date),
      end_date: formatDate(data.end_date),
      published_date: formatDate(data.published_date),
      open_prediction_date: formatDate(data.open_prediction_date),
      close_prediction_date: formatDate(data.close_prediction_date),
      status: data.status,
      reason: data.reason
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Tournament' : 'Create New Tournament'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the details for this tournament.' : 'Enter the details to create a new tournament. The status will initially be set to DRAFT.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right mt-3">Name</Label>
            <div className="col-span-3">
              <Input id="name" data-testid="tournament-name" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="start_date" className="text-right mt-3">Start Date</Label>
            <div className="col-span-3">
              <Input id="start_date" data-testid="tournament-start-date" placeholder="DD/MM/YYYY" {...form.register("start_date")} />
              {form.formState.errors.start_date && <p className="text-sm text-red-500 mt-1">{form.formState.errors.start_date.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="end_date" className="text-right mt-3">End Date</Label>
            <div className="col-span-3">
              <Input id="end_date" data-testid="tournament-end-date" placeholder="DD/MM/YYYY" {...form.register("end_date")} />
              {form.formState.errors.end_date && <p className="text-sm text-red-500 mt-1">{form.formState.errors.end_date.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="published_date" className="text-right mt-3">Published</Label>
            <div className="col-span-3">
              <Input id="published_date" data-testid="tournament-published-date" placeholder="DD/MM/YYYY" {...form.register("published_date")} />
              {form.formState.errors.published_date && <p className="text-sm text-red-500 mt-1">{form.formState.errors.published_date.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="open_prediction_date" className="text-right mt-3">Open Pred.</Label>
            <div className="col-span-3">
              <Input id="open_prediction_date" data-testid="tournament-open-prediction-date" placeholder="DD/MM/YYYY" {...form.register("open_prediction_date")} />
              {form.formState.errors.open_prediction_date && <p className="text-sm text-red-500 mt-1">{form.formState.errors.open_prediction_date.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="close_prediction_date" className="text-right mt-3">Close Pred.</Label>
            <div className="col-span-3">
              <Input id="close_prediction_date" data-testid="tournament-close-prediction-date" placeholder="DD/MM/YYYY" {...form.register("close_prediction_date")} />
              {form.formState.errors.close_prediction_date && <p className="text-sm text-red-500 mt-1">{form.formState.errors.close_prediction_date.message}</p>}
            </div>
          </div>
          {isEdit && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="status" className="text-right mt-3">Status</Label>
              <div className="col-span-3">
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="status" data-testid="tournament-status-select">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">DRAFT</SelectItem>
                        <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                        <SelectItem value="COMPLETE">COMPLETE</SelectItem>
                        <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          )}
          {watchedStatus === 'CANCELLED' && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="reason" className="text-right mt-3">Reason</Label>
              <div className="col-span-3">
                <Textarea id="reason" placeholder="Enter reason for cancellation..." {...form.register("reason")} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" data-testid="tournament-submit-btn" className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
              {isEdit ? 'Save Changes' : 'Save as DRAFT'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CancelTournamentDialog({ tournament, trigger }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => adminApi.cancelTournament(tournament.id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tournamentsDashboard']);
      setIsOpen(false);
      setReason("");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Tournament</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel "{tournament.name}"? This action cannot be undone.
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

export function Tournaments() {
  const queryClient = useQueryClient();
  const { data: tournaments = [], isLoading, error } = useQuery({
    queryKey: ['tournamentsDashboard'],
    queryFn: adminApi.getTournamentsDashboard
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error loading tournaments</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tournaments Management</h2>
        <TournamentFormDialog 
          mode="create" 
          trigger={
            <Button data-testid="create-tournament-btn" className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
              <Plus className="mr-2 h-4 w-4" /> Create Tournament
            </Button>
          } 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tournaments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.id}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.start_date}</TableCell>
                  <TableCell>{t.end_date}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'PUBLISHED' ? 'default' : t.status === 'DRAFT' ? 'outline' : 'secondary'}>
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <TournamentFormDialog
                        mode="edit"
                        initialData={t}
                        trigger={
                          <Button data-testid="edit-tournament-btn" variant="outline" size="sm" disabled={!['DRAFT', 'PUBLISHED'].includes(t.status)}>
                            Edit
                          </Button>
                        }
                      />
                      <CancelTournamentDialog 
                        tournament={t} 
                        trigger={
                          <Button variant="destructive" size="sm" disabled={!['DRAFT', 'PUBLISHED'].includes(t.status)}>Cancel</Button>
                        } 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
