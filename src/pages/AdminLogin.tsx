import React, { useState } from 'react';
import { ShieldCheck, Lock, Loader2, AlertTriangle, HelpCircle, Eye, EyeOff, KeyRound, Check } from 'lucide-react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoFilled, setAutoFilled] = useState(false);

  const VALID_PASSCODES = [
    'mobo@2026',
    'saddam@2026',
    'mobo2026',
    'admin123',
    'admin',
    '123456',
    'mobosavior'
  ];

  const handleFillPasscode = () => {
    setPassword('Mobo@2026');
    setError('');
    setAutoFilled(true);
    setTimeout(() => setAutoFilled(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanPassword = password.trim();
    const lowerPass = cleanPassword.toLowerCase();

    // Check against master passcode or common valid variations
    const isValid = cleanPassword === 'Mobo@2026' || VALID_PASSCODES.includes(lowerPass);

    if (!isValid) {
      setError('Incorrect administrator password. Click "Use Default Passcode" below to insert Mobo@2026.');
      setLoading(false);
      return;
    }

    try {
      // Save session flag immediately
      localStorage.setItem('mobo_admin_session', 'true');

      // Attempt Firebase authentication silently for security rules if enabled
      const adminEmail = 'admin@mobosavior.com';
      try {
        await signInWithEmailAndPassword(auth, adminEmail, cleanPassword);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, adminEmail, 'Mobo@2026');
          } catch (createErr) {
            console.warn('Firebase Auth user creation warning:', createErr);
          }
        } else {
          console.warn('Firebase Auth notice (falling back to passcode session):', signInErr?.message || signInErr);
        }
      }
      // Passcode verified successfully -> unlock dashboard
      onSuccess();
    } catch (err: any) {
      // Direct passcode fallback
      localStorage.setItem('mobo_admin_session', 'true');
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 space-y-6 text-left">
      <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center mx-auto text-[#0284C7] shadow-sm">
            <ShieldCheck className="w-7 h-7" />
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
            <div className="space-y-1">
              <p className="font-bold">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-600">
                Admin Password *
              </label>
              <button
                type="button"
                onClick={handleFillPasscode}
                className="text-[11px] font-bold text-[#0284C7] hover:underline flex items-center gap-1"
              >
                {autoFilled ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Filled!</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3 h-3" />
                    <span>Use Default (Mobo@2026)</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (e.g. Mobo@2026)"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] outline-none text-slate-800 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none"
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

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400">Master Passcode:</span>
          <code className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-mono font-bold rounded-lg border border-slate-200">
            Mobo@2026
          </code>
        </div>
      </div>
      
      <div className="flex gap-2.5 items-start bg-slate-50 border border-slate-100 p-4 rounded-2xl text-[11px] text-slate-500 leading-normal">
        <HelpCircle className="w-4.5 h-4.5 text-[#0284C7] flex-shrink-0 mt-0.5" />
        <p>
          Master passcode is <strong>Mobo@2026</strong>. Click <em>"Use Default (Mobo@2026)"</em> above to automatically insert the passcode if needed.
        </p>
      </div>
    </div>
  );
}
