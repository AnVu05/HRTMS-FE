import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockRegistrations } from '@/mock/adminMockData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X } from 'lucide-react';

export function Verifications() {
  const queryClient = useQueryClient();
  const adminId = 1; // Assuming adminId is 1 for mocked data

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['jockeyCerts', adminId],
    queryFn: () => adminApi.getJockeyCerts(adminId)
  });

  const handleAccept = (jockeyId) => {
    adminApi.acceptJockeyCert(jockeyId, adminId).then(() => {
      queryClient.invalidateQueries(['jockeyCerts']);
    });
  };

  const handleReject = (jockeyId) => {
    adminApi.rejectJockeyCert(jockeyId, adminId, "Rejected by admin").then(() => {
      queryClient.invalidateQueries(['jockeyCerts']);
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Verifications & Registrations</h2>

      <Tabs defaultValue="registrations" className="w-full">
        <TabsList>
          <TabsTrigger value="registrations">Pending Registrations</TabsTrigger>
          <TabsTrigger value="certificates">Jockey Certificates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>User Role Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Requested Role</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRegistrations.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.userId}</TableCell>
                      <TableCell className="font-medium">{r.userName}</TableCell>
                      <TableCell>{r.roleRequested}</TableCell>
                      <TableCell>{r.submittedDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50"><Check className="mr-1 h-4 w-4"/> Approve</Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50"><X className="mr-1 h-4 w-4"/> Reject</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Pending Jockey Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jockey ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">Loading certificates...</TableCell>
                    </TableRow>
                  ) : certificates.map((v) => (
                    <TableRow key={v.jockeyId}>
                      <TableCell>{v.jockeyId}</TableCell>
                      <TableCell className="font-medium">{v.jockeyName}</TableCell>
                      <TableCell>{v.issuedAt || v.submittedDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm">View Image</Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleAccept(v.jockeyId)}
                            disabled={v.status !== 'PENDING'}
                          >
                            <Check className="mr-1 h-4 w-4"/> Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleReject(v.jockeyId)}
                            disabled={v.status !== 'PENDING'}
                          >
                            <X className="mr-1 h-4 w-4"/> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
