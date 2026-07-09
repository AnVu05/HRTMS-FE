import React, { useState } from 'react';
import { Link } from 'wouter';
import { Trophy, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PortalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login handler
  };

  return (
    <div className="min-h-screen flex bg-white">
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
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-500">Sign in to your HRTMS portal account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com"
                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold" data-testid="login-submit">
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

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
