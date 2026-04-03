import { useState } from 'react';
import { X, Check, Crown, Shield, Phone, Package, Loader } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function SubscriptionModal({ isOpen, onClose, user, onUpgradeSuccess }) {
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () =>
    new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleUpgrade = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error('Payment gateway failed to load'); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/payment/create-subscription-order');
      
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'CampsMart',
        description: 'Upgrade to Premium Plan',
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verRes = await api.post('/payment/verify-subscription', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            onUpgradeSuccess(verRes.data.user);
            toast.success('🎉 Welcome to Premium!');
            onClose();
          } catch {
            toast.error('Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone || '' },
        theme: { color: '#2563eb' },
        modal: { ondismiss: () => setLoading(false) },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment initiation failed. Contact admin.';
      toast.error(msg);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative transition-all translate-y-0 scale-100 border border-gray-100 dark:border-gray-700">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors z-10">
          <X size={16} />
        </button>

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
            <Crown size={32} className="fill-white" />
          </div>
          <h2 className="text-2xl font-bold font-display">Upgrade to Premium</h2>
          <p className="text-amber-100 text-sm mt-1">Unlock the full power of CampsMart</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-4 mb-8">
            {[
              { icon: Package, title: 'Unlimited Listings', desc: 'Post as many items as you want' },
              { icon: Crown, title: 'Priority Placement', desc: 'Your items stay at the top of search' },
              { icon: Phone, title: 'Identity Protection', desc: 'Secure & Anonymous exchanges' },
              { icon: Shield, title: 'Premium Badge', desc: 'Verified status on your profile' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <feature.icon size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{feature.desc}</p>
                </div>
                <Check size={14} className="text-emerald-500 ml-auto mt-1 shrink-0" />
              </div>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 mb-8 flex items-center justify-between border border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none mb-1">Total Lifetime</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">₹50</p>
            </div>
            <div className="text-right">
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">BEST VALUE</span>
              <p className="text-xs text-gray-400 mt-1">One-time payment</p>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-amber-200 dark:shadow-none disabled:opacity-50"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Crown size={16} className="fill-white" />}
            {loading ? 'Opening Checkout...' : 'Upgrade Now'}
          </button>
          
          <p className="text-center text-[10px] text-gray-400 mt-4">
            By upgrading, you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
