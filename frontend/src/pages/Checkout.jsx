import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { ShieldCheck, Truck, CreditCard, ArrowRight, Home } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, user, setUser, formatRupees, getCartSubtotal, getDeliveryFee, getGrandTotal } = useStore();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  
  const [paymentMethod, setPaymentMethod] = useState('pod'); // POD is Pay-on-Delivery
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = getCartSubtotal();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim() || !city.trim() || !pincode.trim() || !phone.trim() || !fullName.trim()) {
      setError('Please complete all delivery information fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullDeliveryAddress = `${fullName}, ${address}, ${city} - ${pincode}`;
      
      const orderItems = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));

      const res = await api.post('/orders', {
        delivery_address: fullDeliveryAddress,
        contact_phone: phone,
        items: orderItems
      });

      // Fetch user profile again to update any saved/synced address details
      const profileRes = await api.get('/profile');
      setUser(profileRes.data);

      // Clear the local Zustand cart
      clearCart();

      // Redirect user to their order tracking/history dashboard
      navigate('/orders', { state: { newOrderPlaced: true, orderId: res.data.id } });

    } catch (err) {
      setError(err.response?.data?.detail || 'Checkout transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
        Checkout
      </h1>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-3.5 text-xs font-semibold text-red-650 dark:text-red-400 border border-red-100 dark:border-red-900/50">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Delivery Details Form */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-4">
            <h2 className="font-display font-extrabold text-lg text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Home className="h-5 w-5 text-indigo-600" />
              Delivery Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9999999999"
                  className="w-full mt-2 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs focus:border-indigo-500 focus:bg-white outline-none dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Street Address / House No.
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Flat 302, Sector 15, Green Glen Apartments"
                className="w-full mt-2 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs focus:border-indigo-500 focus:bg-white outline-none dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
          </div>

          {/* Payment Method selector */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-4">
            <h2 className="font-display font-extrabold text-lg text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              Select Payment Method
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <label className="relative flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'pod'}
                  onChange={() => setPaymentMethod('pod')}
                  className="accent-indigo-650 h-4.5 w-4.5"
                />
                <div className="flex-1">
                  <span className="block font-bold text-xs text-slate-900 dark:text-white">Pay-on-Delivery (POD)</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Pay via Cash, UPI or Card when delivery driver arrives.</span>
                </div>
                <Truck className="h-5 w-5 text-emerald-500" />
              </label>
            </div>
          </div>

        </div>

        {/* Right: Summary and Place Order */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-4">
            <h2 className="font-display font-extrabold text-base text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3">
              Order Review
            </h2>

            {/* List items */}
            <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400 line-clamp-1 max-w-[150px]">
                    {item.product.name} <span className="font-bold text-[10px]">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatRupees(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatRupees(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? 'FREE' : formatRupees(deliveryFee)}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between border-t border-slate-150 dark:border-slate-800 pt-4 font-extrabold text-sm text-slate-900 dark:text-white">
              <span>Amount Payable</span>
              <span>{formatRupees(grandTotal)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-sm font-semibold text-white shadow-md hover:shadow-indigo-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing Order...' : 'Confirm & Place Order'}
              <ArrowRight className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-450 mt-4">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>ACID Safe Stock Transaction</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
