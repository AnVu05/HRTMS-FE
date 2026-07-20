import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import doctorApi from '@/api/doctorApi';
import { Check, X, ClipboardCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function HealthChecking() {
  const queryClient = useQueryClient();
  const doctorId = localStorage.getItem("user_id");

  const { data: healthChecksData, isLoading } = useQuery({
    queryKey: ['doctorHealthChecks', doctorId],
    queryFn: () => doctorApi.getAssignedHealthChecks(doctorId)
  });

  // Extract the array correctly based on API response structure
  const healthChecks = (Array.isArray(healthChecksData) ? healthChecksData : (healthChecksData?.data || []))
    .filter(hc => hc.status === 'DOCTOR_INVITED' || hc.status === 'CHECKING');

  const processMutation = useMutation({
    mutationFn: ({ id, action }) => doctorApi.processHealthCheck(id, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorHealthChecks', doctorId] });
      toast.success("Health check processed successfully", { style: { backgroundColor: '#4caf50', color: 'white' } });
    },
    onError: () => {
      toast.error("Failed to process health check", { style: { backgroundColor: '#ffcccc', color: 'black' } });
    }
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }) => doctorApi.respondToInvitation(id, doctorId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorHealthChecks', doctorId] });
      toast.success("Responded to invitation successfully", { style: { backgroundColor: '#4caf50', color: 'white' } });
    },
    onError: () => {
      toast.error("Failed to respond to invitation", { style: { backgroundColor: '#ffcccc', color: 'black' } });
    }
  });

  const handleProcess = (id, action) => {
    processMutation.mutate({ id, action });
  };

  const handleRespond = (id, status) => {
    respondMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Health Checking</h2>
        <p className="text-muted-foreground mt-2">Manage your assigned health checks for horse registrations.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reg. ID</TableHead>
                <TableHead>Horse Owner</TableHead>
                <TableHead>Horse Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : healthChecks.length > 0 ? healthChecks.map((hc) => (
                <TableRow key={hc.id}>
                  <TableCell className="font-medium">{hc.registrationFormId}</TableCell>
                  <TableCell>{hc.owner_name}</TableCell>
                  <TableCell>{hc.horse_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      hc.status === 'DOCTOR_INVITED' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        hc.status === 'CHECKING' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          hc.status === 'ACCEPT' ? "bg-green-50 text-green-700 border-green-200" :
                            hc.status === 'REJECT' ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-gray-50 text-gray-700 border-gray-200"
                    }>
                      {hc.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {hc.status === 'DOCTOR_INVITED' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => handleRespond(hc.id, 'ACCEPT_INVITATION')}
                          disabled={respondMutation.isPending}
                        >
                          <Check className="mr-2 h-4 w-4" /> Accept Invite
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleRespond(hc.id, 'DECLINE_INVITATION')}
                          disabled={respondMutation.isPending}
                        >
                          <X className="mr-2 h-4 w-4" /> Decline
                        </Button>
                      </div>
                    ) : hc.status === 'CHECKING' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleProcess(hc.id, 'accept')}
                          disabled={processMutation.isPending}
                        >
                          <ClipboardCheck className="mr-2 h-4 w-4" /> Pass
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleProcess(hc.id, 'reject')}
                          disabled={processMutation.isPending}
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Fail
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Processed</span>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No assigned health checks found.
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
