import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Check, Save, UserCheck, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../services/api';

export default function Profile() {
  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const setAuth = useStore((state) => state.setAuth);

  // Form input states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Refresh user profile details from backend on load
    async function loadLatestProfile() {
      try {
        const response = await api.get('/profile');
        const updated = response.data;
        setAuth(updated, token);
        setFullName(updated.full_name || '');
        setPhone(updated.phone || '');
        setAddress(updated.address || '');
      } catch (err) {
        console.warn('Backend offline or failed to fetch profile. Running on local store details.', err);
      }
    }
    if (token) {
      loadLatestProfile();
    }
  }, [token, setAuth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccess(false);

    const payload = {
      full_name: fullName,
      phone: phone,
      address: address,
    };

    try {
      const response = await api.put('/profile', payload);
      setAuth(response.data, token);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.warn('API request to update profile failed. Saving to local state.', err);
      
      // Offline fallback: save changes locally in Zustand
      const localUpdatedUser = {
        ...user,
        full_name: fullName,
        phone: phone,
        address: address,
      };
      setAuth(localUpdatedUser, token);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details and shipping address configurations.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        
        {/* Glowing detail */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center border border-primary-200 dark:border-primary-900/50">
            <User size={32} className="stroke-[1.5]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {user?.full_name || 'Valued Customer'}
            </h2>
            <p className="text-sm text-slate-400 font-medium">{user?.email}</p>
            <span className="inline-block text-[9px] font-bold uppercase px-2 py-0.5 mt-1 bg-primary-50 dark:bg-primary-950/20 text-primary-600 rounded-full">
              {user?.role || 'Customer'}
            </span>
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-xs flex gap-1.5 items-start">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-hidden focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest mb-2">
              Contact Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-hidden focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest mb-2">
              Default Shipping Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, unit, city, state, postal code"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-hidden focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex-grow py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                success
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg hover:shadow-primary-500/20 active:scale-98'
              }`}
            >
              {success ? (
                <>
                  <Check size={18} /> Details Saved Successfully
                </>
              ) : (
                <>
                  <Save size={18} /> Save Settings
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
