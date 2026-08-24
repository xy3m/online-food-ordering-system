import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { Utensils, ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, ChevronDown, ListOrdered, Search, Heart } from 'lucide-react';

const Navbar = ({ onCartClick }: { onCartClick: () => void }) => {
  const { user, logout, switchDemoRole } = useAuth() as any;
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/restaurants' },
    { name: 'Partner with Us', path: '/apply-partner' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleSwitchRole = (role: 'ADMIN' | 'RESTAURANT_STAFF' | 'CUSTOMER') => {
    if (switchDemoRole) {
      switchDemoRole(role);
    }
    if (role === 'ADMIN') {
      navigate('/admin');
    } else if (role === 'RESTAURANT_STAFF') {
      navigate('/staff');
    } else {
      navigate('/restaurants');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark/95 backdrop-blur-md shadow-2xl py-2.5 border-b border-white/10' : 'bg-dark/80 backdrop-blur-sm py-4'}`}>
      <div className="container mx-auto px-4 md:px-10 flex items-center justify-between gap-2">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-white hover:text-white transition-colors group shrink-0">
          <span className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white flex items-center">
            F<span className="text-primary-500">oo</span>dy
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-primary-500/20 text-primary-400 border border-primary-500/40 rounded">
              LMS.PRO
            </span>
          </span>
        </Link>

        {/* 1-CLICK DEMO ROLE SWITCHER */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 overflow-x-auto shadow-inner">
          <span className="hidden lg:inline text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2">
            Demo Switcher:
          </span>

          <button
            onClick={() => handleSwitchRole('ADMIN')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              user?.role === 'ADMIN'
                ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Switch to Admin Dashboard"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Admin</span>
          </button>

          <button
            onClick={() => handleSwitchRole('RESTAURANT_STAFF')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              user?.role === 'RESTAURANT_STAFF'
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Switch to Restaurant Kitchen Staff"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Staff</span>
          </button>

          <button
            onClick={() => handleSwitchRole('CUSTOMER')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              user?.role === 'CUSTOMER'
                ? 'bg-orange-500/30 text-orange-200 border border-orange-400/50 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Switch to Customer Foodie"
          >
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span>Customer</span>
          </button>
        </div>

        {/* Center Links (Desktop) */}
        <div className="hidden xl:flex items-center space-x-6">
          {!user || user.role === 'CUSTOMER' ? (
            navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path 
                    ? 'text-primary-500' 
                    : 'text-slate-300 hover:text-primary-500'
                }`}
              >
                {link.name}
              </Link>
            ))
          ) : (
            <Link 
              to={user.role === 'ADMIN' ? "/admin" : "/staff"}
              className={`text-sm font-medium transition-colors ${
                location.pathname === (user.role === 'ADMIN' ? '/admin' : '/staff')
                  ? 'text-primary-500' 
                  : 'text-slate-300 hover:text-primary-500'
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {(!user || user.role === 'CUSTOMER') && (
            <button className="text-slate-300 hover:text-primary-500 transition-colors hidden sm:block">
              <Search className="h-5 w-5" />
            </button>
          )}

          {user ? (
            <>
              {user.role === 'CUSTOMER' && (
                <button onClick={onCartClick} className="relative text-slate-300 hover:text-primary-500 transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                  {cart && cart.totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-dark">
                      {cart.totalItems}
                    </span>
                  )}
                </button>
              )}
              
              {(user.role === 'ADMIN' || user.role === 'RESTAURANT_STAFF') && (
                <Link to={user.role === 'ADMIN' ? "/admin" : "/staff"} className="text-slate-300 hover:text-primary-500 transition-colors">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center overflow-hidden border border-slate-600">
                    <UserIcon className="h-4 w-4" />
                  </div>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-dark-card border border-dark-border rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-dark-border mb-1">
                      <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    
                    {user.role === 'CUSTOMER' && (
                      <>
                        <Link 
                          to="/profile" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:text-primary-400 hover:bg-dark-border/50 transition-colors"
                        >
                          <UserIcon className="h-4 w-4 mr-3" /> Profile
                        </Link>
                        <Link 
                          to="/orders" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:text-primary-400 hover:bg-dark-border/50 transition-colors"
                        >
                          <ListOrdered className="h-4 w-4 mr-3" /> My Orders
                        </Link>
                        <Link 
                          to="/favorites" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:text-primary-400 hover:bg-dark-border/50 transition-colors"
                        >
                          <Heart className="h-4 w-4 mr-3 text-red-500 fill-red-500" /> Favorites
                        </Link>
                      </>
                    )}

                    <div className="border-t border-dark-border mt-1 pt-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              {/* If not logged in, we show Sign Up prominently as per reference */}
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
                Log In
              </Link>
              <Link to="/register" className="btn-success text-sm py-2 px-6">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
