import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Trophy, Mail, Lock, User, ArrowRight, Badge, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';

export default function PortalRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'SPECTATOR',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        username: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      toast({
        title: 'Registration Initiated',
        description: 'A verification code has been sent to your email. Please verify to activate your account.',
      });
      setStep(2);
    } catch (err: any) {
      toast({
        title: 'Registration Failed',
        description: err.message || 'An error occurred during registration.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast({
        title: 'Error',
        description: 'Please enter the verification code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp({
        email: formData.email,
        otpCode: otp,
      });

      toast({
        title: 'Account Verified!',
        description: 'Your account has been successfully verified. Redirecting to login...',
      });

      setTimeout(() => {
        setLocation('/portal/login');
      }, 1500);
    } catch (err: any) {
      toast({
        title: 'Verification Failed',
        description: err.message || 'Invalid or expired verification code.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white w-full">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative overflow-y-auto">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link href="/portal">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="font-bold tracking-tight text-slate-900">HRTMS</span>
            </div>
          </Link>
        </div>

        <div className="w-full max-w-md py-12 lg:py-0">
          {step === 1 ? (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Create an Account</h1>
                <p className="text-slate-500">Join the ultimate racing management platform.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input 
                      id="name" 
                      placeholder="John Doe"
                      className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com"
                      className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-700">Role</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-5 w-5 text-slate-400 z-10" />
                    <Select 
                      value={formData.role} 
                      onValueChange={(val) => setFormData({...formData, role: val})}
                      disabled={loading}
                    >
                      <SelectTrigger className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SPECTATOR">Spectator</SelectItem>
                        <SelectItem value="HORSE_OWNER">Horse Owner</SelectItem>
                        <SelectItem value="JOCKEY">Jockey</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••"
                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="••••••••"
                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base font-bold mt-2" data-testid="register-submit" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-10 text-center">
                <div className="flex justify-center mb-6">
                  <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Shield className="h-8 w-8" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Verify Your Account</h1>
                <p className="text-slate-500">
                  We sent a verification code to <br />
                  <span className="font-medium text-slate-900">{formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-slate-700">Verification Code</Label>
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="Enter 6-digit code"
                    className="text-center text-xl tracking-[0.25em] font-mono h-14 bg-slate-50 border-slate-200 focus:bg-white"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold" data-testid="otp-submit">
                  {loading ? 'Verifying...' : 'Verify & Activate'}
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep(1)} 
                  disabled={loading}
                  className="w-full h-12 text-sm text-slate-500 font-medium"
                >
                  ← Back to details
                </Button>
              </form>
            </>
          )}

          <div className="mt-8 text-center text-slate-500">
            Already have an account?{' '}
            <Link href="/portal/login" className="font-bold text-primary hover:underline" data-testid="link-login">
              Sign in
            </Link>
          </div>
          
          <div className="mt-8 text-center border-t border-slate-100 pt-8">
            <Link href="/portal" className="text-sm text-slate-400 hover:text-slate-600 font-medium" data-testid="link-back-portal">
              ← Back to Portal Home
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-slate-950 to-slate-950"></div>
        
        {/* Abstract decorative shape */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex justify-end">
          <Link href="/portal">
            <div className="flex items-center gap-2 text-white cursor-pointer inline-flex opacity-50 hover:opacity-100 transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/20 text-primary">
                <Trophy className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">HRTMS Portal</span>
            </div>
          </Link>
        </div>
        
        <div className="relative z-10 max-w-lg mb-20">
          <Badge className="bg-white/10 text-white hover:bg-white/20 mb-6 border-none">
            Join the Community
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Follow your favorite riders and track every race.
          </h2>
          <p className="text-slate-400 text-lg">
            Create an account to get personalized notifications, track tournament schedules, and receive live race updates straight to your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
