import React, { useState } from 'react';
import { ShieldCheck, Lock, Loader2, AlertTriangle, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { fallbackVerifyAdminPassword, clientHashPassword } from '../lib/clientCrypto';
import { supabase } from '../lib/supabase';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Recovery Mode State
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRecoveryPasswords, setShowRecoveryPasswords] = useState(false);

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const cleanRecoveryKey = recoveryKey.trim();
    const cleanNewPassword = newPassword.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    // 1. Strictly verify the Master Recovery Key is the default password
    if (cleanRecoveryKey !== 'Mobofounder@2026') {
      setError('Invalid Master Recovery Key. Only the authorized owner has access to this key.');
      setLoading(false);
      return;
    }

    if (cleanNewPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (cleanNewPassword === 'Mobofounder@2026') {
      setError('You cannot set the new password to be the default master password.');
      setLoading(false);
      return;
    }

    if (cleanNewPassword !== cleanConfirmPassword) {
      setError('Confirm password does not match the new password.');
      setLoading(false);
      return;
    }

    try {
      // 2. Hash the new password securely
      const { hash, salt } = await clientHashPassword(cleanNewPassword);

      const payload = {
        id: 'admin_auth',
        data: {
          password_hash: hash,
          salt: salt,
          updated_at: new Date().toISOString()
        },
        value: {
          password_hash: hash,
          salt: salt,
          updated_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      };

      // 3. Save directly to Supabase settings table (unlocked via RLS disable)
      const { error: saveErr } = await supabase
        .from('settings')
        .upsert(payload);

      if (saveErr) {
        throw saveErr;
      }

      setSuccessMessage('Admin Password successfully updated! You can now login using your new password.');
      setPassword(cleanNewPassword);
      setIsRecoveryMode(false);
      setRecoveryKey('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('[handleRecoverySubmit error]:', err);
      setError(`Failed to save new password: ${err.message || JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanPassword = password.trim();

    try {
      // 1. Try standard API
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: cleanPassword }),
      });

      // If the API is not supported/configured on static hosts (e.g. 404 or 405), fallback immediately
      if (response.status === 404 || response.status === 405) {
        console.warn(`[AdminLogin] API returned ${response.status}. Falling back to client-side Supabase verification...`);
        const isValid = await fallbackVerifyAdminPassword(cleanPassword);
        if (isValid) {
          localStorage.setItem('mobo_admin_session', 'true');
          sessionStorage.setItem('admin_passcode', cleanPassword);
          onSuccess();
        } else {
          setError('Invalid admin password.');
        }
        return;
      }

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('mobo_admin_session', 'true');
        sessionStorage.setItem('admin_passcode', cleanPassword);
        onSuccess();
      } else {
        // EXTRA RESILIENT BACKUP CHECK:
        // If the backend API failed (e.g. 401 or success: false), try the direct client-side Supabase verification.
        // This handles cases where the backend has incorrect Supabase environment variables or is out of sync.
        console.warn('[AdminLogin] Backend auth failed. Trying direct client-side Supabase verification as backup...');
        const isClientValid = await fallbackVerifyAdminPassword(cleanPassword);
        if (isClientValid) {
          localStorage.setItem('mobo_admin_session', 'true');
          sessionStorage.setItem('admin_passcode', cleanPassword);
          onSuccess();
        } else {
          setError('Invalid admin password.');
        }
      }
    } catch (err: any) {
      console.warn('Backend authentication failed or timed out. Falling back to client-side Supabase verification...', err);
      try {
        const isValid = await fallbackVerifyAdminPassword(cleanPassword);
        if (isValid) {
          localStorage.setItem('mobo_admin_session', 'true');
          sessionStorage.setItem('admin_passcode', cleanPassword);
          onSuccess();
        } else {
          setError('Invalid admin password.');
        }
      } catch (fallbackErr) {
        console.error('Fallback authentication failed:', fallbackErr);
        setError('Invalid admin password.');
      }
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

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-sm flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="font-bold">{successMessage}</p>
            </div>
          )}

          {!isRecoveryMode ? (
            // STANDARD LOGIN FORM
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

              <div className="text-center mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(true);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-[#0284C7] transition-colors focus:outline-none cursor-pointer"
                >
                  Forgot Admin Password? Recover Account
                </button>
              </div>
            </form>
          ) : (
            // SECURE PASSWORD RECOVERY FORM (REQUIRES MASTER SECURITY KEY)
            <form onSubmit={handleRecoverySubmit} className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <h3 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#0284C7]" /> Secure Admin Password Recovery
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Provide the Master Recovery Key (default developer password) to authenticate your ownership and create a new secure password.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Master Recovery Key
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={recoveryKey}
                    onChange={(e) => setRecoveryKey(e.target.value)}
                    placeholder="Enter Master Recovery Key"
                    className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  New Admin Password
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showRecoveryPasswords ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="block w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRecoveryPasswords(!showRecoveryPasswords)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showRecoveryPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Confirm New Password
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showRecoveryPasswords ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="block w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-md text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving New Password...
                    </>
                  ) : (
                    'Verify & Update Password'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(false);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
