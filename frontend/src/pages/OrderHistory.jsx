import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { ClipboardList, Calendar, MapPin, Phone, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Circle } from 'lucide-react';

export default function OrderHistory() {
  const location = useLocation();
  const { formatRupees } = useStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    // Check if redirecting from a successful checkout
    if (location.state?.newOrderPlaced) {
      setShowSuccessBanner(true);
      if (location.state?.orderId) {
        setExpandedOrderId(location.state.orderId);
      }
      // Clear state so reload doesn't trigger banner
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching order history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const toggleExpandOrder = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const pipelineSteps = [
    { key: 'placed', label: 'Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const getStatusIndex = (status) => {
    return pipelineSteps.findIndex(step => step.key === status);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="py-12 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          My Order History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track and view summaries of all your SmartBuy orders.
        </p>
      </div>

      {/* Success checkout Banner */}
      {showSuccessBanner && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-5 space-y-2 text-emerald-800 dark:text-emerald-450 flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">Order Placed Successfully!</h3>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-450/80 leading-normal mt-0.5">
              Your transaction went through, and the local store has reserved your stock. Our delivery partner will contact you shortly.
            </p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 p-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">No orders found</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2">
            You haven't placed any orders on SmartBuy yet. Feed your cart and check out!
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 text-xs font-semibold text-white shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const currentStatusIndex = getStatusIndex(order.status);
            
            return (
              <div 
                key={order.id}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-200"
              >
                
                {/* Header row click to expand */}
                <div 
                  onClick={() => toggleExpandOrder(order.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                >
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                      <span className="font-semibold text-slate-900 dark:text-white">#{order.id.slice(0, 8)}...</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placed On</span>
                      <span className="font-medium text-slate-700 dark:text-slate-350">{formatDate(order.created_at)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                      <span className="font-extrabold text-slate-950 dark:text-white">{formatRupees(order.total_amount)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                      <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 text-[10px] font-bold border border-indigo-150 dark:border-indigo-900/50 uppercase">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>{isExpanded ? 'Hide Details' : 'Track Status'}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>

                {/* Expanded Tracking Timeline & Items */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-850 p-6 space-y-8 bg-slate-50/30 dark:bg-slate-950/20">
                    
                    {/* Pipeline status timeline */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                        Delivery Status Tracking
                      </h3>
                      
                      {/* Horizonal Timeline */}
                      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-2">
                        {/* Connecting line (desktop) */}
                        <div className="hidden md:block absolute top-[13px] left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -z-0" />
                        <div 
                          className="hidden md:block absolute top-[13px] left-8 h-1 bg-emerald-500 transition-all duration-300 -z-0"
                          style={{ width: `${(currentStatusIndex / (pipelineSteps.length - 1)) * 85}%` }}
                        />

                        {pipelineSteps.map((step, idx) => {
                          const isCompleted = idx <= currentStatusIndex;
                          const isCurrent = idx === currentStatusIndex;
                          
                          return (
                            <div key={idx} className="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 text-xs">
                              {/* Icon/Circle */}
                              <div className={`flex h-7.5 w-7.5 items-center justify-center rounded-full border-2 transition-colors ${
                                isCompleted 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-emerald-500/20 dark:ring-emerald-500/10 animate-pulse' : ''}`}>
                                {isCompleted ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Circle className="h-3 w-3" />}
                              </div>

                              {/* Label */}
                              <span className={`font-bold ${
                                isCurrent 
                                  ? 'text-slate-900 dark:text-white' 
                                  : isCompleted 
                                    ? 'text-emerald-600 dark:text-emerald-450' 
                                    : 'text-slate-400'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 dark:border-slate-850 pt-6">
                      
                      {/* Products purchased */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                          Items Ordered
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div 
                              key={item.id}
                              className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800"
                            >
                              <img
                                src={item.product?.image_url}
                                alt={item.product?.name}
                                className="h-10 w-10 rounded-lg object-cover bg-slate-50"
                              />
                              <div className="flex-1 min-w-0 text-xs">
                                <span className="block font-bold text-slate-900 dark:text-white truncate">
                                  {item.product?.name || 'Local Product'}
                                </span>
                                <span className="block text-slate-500 mt-0.5">
                                  {item.quantity} x {formatRupees(item.price_at_purchase)}
                                </span>
                              </div>
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                                {formatRupees(item.price_at_purchase * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Contact Address */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-indigo-500" />
                            Delivery Address
                          </h4>
                          <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-xl">
                            {order.delivery_address}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
                            <Phone className="h-4 w-4 text-indigo-500" />
                            Contact Mobile
                          </h4>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-xl">
                            {order.contact_phone}
                          </p>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
