import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { Phone, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, setUser } = useStore();

  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1); // 1 = Phone input, 2 = OTP input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number (min 10 digits).');
      return;
    }

    setLoading(true);
    setError('');
    setInfoMessage('');

    try {
      const res = await api.post('/auth/otp/request', { phone });
      setStep(2);
      setInfoMessage(`Mock OTP sent! For testing, use the code: ${res.data.mock_code}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/otp/verify', {
        phone,
        code: otpCode,
      });

      const { access_token, role } = res.data;
      
      // Store token & role in state
      setAuth(access_token, role);

      // Fetch profile to save user details
      const profileRes = await api.get('/profile');
      setUser(profileRes.data);

      // Navigate back
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP code. Please try 123456.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none">
        
        {/* Title / Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-7 w-7"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <path d="M10 9a2 2 0 0 1 4 0v1h-4V9z" />
              <rect x="9" y="10" width="6" height="4" rx="1" />
            </svg>
          </div>
          <h2 className="mt-4 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            Welcome to SmartBuy
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-450">
            Your local essentials, delivered fresh.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-3 text-xs font-medium text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-2">
            <Sparkles className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="mt-6 space-y-4" onSubmit={handleRequestOtp}>
            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mobile Phone Number
              </label>
              <div className="relative mt-2">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 99999 99999"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm focus:border-indigo-500 focus:bg-white outline-none dark:text-white transition-all duration-200"
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                * Note: Admins can log in using phone numbers ending with <b>0000</b> or using <b>+919999999999</b>.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 text-sm font-semibold text-white shadow-md hover:shadow-indigo-500/20 active:scale-98 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP Verification'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleVerifyOtp}>
            <div>
              <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Enter 6-Digit OTP
              </label>
              <div className="relative mt-2">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 123456"
                  className="w-full h-11 pl-10 pr-4 tracking-widest text-center font-bold text-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-indigo-500 focus:bg-white outline-none dark:text-white transition-all duration-200"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Back
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 flex-1 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-md hover:shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
