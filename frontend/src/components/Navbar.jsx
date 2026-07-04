import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User, Sun, Moon, LogOut, Menu, X, BarChart2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const clearAuth = useStore((state) => state.clearAuth);
  const cart = useStore((state) => state.cart);
  const darkMode = useStore((state) => state.darkMode);
  const toggleTheme = useStore((state) => state.toggleTheme);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSignOut = () => {
    clearAuth();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Shop', path: '/products' },
    ...(token ? [{ name: 'Orders', path: '/orders' }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-extrabold text-xl tracking-tight">
              <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
              <span>BlueCart</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Admin Dashboard link */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-xl ${
                  isActive('/admin')
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart2 size={16} />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>

          {/* Right Utility Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Controls */}
            {token ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <User size={18} />
                  <span className="max-w-[120px] truncate">{user?.full_name || user?.email}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-300"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/20 active:scale-98"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Burger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-effect border-b border-slate-200 dark:border-slate-800 animate-slideDown">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-base font-semibold ${
                  isActive('/admin')
                    ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Admin Dashboard
              </Link>
            )}

            {token ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  My Profile ({user?.full_name || user?.email})
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-3 py-2 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 px-3">
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
