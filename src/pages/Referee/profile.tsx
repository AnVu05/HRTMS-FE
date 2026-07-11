import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, User, Calendar, Award, CheckCircle, XCircle, AlertCircle, FileText, Check, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { refereeService } from '@/services/referee.service';

const MOCK_REFEREE_INVITATIONS = [
  {
    notification_id: 301,
    title: "Referee Invitation",
    content: "You have been invited to govern the 'Opening Sprint' race.",
    race_id: 101,
    race_name: "Opening Sprint",
    tournament_name: "Hanoi Grand Prix",
    date: "2026-07-15",
    start_time: "08:00",
    end_time: "08:20",
    distance_m: 1200,
    status: "PENDING",
    created_at: "2026-07-10T08:49:41.021Z"
  },
  {
    notification_id: 302,
    title: "Referee Invitation",
    content: "You have been invited to govern the 'Midday Classic' race.",
    race_id: 102,
    race_name: "Midday Classic",
    tournament_name: "Hanoi Grand Prix",
    date: "2026-07-15",
    start_time: "12:00",
    end_time: "12:25",
    distance_m: 1600,
    status: "PENDING",
    created_at: "2026-07-09T14:30:00.021Z"
  },
  {
    notification_id: 303,
    title: "Referee Invitation",
    content: "You have been invited to govern the 'Sunset Derby' race.",
    race_id: 103,
    race_name: "Sunset Derby",
    tournament_name: "Hanoi Grand Prix",
    date: "2026-07-16",
    start_time: "17:00",
    end_time: null,
    distance_m: 2400,
    status: "PENDING",
    created_at: "2026-07-08T09:15:00.021Z"
  }
];

export default function PortalRefereeProfile() {
  const [refereeId, setRefereeId] = useState<number>(() => {
    return Number(localStorage.getItem('user_id') || '1');
  });

  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [errorInvites, setErrorInvites] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchInvitations();
  }, [refereeId]);

  const fetchInvitations = () => {
    setLoadingInvites(true);
    setErrorInvites(null);
    refereeService.getPendingInvitations(refereeId)
      .then(response => {
        const data = response.data || response || [];
        setInvitations(data.length > 0 ? data : MOCK_REFEREE_INVITATIONS);
        setLoadingInvites(false);
      })
      .catch(err => {
        // Fallback to mock data on error/backend running offline
        setInvitations(MOCK_REFEREE_INVITATIONS);
        setLoadingInvites(false);
      });
  };

  const handleRespondInvitation = async (notificationId: number, status: 'Accept' | 'Reject') => {
    try {
      await refereeService.respondToInvitation(refereeId, notificationId, { status });
      toast({
        title: status === 'Accept' ? 'Accepted Invitation' : 'Declined Invitation',
        description: `Successfully ${status === 'Accept' ? 'accepted' : 'declined'} the tournament/race invitation.`,
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

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl animate-in fade-in duration-500 space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/referee/home">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900 gap-2 pl-0">
                <ArrowLeft className="h-4 w-4" /> Back to Portal
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Referee Portal Dashboard</h1>
          <p className="text-slate-500">Manage your refereeing status and tournament invitations.</p>
        </div>
      </div>

      {/* Race Invitations Card */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> Tournament & Race Invitations
              </CardTitle>
              <CardDescription>Invitations from tournament admins to govern scheduled races.</CardDescription>
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
              <p className="text-xs text-slate-400 mt-1">You will see new race invitations here when they are assigned to you.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invite) => (
                <div key={invite.notification_id} className="p-5 rounded-xl border bg-slate-50 hover:bg-slate-100/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-200/60 px-2.5 py-0.5 rounded">
                        Invite #{invite.notification_id}
                      </span>
                      <span className="text-xs text-slate-500">
                        {invite.created_at ? `Created: ${new Date(invite.created_at).toLocaleDateString()}` : 'Date: N/A'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{invite.title || 'Race Referee Invitation'}</h4>
                      <p className="text-sm text-slate-600 mt-1">{invite.content}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm pt-2 border-t border-slate-200/60">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Tournament</span>
                        <span className="font-bold text-slate-800">{invite.tournament_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Race Name</span>
                        <span className="font-bold text-slate-800">{invite.race_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Race Date & Time</span>
                        <span className="font-bold text-slate-800">
                          {invite.date || 'N/A'} • {invite.start_time || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Distance</span>
                        <span className="font-bold text-slate-800">{invite.distance_m ? `${invite.distance_m}m` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Button 
                      onClick={() => handleRespondInvitation(invite.notification_id, 'Accept')}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold h-10 px-4 flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="h-4 w-4" /> Accept
                    </Button>
                    <Button 
                      onClick={() => handleRespondInvitation(invite.notification_id, 'Reject')}
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
    </div>
  );
}
