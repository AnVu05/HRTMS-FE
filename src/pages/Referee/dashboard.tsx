import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Trophy, Calendar, Award, CheckCircle, FileText,
  Check, X, RefreshCw, Flag, Play, ListCollapse, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { refereeService } from '@/services/referee.service';

export default function RefereeDashboard() {
  const [refereeId] = useState<number>(() => {
    return Number(localStorage.getItem('user_id') || '1');
  });

  const [invitations, setInvitations] = useState<any[]>([]);
  const [scheduledRaces, setScheduledRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingInvite, setSubmittingInvite] = useState<Record<number, boolean>>({});

  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    let invites = [];
    try {
      // 1. Fetch invitations
      const inviteRes = await refereeService.getPendingInvitations(refereeId);
      if (inviteRes && Array.isArray(inviteRes.data)) {
        invites = inviteRes.data;
      } else if (Array.isArray(inviteRes)) {
        invites = inviteRes;
      }
    } catch (err) {
      invites = [];
    }
    setInvitations(invites);

    let races = [];
    try {
      // 2. Fetch scheduled races
      const racesRes = await refereeService.getScheduledRaces(refereeId);
      if (racesRes && Array.isArray(racesRes.data)) {
        races = racesRes.data;
      } else if (Array.isArray(racesRes)) {
        races = racesRes;
      }
    } catch (err) {
      races = [];
    }
    setScheduledRaces(races);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [refereeId]);

  const handleRespondInvitation = async (notificationId: number, status: 'Accept' | 'Reject') => {
    setSubmittingInvite(prev => ({ ...prev, [notificationId]: true }));
    try {
      await refereeService.respondToInvitation(refereeId, notificationId, { status });
      toast({
        title: status === 'Accept' ? 'Accepted Invitation' : 'Declined Invitation',
        description: `Successfully ${status === 'Accept' ? 'accepted' : 'declined'} the tournament/race invitation.`,
      });
      // Refresh data
      fetchData();
    } catch (err: any) {
      toast({
        title: 'Response Failed',
        description: err.message || 'An error occurred while responding to the invitation. (Simulated Action)',
        variant: 'destructive',
      });
      // Mock local remove on fail to demonstrate UI interaction
      setInvitations(prev => prev.filter(i => i.notification_id !== notificationId));
    } finally {
      setSubmittingInvite(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const activeRacesCount = scheduledRaces.filter(r => r.status === 'ONGOING').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:px-6 space-y-10 animate-in fade-in duration-500">

      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 md:p-8 text-white space-y-4 shadow-lg border border-slate-700/50">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 backdrop-blur rounded-full text-xs font-semibold border border-indigo-500/30 text-indigo-200">
          <Award className="w-3.5 h-3.5 text-indigo-400" /> Referee Dashboard
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-300">Referee Control Center</h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl">
            Govern scheduled races, review real-time standings, manage athlete statuses, and finalize official outcomes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/referee/races">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Flag className="mr-1.5 h-4 w-4" /> View Full Schedule
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={fetchData} className="text-white border-slate-700 hover:bg-slate-800">
            <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh Portal
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-slate-200/80 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6 space-y-2">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Assigned Races</span>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-900">{scheduledRaces.length}</p>
              <span className="text-xs text-slate-500 font-medium">scheduled</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">Total races currently assigned to you</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6 space-y-2">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Active / Live Races</span>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-green-600 flex items-center gap-1.5">
                {activeRacesCount}
                {activeRacesCount > 0 && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                )}
              </p>
              <span className="text-xs text-slate-500 font-medium">in progress</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">Races requiring active monitoring</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6 space-y-2">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Pending Invitations</span>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-amber-600">{invitations.length}</p>
              <span className="text-xs text-slate-500 font-medium">pending response</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">New tournament requests to govern</p>
          </CardContent>
        </Card>
      </div>

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
                  <Award className="h-5 w-5 text-indigo-600" /> Pending Invitations
                </CardTitle>
                <CardDescription>Invitations from tournament organizers to govern scheduled races.</CardDescription>
              </div>
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none font-bold">
                {invitations.length} Action Needed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {invitations.map((invite) => (
              <div key={invite.notification_id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/30 transition-colors">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                      Invite #{invite.notification_id}
                    </span>
                    {invite.created_at && (
                      <span className="text-xs text-slate-400 font-medium">
                        Received: {new Date(invite.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{invite.title || 'Race Referee Invitation'}</h4>
                    <p className="text-sm text-slate-600 mt-1">{invite.content}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block font-medium">Tournament</span>
                      <span className="font-bold text-slate-800">{invite.tournament_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Race Name</span>
                      <span className="font-bold text-slate-800">{invite.race_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Schedule</span>
                      <span className="font-bold text-slate-800">{invite.date || 'N/A'} at {invite.start_time || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Distance</span>
                      <span className="font-bold text-slate-800">{invite.distance_m ? `${invite.distance_m}m` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  <Button
                    size="sm"
                    disabled={submittingInvite[invite.notification_id]}
                    onClick={() => handleRespondInvitation(invite.notification_id, 'Accept')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold h-9 px-4 flex items-center gap-1 shadow-sm"
                  >
                    <Check className="h-4 w-4" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    disabled={submittingInvite[invite.notification_id]}
                    onClick={() => handleRespondInvitation(invite.notification_id, 'Reject')}
                    variant="destructive"
                    className="font-bold h-9 px-4 flex items-center gap-1 shadow-sm"
                  >
                    <X className="h-4 w-4" /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Govern Races Section */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <Flag className="h-5 w-5 text-indigo-600" /> My Scheduled Races
              </CardTitle>
              <CardDescription>Scheduled, active, or finalized races currently assigned under your supervision.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-slate-500 animate-pulse flex items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" /> Loading assigned races...
            </div>
          ) : scheduledRaces.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50/50">
              <FileText className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-500">No scheduled races assigned</p>
              <p className="text-xs text-slate-400 mt-1">Contact your system administrator to assign races to you.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {scheduledRaces.map((race) => (
                <div key={race.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/20 transition-colors">

                  {/* Left Info */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-indigo-700 bg-indigo-50 border-indigo-100 font-bold rounded">
                        {race.tournament_name || `Tournament #${race.tournament_id}`}
                      </Badge>
                      <Badge className={
                        race.status === 'COMPLETED' ? 'bg-slate-200 text-slate-700 hover:bg-slate-200' :
                          race.status === 'ONGOING' ? 'bg-green-500 text-white animate-pulse' :
                            race.status === 'CANCELLED' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                              'bg-blue-100 text-blue-700 hover:bg-blue-100'
                      }>
                        {race.status}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{race.name}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> {race.date}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5 text-slate-400" /> {race.start_time} - {race.end_time}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1">
                        <Flag className="h-3.5 w-3.5 text-slate-400" /> {race.distance_m}m • {race.num_horse} Horses limit
                      </span>
                    </div>
                  </div>

                  {/* Right Action */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <Link href={`/referee/races/${race.id}`} className="w-full">
                      <Button
                        size="sm"
                        variant={race.status === 'ONGOING' || race.status === 'SCHEDULED' ? 'default' : 'outline'}
                        className="font-bold w-full md:w-auto flex items-center justify-center gap-1 px-4"
                      >
                        {race.status === 'ONGOING' || race.status === 'SCHEDULED' ? (
                          <>
                            <Play className="h-3.5 w-3.5" /> Control Race
                          </>
                        ) : (
                          <>
                            <ListCollapse className="h-3.5 w-3.5" /> View Details
                          </>
                        )}
                      </Button>
                    </Link>
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
