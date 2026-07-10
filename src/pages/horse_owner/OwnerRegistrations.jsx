import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ownerApi } from '@/api/ownerApi';
import { toast } from 'sonner';

const ownerId = localStorage.getItem("user_id");

const statusColor = {
  PENDING_JOCKEY: 'bg-yellow-100 text-yellow-700',
  PENDING_ADMIN: 'bg-yellow-100 text-yellow-700',
  PREPARE: 'bg-blue-100 text-blue-700',
  HEALTH_CHECKING: 'bg-purple-100 text-purple-700',
  RACING: 'bg-green-100 text-green-700',
  COMPLETE: 'bg-slate-100 text-slate-700',
  DISQUALIFIED: 'bg-red-100 text-red-700',
  DELETE: 'bg-red-100 text-red-700',
  UPDATE: 'bg-orange-100 text-orange-700',
};

function EditRegistrationDialog({ registration, trigger, onSave, horses, jockeys }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    horseId: registration.horseId ? registration.horseId.toString() : '',
    jockeyId: registration.jockeyId ? registration.jockeyId.toString() : '',
  });
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        horseId: registration.horseId ? registration.horseId.toString() : '',
        jockeyId: registration.jockeyId ? registration.jockeyId.toString() : '',
      });
    }
  }, [isOpen, registration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(registration.id, {
        horseId: parseInt(formData.horseId),
        jockeyId: parseInt(formData.jockeyId),
        ownerId: parseInt(ownerId),
        tournamentId: registration.tournamentId,
        raceId: registration.raceId
      });
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
          <DialogTitle>Edit Registration</DialogTitle>
          <DialogDescription>
            {registration.tournament_name || registration.tournamentName} - {registration.race_name || registration.raceName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="horse" className="text-right">Horse</Label>
            <Select value={formData.horseId} onValueChange={v => setFormData(p => ({ ...p, horseId: v }))}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Horse" />
              </SelectTrigger>
              <SelectContent>
                {horses.map(h => (
                  <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jockey" className="text-right">Jockey</Label>
            <Select value={formData.jockeyId} onValueChange={v => setFormData(p => ({ ...p, jockeyId: v }))}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Jockey" />
              </SelectTrigger>
              <SelectContent>
                {jockeys.map(j => (
                  <SelectItem key={j.id} value={j.id.toString()}>{j.jockeyName || j.username}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
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

function CancelRegistrationDialog({ registration, trigger, onCancel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await onCancel(registration.id);
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
          <DialogTitle>Cancel Registration</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel the registration for <strong>{registration.horse_name || registration.horseName}</strong> in <strong>{registration.race_name || registration.raceName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={submitting}>Back</Button>
          <Button variant="destructive" onClick={handleCancel} disabled={submitting}>
            {submitting ? 'Canceling...' : 'Confirm Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OwnerRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [horses, setHorses] = useState([]);
  const [jockeys, setJockeys] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [regsData, horsesData, jockeysData] = await Promise.all([
        ownerApi.getRegistrationsByOwner(ownerId),
        ownerApi.getHorsesByOwner(ownerId),
        ownerApi.getJockeys()
      ]);
      setRegistrations(regsData || []);
      setHorses(horsesData || []);
      setJockeys(jockeysData || []);
    } catch (err) {
      console.error("Failed to fetch registrations data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (id, updatedData) => {
    await ownerApi.updateRegistration(id, updatedData);
    toast.success("Registration updated successfully");
    fetchData();
  };

  const handleCancel = async (id) => {
    await ownerApi.cancelRegistration(id);
    toast.success("Registration cancelled successfully");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading registrations...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Race</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Horse</TableHead>
                  <TableHead>Jockey</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.length > 0 ? registrations.map(reg => {
                  const isDisabled = ['HEALTH_CHECKING', 'RACING', 'COMPLETE', 'DISQUALIFIED', 'DELETE'].includes(reg.status);
                  return (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.tournament_name || reg.tournamentName}</TableCell>
                    <TableCell>{reg.race_name || reg.raceName}</TableCell>
                    <TableCell>{reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{reg.horse_name || reg.horseName}</TableCell>
                    <TableCell>{reg.jockey_name || reg.jockeyName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColor[reg.status] || 'bg-gray-100 text-gray-700'} border-transparent`}>
                        {reg.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditRegistrationDialog 
                          registration={reg}
                          horses={horses}
                          jockeys={jockeys}
                          onSave={handleSave}
                          trigger={
                            <Button variant="ghost" size="sm" className={`text-blue-600 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isDisabled}>
                              <Edit2 className="h-4 w-4 mr-1" /> Edit
                            </Button>
                          } 
                        />
                        <CancelRegistrationDialog 
                          registration={reg}
                          onCancel={handleCancel}
                          trigger={
                            <Button variant="ghost" size="sm" className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isDisabled}>
                              <XCircle className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                          } 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No registrations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
