import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

function ImageViewerDialog({ jockeyId, open, onOpenChange }) {
  const { data: images = [], isLoading } = useQuery({
    queryKey: ['jockeyCertImages', jockeyId],
    queryFn: () => adminApi.getJockeyCertImages(jockeyId),
    enabled: !!jockeyId && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Jockey Certificates</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-4">
          {isLoading ? (
            <p className="text-muted-foreground">Loading images...</p>
          ) : images.length > 0 ? (
            <Carousel className="w-full max-w-xl">
              <CarouselContent>
                {images.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="flex aspect-video items-center justify-center p-2 rounded-md border bg-slate-50">
                      <img 
                        src={img.cert_image_base64?.startsWith('data:image') ? img.cert_image_base64 : `data:image/jpeg;base64,${img.cert_image_base64}`} 
                        alt={`Certificate ${index + 1}`} 
                        className="max-w-full max-h-[500px] object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <p className="text-muted-foreground">No images found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RegistrationDetailDialog({ registration, open, onOpenChange }) {
  const jockeyId = registration?.jockeyId;

  const { data: jockeyProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['jockeyProfile', jockeyId],
    queryFn: () => adminApi.getJockeyProfile(jockeyId),
    enabled: !!jockeyId && open,
  });

  const { data: jockeyCertificates = [], isLoading: isLoadingCerts } = useQuery({
    queryKey: ['jockeyCertificates', jockeyId],
    queryFn: () => adminApi.getJockeyCertificates(jockeyId),
    enabled: !!jockeyId && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Registration Details</DialogTitle>
        </DialogHeader>
        {registration && (
          <Tabs defaultValue="registration_info" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="registration_info">Registration Info</TabsTrigger>
              <TabsTrigger value="jockey_info">Jockey Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="registration_info" className="space-y-4 p-4 border rounded-md mt-4 bg-slate-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tournament</p>
                  <p className="font-semibold">{registration.tournament_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Race</p>
                  <p className="font-semibold">{registration.race_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Owner</p>
                  <p className="font-semibold">{registration.owner_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Horse</p>
                  <p className="font-semibold">{registration.horse_name}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="jockey_info" className="space-y-4 mt-4">
              {isLoadingProfile || isLoadingCerts ? (
                 <p className="text-center text-muted-foreground p-4">Loading jockey information...</p>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Jockey Name</p>
                      <p className="font-semibold">{jockeyProfile?.jockeyName || registration.jockey_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Experience (Years)</p>
                      <p className="font-semibold">{jockeyProfile?.experienceYears ?? 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Certificates</h4>
                    {jockeyCertificates.length > 0 ? (
                      <div className="flex justify-center border rounded-md p-4 bg-slate-50">
                        <Carousel className="w-full max-w-xl">
                          <CarouselContent>
                            {jockeyCertificates.map((cert, index) => (
                              <CarouselItem key={index}>
                                <div className="space-y-3">
                                  <p className="text-center font-medium">{cert.cert_name || `Certificate ${index + 1}`}</p>
                                  <div className="flex aspect-video items-center justify-center p-2 rounded-md border bg-white">
                                    <img 
                                      src={cert.cert_image_base64?.startsWith('data:image') ? cert.cert_image_base64 : `data:image/jpeg;base64,${cert.cert_image_base64}`} 
                                      alt={cert.cert_name || `Certificate ${index + 1}`} 
                                      className="max-w-full max-h-[400px] object-contain"
                                    />
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm p-4 text-center border rounded-md">No certificates found.</p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function Verifications() {
  const queryClient = useQueryClient();
  const adminId = localStorage.getItem("user_id");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedJockeyId, setSelectedJockeyId] = useState(null);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailRegistration, setDetailRegistration] = useState(null);

  const handleViewDetail = (reg) => {
    setDetailRegistration(reg);
    setDetailDialogOpen(true);
  };

  const handleViewImage = (jockeyId) => {
    setSelectedJockeyId(jockeyId);
    setViewerOpen(true);
  };

  const { data: certificates = [], isLoading: isLoadingCerts } = useQuery({
    queryKey: ['jockeyCerts', adminId],
    queryFn: () => adminApi.getJockeyCerts(adminId)
  });

  const { data: pendingRegistrations = [], isLoading: isLoadingRegs } = useQuery({
    queryKey: ['pendingAdminForms', adminId],
    queryFn: () => adminApi.getPendingAdminForms(adminId)
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

  const handleAcceptReg = (id) => {
    adminApi.adminRespondRegistration(id, { status: 'Accept', reason: '' }).then(() => {
      queryClient.invalidateQueries(['pendingAdminForms']);
    });
  };

  const handleRejectReg = (id) => {
    adminApi.adminRespondRegistration(id, { status: 'Reject', reason: 'Rejected by admin' }).then(() => {
      queryClient.invalidateQueries(['pendingAdminForms']);
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
                    <TableHead>Reg. ID</TableHead>
                    <TableHead>Tournament</TableHead>
                    <TableHead>Race</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Horse</TableHead>
                    <TableHead>Jockey</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingRegs ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">Loading registrations...</TableCell>
                    </TableRow>
                  ) : pendingRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">No pending registrations found.</TableCell>
                    </TableRow>
                  ) : pendingRegistrations.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>{r.tournament_name}</TableCell>
                      <TableCell>{r.race_name}</TableCell>
                      <TableCell>{r.owner_name}</TableCell>
                      <TableCell>{r.horse_name}</TableCell>
                      <TableCell>{r.jockey_name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetail(r)}><Eye className="mr-1 h-4 w-4"/> Detail</Button>
                          <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleAcceptReg(r.id)}><Check className="mr-1 h-4 w-4"/> Approve</Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleRejectReg(r.id)}><X className="mr-1 h-4 w-4"/> Reject</Button>
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
                  {isLoadingCerts ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">Loading certificates...</TableCell>
                    </TableRow>
                  ) : Object.values(certificates.reduce((acc, v) => {
                      if (v.jockey?.id && !acc[v.jockey.id]) acc[v.jockey.id] = v;
                      return acc;
                    }, {})).map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.jockey?.id}</TableCell>
                      <TableCell className="font-medium">{v.jockey?.jockeyName}</TableCell>
                      <TableCell>{v.issuedAt || v.submittedDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => handleViewImage(v.jockey?.id)}>View Image</Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleAccept(v.jockey?.id)}
                            disabled={v.status !== 'PENDING'}
                          >
                            <Check className="mr-1 h-4 w-4"/> Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleReject(v.jockey?.id)}
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
      
      <RegistrationDetailDialog registration={detailRegistration} open={detailDialogOpen} onOpenChange={setDetailDialogOpen} />
      <ImageViewerDialog jockeyId={selectedJockeyId} open={viewerOpen} onOpenChange={setViewerOpen} />
    </div>
  );
}
