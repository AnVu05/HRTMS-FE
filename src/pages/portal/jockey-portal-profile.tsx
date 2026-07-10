import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, User, Mail, Shield, Calendar, Award, CheckCircle, XCircle, AlertCircle, FileText, Check, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { jockeyService } from '@/services/jockey.service';

export default function PortalJockeyProfile() {
  const [jockeyId, setJockeyId] = useState<number>(() => {
    return Number(localStorage.getItem('jockey_id') || '1');
  });
  
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [loadingInvites, setLoadingInvites] = useState(true);
  
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [errorCerts, setErrorCerts] = useState<string | null>(null);
  const [errorInvites, setErrorInvites] = useState<string | null>(null);

  // Certificate Upload States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newCertName, setNewCertName] = useState('');
  const [newCertImageBase64, setNewCertImageBase64] = useState('');
  const [newCertIssuedAt, setNewCertIssuedAt] = useState(new Date().toISOString().split('T')[0]);
  const [submittingCert, setSubmittingCert] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchCertificates();
    fetchInvitations();
  }, [jockeyId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewCertImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName || !newCertImageBase64) {
      toast({
        title: 'Error',
        description: 'Please enter a certificate name and choose an image.',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingCert(true);
    try {
      // 1. Create Certificate in PENDING status
      await jockeyService.createJockeyCertificateVerification({
        certName: newCertName,
        certImageBase64: newCertImageBase64,
        issuedAt: newCertIssuedAt || new Date().toISOString().split('T')[0],
        jockeyId: jockeyId
      });

      // 2. Request Verification (Sends notification to admins)
      await jockeyService.requestVerificationForAll(jockeyId);

      toast({
        title: 'Success',
        description: 'Certificate uploaded and admin notification sent successfully.',
      });

      // Reset Form and State
      setNewCertName('');
      setNewCertImageBase64('');
      setNewCertIssuedAt(new Date().toISOString().split('T')[0]);
      setIsUploadOpen(false);
      
      // Refresh list
      fetchCertificates();
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err.message || 'Could not upload certificate.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingCert(false);
    }
  };

  const fetchProfile = () => {
    setLoadingProfile(true);
    setErrorProfile(null);
    jockeyService.getProfile(jockeyId)
      .then(response => {
        const data = response.data || response;
        setProfile(data);
        setLoadingProfile(false);
      })
      .catch(err => {
        setErrorProfile(err.message || 'Failed to fetch jockey profile.');
        setLoadingProfile(false);
      });
  };

  const fetchCertificates = () => {
    setLoadingCerts(true);
    setErrorCerts(null);
    jockeyService.getJockeyCertificates(jockeyId)
      .then(response => {
        const data = response.data || response || [];
        setCertificates(data);
        setLoadingCerts(false);
      })
      .catch(err => {
        setErrorCerts(err.message || 'Failed to fetch certificates.');
        setLoadingCerts(false);
      });
  };

  const fetchInvitations = () => {
    setLoadingInvites(true);
    setErrorInvites(null);
    jockeyService.getAllRegistrationForms()
      .then(response => {
        const data = response.data || response || [];
        // Filter forms where this jockey is invited (jockeyId matches) and status is PENDING_JOCKEY
        const filtered = data.filter((form: any) => 
          form.jockeyId === jockeyId && form.status === 'PENDING_JOCKEY'
        );
        setInvitations(filtered);
        setLoadingInvites(false);
      })
      .catch(err => {
        setErrorInvites(err.message || 'Failed to fetch invitations.');
        setLoadingInvites(false);
      });
  };

  const handleRespondInvitation = async (formId: number, status: 'Accept' | 'Reject') => {
    try {
      await jockeyService.jockeyRespondToRegistrationForm(formId, { status });
      toast({
        title: status === 'Accept' ? 'Accepted Invitation' : 'Declined Invitation',
        description: `Successfully ${status === 'Accept' ? 'accepted' : 'declined'} the race invitation.`,
      });
      // Refresh list
      fetchInvitations();
    } catch (err: any) {
      toast({
        title: 'Response Failed',
        description: err.message || 'An error occurred while responding to the invitation.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
      case 'APPROVED':
        return <Badge className="bg-green-500/20 text-green-700 border-green-300 hover:bg-green-500/30">Verified</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-500/20 text-amber-700 border-amber-300 hover:bg-amber-500/30">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500/20 text-red-700 border-red-300 hover:bg-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl animate-in fade-in duration-500 space-y-8">
      {/* Header section with configurable Jockey ID */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <Link href="/portal">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 gap-2 mb-2 pl-0">
              <ArrowLeft className="h-4 w-4" /> Back to Portal
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Jockey Portal Dashboard</h1>
          <p className="text-slate-500">Manage your credentials, status, and racing invitations.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-3 rounded-lg border shadow-sm">
          <span className="text-sm font-semibold text-slate-600">Simulate Jockey ID:</span>
          <Input 
            type="number" 
            value={jockeyId} 
            onChange={(e) => {
              const val = Number(e.target.value);
              setJockeyId(val);
              localStorage.setItem('jockey_id', String(val));
            }} 
            className="w-20 h-9 font-bold text-center" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Profile info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white pb-8">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-4xl mb-4 shadow-inner">
                🏇
              </div>
              <CardTitle className="text-2xl font-bold">
                {loadingProfile ? 'Loading...' : profile?.jockeyName || profile?.username || 'Jockey Profile'}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Jockey Account Details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {loadingProfile ? (
                <div className="py-8 text-center text-slate-500 animate-pulse">Loading profile data...</div>
              ) : errorProfile || !profile ? (
                <div className="py-6 text-center text-red-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">{errorProfile || 'Jockey not found'}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 py-1 border-b border-slate-100">
                    <User className="h-5 w-5 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Username</div>
                      <div className="text-sm font-semibold text-slate-800">{profile.username}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-1 border-b border-slate-100">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Email Address</div>
                      <div className="text-sm font-semibold text-slate-800">{profile.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-1 border-b border-slate-100">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Age & Experience</div>
                      <div className="text-sm font-semibold text-slate-800">
                        {profile.age || 'N/A'} years old • {profile.experienceYears || '0'} yrs exp
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-1 border-b border-slate-100">
                    <Shield className="h-5 w-5 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Status</div>
                      <Badge className={
                        profile.status === 'ACTIVE' 
                          ? 'bg-green-500/20 text-green-700 border-green-300' 
                          : 'bg-slate-300 text-slate-700'
                      }>
                        {profile.status || 'ACTIVE'}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs text-slate-400 font-medium mb-1">Professional Bio</div>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border leading-relaxed">
                      {profile.professionalBio || 'No biography available.'}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Certificates and Invitations */}
        <div className="lg:col-span-2 space-y-8">
          {/* Race Invitations Card */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" /> Race Invitations
                  </CardTitle>
                  <CardDescription>Invitations from horse owners to participate in scheduled races.</CardDescription>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {invitations.length} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingInvites ? (
                <div className="py-8 text-center text-slate-500 animate-pulse">Loading invitations...</div>
              ) : errorInvites ? (
                <div className="py-6 text-center text-red-500">{errorInvites}</div>
              ) : invitations.length === 0 ? (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                  <FileText className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-500">No pending invitations</p>
                  <p className="text-xs text-slate-400 mt-1">You will see new invitations here when horse owners invite you.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invite) => (
                    <div key={invite.id} className="p-5 rounded-xl border bg-slate-50 hover:bg-slate-100/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-200/60 px-2.5 py-0.5 rounded">
                            Invite #{invite.id}
                          </span>
                          <span className="text-xs text-slate-500">
                            Created: {new Date(invite.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm">
                          <div>
                            <span className="text-xs text-slate-400 block font-medium">Horse ID</span>
                            <span className="font-bold text-slate-800">#{invite.horseId}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block font-medium">Race ID</span>
                            <span className="font-bold text-slate-800">#{invite.raceId || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block font-medium">Tournament ID</span>
                            <span className="font-bold text-slate-800">#{invite.tournamentId || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block font-medium">Owner ID</span>
                            <span className="font-bold text-slate-800">#{invite.ownerId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Button 
                          onClick={() => handleRespondInvitation(invite.id, 'Accept')}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold h-10 px-4 flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="h-4 w-4" /> Accept
                        </Button>
                        <Button 
                          onClick={() => handleRespondInvitation(invite.id, 'Reject')}
                          variant="destructive"
                          className="font-bold h-10 px-4 flex items-center gap-1.5 shadow-sm"
                        >
                          <X className="h-4 w-4" /> Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certificates Card */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Jockey Certificates
                </CardTitle>
                <CardDescription>Professional certificates and licenses submitted for validation.</CardDescription>
              </div>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1.5 font-bold bg-slate-900 hover:bg-slate-800 text-white">
                    <Upload className="h-4 w-4" /> Upload Cert
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleUploadCertificate}>
                    <DialogHeader>
                      <DialogTitle>Upload Certificate</DialogTitle>
                      <CardDescription>Submit a new certificate for verification. Admins will be notified.</CardDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Certificate Name</label>
                        <Input
                          placeholder="e.g. Professional Jockey License"
                          value={newCertName}
                          onChange={(e) => setNewCertName(e.target.value)}
                          required
                          disabled={submittingCert}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Issued Date</label>
                        <Input
                          type="date"
                          value={newCertIssuedAt}
                          onChange={(e) => setNewCertIssuedAt(e.target.value)}
                          required
                          disabled={submittingCert}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Certificate Image</label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          required
                          disabled={submittingCert}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsUploadOpen(false)}
                        disabled={submittingCert}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                        disabled={submittingCert}
                      >
                        {submittingCert ? 'Uploading...' : 'Submit'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingCerts ? (
                <div className="py-8 text-center text-slate-500 animate-pulse">Loading certificates...</div>
              ) : errorCerts ? (
                <div className="py-6 text-center text-red-500">{errorCerts}</div>
              ) : certificates.length === 0 ? (
                <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                  <Award className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-500">No certificates registered</p>
                  <p className="text-xs text-slate-400 mt-1">Submit certifications to gain clearance to compete.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-xl bg-white shadow-inner">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-bold">Cert ID</th>
                        <th className="px-6 py-4 font-bold">Certificate Name</th>
                        <th className="px-6 py-4 font-bold">Issued Date</th>
                        <th className="px-6 py-4 font-bold">Image</th>
                        <th className="px-6 py-4 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {certificates.map((cert) => {
                        const imgSrc = cert.cert_image_base64 && (
                          cert.cert_image_base64.startsWith('data:') 
                            ? cert.cert_image_base64 
                            : `data:image/png;base64,${cert.cert_image_base64}`
                        );
                        return (
                          <tr key={cert.cert_id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-700">#{cert.cert_id}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{cert.cert_name || 'Unnamed Certificate'}</td>
                            <td className="px-6 py-4 text-slate-500">{cert.issued_at || 'N/A'}</td>
                            <td className="px-6 py-4">
                              {imgSrc ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <img 
                                      src={imgSrc} 
                                      alt={cert.cert_name} 
                                      className="w-12 h-12 object-cover rounded border shadow-sm cursor-zoom-in hover:opacity-85 transition-opacity" 
                                    />
                                  </DialogTrigger>
                                  <DialogContent className="max-w-xl">
                                    <DialogHeader>
                                      <DialogTitle>{cert.cert_name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex justify-center p-2 bg-slate-50 rounded border">
                                      <img src={imgSrc} alt={cert.cert_name} className="max-h-[70vh] object-contain rounded" />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <span className="text-xs text-slate-400">No Image</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">{getStatusBadge(cert.status)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
