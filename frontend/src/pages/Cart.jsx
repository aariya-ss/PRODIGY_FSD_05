import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Cart() {
  const navigate = useNavigate();
  const cart = useStore((state) => state.cart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const clearCart = useStore((state) => state.clearCart);
  const getCartSubtotal = useStore((state) => state.getCartSubtotal);
  const getCartTax = useStore((state) => state.getCartTax);
  const getCartDelivery = useStore((state) => state.getCartDelivery);
  const getCartTotal = useStore((state) => state.getCartTotal);

  const [qtyError, setQtyError] = useState({});

  const handleQtyChange = (productId, currentQty, amount) => {
    try {
      updateQuantity(productId, currentQty + amount);
      setQtyError((prev) => ({ ...prev, [productId]: '' }));
    } catch (err) {
      setQtyError((prev) => ({ ...prev, [productId]: err.message }));
      setTimeout(() => {
        setQtyError((prev) => ({ ...prev, [productId]: '' }));
      }, 3000);
    }
  };

  const subtotal = getCartSubtotal();
  const tax = getCartTax();
  const delivery = getCartDelivery();
  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center my-12 shadow-sm">
        <ShoppingBag size={48} className="mx-auto text-slate-350 dark:text-slate-650 mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Cart is Empty</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Looks like you haven't added any products to your cart yet.
        </p>
        <Link
          to="/products"
          className="inline-block mt-6 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-xl transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          You have {cart.reduce((sum, i) => sum + i.quantity, 0)} items in your cart.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {cart.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-150 shrink-0 border border-slate-100 dark:border-slate-800">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name and Details */}
                  <div className="flex-grow space-y-1">
                    <Link to={`/products/${item.id}`} className="font-bold text-slate-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wider">
                      {item.category}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Unit Price: ${Number(item.price).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity and Error Message Box */}
                  <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0 w-full sm:w-auto">
                    <div className="flex items-center gap-1">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg overflow-hidden h-9">
                        <button
                          onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                          className="px-2.5 text-slate-500 hover:bg-slate-250 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                          className="px-2.5 text-slate-500 hover:bg-slate-250 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all ml-2"
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Stock Warning message */}
                    {qtyError[item.id] && (
                      <span className="text-[10px] font-semibold text-red-500 animate-pulse text-center sm:text-right">
                        {qtyError[item.id]}
                      </span>
                    )}
                  </div>

                  {/* Item Total Price */}
                  <div className="text-right font-bold text-slate-900 dark:text-white shrink-0 sm:min-w-[80px] w-full sm:w-auto mt-2 sm:mt-0 flex justify-between sm:block border-t border-slate-100 pt-2 sm:pt-0 sm:border-0">
                    <span className="text-xs text-slate-400 font-medium sm:hidden">Total:</span>
                    <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>

                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="bg-slate-50 dark:bg-slate-900/50 py-3 px-6 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <Link to="/products" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                &larr; Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-xs font-bold text-slate-500 hover:text-red-500 hover:underline"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        {/* Checkout Summary Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
              Order Summary
            </h2>
            
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-650 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-650 dark:text-slate-400">
                <span>Sales Tax (8%)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-650 dark:text-slate-400">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {delivery === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `$${delivery.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            {/* Delivery free notifier banner */}
            {subtotal < 100 && (
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-850 text-xs flex gap-2 text-slate-500 dark:text-slate-400 items-start leading-relaxed">
                <Info size={14} className="shrink-0 text-primary-500 mt-0.5" />
                <span>
                  Add <strong className="text-slate-700 dark:text-slate-300">${(100 - subtotal).toFixed(2)}</strong> more to your cart to qualify for <strong>Free Delivery</strong>!
                </span>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-850 pt-3" />

            <div className="flex justify-between items-center text-slate-900 dark:text-white pb-2">
              <span className="font-bold">Total Amount</span>
              <span className="text-xl font-extrabold">${total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-500/20 transition-all active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
