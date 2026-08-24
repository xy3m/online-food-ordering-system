import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MapPin, Search, Clock, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { Restaurant } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getDemoStore } from '../services/demoStore';

const ITEMS_PER_PAGE = 10;

const RestaurantList = () => {
  const { user } = useAuth();
  const initialStore = getDemoStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialStore.restaurants || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 2]));
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(initialStore.restaurants.length);

  const hasLocation = !!(user?.latitude && user?.longitude);

  useEffect(() => {
    fetchRestaurants();
    if (localStorage.getItem('ofos_access_token')) {
      fetchFavorites();
    }
  }, [user, page]); // Re-fetch if user (and location) changes or page changes

  // Reset to page 0 when search changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const fetchRestaurants = async () => {
    const store = getDemoStore();
    try {
      setLoading(true);
      let url = `/restaurants?page=${page}&size=${ITEMS_PER_PAGE}`;
      if (user?.latitude && user?.longitude) {
        url += `&lat=${user.latitude}&lng=${user.longitude}`;
      }
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      const response = await api.get(url);
      const data = response.data.data;
      if (data?.content?.length) {
        setRestaurants(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalElements || data.content.length);
        return;
      }
    } catch (error) {
      // Fallback
    } finally {
      let filtered = store.restaurants || [];
      if (searchTerm.trim()) {
        filtered = filtered.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setRestaurants(filtered);
      setTotalItems(filtered.length);
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites');
      setFavorites(new Set(res.data.data || []));
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchRestaurants();
  };

  const toggleFavorite = async (id: number) => {
    if (!localStorage.getItem('ofos_token')) {
      alert('Please log in to save favorites.');
      return;
    }
    try {
      await api.post(`/favorites/${id}`);
      setFavorites(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return null;
    const [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const sortedRestaurants = [...restaurants].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'distance' && a.distance != null && b.distance != null) return a.distance - b.distance;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
        <div className="w-full md:w-2/3">
          <motion.h1
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-2"
          >
            Discover <span className="text-primary-500">Premium</span> Dining
          </motion.h1>
          <p className="text-slate-400 text-lg">
            {hasLocation
              ? `Showing restaurants within 10 km of your location.`
              : 'Order from the finest restaurants in your area.'}
          </p>
        </div>

        <div className="w-full md:w-1/3 relative flex gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
              className="input-field pl-10 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <select
            className="input-field w-36 h-12 py-0 px-4 appearance-none bg-dark-card cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating">Top Rated</option>
            {hasLocation && <option value="distance">Nearest</option>}
            <option value="name">A - Z</option>
          </select>
        </div>
      </div>

      {/* Location prompt banner */}
      {!hasLocation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 bg-blue-900/20 border border-blue-500/30 rounded-xl px-5 py-3"
        >
          <div className="flex items-center gap-3 text-sm text-blue-200">
            <Navigation className="w-5 h-5 text-blue-400 shrink-0" />
            <span>Set your delivery location to see only nearby restaurants and get accurate delivery times.</span>
          </div>
          <Link
            to="/profile"
            className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 transition-all"
          >
            Set Location
          </Link>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-panel h-72 animate-pulse bg-dark-card/50"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Results info */}
          {totalItems > 0 && (
            <p className="text-xs text-slate-500">
              Showing {restaurants.length} of {totalItems} restaurants
              {hasLocation ? ' within 10 km' : ''}
            </p>
          )}

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.07 } }
            }}
          >
            {sortedRestaurants.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-panel overflow-hidden group cursor-pointer border border-transparent hover:border-primary-500/50 transition-all duration-300 shadow-lg hover:shadow-primary-500/20"
              >
                <Link to={`/restaurants/${restaurant.id}/menu`} className="block">
                  <div className="h-48 bg-dark-border relative overflow-hidden">
                    <img
                      src={restaurant.imageUrl || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80`}
                      alt={restaurant.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent opacity-80"></div>

                    {/* Rating Badge */}
                    <div className="absolute top-4 left-4 bg-dark/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-dark-border shadow-lg">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-white">{restaurant.rating > 0 ? Number(restaurant.rating).toFixed(1) : 'New'}</span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite(restaurant.id); }}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-dark/80 backdrop-blur-md flex items-center justify-center border border-dark-border hover:scale-110 transition-transform shadow-lg z-20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${favorites.has(restaurant.id) ? 'text-primary-500 fill-primary-500 shadow-[0_0_15px_rgba(255,30,56,0.8)]' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </button>

                    {/* Status Badge */}
                    <div className="absolute bottom-4 left-4 z-20">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg border backdrop-blur-md ${restaurant.isCurrentlyOpen === false ? 'bg-red-500/80 text-white border-red-400/50' : 'bg-emerald-500/80 text-white border-emerald-400/50'}`}>
                        {restaurant.isCurrentlyOpen === false ? 'CLOSED' : 'OPEN'}
                      </span>
                    </div>

                    {/* Distance Badge */}
                    {restaurant.distance != null && (
                      <div className="absolute bottom-4 right-4 z-20">
                        <span className="px-3 py-1 text-xs font-bold rounded-full shadow-lg border backdrop-blur-md bg-dark/80 text-white border-dark-border flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-blue-400" />
                          {Number(restaurant.distance).toFixed(1)} km
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">{restaurant.name}</h2>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{restaurant.description || 'Delicious premium food.'}</p>

                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                      <span className="truncate">{restaurant.address || 'Local Delivery Area'}</span>
                    </div>

                    {(restaurant.openingTime || restaurant.closingTime) && (
                      <div className="flex items-center gap-2 text-slate-400 text-sm mt-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span>{formatTime(restaurant.openingTime)} – {formatTime(restaurant.closingTime)}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}

            {sortedRestaurants.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400">
                {hasLocation ? (
                  <>
                    <Navigation className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-xl mb-2">No restaurants found within 10 km</p>
                    <p className="text-sm">Try updating your location or check back later for new restaurants in your area.</p>
                  </>
                ) : (
                  <p className="text-xl">No restaurants found matching your search.</p>
                )}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dark-border text-slate-300 hover:bg-dark-card disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  // Show pages around current page
                  let pageNum = i;
                  if (totalPages > 7) {
                    if (page < 4) pageNum = i;
                    else if (page > totalPages - 4) pageNum = totalPages - 7 + i;
                    else pageNum = page - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        pageNum === page
                          ? 'bg-primary-500 text-white shadow-[0_0_15px_rgba(255,30,56,0.4)]'
                          : 'border border-dark-border text-slate-400 hover:bg-dark-card'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dark-border text-slate-300 hover:bg-dark-card disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default RestaurantList;
