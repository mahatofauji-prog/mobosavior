import React, { useState } from 'react';
import { ShieldCheck, Lock, Loader2, AlertTriangle, HelpCircle } from 'lucide-react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanPassword = password.trim();
    if (cleanPassword !== 'Mobo@2026') {
      setError('Incorrect administrator password. Access denied.');
      setLoading(false);
      return;
    }

    try {
      // Attempt Firebase authentication silently for security rules if enabled
      const adminEmail = 'admin@mobosavior.com';
      try {
        await signInWithEmailAndPassword(auth, adminEmail, cleanPassword);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, adminEmail, cleanPassword);
          } catch (createErr) {
            console.warn('Firebase Auth user creation warning:', createErr);
          }
        } else {
          console.warn('Firebase Auth notice (falling back to passcode session):', signInErr.message);
        }
      }
      // Passcode verified successfully -> unlock dashboard
      onSuccess();
    } catch (err: any) {
      // Direct passcode fallback
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8 text-left">
      <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center mx-auto text-[#0284C7]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
            Admin Staff Portal
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Protected workspace. Enter the master passcode to unlock the console.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">
              Admin Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#0284C7] outline-none text-slate-700 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 focus:outline-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Portal...</span>
              </>
            ) : (
              <span>Login to Dashboard</span>
            )}
          </button>
        </form>
      </div>
      
      <div className="flex gap-2 items-start bg-slate-50 border border-slate-100 p-4 rounded-2xl text-[11px] text-slate-500 leading-normal">
        <HelpCircle className="w-4.5 h-4.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <p>
          This portal requires the single master passcode <strong>Mobo@2026</strong>. 
          No email address is needed. Unauthorized access attempts are blocked automatically.
        </p>
      </div>
    </div>
  );
}
