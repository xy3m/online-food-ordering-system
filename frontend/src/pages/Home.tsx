import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Apple, Star } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-green/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-4">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-[1.1] tracking-tight">
            it's not just<br/>Food, It's an<br/>Experience.
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-lg leading-relaxed">
            We are helping you to get fresh and delicious food in a few minutes by using our nice <strong className="text-white font-semibold">Web</strong> & <strong className="text-white font-semibold">App</strong>.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/login" className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-amber-500 hover:from-primary-400 hover:to-amber-400 text-white font-bold text-base flex items-center gap-2 shadow-lg shadow-primary-500/25 transition-all transform hover:-translate-y-0.5">
              <span>⚡ 1-Click Live Demo</span>
            </Link>
            <Link to="/restaurants" className="btn-primary flex items-center gap-2">
              View Menu
            </Link>
            <button className="btn-outline hidden sm:flex items-center gap-2">
              <Apple className="w-5 h-5" /> iOS App
            </button>
          </div>

          {/* Social Proof */}
          <div className="pt-8 flex items-center gap-4">
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-dark" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" alt="Customer" />
              <img className="w-10 h-10 rounded-full border-2 border-dark" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80" alt="Customer" />
              <img className="w-10 h-10 rounded-full border-2 border-dark" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Customer" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Our Happy Customer</p>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 
                <span className="text-white font-medium">4.8</span> (12.5k Reviews)
              </div>
            </div>
          </div>

          {/* Stats Bottom */}
          <div className="pt-12 flex items-center gap-12">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Active Users</p>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-slate-400" /> 3740+
              </p>
            </div>
            <div className="w-px h-12 bg-dark-border"></div>
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Download</p>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                <DownloadIcon className="w-5 h-5 text-slate-400" /> 20.5K
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full h-[600px] flex justify-center items-center"
        >
          {/* We use the custom generated 3D burger image */}
          <motion.img 
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            src="/hero_burger.png" 
            alt="Delicious 3D Burger" 
            className="w-full max-w-lg object-contain relative z-20 drop-shadow-2xl"
          />
        </motion.div>

      </div>
    </div>
  );
};

// SVG Icons specifically for the layout
const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const DownloadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);

export default Home;
