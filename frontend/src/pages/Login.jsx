import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
    // Errors shown via toast from axios interceptor
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c1f2e 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo-full.png" alt="SalesPilot" className="h-24 mx-auto mb-2 drop-shadow-lg"/>
          <p className="text-slate-400 mt-1.5 text-sm">Sign in to your workspace</p>
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5)' }}>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-400 mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="input-field"
                placeholder="jane@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-400">
              No account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                Get started
              </Link>
            </p>
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
