import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function OrganizationSetup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [action, setAction] = useState('create');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    inviteCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Email OTP verification state
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState(''); // verified OTP to send on submit
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [skipOtp, setSkipOtp] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    // Reset email verification if email changes
    if (name === 'email') {
      setEmailVerified(false);
      setOtpSent(false);
      setEnteredOtp('');
      setEmailOtp('');
      setOtpError('');
      setOtpSuccess('');
      setSkipOtp(false);
    }
  };

  const sendOtp = async () => {
    if (!form.email) return;
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      await API.post('/auth/send-registration-otp', { email: form.email });
      setOtpSent(true);
      setOtpSuccess('Verification code sent to your email');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Failed to send code';
      if (status === 503) {
        // Email not configured — skip OTP gracefully
        setSkipOtp(true);
        setEmailVerified(true);
        setOtpSuccess('Email verification skipped (not configured on server)');
      } else {
        setOtpError(msg);
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = () => {
    if (enteredOtp.length !== 6) {
      setOtpError('Enter the 6-digit code');
      return;
    }
    setEmailOtp(enteredOtp);
    setEmailVerified(true);
    setOtpSuccess('Email verified!');
    setOtpError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      action,
      ...(action === 'create' ? { organizationName: form.organizationName } : { inviteCode: form.inviteCode }),
      ...(!skipOtp && emailOtp ? { emailOtp } : {}),
    };

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c1f2e 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo-full.png" alt="SalesPilot" className="h-24 mx-auto mb-2 drop-shadow-lg"/>
          <p className="text-slate-400 mt-1.5 text-sm">Multi-tenant Sales CRM</p>
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5)' }}>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Get Started</h2>
          <p className="text-sm text-slate-400 mb-6">Create a new workspace or join an existing one</p>

          {/* Action toggle */}
          <div className="flex rounded-xl border border-slate-200 p-1 mb-6 bg-slate-50">
            {['create', 'join'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAction(opt)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={action === opt
                  ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }
                  : { color: '#64748b' }
                }
              >
                {opt === 'create' ? 'Create Workspace' : 'Join Workspace'}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {action === 'create' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Organization Name</label>
                <input
                  name="organizationName"
                  value={form.organizationName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Acme Corp"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Invite Code</label>
                <input
                  name="inviteCode"
                  value={form.inviteCode}
                  onChange={handleChange}
                  className="input-field uppercase tracking-widest font-mono"
                  placeholder="AB12CD34"
                  required
                />
                <p className="text-xs text-slate-400 mt-1.5">Ask your admin for the 8-character invite code</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Jane Doe" required />
            </div>

            {/* Email with inline verify button */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
              <div className="flex gap-2">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field flex-1"
                  placeholder="jane@company.com"
                  required
                  disabled={emailVerified}
                />
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={otpLoading || !form.email}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-white flex-shrink-0 transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', minWidth: '68px' }}
                  >
                    {otpLoading ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto"/>
                    ) : otpSent ? 'Resend' : 'Verify'}
                  </button>
                )}
                {emailVerified && (
                  <div className="flex items-center gap-1 px-3 text-emerald-600 text-xs font-semibold flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Verified
                  </div>
                )}
              </div>

              {/* OTP input */}
              {otpSent && !emailVerified && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => { setEnteredOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                      className="input-field flex-1 text-center tracking-[0.4em] text-lg font-bold"
                      placeholder="000000"
                    />
                    <button
                      type="button"
                      onClick={verifyOtp}
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#10b981,#059669)', minWidth: '68px' }}
                    >
                      Confirm
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">Check your inbox for the 6-digit code (expires in 10 min)</p>
                </div>
              )}

              {otpError && <p className="text-xs text-red-600 mt-1.5">{otpError}</p>}
              {otpSuccess && !otpError && (
                <p className="text-xs mt-1.5" style={{ color: emailVerified ? '#059669' : '#6366f1' }}>{otpSuccess}</p>
              )}
            </div>

            {/* Password — only show after email verified */}
            {emailVerified && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Min. 6 characters" required minLength={6} />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !emailVerified}
              className="btn-primary w-full justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Setting up…
                </>
              ) : action === 'create' ? 'Create & Register' : 'Join & Register'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
