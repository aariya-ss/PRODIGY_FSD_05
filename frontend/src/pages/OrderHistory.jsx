import React, { useEffect, useState } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp, Clock, Truck, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import api from '../services/api';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Status mapping to colors and steps
  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const statusLabels = {
    pending: 'Pending Review',
    processing: 'Processing Order',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (err) {
        console.warn('Could not fetch orders from backend. Fetching local sandbox storage...', err);
        
        // Try local storage orders
        const localHistory = localStorage.getItem('local_orders');
        if (localHistory) {
          setOrders(JSON.parse(localHistory));
        } else {
          // Provide some default dummy order history for immediate visual demonstration
          const dummyOrders = [
            {
              id: 'ord-8f92bd12',
              user_id: 'mock-user-id',
              total_amount: 114.98,
              status: 'shipped',
              created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              items: [
                { id: 'itm-1', product_id: '1', product_name: 'Classic Blue Denim Jacket', quantity: 1, price_at_purchase: 89.99 },
                { id: 'itm-4', product_id: '4', product_name: 'Stainless Steel Water Bottle', quantity: 1, price_at_purchase: 24.99 },
              ],
            },
            {
              id: 'ord-2a10df99',
              user_id: 'mock-user-id',
              total_amount: 199.99,
              status: 'delivered',
              created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              items: [
                { id: 'itm-2', product_id: '2', product_name: 'Premium Wireless Headphones', quantity: 1, price_at_purchase: 199.99 },
              ],
            },
          ];
          setOrders(dummyOrders);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusStepIndex = (status) => {
    return statusSteps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse py-8">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="space-y-4 pt-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review, view details, and track statuses of all your purchases.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
          <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Orders Found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            You haven't placed any orders yet on this account.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const stepIndex = getStatusStepIndex(order.status);
            const isCancelled = order.status === 'cancelled';
            const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs hover:border-slate-350 dark:hover:border-slate-700/80 transition-all duration-300"
              >
                
                {/* Header Summary */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-none">
                        Order #{order.id.substring(0, 8)}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isCancelled
                          ? 'bg-red-50 dark:bg-red-950/20 text-red-650'
                          : order.status === 'delivered'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650'
                          : 'bg-primary-50 dark:bg-primary-950/20 text-primary-600'
                      }`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{orderDate}</p>
                  </div>

                  <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">Total</span>
                      <span className="font-extrabold text-slate-800 dark:text-white">${Number(order.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Collapsible Details Area */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-slate-50 dark:border-slate-850/40 pt-6 space-y-8 animate-fadeIn">
                    
                    {/* Visual Status Tracker Timeline */}
                    {!isCancelled ? (
                      <div className="relative pt-2 pb-6 px-4">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
                        <div
                          className="absolute top-1/2 left-8 h-1 bg-primary-600 -translate-y-1/2 z-0 transition-all duration-700"
                          style={{
                            width: `${(Math.max(0, stepIndex) / (statusSteps.length - 1)) * 100}%`,
                            left: '32px',
                            right: '32px',
                          }}
                        />

                        {/* Tracker Steps */}
                        <div className="relative z-10 flex justify-between">
                          {statusSteps.map((step, idx) => {
                            const isDone = idx <= stepIndex;
                            const isCurrent = idx === stepIndex;
                            
                            let StepIcon = Clock;
                            if (step === 'processing') StepIcon = ShieldCheck;
                            if (step === 'shipped') StepIcon = Truck;
                            if (step === 'delivered') StepIcon = CheckCircle2;

                            return (
                              <div key={step} className="flex flex-col items-center">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                                  isDone
                                    ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                                } ${isCurrent ? 'ring-4 ring-primary-500/20 scale-110' : ''}`}>
                                  <StepIcon size={16} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase mt-2.5 tracking-wider hidden sm:block ${
                                  isDone ? 'text-primary-600 dark:text-primary-400' : 'text-slate-450 dark:text-slate-650'
                                }`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-xl flex gap-3 text-red-700 dark:text-red-400 text-xs items-center leading-relaxed">
                        <XCircle size={18} className="shrink-0" />
                        <span>This order was cancelled. Please contact support if you believe this is in error.</span>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest">Items Purchased</h3>
                      <div className="border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
                        {order.items.map((item) => (
                          <div key={item.id} className="p-4 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between text-xs items-center">
                            <div>
                              <p className="font-bold text-slate-850 dark:text-slate-200">{item.product_name || 'Product Details'}</p>
                              <p className="text-slate-400 mt-0.5">
                                Qty: {item.quantity} &times; ${Number(item.price_at_purchase).toFixed(2)}
                              </p>
                            </div>
                            <div className="font-bold text-slate-850 dark:text-slate-200">
                              ${(item.quantity * Number(item.price_at_purchase)).toFixed(2)}
                            </div>
                          </div>
                        ))}
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
