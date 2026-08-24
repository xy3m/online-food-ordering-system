import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Order } from '../types';
import { Package, ChefHat, Truck, CheckCircle, XCircle, Star, X, Clock, RefreshCw } from 'lucide-react';
import Pagination from '../components/Pagination';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getDemoStore, saveDemoStore } from '../services/demoStore';

const Orders = () => {
  const initialStore = getDemoStore();
  const [orders, setOrders] = useState<Order[]>(initialStore.orders || []);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewedOrderIds, setReviewedOrderIds] = useState<Set<number>>(() => {
    try {
      const storedUser = localStorage.getItem('ofos_user');
      const userId = storedUser ? JSON.parse(storedUser).id : 'guest';
      const saved = localStorage.getItem(`ofos_reviewed_orders_${userId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set([1003]);
    } catch {
      return new Set([1003]);
    }
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(initialStore.orders.length);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reorderingId, setReorderingId] = useState<number | null>(null);
  
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const handleOpenReviewModal = (order: Order) => {
    setSelectedOrder(order);
    setRating(5);
    setComment('');
    setReviewError('');
    setReviewSuccess('');
  };

  const handleCloseReviewModal = () => {
    setSelectedOrder(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSubmitting(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      await api.post('/reviews', {
        restaurantId: selectedOrder.restaurantId,
        rating,
        comment
      });
      setReviewSuccess('Thank you! Your review has been submitted.');

      setReviewedOrderIds(prev => {
        const next = new Set(prev);
        next.add(selectedOrder.id);
        try {
          const storedUser = localStorage.getItem('ofos_user');
          const userId = storedUser ? JSON.parse(storedUser).id : 'guest';
          localStorage.setItem(`ofos_reviewed_orders_${userId}`, JSON.stringify(Array.from(next)));
        } catch (e) {
          console.error("Failed to save reviewed orders", e);
        }
        return next;
      });

      setTimeout(() => {
        handleCloseReviewModal();
      }, 1500);
    } catch (err: any) {
      setReviewSuccess('Thank you! Review saved in demo mode.');
      setTimeout(() => handleCloseReviewModal(), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    setCancelling(true);
    try {
      await api.post(`/orders/${cancelOrderId}/cancel`);
    } catch (err: any) {}
    
    // Always update local state & mock store
    const store = getDemoStore();
    const ord = store.orders.find(o => o.id === cancelOrderId);
    if (ord) {
      ord.status = 'CANCELLED';
      saveDemoStore(store);
    }
    setOrders(prevOrders =>
      prevOrders.map(o => o.id === cancelOrderId ? { ...o, status: 'CANCELLED' } : o)
    );
    setCancelOrderId(null);
    setCancelling(false);
  };

  const handleReorder = async (orderId: number) => {
    setReorderingId(orderId);
    try {
      await api.post(`/orders/${orderId}/reorder`);
      await fetchCart();
      navigate('/checkout'); // Direct to checkout for quick reordering
    } catch (err: any) {
      navigate('/restaurants');
    } finally {
      setReorderingId(null);
    }
  };

  const fetchOrders = async (pageNumber: number, isInitial = false) => {
    const store = getDemoStore();
    try {
      if (isInitial) setLoading(true);
      const response = await api.get(`/orders?page=${pageNumber}&size=10&sort=id,desc`);
      const pageData = response.data?.data;
      if (pageData?.content?.length || (Array.isArray(pageData) && pageData.length > 0)) {
        setOrders(pageData.content || pageData);
        setTotalPages(pageData.totalPages || 1);
        setTotalElements(pageData.totalElements || pageData.length);
        return;
      }
    } catch (err) {
      // Fallback
    } finally {
      setOrders(store.orders || []);
      setTotalElements(store.orders?.length || 4);
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page, true);
    const interval = setInterval(() => fetchOrders(page, false), 10000);
    return () => clearInterval(interval);
  }, [page]);

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'PLACED': return 1;
      case 'CONFIRMED': return 1;
      case 'PREPARING': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const steps = [
    { num: 1, name: 'Placed', icon: <Package className="h-5 w-5" /> },
    { num: 2, name: 'Preparing', icon: <ChefHat className="h-5 w-5" /> },
    { num: 3, name: 'On the Way', icon: <Truck className="h-5 w-5" /> },
    { num: 4, name: 'Delivered', icon: <CheckCircle className="h-5 w-5" /> }
  ];

  const formatEta = (eta: string) => {
    const date = new Date(eta);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return sameDay ? time : `${date.toLocaleDateString()} ${time}`;
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-6 py-4 max-w-4xl">
        <h1 className="text-4xl font-serif font-bold text-white mb-10">My Orders</h1>

        {orders.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl">
              <Package className="h-16 w-16 text-slate-500 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
              <p className="text-slate-400">You haven't placed any orders yet. Discover delicious food and place your first order!</p>
            </div>
        ) : (
            <div className="space-y-8">
              {orders.map((order, idx) => {
                const isCancelled = order.status === 'CANCELLED';
                const isDelivered = order.status === 'DELIVERED';
                const currentStep = getStatusStep(order.status);

                return (
                    <motion.div
                        key={order.id}
                        className="glass-panel p-8 rounded-3xl hover:border-primary-500/20 transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-dark-border pb-6 gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-white tracking-tight">{order.restaurantName}</h2>
                          <p className="text-slate-400 text-sm mt-1">
                            Order #{order.id} • {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-400">${order.totalAmount.toFixed(2)}</p>
                          <p className="text-xs text-slate-500 mt-1">Paid via: {order.payment?.method?.replace(/_/g, ' ') || 'CASH ON DELIVERY'}</p>
                        </div>
                      </div>

                      {/* Estimated Delivery Time - shown for active (non-cancelled, non-delivered) orders */}
                      {!isCancelled && !isDelivered && order.estimatedDeliveryTime && (
                          <div className="mb-6 flex items-center gap-2 text-sm text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-xl px-4 py-2.5 w-fit">
                            <Clock className="h-4 w-4" />
                            <span>
                              Estimated delivery by{' '}
                              <strong className="text-white">{formatEta(order.estimatedDeliveryTime)}</strong>
                            </span>
                          </div>
                      )}

                      {/* Items List */}
                      <div className="space-y-3 mb-8 bg-dark/40 border border-dark-border/40 p-5 rounded-2xl">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center text-slate-300">
                        <span className="font-semibold text-white bg-dark-border/60 px-2 py-0.5 rounded-md mr-3 text-xs">
                          {item.quantity}x
                        </span>
                                <span>{item.itemName}</span>
                              </div>
                              <span className="text-slate-400">${(item.lineTotal || (item.itemPrice * item.quantity)).toFixed(2)}</span>
                            </div>
                        ))}
                      </div>

                      {/* Visual Tracker or Cancelled Banner */}
                      {isCancelled ? (
                          <div className="flex flex-col items-center justify-center gap-3 p-4 bg-red-950/20 border border-red-500/20 rounded-2xl text-red-400 font-medium text-sm">
                            <div className="flex items-center gap-3">
                              <XCircle className="h-5 w-5" />
                              <span>This order has been cancelled</span>
                            </div>
                            <button
                                onClick={() => handleReorder(order.id)}
                                disabled={reorderingId === order.id}
                                className="mt-2 flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 hover:bg-red-500/10 transition-colors"
                            >
                              {reorderingId === order.id ? <span className="animate-spin w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full" /> : <RefreshCw className="h-4 w-4" />}
                              Reorder
                            </button>
                          </div>
                      ) : (
                          <div className="relative py-8 px-2">
                            <div className="absolute top-1/2 left-6 right-6 h-1 bg-dark-border -translate-y-1/2 z-0"></div>
                            <div
                                className="absolute top-1/2 left-6 h-1 bg-primary-500 -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out"
                                style={{
                                  width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 48px)`,
                                  boxShadow: '0 0 10px rgba(255,30,56,0.8)'
                                }}
                            ></div>

                            <div className="relative z-10 flex justify-between">
                              {steps.map((step) => {
                                const isCompleted = step.num <= currentStep;
                                const isActive = step.num === currentStep;
                                return (
                                    <div key={step.num} className="flex flex-col items-center">
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                                          isCompleted ? 'bg-primary-500 text-white shadow-[0_0_20px_rgba(255,30,56,0.5)]' : 'bg-dark border-2 border-dark-border text-slate-500'
                                      } ${isActive ? 'scale-110 ring-4 ring-primary-500/20' : ''}`}>
                                        {step.icon}
                                      </div>
                                      <p className={`mt-3 text-xs md:text-sm font-medium ${isCompleted ? 'text-white' : 'text-slate-500'}`}>{step.name}</p>
                                    </div>
                                );
                              })}
                            </div>
                          </div>
                      )}

                      {/* Rate & Review Button for Delivered Orders */}
                      {order.status === 'DELIVERED' && (
                          <div className="mt-6 pt-6 border-t border-dark-border/40 flex justify-end gap-3">
                            <button
                                onClick={() => handleReorder(order.id)}
                                disabled={reorderingId === order.id}
                                className="btn-outline py-2 px-6 text-sm flex items-center gap-2 border-primary-500/50"
                            >
                              {reorderingId === order.id ? <span className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full" /> : <RefreshCw className="h-4 w-4" />}
                              Reorder
                            </button>
                            {reviewedOrderIds.has(order.id) ? (
                                <button
                                    disabled
                                    className="bg-dark-border border border-slate-700/30 text-slate-500 font-semibold py-2 px-6 rounded-full text-sm cursor-not-allowed"
                                >
                                  Reviewed
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleOpenReviewModal(order)}
                                    className="btn-primary py-2 px-6 text-sm"
                                >
                                  Rate & Review
                                </button>
                            )}
                          </div>
                      )}

                      {/* Cancel Button for Placed Orders */}
                      {order.status === 'PLACED' && (
                          <div className="mt-6 pt-6 border-t border-dark-border/40 flex justify-end">
                            <button
                                onClick={() => setCancelOrderId(order.id)}
                                className="bg-transparent border border-red-500/50 hover:bg-red-500/10 text-red-500 font-semibold py-2 px-6 rounded-full text-sm transition-colors"
                            >
                              Cancel Order
                            </button>
                          </div>
                      )}
                    </motion.div>
                );
              })}

              <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  size={10}
                  onPageChange={(p) => setPage(p)}
              />
            </div>
        )}

        {/* Review & Rating Modal */}
        {selectedOrder && (
            <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel max-w-md w-full p-8 relative overflow-hidden border border-dark-border/60 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-700"></div>

                <button
                    onClick={handleCloseReviewModal}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Rate & Review</h2>
                <p className="text-slate-400 text-sm mb-6">How was your order from <strong className="text-white">{selectedOrder.restaurantName}</strong>?</p>

                {reviewError && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
                      {reviewError}
                    </div>
                )}

                {reviewSuccess && (
                    <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-500/50 rounded-lg text-emerald-200 text-sm">
                      {reviewSuccess}
                    </div>
                )}

                {!reviewSuccess && (
                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
                        <div
                            className="flex items-center gap-2"
                            onMouseLeave={() => setHoverRating(null)}
                        >
                          {[1, 2, 3, 4, 5].map((starNum) => {
                            const isActive = starNum <= (hoverRating !== null ? hoverRating : rating);
                            return (
                                <button
                                    type="button"
                                    key={starNum}
                                    onClick={() => setRating(starNum)}
                                    onMouseEnter={() => setHoverRating(starNum)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                  <Star
                                      className={`h-8 w-8 transition-colors duration-150 ${
                                          isActive
                                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                              : 'text-slate-600'
                                      }`}
                                  />
                                </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Your Review</label>
                        <textarea
                            rows={4}
                            className="input-field py-3"
                            placeholder="Tell us what you liked or disliked about this order..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                      </div>

                      <div className="flex items-center justify-end gap-4 pt-2">
                        <button
                            type="button"
                            onClick={handleCloseReviewModal}
                            className="px-5 py-2.5 rounded-full text-slate-300 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary py-2.5 px-6 text-sm flex items-center justify-center min-w-[120px]"
                        >
                          {submitting ? (
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          ) : (
                              'Submit Review'
                          )}
                        </button>
                      </div>
                    </form>
                )}
              </motion.div>
            </div>
        )}

        {/* Cancel Order Confirmation Modal */}
        {cancelOrderId && (
            <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel max-w-sm w-full p-8 relative overflow-hidden border border-dark-border/60 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-700"></div>

                <button
                    onClick={() => setCancelOrderId(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/10 rounded-full">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Cancel Order</h2>
                </div>

                <p className="text-slate-400 text-sm mb-8">
                  Are you sure you want to cancel <strong className="text-white">Order #{cancelOrderId}</strong>? This action cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-4">
                  <button
                      onClick={() => setCancelOrderId(null)}
                      className="px-5 py-2.5 rounded-full text-slate-300 hover:text-white transition-colors"
                  >
                    Keep Order
                  </button>
                  <button
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-full text-sm transition-colors flex items-center justify-center min-w-[130px]"
                  >
                    {cancelling ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        'Yes, Cancel'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
        )}
      </div>
  );
};

export default Orders;
