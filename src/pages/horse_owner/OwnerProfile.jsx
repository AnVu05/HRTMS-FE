import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Lock, LogOut, Camera, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { ownerApi } from '@/api/ownerApi';
import { authApi } from '@/api/authApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function OwnerProfile() {
  const [, setLocation] = useLocation();
  const ownerId = localStorage.getItem('user_id');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ownerName: ''
  });
  const [avatarBase64, setAvatarBase64] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [ownerId]);

  const fetchProfile = async () => {
    try {
      const res = await ownerApi.getProfile(ownerId);
      const data = res?.data || res;
      setProfile(data);
      setFormData({
        email: data?.email || '',
        password: '', // Do not populate password for security
        ownerName: data?.ownerName || ''
      });
      setAvatarBase64(data?.avatar || '');
    } catch (err) {
      console.error("Failed to load profile", err);
      toast.error("Could not load profile information", { style: { backgroundColor: '#ffcccc', color: 'black' } });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      // Build request payload, only send password if it's not empty
      const payload = {
        email: formData.email,
        ownerName: formData.ownerName
      };
      if (formData.password && formData.password.trim() !== '') {
        payload.password = formData.password;
      }
      
      await ownerApi.updateProfile(ownerId, payload);
      toast.success("Account information updated successfully!", { style: { backgroundColor: '#4caf50', color: 'white' } });
      fetchProfile(); // Refresh to get latest data
    } catch (err) {
      console.error("Update failed", err);
      // Let axios interceptor handle the toast if configured, otherwise show a generic error
    } finally {
      setSavingAccount(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    if (!avatarBase64) {
      toast.error("Please select an image first", { style: { backgroundColor: '#ffcccc', color: 'black' } });
      return;
    }
    
    setSavingAvatar(true);
    try {
      await ownerApi.updateAvatar(ownerId, { avatar: avatarBase64 });
      toast.success("Avatar updated successfully!", { style: { backgroundColor: '#4caf50', color: 'white' } });
      // We must reload the window to update the avatar in the navbar layout as well
      window.location.reload(); 
    } catch (err) {
      console.error("Avatar update failed", err);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await ownerApi.deactivateAccount(ownerId);
      toast.success("Account deactivated successfully. Logging out...", { style: { backgroundColor: '#4caf50', color: 'white' } });
      
      // Logout process
      await authApi.logout().catch(() => {});
      localStorage.clear();
      window.location.href = '/portal/login';
    } catch (err) {
      console.error("Deactivation failed", err);
      toast.error("Failed to deactivate account", { style: { backgroundColor: '#ffcccc', color: 'black' } });
      setDeactivating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
          {profile?.avatar ? (
            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="h-8 w-8 text-slate-400" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{profile?.ownerName || profile?.username}</h1>
          <p className="text-slate-500">{profile?.email}</p>
        </div>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="account">Account Information</TabsTrigger>
          <TabsTrigger value="avatar">Profile Avatar</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Update your personal information and credentials here.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAccountSubmit}>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="ownerName" 
                      name="ownerName"
                      value={formData.ownerName} 
                      onChange={handleAccountChange}
                      className="pl-9" 
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      value={formData.email} 
                      onChange={handleAccountChange}
                      className="pl-9" 
                      placeholder="owner@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="password" 
                      name="password"
                      type="password" 
                      value={formData.password} 
                      onChange={handleAccountChange}
                      className="pl-9" 
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6">
                <Button type="submit" disabled={savingAccount} className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
                  {savingAccount ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="avatar">
          <Card>
            <CardHeader>
              <CardTitle>Profile Avatar</CardTitle>
              <CardDescription>
                Upload a new image to represent your account across the portal.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAvatarSubmit}>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-32 w-32 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                    {avatarBase64 ? (
                      <img src={avatarBase64} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-12 w-12 text-slate-300" />
                    )}
                  </div>
                  
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="picture">Picture</Label>
                    <Input id="picture" type="file" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6">
                <Button type="submit" disabled={savingAvatar} className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
                  {savingAvatar ? 'Uploading...' : 'Update Avatar'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions for your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-red-100 bg-red-50/50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-slate-900">Deactivate Account</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Once you deactivate your account, you will be logged out and cannot log in again until an administrator re-activates your account.
                  </p>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="mt-4 sm:mt-0 whitespace-nowrap">
                      Deactivate Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will immediately log you out and mark your account as inactive. You will no longer be able to log in or manage your horses until you contact support.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeactivate}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      >
                        Yes, deactivate my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
