import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ShieldAlert, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../services/supabase';
import api from '../services/api';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const token = data.session.access_token;

      // Temporary auth state to make the API call with the interceptor
      setAuth({ id: data.user.id, email: data.user.email, role: 'customer' }, token);

      // 2. Fetch and sync profile with FastAPI Backend
      const profileRes = await api.get('/profile');
      setAuth(profileRes.data, token);

      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to authenticate. Please check your credentials.');
      // clear local state in case of backend sync failures
      useStore.getState().clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // Developer mock login handler
  const handleMockLogin = async (role) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const mockUuid = role === 'admin' 
        ? 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' 
        : 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
      
      const mockEmail = role === 'admin' ? 'admin@example.com' : 'customer@example.com';
      const mockToken = `mock-${mockUuid}:${role}:${mockEmail}`;

      // Set temporary state to hit backend
      setAuth({ id: mockUuid, email: mockEmail, role }, mockToken);

      try {
        // Sync profile on backend
        const profileRes = await api.get('/profile');
        setAuth(profileRes.data, mockToken);
      } catch (backendErr) {
        console.warn('Backend is offline. Using local-only mock session.', backendErr);
        // Local fallback if backend is not running yet
        setAuth({
          id: mockUuid,
          email: mockEmail,
          full_name: `Mock Local ${role.toUpperCase()}`,
          phone: '+1 555-0199',
          address: '123 Developer Lane, Localhost',
          role: role,
          created_at: new Date().toISOString()
        }, mockToken);
      }

      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg('Failed to run mock login: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Sign in to access orders and manage your profile.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-sm flex items-start gap-2.5">
            <ShieldAlert className="shrink-0 w-5 h-5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Real Sign In Form */}
        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-hidden focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-hidden focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20 active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
            Create account
          </Link>
        </p>

        {/* Developer Sandbox Logins Section */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 justify-center text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider mb-4">
            <Sparkles size={14} />
            <span>Developer Sandbox Modes</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleMockLogin('customer')}
              className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <User size={14} />
              <span>Mock Customer</span>
            </button>
            <button
              onClick={() => handleMockLogin('admin')}
              className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ShieldCheck size={14} className="text-primary-600 dark:text-primary-400" />
              <span>Mock Admin</span>
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-3">
            Use sandbox modes to test the backend API flow offline on localhost without configuring Supabase.
          </p>
        </div>

      </div>
    </div>
  );
}
