import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Trophy, Flag, Users, ArrowRight, ShieldAlert, Award, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ownerApi } from '@/services/owner.service';
import { jockeyService } from '@/services/jockey.service';
import { toast } from 'sonner';

export default function JockeyHome() {
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [submittingInvite, setSubmittingInvite] = useState<Record<number, boolean>>({});

  const fetchRaces = async () => {
    setLoading(true);
    try {
      const jockeyId = Number(localStorage.getItem('user_id') || '1');
      const [racesRes, formsRes, profileRes] = await Promise.all([
        ownerApi.getUpcomingRaces(),
        jockeyService.getAllRegistrationForms(),
        jockeyService.getProfile(jockeyId).catch(() => null)
      ]);

      const racesList = racesRes.data || racesRes || [];
      const formsList = formsRes.data || formsRes || [];
      const profileData = profileRes?.data || profileRes || null;

      if (profileData) {
        setProfile(profileData);
      }

      // Filter registration forms for this jockey
      const jockeyForms = formsList.filter((f: any) => f.jockeyId === jockeyId);

      // Deduplicate forms by raceId (prioritizing active forms over DELETE/declined ones, and newer IDs)
      const uniqueFormsMap: Record<string, any> = {};
      for (const form of jockeyForms) {
        const raceIdStr = String(form.raceId);
        const existing = uniqueFormsMap[raceIdStr];
        if (!existing) {
          uniqueFormsMap[raceIdStr] = form;
        } else {
          const existingIsDeclined = existing.status === 'DELETE';
          const currentIsDeclined = form.status === 'DELETE';

          if (existingIsDeclined && !currentIsDeclined) {
            uniqueFormsMap[raceIdStr] = form;
          } else if (!existingIsDeclined && currentIsDeclined) {
            // Keep the active one
          } else {
            if (Number(form.id) > Number(existing.id)) {
              uniqueFormsMap[raceIdStr] = form;
            }
          }
        }
      }

      const participatedRaces = Object.values(uniqueFormsMap).map((f: any) => {
        const r = racesList.find((race: any) => String(race.id) === String(f.raceId));
        const date = r?.date || (f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'TBD');
        const tournament = r?.tournament_name || f.tournament_name || f.tournamentName || 'Tournament';
        const name = r?.name || f.race_name || f.raceName || 'Race';
        const raceStatus = r?.status || 'SCHEDULED';
        const displayStatus = raceStatus === 'COMPLETED' ? 'Completed' : raceStatus === 'IN_PROGRESS' ? 'In Progress' : 'Scheduled';

        return {
          id: String(f.raceId),
          formId: f.id,
          name,
          tournament,
          date,
          status: displayStatus,
          position: r?.position || '--',
          formStatus: f.status
        };
      });

      setRaces(participatedRaces.slice(0, 5)); // show top 5 relevant races
    } catch (err) {
      setRaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondInvitation = async (formId: number, status: 'Accept' | 'Reject') => {
    setSubmittingInvite(prev => ({ ...prev, [formId]: true }));
    try {
      await jockeyService.jockeyRespondToRegistrationForm(formId, { status });
      toast.success(status === 'Accept' ? 'Accepted Invitation' : 'Declined Invitation', { style: { backgroundColor: '#4caf50', color: 'white' } });
      fetchRaces();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while responding to the invitation.', { style: { backgroundColor: '#ffcccc', color: 'black' } });
    } finally {
      setSubmittingInvite(prev => ({ ...prev, [formId]: false }));
    }
  };

  useEffect(() => {
    fetchRaces();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl p-8 text-white space-y-4 shadow-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">
          <Award className="w-3.5 h-3.5" /> Jockey Portal
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, Jockey!</h1>
          <p className="text-orange-100 text-sm max-w-md">
            View your upcoming race schedule, check tournament details, and manage invitations directly from your dashboard.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Link href="/jockey/profile">
            <Button size="sm" variant="secondary" className="text-orange-700 bg-white hover:bg-orange-50 font-bold">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/jockey/races">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 font-bold border border-white/20">
              My Races
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-2">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Win Rate</span>
          <p className="text-3xl font-bold text-orange-600">
            {profile?.winRate !== undefined ? `${profile.winRate}%` : '0%'}
          </p>
          <p className="text-xs text-muted-foreground">Based on career wins</p>
        </div>
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-2">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Completed Races</span>
          <p className="text-3xl font-bold text-gray-900">
            {profile?.races !== undefined ? profile.races : '0'}
          </p>
          <p className="text-xs text-muted-foreground">Total career races completed</p>
        </div>
      </div>

      {/* My Upcoming / Recent Races */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Participation Summary</h2>
          <Link href="/jockey/races">
            <button className="text-sm text-orange-600 hover:underline flex items-center gap-1">
              View All My Races <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="divide-y border rounded-lg overflow-hidden bg-white">
            {races.length > 0 ? (
              races.map(r => (
                <div key={r.id} className="flex items-center justify-between px-4 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.tournament} · {r.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {r.formStatus === 'PENDING_JOCKEY' ? (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-700">Invited</span>
                    ) : r.formStatus === 'DELETE' ? (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-100 text-red-700">Declined</span>
                    ) : (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        r.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>{r.status}</span>
                    )}

                    {r.position !== '--' && (
                      <span className="text-sm font-bold text-gray-700">Pos: {r.position}</span>
                    )}

                    {r.formStatus === 'PENDING_JOCKEY' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white font-bold"
                          disabled={submittingInvite[r.formId]}
                          onClick={() => handleRespondInvitation(r.formId, 'Accept')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 font-bold"
                          disabled={submittingInvite[r.formId]}
                          onClick={() => handleRespondInvitation(r.formId, 'Reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    <Link href={`/jockey/races/${r.id}`}>
                      <button className="text-xs text-orange-600 hover:underline">Details</button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">No race participation history found.</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
