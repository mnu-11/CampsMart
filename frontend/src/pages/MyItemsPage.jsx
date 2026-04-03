import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Package, Edit3, Trash2, Star, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  received: { label: 'Admin Received', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  approved: { label: 'Live for Sale', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function MyItemsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/items/my/all')
      .then(r => setItems(r.data.items))
      .catch(() => toast.error('Failed to load items'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteItem = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/items/${id}`);
      toast.success('Item deleted');
      setItems(prev => prev.filter(i => i._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const toggleSold = async (id) => {
    try {
      const { data } = await api.patch(`/items/${id}/sold`);
      setItems(prev => prev.map(i => i._id === id ? { ...i, isSold: data.item.isSold } : i));
      toast.success(data.item.isSold ? 'Marked as sold' : 'Marked as available');
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Listings</h1>
          <Link to="/add-item" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Item
          </Link>
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Item Status Flow</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusConfig).map(([k, v]) => (
              <span key={k} className={`text-xs px-2 py-1 rounded-full font-semibold ${v.color}`}>{v.label}</span>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">You haven't listed anything yet</p>
            <Link to="/add-item" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> List Your First Item
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => {
              const st = statusConfig[item.adminStatus] || statusConfig.pending;
              const StIcon = st.icon;
              return (
                <div key={item._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex gap-4">
                  {item.images?.[0]?.url ? (
                    <img src={item.images[0].url} alt={item.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link to={`/items/${item._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors text-sm">{item.title}</Link>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {item.isSold && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">SOLD</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${st.color}`}>
                          <StIcon className="w-3 h-3" />{st.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-blue-600 font-bold text-sm">₹{item.price.toLocaleString()}</p>
                    {item.adminRating && (
                      <p className="text-xs text-yellow-600 mt-0.5 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Admin rating: {item.adminRating}/5
                      </p>
                    )}
                    {item.adminNotes && <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5">"{item.adminNotes}"</p>}
                    {item.adminStatus === 'pending' && (
                      <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Waiting for admin to receive & rate your item
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Link to={`/edit-item/${item._id}`}
                        className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button onClick={() => toggleSold(item._id)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${item.isSold ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
                        {item.isSold ? '↩ Unmark Sold' : '✓ Mark Sold'}
                      </button>
                      <button onClick={() => deleteItem(item._id)}
                        className="flex items-center gap-1 text-xs bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg transition-colors ml-auto">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
