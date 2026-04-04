import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, Package, ShoppingCart, Bell, Star,
  CheckCircle, XCircle, Eye, Trash2, RefreshCw, ChevronDown,
  TrendingUp, Clock, AlertTriangle, User, Contact
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'items', label: 'Items', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'notifications', label: 'Alerts', icon: Bell },
];

function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)} className={`text-2xl transition-transform hover:scale-110 ${s <= value ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
      ))}
    </div>
  );
}

// ─── Dashboard Tab ───────────────────────────────────────────────────────────
function DashboardTab({ stats }) {
  if (!stats) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
        <StatCard title="Pending Approval" value={stats.pendingUsers} icon={Clock} color="bg-yellow-500" sub="Email verified, need review" />
        <StatCard title="Total Items" value={stats.totalItems} icon={Package} color="bg-purple-500" />
        <StatCard title="Items Sold" value={stats.soldItems} icon={TrendingUp} color="bg-green-500" />
        <StatCard title="Pending Review" value={stats.pendingItems} icon={AlertTriangle} color="bg-orange-500" sub="Need admin rating" />
        <StatCard title="Orders" value={stats.totalOrders} icon={ShoppingCart} color="bg-indigo-500" />
        <StatCard title="Revenue" value={`₹${(stats.revenue || 0).toLocaleString()}`} icon={TrendingUp} color="bg-emerald-500" />
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const url = filter === 'inactive' ? '/admin/users/inactive' : `/admin/users?status=${filter}`;
    api.get(url).then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/approve`);
      toast.success('User approved & notified via email');
      load();
    } catch { toast.error('Failed to approve'); }
  };

  const reject = async () => {
    try {
      await api.patch(`/admin/users/${rejectId}/reject`, { reason: rejectReason });
      toast.success('User rejected');
      setRejectId(null); setRejectReason('');
      load();
    } catch { toast.error('Failed to reject'); }
  };

  const toggleSubscription = async (id, currentPlan) => {
    const newPlan = currentPlan === 'premium' ? 'free' : 'premium';
    try {
      await api.patch(`/admin/users/${id}/subscription`, { plan: newPlan });
      toast.success(`User plan updated to ${newPlan.toUpperCase()}`);
      load();
    } catch { toast.error('Failed to update plan'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Users</h2>
        <div className="flex gap-2">
          {['pending', 'approved', 'unverified', 'inactive', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> :
        users.length === 0 ? <div className="text-center py-16 text-gray-400"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No users found</p></div> : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                      {!u.isEmailVerified && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Email unverified</span>}
                      {u.isEmailVerified && !u.isApproved && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending approval</span>}
                      {u.isApproved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Approved</span>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{u.university} • College ID: <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{u.collegeId}</span></p>
                    <div className="flex gap-4 mt-1">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter italic">Registered {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</p>
                      {u.lastActive && <p className="text-[10px] text-blue-400 uppercase font-black tracking-tighter italic">Active {formatDistanceToNow(new Date(u.lastActive), { addSuffix: true })}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {u.collegeIdImage && (
                      <button onClick={() => setSelectedUser(u)}
                        className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 px-2 py-1.5 rounded-lg transition-colors">
                        <Contact className="w-3.5 h-3.5" /> ID
                      </button>
                    )}
                    {!u.isApproved && u.isEmailVerified && (
                      <>
                        <button onClick={() => approve(u._id)}
                          className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => setRejectId(u._id)}
                          className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                    {u.isApproved && (
                      <button onClick={() => toggleSubscription(u._id, u.subscription?.plan)}
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors font-bold ${u.subscription?.plan === 'premium' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
                        {u.subscription?.plan === 'premium' ? '★ Premium' : '☆ Make Premium'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* College ID modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{selectedUser.name}</h3>
            <p className="text-sm text-gray-500 mb-3">College ID: {selectedUser.collegeId}</p>
            <img src={selectedUser.collegeIdImage} alt="College ID" className="w-full rounded-xl border border-gray-200 dark:border-gray-600 object-contain max-h-64" />
            <button onClick={() => setSelectedUser(null)} className="mt-4 w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-xl text-sm font-medium">Close</button>
          </div>
        </div>
      )}

      {/* Reject reason modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setRejectId(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Reject User</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional, sent via email)"
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-24 focus:ring-2 focus:ring-red-500 outline-none" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setRejectId(null)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-xl text-sm">Cancel</button>
              <button onClick={reject} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-sm font-semibold">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Items Tab ────────────────────────────────────────────────────────────────
function ItemsTab() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingNotes, setRatingNotes] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const q = filter === 'all' ? '' : `?status=${filter}`;
    api.get(`/admin/items${q}`).then(r => setItems(r.data.items)).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status, notes = '') => {
    try {
      await api.patch(`/admin/items/${id}/status`, { status, adminNotes: notes });
      toast.success(`Item marked as ${status}`);
      load();
    } catch { toast.error('Failed to update status'); }
  };

  const submitRating = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    try {
      await api.patch(`/admin/items/${ratingModal._id}/rate`, { rating, notes: ratingNotes });
      toast.success('Item rated & approved. Seller notified!');
      setRatingModal(null); setRating(0); setRatingNotes('');
      load();
    } catch { toast.error('Failed to rate'); }
  };

  const deleteItem = async (id) => {
    if (!confirm('Remove this item permanently?')) return;
    try { await api.delete(`/admin/items/${id}`); toast.success('Item removed'); load(); }
    catch { toast.error('Failed to remove'); }
  };

  const statusColors = { pending: 'bg-yellow-100 text-yellow-700', received: 'bg-blue-100 text-blue-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Items</h2>
        <div className="flex gap-2 flex-wrap">
          {['pending', 'received', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> :
        items.length === 0 ? <div className="text-center py-16 text-gray-400"><Package className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No items found</p></div> : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex gap-4">
                  {item.images?.[0]?.url && (
                    <img src={item.images[0].url} alt={item.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${statusColors[item.adminStatus]}`}>
                        {item.adminStatus}
                      </span>
                    </div>
                    <p className="text-blue-600 font-bold text-sm">₹{item.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Seller: {item.sellerId?.name} ({item.sellerId?.email})
                    </p>
                    {item.adminRating && (
                      <p className="text-xs text-yellow-600 mt-0.5">Admin Rating: {'⭐'.repeat(item.adminRating)} ({item.adminRating}/5)</p>
                    )}
                    {item.adminNotes && <p className="text-xs text-gray-400 mt-0.5 italic">"{item.adminNotes}"</p>}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {item.adminStatus === 'pending' && (
                    <button onClick={() => setStatus(item._id, 'received')}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                      ✓ Mark Received
                    </button>
                  )}
                  {item.adminStatus === 'received' && (
                    <button onClick={() => setRatingModal(item)}
                      className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                      <Star className="w-3 h-3" /> Rate & Approve
                    </button>
                  )}
                  {(item.adminStatus === 'pending' || item.adminStatus === 'received') && (
                    <button onClick={() => setStatus(item._id, 'rejected')}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                      ✗ Reject
                    </button>
                  )}
                  <button onClick={() => deleteItem(item._id)}
                    className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors ml-auto">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Rating modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setRatingModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Rate Item</h3>
            <p className="text-sm text-gray-500 mb-4">{ratingModal.title}</p>
            <StarRating value={rating} onChange={setRating} />
            <textarea value={ratingNotes} onChange={e => setRatingNotes(e.target.value)}
              placeholder="Notes for seller (optional)"
              className="w-full mt-4 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-20 focus:ring-2 focus:ring-yellow-400 outline-none" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setRatingModal(null)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-xl text-sm">Cancel</button>
              <button onClick={submitRating} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-xl text-sm font-semibold">Rate & Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/orders').then(r => setOrders(r.data.orders)).finally(() => setLoading(false));
  }, []);

  const statusColors = { created: 'bg-gray-100 text-gray-600', paid: 'bg-blue-100 text-blue-700', admin_processing: 'bg-yellow-100 text-yellow-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700', refunded: 'bg-purple-100 text-purple-700' };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Orders</h2>
      {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> :
        orders.length === 0 ? <div className="text-center py-16 text-gray-400"><ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No orders yet</p></div> : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{o.itemId?.title || 'Item'}</p>
                    <p className="text-blue-600 font-bold">₹{o.amount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Buyer: {o.buyerId?.name} ({o.buyerId?.email})</p>
                    <p className="text-xs text-gray-500">Seller: {o.sellerId?.name} ({o.sellerId?.email})</p>
                    <p className="text-xs text-gray-400 mt-1">Payment: {o.razorpayPaymentId || '—'}</p>
                    <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(o.createdAt), { addSuffix: true })}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[o.status] || statusColors.created}`}>
                    {o.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/notifications').then(r => setNotifications(r.data.notifications)).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.patch('/admin/notifications/read');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Alerts</h2>
          {unread > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>}
        </div>
        {unread > 0 && <button onClick={markAllRead} className="text-xs text-blue-600 font-medium hover:underline">Mark all read</button>}
      </div>
      {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> :
        notifications.length === 0 ? <div className="text-center py-16 text-gray-400"><Bell className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No alerts</p></div> : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n._id} className={`p-4 rounded-xl border text-sm ${n.isRead ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-gray-900 dark:text-white font-medium'}`}>
                <p>{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data.stats)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutDashboard className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Admin Hub</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest opacity-60">Control Center</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-2xl p-1.5 shadow-sm mb-8 border border-gray-100 dark:border-gray-700 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'items' && <ItemsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  );
}
