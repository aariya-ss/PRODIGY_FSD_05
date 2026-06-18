import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-md">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-5.5 w-5.5"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <path d="M10 9a2 2 0 0 1 4 0v1h-4V9z" />
                  <rect x="9" y="10" width="6" height="4" rx="1" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">
                SmartBuy
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Your hyper-local, fresh grocery and bakery marketplace. Delivering organic produce, dairy, and artisanal baked goods directly to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products?category=Fruits%20%26%20Vegetables" className="hover:text-indigo-400 transition-colors">
                  Fruits & Vegetables
                </Link>
              </li>
              <li>
                <Link to="/products?category=Dairy" className="hover:text-indigo-400 transition-colors">
                  Dairy & Eggs
                </Link>
              </li>
              <li>
                <Link to="/products?category=Bakery" className="hover:text-indigo-400 transition-colors">
                  Bakery & Artisanal Bread
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-indigo-400 transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Customer Care</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/profile" className="hover:text-indigo-400 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-400 transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-indigo-400 transition-colors">
                  My Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Support & Contact</h3>
            <div className="flex items-center gap-2 text-xs">
              <Mail className="h-4 w-4 text-indigo-400" />
              <a href="mailto:support@smartbuy.com" className="hover:text-white transition-colors">
                support@smartbuy.com
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Phone className="h-4 w-4 text-indigo-400" />
              <span>+91 1800-SMART-BUY</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>100% Secure Checkout</span>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SmartBuy Ltd. All rights reserved. Indian Local E-Commerce Platform.</p>
        </div>
      </div>
    </footer>
  );
}
