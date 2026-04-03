import { useState } from 'react';
import { X, Calendar, Wallet, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function RentItemModal({ isOpen, onClose, item, user, onRentSuccess }) {
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const totalFee = item.rentPerDay * days;
  const hasBalance = (user.wallet?.balance || 0) >= totalFee;

  const handleRent = async () => {
    if (!hasBalance) {
      toast.error('Insufficient wallet balance. Please add more points.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/rentals/rent', { itemId: item._id, days });
      toast.success(`🎉 "${item.title}" rented for ${days} days!`);
      onRentSuccess(data.balance);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rental failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative border border-gray-100 dark:border-gray-700">
        
        <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors z-10">
          <X size={16} />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold dark:text-white">Rent Item</h2>
            <p className="text-xs text-gray-500 mt-1">{item.title}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Duration (Days)</label>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-2">
                <button onClick={() => setDays(Math.max(1, days - 1))} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-lg font-bold dark:text-white">-</button>
                <div className="flex-1 text-center font-bold text-lg dark:text-white font-mono">{days}</div>
                <button onClick={() => setDays(days + 1)} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-lg font-bold dark:text-white">+</button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Total Fee</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">₹{totalFee}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Wallet Balance</p>
                <p className={`text-sm font-bold ${hasBalance ? 'text-emerald-500' : 'text-red-500'}`}>₹{user.wallet?.balance || 0}</p>
              </div>
            </div>

            {!hasBalance && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                <AlertTriangle size={14} />
                <p className="text-[10px] font-bold">Insufficient funds. Use Profile to Top-up.</p>
              </div>
            )}
            
            {hasBalance && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <CheckCircle size={14} />
                <p className="text-[10px] font-bold">Points will be locked and returned on time.</p>
              </div>
            )}
          </div>

          <button
            onClick={handleRent}
            disabled={loading || !hasBalance}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Calendar size={18} />}
            {loading ? 'Processing...' : 'Confirm Rental'}
          </button>
        </div>
      </div>
    </div>
  );
}
