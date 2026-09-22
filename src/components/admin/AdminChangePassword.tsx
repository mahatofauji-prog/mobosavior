import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { fallbackChangeAdminPassword } from '../../lib/clientCrypto';

interface AdminChangePasswordProps {
  onCancel: () => void;
  onSuccessLogout: () => void;
}

export default function AdminChangePassword({ onCancel, onSuccessLogout }: AdminChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pass.length < 8) return { score: 1, label: 'Too short (min 8 chars)', color: 'bg-rose-500' };

    let score = 1;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 2, label: 'Weak', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Medium', color: 'bg-sky-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Frontend validations matching exact requirements
    if (!currentPassword) {
      setErrorMessage('Current password is required.');
      return;
    }

    if (!newPassword) {
      setErrorMessage('New password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // 1. Try standard API
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      // If the API is not supported/configured on static hosts (e.g. 404 or 405), fallback immediately
      if (response.status === 404 || response.status === 405) {
        console.warn(`[AdminChangePassword] API returned ${response.status}. Falling back to client-side Supabase password update...`);
        const fallbackRes = await fallbackChangeAdminPassword(currentPassword, newPassword);
        if (fallbackRes.success) {
          setSuccessMessage('Password updated successfully. Signing out...');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => {
            onSuccessLogout();
          }, 1500);
        } else {
          setErrorMessage(fallbackRes.message || 'Current password is incorrect.');
        }
        setLoading(false);
        return;
      }

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('[Change Password Response Parse Error]:', text);
        setErrorMessage(`Server Error (${response.status}): ${text.substring(0, 100) || 'Invalid response format'}`);
        setLoading(false);
        return;
      }

      if (!response.ok || !data.success) {
        // Try client-side update fallback as a secondary option in case the backend is misconfigured/out of sync
        console.warn('[AdminChangePassword] Backend change password failed. Trying direct client-side Supabase update...');
        const fallbackRes = await fallbackChangeAdminPassword(currentPassword, newPassword);
        if (fallbackRes.success) {
          setSuccessMessage('Password updated successfully. Signing out...');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => {
            onSuccessLogout();
          }, 1500);
        } else {
          setErrorMessage(fallbackRes.message || data.message || 'Current password is incorrect.');
        }
        setLoading(false);
        return;
      }

      setSuccessMessage('Password updated successfully. Signing out...');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onSuccessLogout();
      }, 1500);
    } catch (err) {
      console.warn('Backend connection failed. Falling back to client-side Supabase password update...', err);
      try {
        const fallbackRes = await fallbackChangeAdminPassword(currentPassword, newPassword);
        if (fallbackRes.success) {
          setSuccessMessage('Password updated successfully. Signing out...');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => {
            onSuccessLogout();
          }, 1500);
        } else {
          setErrorMessage(fallbackRes.message || 'Current password is incorrect.');
          setLoading(false);
        }
      } catch (fallbackErr: any) {
        console.error('Fallback change password failed:', fallbackErr);
        setErrorMessage('Failed to connect to backend server. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Account</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
            Change Admin Password
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Update your MOBO SAVIOR administrative login credentials securely.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-2xs focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Main Password Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Top Security Banner */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3 text-xs text-slate-600">
          <div className="p-2 bg-sky-100/70 rounded-xl text-[#0284C7] flex-shrink-0 mt-0.5">
            <KeyRound className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-xs">Security Best Practices</h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Your new password is encrypted using PBKDF2 salted password hashing. Passwords are never stored in plaintext and never stored in local browser storage.
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Current Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter your current admin password"
                className="w-full pl-10 pr-11 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-2" />

          {/* 2. New Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                New Password <span className="text-rose-500">*</span>
              </label>
              {newPassword && (
                <span className="text-[11px] font-bold text-slate-500">
                  Strength: <span className={strength.score >= 3 ? 'text-emerald-600 font-extrabold' : 'text-amber-600 font-extrabold'}>{strength.label}</span>
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNew ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter new password (minimum 8 characters)"
                className="w-full pl-10 pr-11 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator Bar */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-transparent'} ${strength.score === 1 ? 'w-full' : 'w-1/4'}`} />
                  <div className={`h-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-transparent'} w-1/4`} />
                  <div className={`h-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-transparent'} w-1/4`} />
                  <div className={`h-full transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-transparent'} w-1/4`} />
                </div>
                <p className="text-[10px] text-slate-400">
                  Use at least 8 characters with letters, numbers & special symbols.
                </p>
              </div>
            )}
          </div>

          {/* 3. Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Re-enter new password to confirm"
                className="w-full pl-10 pr-11 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] font-bold text-rose-500 mt-1">
                Passwords do not match.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all focus:outline-none"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 focus:outline-none active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
