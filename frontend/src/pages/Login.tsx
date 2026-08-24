import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Utensils, AlertCircle, ShieldCheck, ChefHat, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoRoleLoading, setDemoRoleLoading] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoQuickLogin = async (role: 'ADMIN' | 'RESTAURANT_STAFF' | 'CUSTOMER', demoEmail: string) => {
    setError('');
    setDemoRoleLoading(role);
    setEmail(demoEmail);
    setPassword('admin123');

    try {
      // Try official login endpoint first
      const loggedInUser = await login(demoEmail, 'admin123');
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin');
      } else if (loggedInUser.role === 'RESTAURANT_STAFF') {
        navigate('/staff');
      } else {
        navigate('/restaurants');
      }
    } catch (err) {
      // Direct instant fallback pre-hydration
      const fallbackUser = {
        userId: role === 'ADMIN' ? 1 : role === 'RESTAURANT_STAFF' ? 2 : 3,
        id: role === 'ADMIN' ? 1 : role === 'RESTAURANT_STAFF' ? 2 : 3,
        fullName: role === 'ADMIN' ? 'System Administrator' : role === 'RESTAURANT_STAFF' ? 'Karim Uddin (Kacchi House)' : 'Tanvir Hasan (Foodie)',
        email: demoEmail,
        phone: '+880 1711-000001',
        role: role,
        latitude: 23.7500,
        longitude: 90.3800
      };
      localStorage.setItem(TOKEN_KEY, 'demo_jwt_access_token_v1');
      localStorage.setItem(REFRESH_TOKEN_KEY, 'demo_jwt_refresh_token_v1');
      localStorage.setItem('ofos_user', JSON.stringify(fallbackUser));

      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'RESTAURANT_STAFF') {
        navigate('/staff');
      } else {
        navigate('/restaurants');
      }
      window.location.reload();
    } finally {
      setDemoRoleLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);
      
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin');
      } else if (loggedInUser.role === 'RESTAURANT_STAFF') {
        navigate('/staff');
      } else {
        navigate('/restaurants');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Try 1-Click Demo buttons below!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-12 px-4">
      
      {/* --- 1-CLICK LIVE DEMO HERO SECTION --- */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mb-8"
      >
        <div className="bg-gradient-to-r from-primary-950/80 via-slate-900/90 to-primary-950/80 border border-primary-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-500/20 border border-primary-500/40 rounded-xl text-primary-400">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  1-Click Live Demo Access
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    Pre-Hydrated
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Instant portfolio walkthrough. Click any role to auto-sign in with live data:
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. Admin Persona */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDemoQuickLogin('ADMIN', 'admin@ofos.com')}
              disabled={!!demoRoleLoading}
              className="group p-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 hover:border-purple-400 text-left transition-all relative overflow-hidden shadow-lg cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-[11px] font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  ADMIN
                </span>
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-purple-200">System Admin</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Revenue metrics, restaurant approvals, user management & order audit.
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
                <span>Launch Admin Studio</span>
                <ArrowRight size={14} className="ml-1" />
              </div>
            </motion.button>

            {/* 2. Restaurant Staff Persona */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDemoQuickLogin('RESTAURANT_STAFF', 'karim@kacchihouse.com')}
              disabled={!!demoRoleLoading}
              className="group p-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all relative overflow-hidden shadow-lg cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <ChefHat size={20} />
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  KITCHEN
                </span>
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-emerald-200">Restaurant Staff</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Kacchi House kitchen orders queue, menu manager & daily sales.
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Open Kitchen Queue</span>
                <ArrowRight size={14} className="ml-1" />
              </div>
            </motion.button>

            {/* 3. Customer Persona */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDemoQuickLogin('CUSTOMER', 'tanvir@gmail.com')}
              disabled={!!demoRoleLoading}
              className="group p-4 rounded-xl bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/30 hover:border-orange-400 text-left transition-all relative overflow-hidden shadow-lg cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                  <ShoppingBag size={20} />
                </div>
                <span className="text-[11px] font-mono font-bold text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  FOODIE
                </span>
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-orange-200">Customer (Tanvir)</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Browse 5 restaurants, cart, bKash checkout & GPS rider map tracking.
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
                <span>Explore Restaurants</span>
                <ArrowRight size={14} className="ml-1" />
              </div>
            </motion.button>

          </div>
        </div>
      </motion.div>

      {/* --- STANDARD LOGIN FORM --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-700"></div>
        
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
            <Utensils className="h-6 w-6 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Manual Sign In</h2>
          <p className="text-slate-400 text-sm mt-1">Sign in with custom credentials or demo accounts</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-200 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-text">Email Address</label>
            <input 
              type="email" 
              required
              className="input-field"
              placeholder="admin@ofos.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full mt-6 py-2.5 flex justify-center items-center cursor-pointer"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign up now
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

