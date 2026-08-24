import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Search, AlertCircle, Star, Utensils } from 'lucide-react';
import { Restaurant, MenuItem } from '../types';
import { getDemoStore } from '../services/demoStore';

const Menu = () => {
  const { id } = useParams<{ id: string }>();
  const initialStore = getDemoStore();
  const restId = parseInt(id || '1') || 1;
  const defaultRest = initialStore.restaurants.find(r => r.id === restId) || initialStore.restaurants[0];
  const defaultItems = initialStore.menuItems.filter(m => m.restaurantId === restId);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(defaultRest);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultItems.length ? defaultItems : initialStore.menuItems);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingItem, setAddingItem] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<any[]>([
    { id: 1, userName: 'Sadia Rahman', rating: 5, comment: 'Best Kacchi in Dhaka, fast delivery!', createdAt: '2 days ago' },
    { id: 2, userName: 'Mehedi Hasan', rating: 5, comment: 'Food was hot and piping fresh.', createdAt: '1 week ago' }
  ]);
  const [visibleCount, setVisibleCount] = useState(5);
  const categoryRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  
  const { user } = useAuth();
  const { addItem, cart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      const store = getDemoStore();
      const currentRestId = parseInt(id || '1') || 1;
      try {
        const [restRes, menuRes, reviewsRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/restaurants/${id}/menu?size=50`),
          api.get(`/reviews/restaurant/${id}`)
        ]);
        if (restRes.data?.data) setRestaurant(restRes.data.data);
        if (menuRes.data?.data?.content?.length) setMenuItems(menuRes.data.data.content);
        if (reviewsRes.data?.data) setReviews(reviewsRes.data.data);
      } catch (err) {
        // Fallback
        const fallbackRest = store.restaurants.find(r => r.id === currentRestId) || store.restaurants[0];
        const fallbackItems = store.menuItems.filter(m => m.restaurantId === currentRestId);
        setRestaurant(fallbackRest);
        setMenuItems(fallbackItems.length ? fallbackItems : store.menuItems);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async (menuItem: MenuItem) => {
    if (!user) {
      alert("Please login to add items to your cart.");
      return;
    }
    
    // Check if adding from different restaurant
    // @ts-ignore - Temporary bypass for existing cart logic
    if (cart && cart.restaurantName && cart.restaurantName !== restaurant?.name && cart.items.length > 0) {
      if (!window.confirm("Your cart contains items from a different restaurant. Clear cart and add this item?")) {
        return;
      }
    }

    setAddingItem(menuItem.id);
    try {
      await addItem(menuItem.id, 1);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setTimeout(() => setAddingItem(null), 1000); // Show checkmark briefly
    }
  };

  const filteredMenu = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by category
  const groupedMenu = filteredMenu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const scrollToCategory = (category: string) => {
    // Add offset for the sticky header
    const element = categoryRefs.current[category];
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      
      {/* Restaurant Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 relative overflow-hidden rounded-3xl min-h-[350px] flex flex-col justify-end group shadow-2xl"
      >
        <div className="absolute inset-0 bg-dark-card">
          <img 
            src={restaurant?.imageUrl || `https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80`} 
            alt={restaurant?.name} 
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 to-transparent pointer-events-none mix-blend-overlay"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="text-5xl font-bold text-white"
            >
              {restaurant?.name}
            </motion.h1>
            {restaurant?.isCurrentlyOpen === false && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-red-600/90 text-white text-sm font-bold rounded-full border border-red-400/50"
              >
                CLOSED
              </motion.span>
            )}
          </div>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xl text-slate-300 max-w-2xl mb-4"
          >
            {restaurant?.description}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="inline-block bg-dark/60 border border-dark-border px-4 py-2 rounded-xl text-slate-200 backdrop-blur-md shadow-lg"
          >
            {restaurant?.address || '123 Premium Food Ave'}
          </motion.div>
        </div>
      </motion.div>

      {restaurant?.isCurrentlyOpen === false && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-red-950/40 border-l-4 border-red-500 rounded-r-xl flex items-start gap-4 text-red-200 backdrop-blur-md shadow-lg"
        >
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" /> 
          <div>
            <h3 className="font-bold text-lg text-white mb-1">This restaurant is currently closed</h3>
            <p className="text-red-300">You can browse the menu, but placing orders is disabled until they reopen.</p>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto md:mx-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
        <input 
          type="text" 
          placeholder="Search menu items or categories..." 
          className="input-field pl-12 h-12 text-lg shadow-lg border-primary-900/20 focus:border-primary-500/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      {Object.keys(groupedMenu).length > 0 && (
        <div className="sticky top-[70px] z-40 bg-dark/90 backdrop-blur-md py-4 border-b border-dark-border -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto custom-scrollbar shadow-lg">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all bg-dark-card text-slate-300 hover:text-white border border-dark-border hover:border-primary-500/50"
          >
            Top
          </button>
          {Object.keys(groupedMenu).map((category) => (
            <button
              key={category}
              onClick={() => scrollToCategory(category)}
              className="whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all bg-dark-card text-slate-300 hover:text-white hover:bg-primary-500/20 border border-dark-border hover:border-primary-500/50"
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Menu Categories */}
      <div className="space-y-12">
        <AnimatePresence>
          {Object.entries(groupedMenu).map(([category, items], catIdx) => (
            <motion.div 
              key={category}
              ref={(el) => { categoryRefs.current[category] = el; }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.1 }}
              className="scroll-mt-32"
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                {category}
                <div className="h-px bg-dark-border flex-1 ml-4 mt-2"></div>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (catIdx * 0.1) + (idx * 0.05) }}
                    whileHover={{ y: -5 }}
                    className="glass-panel p-5 flex justify-between group hover:shadow-[0_0_20px_rgba(225,29,72,0.15)] hover:border-primary-500/40 transition-all duration-300"
                  >
                    <div className="flex-1 flex gap-5 pr-4">
                      <div className="shrink-0 w-28 h-28 rounded-xl overflow-hidden shadow-md bg-dark-card border border-dark-border flex items-center justify-center text-slate-500">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <Utensils className="h-8 w-8 text-slate-500/60" />
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-1">
                        <div>
                          <h3 className="text-xl font-semibold text-white group-hover:text-primary-400 transition-colors">{item.name}</h3>
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="font-bold text-emerald-400 text-lg mt-2">${item.price.toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-end">
                      <motion.button 
                        whileTap={restaurant?.isCurrentlyOpen === false ? {} : { scale: 0.9 }}
                        onClick={() => handleAddToCart(item)}
                        disabled={restaurant?.isCurrentlyOpen === false}
                        className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all shadow-md ${
                          restaurant?.isCurrentlyOpen === false
                            ? 'bg-dark-card border border-dark-border text-slate-500 cursor-not-allowed opacity-50'
                            : addingItem === item.id 
                              ? 'bg-accent-green text-white shadow-[0_0_20px_rgba(52,211,42,0.4)]' 
                              : 'bg-dark border border-dark-border text-slate-300 hover:bg-accent-green hover:text-white hover:border-accent-green hover:shadow-[0_0_20px_rgba(52,211,42,0.3)]'
                        }`}
                        aria-label="Add to cart"
                      >
                        {addingItem === item.id ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {Object.keys(groupedMenu).length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 text-slate-400 glass-panel"
          >
            <p className="text-xl">No menu items found matching your search.</p>
          </motion.div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="pt-12 mt-12 border-t border-dark-border">
        <h2 className="text-3xl font-bold text-white mb-8">Customer Reviews</h2>
        
        {reviews.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-400 rounded-3xl">
            No reviews yet for this restaurant. Place an order and be the first to leave a review!
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.slice(0, visibleCount).map((review) => (
                <div key={review.id} className="glass-panel p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary-950 text-primary-500 rounded-full flex items-center justify-center font-bold text-xl border border-primary-500/20">
                      {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{review.userName || 'Customer'}</h4>
                      <div className="flex text-amber-400 text-sm gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-300">{review.comment || 'No comment provided.'}</p>
                </div>
              ))}
            </div>

            {reviews.length > visibleCount && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="btn-outline px-8 py-2.5 text-sm"
                >
                  View More Reviews
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default Menu;
