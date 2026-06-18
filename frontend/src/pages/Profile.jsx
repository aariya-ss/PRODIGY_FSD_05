import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { User, MapPin, ClipboardList, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Profile() {
  const { user, setUser, formatRupees } = useStore();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Refresh state when user store refreshes
    if (user) {
      setFullName(user.full_name || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setPincode(user.pincode || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  useEffect(() => {
    async function fetchRecentOrders() {
      try {
        const res = await api.get('/orders');
        setRecentOrders(res.data.slice(0, 3)); // Display last 3 orders
      } catch (err) {
        console.error('Error fetching profile orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchRecentOrders();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const res = await api.put('/profile', {
        full_name: fullName,
        avatar_url: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.phone}`,
        address,
        city,
        pincode
      });

      setUser(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  const generateNewAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`);
  };

  return (
    <div className="py-6 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          My Account
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your delivery details, profile settings, and check order statuses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Edit Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-6">
            
            <h2 className="font-display font-extrabold text-lg text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <User className="h-5 w-5 text-indigo-600" />
              Profile Settings
            </h2>

            {success && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3.5 text-xs font-semibold text-red-650 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              {/* Avatar select */}
              <div className="flex items-center gap-4">
                <img
                  src={avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.phone}`}
                  alt="Avatar Preview"
                  className="h-16 w-16 rounded-full border border-slate-250 bg-slate-50"
                />
                <div>
                  <button
                    type="button"
                    onClick={generateNewAvatar}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                  >
                    Change Avatar
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Generates a randomized Dicebear character.
                  </p>
                </div>
              </div>

              {/* Read-only phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mobile Number (Read-Only)
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.phone || ''}
                  className="w-full mt-2 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-slate-800/50 text-xs text-slate-500 font-semibold cursor-not-allowed outline-none"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full mt-2 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs focus:border-indigo-500 focus:bg-white outline-none dark:text-white"
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-555 dark:text-slate-400">
                  Default Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat No, Wing, Apartment, Street name"
                  className="w-full mt-2 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs focus:border-indigo-500 focus:bg-white outline-none dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-555 dark:text-slate-400">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full mt-2 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs focus:border-indigo-500 focus:bg-white outline-none dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-555 dark:text-slate-400">
                    Pincode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 110001"
                    className="w-full mt-2 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs focus:border-indigo-500 focus:bg-white outline-none dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex h-10 items-center justify-center rounded-xl bg-indigo-650 hover:bg-indigo-600 text-xs font-semibold text-white shadow-md hover:shadow-indigo-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>

            </form>
          </div>
        </div>

        {/* Right: Quick Orders Snapshot */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-4">
            
            <h2 className="font-display font-extrabold text-base text-slate-950 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <span className="flex items-center gap-2">
                <ClipboardList className="h-4.5 w-4.5 text-indigo-600" />
                Quick Orders
              </span>
              <Link to="/orders" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </h2>

            {loadingOrders ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, idx) => (
                  <div key={idx} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-xs text-slate-450 text-center py-4">
                No orders placed yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link 
                    key={order.id}
                    to="/orders"
                    className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-800 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-all text-xs"
                  >
                    <div className="space-y-1">
                      <span className="block font-bold text-slate-900 dark:text-white">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="block font-extrabold text-slate-900 dark:text-white">
                          {formatRupees(order.total_amount)}
                        </span>
                        <span className="block text-[9px] font-bold text-indigo-600 bg-indigo-50/55 dark:bg-indigo-950/40 px-1 rounded uppercase tracking-wider text-center mt-0.5">
                          {order.status}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
