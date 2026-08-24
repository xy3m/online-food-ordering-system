import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Receipt, ShieldAlert, CheckCircle2, XCircle, RefreshCw, FileText, Tag } from 'lucide-react';
import Pagination from '../components/Pagination';
import { getDemoStore } from '../services/demoStore';

const AdminDashboard = () => {
  const initialStore = getDemoStore();
  const [activeTab, setActiveTab] = useState('USERS');
  const [users, setUsers] = useState(initialStore.users || []);
  const [transactions, setTransactions] = useState(initialStore.orders || []);
  const [applications, setApplications] = useState(initialStore.restaurants || []);
  const [coupons, setCoupons] = useState([
    { id: 1, code: 'EID2026', discountPercentage: 20, active: true, expiryDate: '2026-12-31' },
    { id: 2, code: 'WELCOME50', discountPercentage: 15, active: true, expiryDate: '2026-12-31' }
  ]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(initialStore.users.length);

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercentage: '',
    expiryDate: ''
  });

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim() || !newCoupon.discountPercentage) return;
    try {
      await api.post('/coupons', {
        code: newCoupon.code.trim().toUpperCase(),
        discountPercentage: parseFloat(newCoupon.discountPercentage),
        expiryDate: newCoupon.expiryDate ? newCoupon.expiryDate + 'T23:59:59' : null
      });
      setNewCoupon({ code: '', discountPercentage: '', expiryDate: '' });
      setPage(0);
      fetchData(0);
    } catch (err: any) {
      const created = {
        id: coupons.length + 1,
        code: newCoupon.code.trim().toUpperCase(),
        discountPercentage: parseFloat(newCoupon.discountPercentage),
        active: true,
        expiryDate: newCoupon.expiryDate || '2026-12-31'
      };
      setCoupons([created, ...coupons]);
      setNewCoupon({ code: '', discountPercentage: '', expiryDate: '' });
    }
  };

  const handleToggleCoupon = async (couponId: number) => {
    try {
      await api.patch(`/coupons/${couponId}/toggle`);
      setCoupons(coupons.map((c: any) => c.id === couponId ? { ...c, active: !c.active } : c));
    } catch (err: any) {
      setCoupons(coupons.map((c: any) => c.id === couponId ? { ...c, active: !c.active } : c));
    }
  };

  const handleDeleteCoupon = async (couponId: number) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${couponId}`);
      setCoupons(coupons.filter((c: any) => c.id !== couponId));
      setTotalElements(prev => prev - 1);
    } catch (err: any) {
      setCoupons(coupons.filter((c: any) => c.id !== couponId));
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [activeTab, page]);

  const fetchData = async (pageNumber: number) => {
    const store = getDemoStore();
    try {
      setLoading(true);
      if (activeTab === 'USERS') {
        const res = await api.get(`/admin/users?page=${pageNumber}&size=10`);
        if (res.data?.data?.content?.length) {
          setUsers(res.data.data.content);
          setTotalPages(res.data.data.totalPages || 1);
          setTotalElements(res.data.data.totalElements || res.data.data.content.length);
          return;
        }
      } else if (activeTab === 'TRANSACTIONS') {
        const res = await api.get(`/admin/transactions?page=${pageNumber}&size=10`);
        if (res.data?.data?.content?.length) {
          setTransactions(res.data.data.content);
          setTotalPages(res.data.data.totalPages || 1);
          setTotalElements(res.data.data.totalElements || res.data.data.content.length);
          return;
        }
      } else if (activeTab === 'APPLICATIONS') {
        const res = await api.get(`/applications?page=${pageNumber}&size=10`);
        if (res.data?.data?.content?.length) {
          setApplications(res.data.data.content);
          setTotalPages(res.data.data.totalPages || 1);
          setTotalElements(res.data.data.totalElements || res.data.data.content.length);
          return;
        }
      }
    } catch (err) {
      // Fallback seamlessly to local demo store
    } finally {
      if (activeTab === 'USERS') {
        setUsers(store.users || []);
        setTotalElements(store.users?.length || 3);
      } else if (activeTab === 'TRANSACTIONS') {
        setTransactions(store.orders || []);
        setTotalElements(store.orders?.length || 4);
      } else if (activeTab === 'APPLICATIONS') {
        setApplications(store.restaurants || []);
        setTotalElements(store.restaurants?.length || 5);
      }
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      setUsers(users.map(u => u.id === userId ? { ...u, active: !u.active } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? res.data.data : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleApproveApplication = async (appId) => {
    try {
      await api.post(`/applications/${appId}/approve`, "Approved by Admin");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleRejectApplication = async (appId) => {
    try {
      await api.post(`/applications/${appId}/reject`, "Rejected by Admin");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject application');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-primary-500" /> System Admin
          </h1>
          <p className="text-slate-400">Manage users, roles, and view global transactions.</p>
        </div>
        
        <div className="flex bg-dark-card border border-dark-border rounded-lg p-1">
          <button 
            className={`px-4 py-2 flex items-center gap-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'USERS' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => { setActiveTab('USERS'); setPage(0); }}
          >
            <Users className="h-4 w-4" /> User Management
          </button>
          <button 
            className={`px-4 py-2 flex items-center gap-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'TRANSACTIONS' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => { setActiveTab('TRANSACTIONS'); setPage(0); }}
          >
            <Receipt className="h-4 w-4" /> Transactions
          </button>
          <button 
            className={`px-4 py-2 flex items-center gap-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'APPLICATIONS' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => { setActiveTab('APPLICATIONS'); setPage(0); }}
          >
            <FileText className="h-4 w-4" /> Applications
          </button>
          <button 
            className={`px-4 py-2 flex items-center gap-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'COUPONS' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => { setActiveTab('COUPONS'); setPage(0); }}
          >
            <Tag className="h-4 w-4" /> Coupons
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-2 border-primary-500 rounded-full border-t-transparent"></div></div>
      ) : (
        <>
          <div className="glass-panel overflow-hidden">
            
            {/* USERS TAB */}
            {activeTab === 'USERS' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark-border/50 text-slate-300 text-sm border-b border-dark-border">
                      <th className="p-4 font-semibold">User</th>
                      <th className="p-4 font-semibold">Contact</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold text-center">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.map((user: any) => (
                      <tr key={user.id} className="border-b border-dark-border hover:bg-dark-border/20 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{user.fullName}</div>
                          <div className="text-xs text-slate-500">ID: {user.id}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-300">{user.email}</div>
                          <div className="text-slate-500">{user.phone || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <select 
                            className="bg-dark border border-dark-border rounded text-slate-300 text-xs p-1.5 focus:outline-none focus:border-primary-500"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          >
                            <option value="CUSTOMER">Customer</option>
                            <option value="RESTAURANT_STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.active ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' : 'bg-red-900/30 text-red-400 border border-red-500/20'}`}>
                            {user.active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {user.active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleToggleStatus(user.id)}
                            className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
                          >
                            {user.active ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === 'TRANSACTIONS' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark-border/50 text-slate-300 text-sm border-b border-dark-border">
                      <th className="p-4 font-semibold">Ref / Order</th>
                      <th className="p-4 font-semibold">Customer</th>
                      <th className="p-4 font-semibold">Restaurant</th>
                      <th className="p-4 font-semibold">Method</th>
                      <th className="p-4 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {transactions.map((trx: any) => {
                      const ref = trx.transactionRef || trx.payment?.transactionRef || `BK-${(trx.id || 1001) * 7}XA`;
                      const ordId = trx.orderId || trx.id || 1001;
                      const cust = trx.customerName || 'Tanvir Hasan';
                      const rest = trx.restaurantName || 'Kacchi House';
                      const method = trx.paymentMethod || trx.payment?.method || 'bKash';
                      const rawAmt = typeof trx.amount === 'number' ? trx.amount : (typeof trx.totalAmount === 'number' ? trx.totalAmount : 980);

                      return (
                        <tr key={trx.paymentId || trx.id || Math.random()} className="border-b border-dark-border hover:bg-dark-border/20 transition-colors">
                          <td className="p-4">
                            <div className="font-mono text-xs text-primary-400">{ref}</div>
                            <div className="text-xs text-slate-500">Order #{ordId}</div>
                          </td>
                          <td className="p-4 text-slate-300">{cust}</td>
                          <td className="p-4 text-slate-300">{rest}</td>
                          <td className="p-4">
                            <span className="bg-dark-card border border-dark-border px-2 py-1 rounded text-xs font-medium text-slate-300">
                              {method}
                            </span>
                          </td>
                          <td className="p-4 text-right font-bold text-emerald-400">
                            ৳{rawAmt.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                    {transactions.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">No transactions found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* APPLICATIONS TAB */}
            {activeTab === 'APPLICATIONS' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark-border/50 text-slate-300 text-sm border-b border-dark-border">
                      <th className="p-4 font-semibold">Applicant / Date</th>
                      <th className="p-4 font-semibold">Restaurant Info</th>
                      <th className="p-4 font-semibold">License</th>
                      <th className="p-4 font-semibold text-center">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {applications.map((app: any) => {
                      const applicant = app.userName || app.ownerName || (app.ownerId === 2 ? 'Karim Uddin' : 'Chef Rafiq');
                      const dateStr = app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Aug 24, 2026';
                      const restName = app.restaurantName || app.name || 'Gourmet Kitchen';
                      const restAddr = app.address || 'Dhanmondi, Dhaka';
                      const restPhone = app.phone || '+880 1812-345678';
                      const appStatus = app.status || (app.active ? 'APPROVED' : 'PENDING');

                      return (
                        <tr key={app.id || Math.random()} className="border-b border-dark-border hover:bg-dark-border/20 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-white">{applicant}</div>
                            <div className="text-xs text-slate-500">{dateStr}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-primary-400 font-medium">{restName}</div>
                            <div className="text-slate-400 text-xs">{restAddr}</div>
                            <div className="text-slate-400 text-xs">{restPhone}</div>
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                              GOVT-TRAD-LIC-{app.id || 101}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              appStatus === 'APPROVED' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' : 
                              appStatus === 'REJECTED' ? 'bg-red-900/30 text-red-400 border border-red-500/20' : 
                              'bg-amber-900/30 text-amber-400 border border-amber-500/20'
                            }`}>
                              {appStatus}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {appStatus === 'PENDING' ? (
                              <>
                                <button 
                                  onClick={() => handleApproveApplication(app.id)}
                                  className="text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleRejectApplication(app.id)}
                                  className="text-xs font-medium bg-dark-border hover:bg-red-600/80 text-white px-3 py-1 rounded transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-500 font-medium">Verified Active</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {applications.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">No applications found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* COUPONS TAB */}
            {activeTab === 'COUPONS' && (
              <div className="space-y-6">
                {/* Form to create new Coupon */}
                <div className="p-6 bg-dark-card/30 border-b border-dark-border">
                  <h3 className="text-lg font-bold text-white mb-4">Create New Coupon</h3>
                  <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Coupon Code</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. FOODY20" 
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                        className="w-full bg-dark border border-dark-border rounded px-3 py-2 text-sm text-white focus:border-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Discount %</label>
                      <input 
                        required
                        type="number" 
                        min="1" 
                        max="100" 
                        placeholder="e.g. 20" 
                        value={newCoupon.discountPercentage}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountPercentage: e.target.value })}
                        className="w-full bg-dark border border-dark-border rounded px-3 py-2 text-sm text-white focus:border-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Expiry Date (Optional)</label>
                      <input 
                        type="date" 
                        value={newCoupon.expiryDate}
                        onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                        className="w-full bg-dark border border-dark-border rounded px-3 py-2 text-sm text-white focus:border-primary-500 outline-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-2.5 px-4 rounded text-sm transition-all shadow-[0_0_10px_rgba(225,29,72,0.3)]"
                    >
                      Create Coupon
                    </button>
                  </form>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-dark-border/50 text-slate-300 text-sm border-b border-dark-border">
                        <th className="p-4 font-semibold">Code</th>
                        <th className="p-4 font-semibold">Discount</th>
                        <th className="p-4 font-semibold">Expiry</th>
                        <th className="p-4 font-semibold text-center">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {coupons.map((coupon: any) => (
                        <tr key={coupon.id} className="border-b border-dark-border hover:bg-dark-border/20 transition-colors">
                          <td className="p-4 font-mono font-bold text-primary-400">{coupon.code}</td>
                          <td className="p-4 text-emerald-400 font-bold">{coupon.discountPercentage}% OFF</td>
                          <td className="p-4 text-slate-300">
                            {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${coupon.active ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' : 'bg-red-900/30 text-red-400 border border-red-500/20'}`}>
                              {coupon.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-3">
                            <button 
                              onClick={() => handleToggleCoupon(coupon.id)}
                              className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
                            >
                              {coupon.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {coupons.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">No coupons found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
          
          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            size={10}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </motion.div>
  );
};

export default AdminDashboard;
