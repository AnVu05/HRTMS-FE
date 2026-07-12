import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Trophy, Medal, Target, DollarSign, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { jockeyService } from '@/services/jockey.service';


export default function PortalJockeyProfile() {
  const { id } = useParams();
  const [jockeyData, setJockeyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    jockeyService.getProfile(id)
      .then(response => {
        const raw = response.data || response;
        setJockeyData(raw);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch jockey profile');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg text-slate-500">Loading jockey profile...</p>
      </div>
    );
  }

  if (error || !jockeyData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Trophy className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Failed to load profile</h3>
        <p className="text-red-500 mt-2">{error || 'Jockey not found'}</p>
      </div>
    );
  }

  const getAvatarSrc = (avatar: string | null) => {
    if (!avatar) return null;
    if (avatar.startsWith('data:image/') || avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/')) {
      return avatar;
    }
    if (/^[A-Za-z0-9+/=]+$/.test(avatar)) {
      return `data:image/png;base64,${avatar}`;
    }
    return avatar;
  };

  const avatarSrc = getAvatarSrc(jockeyData.avatar);

  const jockey = {
    id: String(jockeyData.id),
    name: jockeyData.jockeyName || jockeyData.username || 'Unknown',
    nationality: jockeyData.nationality || 'Vietnam 🇻🇳',
    license: jockeyData.license || 'N/A',
    status: jockeyData.status === 'ACTIVE' ? 'Active' :
      jockeyData.status === 'SUSPENDED' ? 'Suspended' :
        jockeyData.status === 'RETIRED' ? 'Retired' :
          (jockeyData.status || 'Active'),
    winRate: jockeyData.winRate || 0,
    earnings: jockeyData.earnings || 0,
    races: jockeyData.races || 0,
    avgPosition: jockeyData.avgPosition || 0,
    bio: jockeyData.professionalBio || 'No biography available.'
  };

  return (
    <div className="pb-20">
      {/* Profile Header Area */}
      <div className="bg-slate-950 text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <Link href="/spectator/jockeys">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 mb-6 -ml-4" data-testid="btn-back">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={jockey.name}
                className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full object-cover border-4 border-slate-700 shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-6xl shadow-xl">
                {(jockey.nationality || '').split(' ')[1] || '🏇'}
              </div>
            )}

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-400">{jockey.name}</h1>
                <Badge className={
                  jockey.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                    'bg-slate-700 text-slate-300 border-slate-600'
                }>
                  {jockey.status}
                </Badge>
              </div>
              <p className="text-xl text-slate-400 mb-6 flex items-center justify-center md:justify-start gap-2">
                License: {jockey.license}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-slate-900/50 p-6 rounded-xl border border-slate-800 inline-flex text-left w-full max-w-3xl">
                <div>
                  <div className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> Races
                  </div>
                  <div className="text-2xl font-bold">{jockey.races}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
                    <Medal className="h-4 w-4 text-primary" /> Avg Pos
                  </div>
                  <div className="text-2xl font-bold">{jockey.avgPosition}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  Biography
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {jockey.bio}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="bg-white shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Career Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-amber-100 text-amber-600 p-1.5 rounded-full">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Mekong Valley Champion</h4>
                    <p className="text-sm text-slate-500">Won the main event in Sep 2023</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 text-blue-600 p-1.5 rounded-full">
                    <Medal className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Highest Win Rate (Season)</h4>
                    <p className="text-sm text-slate-500">Maintained 65%+ win rate over 50 races</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 text-green-600 p-1.5 rounded-full">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">$1M Lifetime Earnings</h4>
                    <p className="text-sm text-slate-500">Crossed milestone in 2022</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
