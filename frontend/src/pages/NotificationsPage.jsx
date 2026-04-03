import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Bell, CheckCheck, Package, Star, ShieldCheck, CreditCard, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const iconMap = {
  new_item: Package,
  item_received: Package,
  item_approved: ShieldCheck,
  item_rejected: Package,
  purchase_request: CreditCard,
  payment_success: CreditCard,
  item_rated: Star,
  account_approved: UserCheck,
};

const colorMap = {
  item_approved: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  item_rejected: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  payment_success: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  item_rated: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
  account_approved: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  default: 'text-gray-500 bg-gray-100 dark:bg-gray-700',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(res => {
      setNotifications(res.data.notifications);
    }).catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  };

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {unread > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const Icon = iconMap[n.type] || Bell;
              const color = colorMap[n.type] || colorMap.default;
              return (
                <div key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition-all ${n.isRead ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white font-medium'}`}>{n.message}</p>
                    {n.itemId?.title && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Item: {n.itemId.title}</p>}
                    <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
