import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const MenuManagement = ({ restaurantId }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    available: true
  });

  useEffect(() => {
    if (!restaurantId) return;
    fetchMenu();
  }, [restaurantId]);

  const fetchMenu = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const res = await api.get(`/restaurants/${restaurantId}/menu?size=100`);
      setMenuItems(res.data.data.content);
    } catch (err) {
      console.error("Failed to fetch menu", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl || '',
      available: item.available
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ id: null, name: '', description: '', price: '', category: '', imageUrl: '', available: true });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/restaurants/${restaurantId}/menu/${formData.id}`, formData);
      } else {
        await api.post(`/restaurants/${restaurantId}/menu`, formData);
      }
      handleCancel();
      fetchMenu();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/restaurants/${restaurantId}/menu/${itemId}`);
      fetchMenu();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete menu item');
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Loading menu...</div>;

  return (
    <div className="space-y-6">
      
      {/* Form Section */}
      <div className="glass-panel p-6 border-l-4 border-primary-500">
        <h3 className="text-lg font-bold text-white mb-4">{isEditing ? 'Edit Menu Item' : 'Add New Item'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-dark border border-dark-border rounded px-3 py-2 text-sm text-white focus:border-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
            <input required type="text" name="category" value={formData.category} onChange={handleChange} className="w-full bg-dark border border-dark-border rounded px-3 py-2 text-sm text-white focus:border-primary-500 outline-none" placeholder="e.g. Mains, Drinks" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full bg-dark border border-dark-border rounded px-3 py-2 text-sm text-white focus:border-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Price ($)</label>
            <input required type="number" step="0.01" min="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-dark border border-dark-border rounded px-3 py-2 text-sm text-white focus:border-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Image URL</label>
            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full bg-dark border border-dark-border rounded px-3 py-2 text-sm text-white focus:border-primary-500 outline-none" placeholder="https://..." />
          </div>
          <div className="md:col-span-2 flex items-center gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} className="accent-primary-500 h-4 w-4" />
              <span className="text-sm text-slate-300">Available to order</span>
            </label>
            
            <div className="flex-1 flex justify-end gap-2">
              {isEditing && (
                <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm bg-dark-card text-slate-300 rounded hover:text-white transition">Cancel</button>
              )}
              <button type="submit" className="px-4 py-2 text-sm bg-primary-600 text-white rounded font-medium hover:bg-primary-500 transition shadow-[0_0_10px_rgba(225,29,72,0.3)]">
                {isEditing ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map(item => (
          <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`glass-panel p-4 flex flex-col ${!item.available && 'opacity-60'}`}>
            <div className="flex gap-4 mb-3">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg border border-dark-border" />
              ) : (
                <div className="w-20 h-20 bg-dark-card border border-dark-border rounded-lg flex items-center justify-center text-slate-500">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-white font-bold text-sm line-clamp-2">{item.name}</h4>
                </div>
                <p className="text-xs text-primary-400 font-semibold">${item.price.toFixed(2)}</p>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-dark-card px-1.5 py-0.5 rounded mt-1 inline-block">{item.category}</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 line-clamp-2 flex-1">{item.description}</p>
            
            <div className="flex justify-between items-center pt-3 border-t border-dark-border">
              <span className={`text-xs font-medium ${item.available ? 'text-emerald-400' : 'text-red-400'}`}>
                {item.available ? 'Available' : 'Unavailable'}
              </span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-400 bg-dark-card rounded transition"><Edit2 className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 bg-dark-card rounded transition"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
};

export default MenuManagement;
