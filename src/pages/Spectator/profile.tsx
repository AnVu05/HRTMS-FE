import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, User, Mail, Shield, Calendar, Edit, Save, Camera, Trophy, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { spectatorService } from '@/services/spectator.service';

export default function PortalSpectatorProfile() {
  // Use a default spectator ID (e.g. 2) since there is no session manager, but allow configuring
  const [spectatorId, setSpectatorId] = useState<number>(() => {
    return Number(localStorage.getItem('spectator_id') || '2');
  });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Predictions history state
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  // Edit fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchPredictions();
  }, [spectatorId]);

  const fetchProfile = () => {
    setLoading(true);
    setError(null);
    spectatorService.getProfile(spectatorId)
      .then(response => {
        const data = response.data || response;
        setProfile(data);
        setDisplayName(data.displayName || '');
        setEmail(data.email || '');
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch spectator profile. Make sure a Spectator with this ID exists.');
        setLoading(false);
      });
  };

  const fetchPredictions = async () => {
    setLoadingPredictions(true);
    try {
      const response = await spectatorService.getAllPredictions();
      const apiData = response.data || response || [];
      const apiFiltered = apiData.filter((p: any) => p.spectatorId === spectatorId);
      setPredictions(apiFiltered);
    } catch (err: any) {
      toast({
        title: 'Error Loading Predictions',
        description: err.message || 'Failed to fetch predictions history from API.',
        variant: 'destructive',
      });
      setPredictions([]);
    } finally {
      setLoadingPredictions(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    spectatorService.updateProfile(spectatorId, { 
      username: profile?.username, 
      display_name: displayName, 
      email 
    })
      .then(response => {
        const data = response.data || response;
        setProfile(data);
        setIsEditing(false);
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
      })
      .catch(err => {
        toast({
          title: 'Error',
          description: err.message || 'Failed to update profile',
          variant: 'destructive',
        });
      });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      spectatorService.updateAvatar(spectatorId, { avatar: base64String })
        .then(response => {
          const data = response.data || response;
          setProfile(data);
          toast({
            title: 'Success',
            description: 'Avatar updated successfully',
          });
        })
        .catch(err => {
          toast({
            title: 'Error',
            description: err.message || 'Failed to update avatar',
            variant: 'destructive',
          });
        });
    };
    reader.readAsDataURL(file);
  };

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium text-lg">Loading spectator profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="py-8 text-center">
            <User className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Could Not Load Spectator Profile</h3>
            <p className="text-red-700 max-w-md mx-auto mb-6">{error || 'Spectator profile not found'}</p>
            <div className="flex justify-center gap-4">
              <Link href="/spectator/home">
                <Button variant="outline">Back Home</Button>
              </Link>
              <Button onClick={fetchProfile} className="bg-red-600 hover:bg-red-700 text-white">Retry Fetch</Button>
            </div>
            <div className="mt-6 flex justify-center items-center gap-2 border-t pt-4">
              <span className="text-xs text-slate-500">Configure ID:</span>
              <Input 
                type="number" 
                value={spectatorId} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSpectatorId(val);
                  localStorage.setItem('spectator_id', String(val));
                }} 
                className="w-16 h-8 text-xs" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avatarSrc = getAvatarSrc(profile.avatar);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in duration-500 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/spectator/home">
          <Button variant="ghost" className="text-slate-600 hover:text-slate-900 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Portal Home
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 font-medium">Spectator ID:</span>
          <Input 
            type="number" 
            value={spectatorId} 
            onChange={(e) => {
              const val = Number(e.target.value);
              setSpectatorId(val);
              localStorage.setItem('spectator_id', String(val));
            }} 
            className="w-20 h-9" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar / Summary Card */}
        <Card className="md:col-span-1 border-slate-200 shadow-sm bg-white overflow-hidden h-fit">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6 group">
              {avatarSrc ? (
                <img 
                  src={avatarSrc} 
                  alt={profile.displayName || 'Spectator'} 
                  className="w-full h-full rounded-full object-cover border-4 border-slate-100 shadow-md"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100 border-4 border-slate-50 flex items-center justify-center text-slate-400 text-4xl shadow-md font-bold uppercase">
                  {(profile.displayName || profile.username || 'S').slice(0, 2)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full shadow-lg border border-slate-700 hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">
                <Camera className="h-4 w-4" />
                <input type="file" onChange={handleAvatarChange} accept="image/*" className="hidden" />
              </label>
            </div>

            <h2 className="text-xl font-bold text-slate-950 mb-1">{profile.displayName || 'Spectator'}</h2>
            <p className="text-sm font-mono text-slate-500 mb-4">@{profile.username}</p>
            
            <div className="flex justify-center">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 shadow-none font-semibold px-3 py-1">
                {profile.role || 'SPECTATOR'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Details / Edit Card */}
        <Card className="md:col-span-2 border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-950">Spectator Information</CardTitle>
              <CardDescription>Manage your spectator profile settings and contact details.</CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                <Edit className="h-4 w-4" /> Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Display Name</label>
                  <Input 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="e.g. john@example.com"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 border rounded-lg text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Display Name</div>
                      <div className="font-semibold text-slate-900">{profile.displayName || 'Not Set'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 border rounded-lg text-slate-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email Address</div>
                      <div className="font-semibold text-slate-900">{profile.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 border rounded-lg text-slate-400">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Role Account</div>
                      <div className="font-semibold text-slate-900">{profile.role || 'SPECTATOR'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 border rounded-lg text-slate-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Account Created</div>
                      <div className="font-semibold text-slate-900">
                        {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Predictions History Card */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg font-bold text-slate-950">Prediction History</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPredictions} disabled={loadingPredictions}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loadingPredictions ? (
            <div className="py-8 text-center text-slate-500">Loading predictions...</div>
          ) : predictions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CircleDollarSign className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No predictions placed yet.</p>
              <p className="text-xs mt-1">Visit the Race Schedule page to predict upcoming races.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Created Date</th>
                    <th className="px-6 py-3.5 font-semibold">Race Name</th>
                    <th className="px-6 py-3.5 font-semibold">Predicted Horse</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Points Invested</th>
                    <th className="px-6 py-3.5 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {predictions.map((pred) => (
                    <tr key={pred.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">
                        {pred.createdAt ? new Date(pred.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {pred.raceName || `Race #${pred.raceId}`}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {pred.predictedHorseName || `Horse #${pred.predictedHorseId}`}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {pred.pointsInvested} PTS
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={
                          pred.status === 'WON' ? 'bg-green-500 text-white' :
                          pred.status === 'LOST' ? 'bg-red-500 text-white' :
                          'bg-amber-500 text-white'
                        }>
                          {pred.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
