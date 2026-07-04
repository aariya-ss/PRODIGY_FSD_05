import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header>
        <Navbar />
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">BlueCart E-Commerce</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                A production-quality local storefront powered by FastAPI & Supabase.
              </p>
            </div>
            <div className="flex gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="hover:text-primary-600 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-primary-600 cursor-pointer">Terms of Service</span>
              <span className="hover:text-primary-600 cursor-pointer">Contact Support</span>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              &copy; {currentYear} BlueCart Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
