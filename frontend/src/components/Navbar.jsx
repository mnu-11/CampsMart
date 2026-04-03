import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  ShoppingBag, Menu, X, Sun, Moon, User, Plus, Package,
  Bell, LogOut, Shield, ChevronDown, Crown, Search, Wallet
} from 'lucide-react';
import SubscriptionModal from './SubscriptionModal';

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const profileRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(r => setUnreadCount(r.data.unreadCount || 0)).catch(() => {});
  }, [user, location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); setProfileOpen(false); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-4 py-3 ${scrolled ? 'md:py-4' : 'md:py-6'}`}>
      <nav className={`mx-auto max-w-6xl rounded-[2rem] transition-all duration-500 border ${
        scrolled 
          ? 'glass shadow-2xl shadow-blue-500/10 border-white/20 dark:border-white/5 py-2' 
          : 'bg-white/80 dark:bg-slate-900/80 border-slate-100 dark:border-slate-800 py-3'
      }`}>
        <div className="page-container flex items-center justify-between gap-2 md:gap-4 px-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-black text-xl tracking-tighter dark:text-white">
                Camps<span className="text-blue-600">Mart</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-50 dark:bg-slate-800/40 p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
            {[
              { to: '/', label: 'Explore', icon: Search },
              { to: '/notifications', label: 'Updates', icon: Bell, count: unreadCount },
            ].map(l => (
              <Link 
                key={l.to} 
                to={l.to} 
                className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-5 py-2.5 rounded-xl text-[11px] lg:text-sm font-bold transition-all ${
                  isActive(l.to) 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <l.icon size={15} className={isActive(l.to) ? 'text-blue-600' : 'text-slate-400'} />
                {l.label}
                {l.count > 0 && <span className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">{l.count}</span>}
              </Link>
            ))}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3">
            
            {/* Wallet Display (Realistic) */}
            {user && (
              <Link to="/profile" className="hidden lg:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800/40 group">
                <Wallet size={14} className="text-emerald-600" />
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">₹{user.wallet?.balance || 0}</span>
              </Link>
            )}

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all border border-slate-100 dark:border-slate-800"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                
                {/* Premium Crown */}
                <button 
                  onClick={() => setSubModalOpen(true)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    user.subscription?.plan === 'premium' 
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500 border border-amber-200 dark:border-amber-800/40' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <Crown size={18} fill={user.subscription?.plan === 'premium' ? 'currentColor' : 'none'} className={user.subscription?.plan === 'free' ? 'animate-pulse' : ''} />
                </button>

                {/* Sell Button */}
                <Link to="/add-item" className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all">
                  <Plus size={14} strokeWidth={3} /> Post Item
                </Link>

                {/* Avatar Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md overflow-hidden">
                       {user.name?.[0].toUpperCase()}
                    </div>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-[#0a0f1e] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden py-2 animate-enter">
                      <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account</p>
                        <p className="text-sm font-black dark:text-white truncate">{user.name}</p>
                      </div>
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <User size={16} /> Profile
                      </Link>
                      <Link to="/my-items" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <Package size={16} /> My Listings
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 transition-all">
                          <Shield size={16} /> Admin Hub
                        </Link>
                      )}
                      <div className="h-px bg-slate-50 dark:bg-slate-800 my-1"></div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all">Login</Link>
                <Link to="/register" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu (Glass) */}
      {menuOpen && (
        <div className="mx-auto max-w-6xl mt-2 p-4 animate-enter">
           <div className="glass rounded-[2rem] p-6 flex flex-col gap-4 shadow-2xl border-white/20">
              <Link to="/" onClick={() => setMenuOpen(false)} className="text-lg font-black dark:text-white border-b border-white/10 pb-4">Browse Marketplace</Link>
              {user && (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-slate-600 dark:text-slate-300">My Profile</Link>
                  <Link to="/add-item" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-blue-600">Post New Item</Link>
                  <button onClick={handleLogout} className="text-lg font-bold text-red-500 text-left">Logout</button>
                </>
              )}
           </div>
        </div>
      )}

      {/* Subscription Modal */}
      {user && (
        <SubscriptionModal isOpen={subModalOpen} onClose={() => setSubModalOpen(false)} user={user} />
      )}
    </div>
  );
}
