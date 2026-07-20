import React, { useState } from 'react';
import { Link } from 'wouter';
import { authApi } from '@/services/auth.service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Key, Lock, CheckCircle2 } from 'lucide-react';
import { Trophy } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email', { style: { backgroundColor: '#ffcccc', color: 'black' } });
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      toast.success('Verification code sent to your email!', { style: { backgroundColor: '#4caf50', color: 'white' } });
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification code. Please try again.', { style: { backgroundColor: '#ffcccc', color: 'black' } });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields', { style: { backgroundColor: '#ffcccc', color: 'black' } });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', { style: { backgroundColor: '#ffcccc', color: 'black' } });
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({
        email: email,
        otpCode: otp,
        newPassword: newPassword
      });
      toast.success('Password reset successfully!', { style: { backgroundColor: '#4caf50', color: 'white' } });
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Please check your OTP.', { style: { backgroundColor: '#ffcccc', color: 'black' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 w-full absolute inset-0 z-50">
      {/* Left side - Banner */}
      <div className="hidden md:flex md:w-1/2 bg-[#001f3f] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" id="patternId" x="0" y="0" width="100" height="100" viewBox="0 0 100 100" fill="none"><path d="M0 0h100v100H0z" fill="transparent"/><path d="M10 10L90 90M90 10L10 90" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        
        <div className="relative z-10">
          <Link href="/portal">
            <div className="flex items-center gap-2 text-white cursor-pointer inline-flex">
              <div className="bg-[#f59e0b] p-2 rounded-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">HRTMS</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mt-20">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-white">
            Recover your account
          </h1>
          <p className="text-lg text-slate-300">
            Don't worry, we'll help you get back on track.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-slate-400">
          &copy; 2026 Elite Horse Racing Tournament Management. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              {step === 1 ? 'Forgot Password?' : step === 2 ? 'Reset Password' : 'All done!'}
            </h2>
            <p className="text-slate-500">
              {step === 1 
                ? 'Enter your email address and we\'ll send you a verification code to reset your password.' 
                : step === 2 
                ? 'Enter the 6-digit code sent to your email and your new password.'
                : 'Your password has been successfully reset. You can now log in.'}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10 h-12"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold bg-[#f59e0b] hover:bg-[#d97706] text-white">
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input 
                      id="otp" 
                      type="text" 
                      placeholder="6-digit code" 
                      className="pl-10 h-12 tracking-widest text-lg"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input 
                      id="newPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-12"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-12"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold bg-[#f59e0b] hover:bg-[#d97706] text-white">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            {step === 3 && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-slate-900">Success!</h3>
                  <p className="text-slate-500">Your password has been changed.</p>
                </div>
                <Link href="/portal/login" className="w-full block">
                  <Button className="w-full h-12 text-base font-bold bg-[#001f3f] hover:bg-[#003366] text-white">
                    Go to Login
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {step !== 3 && (
            <div className="text-center">
              <Link href="/portal/login" className="inline-flex items-center text-sm font-medium text-primary hover:underline cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
