import React, { useState } from 'react';
import { ShieldCheck, Lock, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanPassword = password.trim();

    try {
      // In a real application, validate against backend
      // Here we check auth using Firebase with a fixed service account or dedicated endpoint.
      // Since backend logic isn't securely provided to React without custom APIs, 
      // we check via Firebase auth sign in.
      const adminEmail = 'admin@mobosavior.com';
      await signInWithEmailAndPassword(auth, adminEmail, cleanPassword);
      
      localStorage.setItem('mobo_admin_session', 'true');
      onSuccess();
    } catch (err: any) {
      console.warn('Authentication failed:', err.message);
      setError('Invalid admin password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 bg-[#0284C7] rounded-3xl flex items-center justify-center shadow-lg shadow-sky-500/20 transform -rotate-6">
            <div className="transform rotate-6">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">
              MOBO SAVIOR
            </h1>
            <h2 className="mt-2 text-xl font-bold text-slate-600">
              Admin Staff Portal
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Secure Administrator Access
            </p>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <p className="font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Admin Password
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="block w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-md text-sm font-extrabold text-white bg-[#0284C7] hover:bg-[#0369A1] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0284C7] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
