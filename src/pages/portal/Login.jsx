import React, { useState } from 'react';
import { Link } from 'wouter';
import { Trophy, Mail, Lock, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/services/auth.service';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = (response) => {
    if (response && response.user && response.token) {
      toast.success('Login successful!', { style: { backgroundColor: '#4caf50', color: 'white' } });
      localStorage.setItem("access_token", response.token);
      localStorage.setItem("user_role", response.user.role);
      localStorage.setItem("user_id", response.user.id);

      const role = response.user.role;
      if (role === "ADMIN") {
        window.location.href = "/admin";
      } else if (role === "DOCTOR") {
        window.location.href = "/doctor/health-check";
      } else if (role === "HORSE_OWNER") {
        window.location.href = "/owner-home";
      } else if (role === "JOCKEY") {
        window.location.href = "/jockey/home";
      } else if (role === "REFEREE") {
        window.location.href = "/referee/home";
      } else if (role === "SPECTATOR") {
        window.location.href = "/spectator/home";
      } else {
        window.location.href = "/portal";
      }
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password', { style: { backgroundColor: '#ffcccc', color: 'black' } });
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (response) {
        if (response.otpRequired) {
          toast.success('Verification code sent to your email', { style: { backgroundColor: '#4caf50', color: 'white' } });
          setStep(2);
        } else if (response.token) {
          handleLoginSuccess(response);
        }
      }
    } catch (err) {
      // Error handled by axios interceptor
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP', { style: { backgroundColor: '#ffcccc', color: 'black' } });
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOtp({ email, otpCode: otp });
      handleLoginSuccess(response);
    } catch (err) {
      // Error handled by axios interceptor
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white w-full absolute inset-0 z-50">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-slate-950 to-slate-950"></div>

        {/* Abstract decorative shape */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <Link href="/portal">
            <div className="flex items-center gap-2 text-white cursor-pointer inline-flex" data-testid="login-logo-link">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-primary text-primary-foreground">
                <Trophy className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">HRTMS</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            The world's premier platform for elite racing management.
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Access real-time tournament data, track jockey performance, and follow the action across every circuit.
          </p>

          <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center">🇻🇳</div>
              <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center">🇮🇪</div>
              <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center">🇯🇵</div>
            </div>
            <span>Trusted by global racing federations</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 md:p-20 relative">
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

        <div className="w-full max-w-md">
          {step === 1 ? (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome Back</h1>
                <p className="text-slate-500">Sign in to your HRTMS portal account</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <Input
                        id="email"
                        data-testid="login-email-input"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-slate-700">Password</Label>
                      <Link href="/portal/forgot-password">
                        <span className="text-sm font-medium text-primary hover:underline cursor-pointer">Forgot password?</span>
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <Input
                        id="password"
                        data-testid="login-password-input"
                        type="password"
                        placeholder="password"
                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold" data-testid="login-submit-btn">
                  {loading ? 'Verifying...' : 'Sign In'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <KeyRound className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Two-Step Verification</h1>
                <p className="text-slate-500">
                  We sent a verification code to <br />
                  <span className="font-medium text-slate-900">{email}</span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-slate-700">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      className="text-center text-xl tracking-[0.25em] font-mono h-14 bg-slate-50 border-slate-200 focus:bg-white"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button type="submit" disabled={loading || otp.length < 6} className="w-full h-12 text-base font-bold" data-testid="otp-submit">
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={loading} className="w-full h-12">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                  </Button>
                </div>
              </form>
            </>
          )}

          <div className="mt-8 text-center text-slate-500">
            Don't have an account?{' '}
            <Link href="/portal/register" className="font-bold text-primary hover:underline" data-testid="link-register">
              Create one now
            </Link>
          </div>

          <div className="mt-12 text-center">
            <Link href="/portal" className="text-sm text-slate-400 hover:text-slate-600 font-medium" data-testid="link-back-portal">
              ← Back to Portal Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
