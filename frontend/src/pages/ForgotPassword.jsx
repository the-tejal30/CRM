import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import LockIcon from '../icons/LockIcon';
import MailIcon from '../icons/MailIcon';
import CheckIcon from '../icons/CheckIcon';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      toast.success(data.message);
      setStep('otp');
    } catch {
      // toast shown by axios interceptor
    } finally { setLoading(false); }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) return setLocalError('Passwords do not match');
    if (newPassword.length < 6) return setLocalError('Password must be at least 6 characters');
    setLocalError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/reset-password', { email, otp, newPassword });
      toast.success(data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      // toast shown by axios interceptor
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c1f2e 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo-full.png" alt="SalesPilot" className="h-24 mx-auto mb-2 drop-shadow-lg"/>
          <p className="text-slate-400 mt-1.5 text-sm">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5)' }}>
          {step === 'email' ? (
            <>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Forgot password?</h2>
              <p className="text-sm text-slate-400 mb-6">Enter your email and we'll send you a 6-digit OTP.</p>

              <form onSubmit={sendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                  <div className="relative">
                    <MailIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-9"
                      placeholder="jane@company.com"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center mt-2"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                  ) : 'Send OTP'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Enter OTP</h2>
              <p className="text-sm text-slate-400 mb-1">We sent a 6-digit code to</p>
              <p className="text-sm font-semibold text-primary-600 mb-5 truncate">{email}</p>

              {localError && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">{localError}</div>
              )}

              <form onSubmit={resetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">6-Digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field text-center text-xl font-bold tracking-[0.4em]"
                    placeholder="——————"
                    maxLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">New Password</label>
                  <div className="relative">
                    <LockIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field pl-9"
                      placeholder="Min. 6 characters"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <LockIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="input-field pl-9"
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="btn-primary w-full justify-center mt-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Resetting…</>
                  ) : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setLocalError(''); }}
                  className="w-full text-xs text-slate-400 hover:text-primary-600 transition-colors mt-1"
                >
                  ← Back / resend OTP
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-slate-400 mt-6">
            Remembered it?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
