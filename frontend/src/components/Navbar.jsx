import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  ShoppingBag, 
  Search, 
  Sun, 
  Moon, 
  User, 
  LayoutDashboard, 
  LogOut,
  MapPin
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, token, role, user, cart, logout } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Sync search input with URL query param if on product list page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    if (location.pathname === '/products') {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery('');
    }
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-200 glass bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              {/* Location pin enclosing a shopping bag SVG */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-6 w-6"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <path d="M10 9a2 2 0 0 1 4 0v1h-4V9z" />
                <rect x="9" y="10" width="6" height="4" rx="1" />
              </svg>
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
              SmartBuy
            </span>
          </Link>

          {/* Search bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden sm:flex relative flex-1 max-w-md items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search fresh grocery, dairy, bakery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 dark:text-slate-100 outline-none transition-all duration-200"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
            </div>
            <button 
              type="submit" 
              className="absolute right-1 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900 transition-colors"
            >
              Go
            </button>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:scale-105 transition-all duration-200 cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Cart Icon Badge */}
            <Link
              to="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:scale-105 transition-all duration-200"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {/* Auth / Menu Links */}
            {token ? (
              <div className="flex items-center gap-2 border-l border-slate-250 dark:border-slate-800 pl-2 sm:pl-4">
                
                {/* Admin Dashboard button */}
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-950 transition-colors"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </Link>
                )}

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  title="View Profile"
                >
                  <img
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.phone}`}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100"
                  />
                  <span className="hidden lg:inline text-sm font-medium text-slate-700 dark:text-slate-350 max-w-[100px] truncate">
                    {user?.full_name || 'My Profile'}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>

              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 text-xs font-semibold text-white shadow-sm hover:scale-102 hover:shadow-indigo-500/20 active:scale-98 transition-all duration-200"
              >
                Sign In
              </Link>
            )}

          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative flex w-full items-center">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs focus:border-indigo-500 focus:bg-white outline-none transition-all duration-200 dark:text-slate-100"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <button type="submit" className="absolute right-1 px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Search
            </button>
          </form>
        </div>

      </div>
    </header>
  );
}
