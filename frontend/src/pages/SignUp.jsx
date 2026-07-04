import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldAlert, Sparkles, User, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function SignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Join BlueCart for high-fidelity commerce.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-6">
            <div className="flex justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={64} className="animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Registration Successful!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please check your email inbox to verify your email. Once verified, you can sign in to your profile.
            </p>
            <Link
              to="/signin"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-xl transition-all"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-sm flex items-start gap-2.5">
                <ShieldAlert className="shrink-0 w-5 h-5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-hidden focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>

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
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
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

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
              Already have an account?{' '}
              <Link to="/signin" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
