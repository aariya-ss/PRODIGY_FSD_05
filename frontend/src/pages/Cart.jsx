import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    formatRupees, 
    getCartSubtotal, 
    getDeliveryFee, 
    getGrandTotal, 
    getAmtNeededForFreeDelivery 
  } = useStore();

  const subtotal = getCartSubtotal();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();
  const amtNeededForFreeDelivery = getAmtNeededForFreeDelivery();

  const gstPercentage = 5; // 5% GST inclusive
  const gstAmount = (subtotal * gstPercentage) / (100 + gstPercentage);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl mt-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 mb-4">
          <ShoppingCart className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your cart is empty</h2>
        <p className="text-xs text-slate-500 max-w-xs mt-2">
          Looks like you haven't added any fresh vegetables, dairy, or bakery goods to your cart yet.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 text-xs font-semibold text-white shadow-sm transition-colors"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const prod = item.product;
            const discount = Math.round(
              ((prod.original_price - prod.price) / prod.original_price) * 100
            );

            return (
              <div 
                key={prod.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl"
              >
                {/* Product Image */}
                <img
                  src={prod.image_url}
                  alt={prod.name}
                  className="h-16 w-16 rounded-xl object-cover bg-slate-50 dark:bg-slate-950 shrink-0"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {prod.category}
                  </span>
                  <Link 
                    to={`/products/${prod.id}`}
                    className="block font-bold text-sm text-slate-900 dark:text-white truncate hover:text-indigo-650"
                  >
                    {prod.name}
                  </Link>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatRupees(prod.price)}
                    </span>
                    {prod.original_price > prod.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatRupees(prod.original_price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Quantity adjustments & delete */}
                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  
                  {/* Quantity selector */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-lg h-8">
                    <button
                      onClick={() => updateCartQuantity(prod.id, item.quantity - 1)}
                      className="px-2.5 h-full text-slate-500 hover:text-slate-700"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(prod.id, item.quantity + 1)}
                      className="px-2.5 h-full text-slate-500 hover:text-slate-700"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(prod.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/55 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Summary panel & delivery tracker */}
        <div className="space-y-6">
          
          {/* Free Delivery Tracker */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Delivery Benefit
            </h3>
            {amtNeededForFreeDelivery > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  Add <span className="font-extrabold text-indigo-650">{formatRupees(amtNeededForFreeDelivery)}</span> more to unlock <span className="font-bold text-emerald-600">FREE delivery</span>!
                </p>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-650 h-full transition-all duration-300"
                    style={{ width: `${(subtotal / 500) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/40">
                🎉 Congratulations! You qualify for FREE delivery on this order.
              </div>
            )}
          </div>

          {/* Pricing summary */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3">
              Order Summary
            </h3>
            
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatRupees(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatRupees(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-850 pt-2 text-[10px] text-slate-400">
                <span>Includes 5% local GST</span>
                <span>{formatRupees(gstAmount)}</span>
              </div>
            </div>

            <div className="flex justify-between border-t border-slate-150 dark:border-slate-800 pt-4 text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Grand Total</span>
              <span>{formatRupees(grandTotal)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-sm font-semibold text-white shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
