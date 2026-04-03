import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, Building, Phone, MapPin, Save, Edit3, Wallet, Crown, ShieldCheck, History, ArrowUpRight } from 'lucide-react';
import { getInitials, formatDate } from '../utils/helpers';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: user?.name || '', university: user?.university || '',
    phone: user?.phone || '', location: user?.location || '', bio: user?.bio || '',
  });

  const loadRazorpay = () =>
    new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  if (!user) return <Navigate to="/login" />;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) return toast.error('Gateway failed');
    setUpgrading(true);
    try {
      const { data } = await api.post('/payment/create-subscription-order');
      const options = {
        key: data.key, amount: data.order.amount, currency: data.order.currency,
        name: 'CampsMart', order_id: data.order.id,
        handler: async (response) => {
          const verRes = await api.post('/payment/verify-subscription', response);
          updateUser(verRes.data.user);
          toast.success('🎉 Welcome to Premium!');
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#2563eb' }
      };
      new window.Razorpay(options).open();
    } catch { toast.error('Upgrade failed'); }
    finally { setUpgrading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-[#03050a] transition-colors duration-500 pb-20">
      
      {/* ── Realistic Hero Banner ── */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
          style={{ 
            backgroundImage: "url('/images/homepage_hero_student_stationery_1775149180599.png')",
            filter: 'brightness(0.6) saturate(1.2) blur(2px)'
          }}
        >
           <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#f8faff] dark:to-[#03050a]"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8faff] dark:from-[#03050a]"></div>
      </div>

      <div className="page-container max-w-5xl -mt-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Side: Avatar & Core Info */}
          <div className="lg:w-1/3 animate-enter">
            <div className="card p-6 text-center shadow-2xl border-white dark:border-white/5 bg-white/80 dark:bg-[#0a0f1e]/80 backdrop-blur-xl">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-[1.25rem] bg-white dark:bg-[#0a0f1e] overflow-hidden flex items-center justify-center text-4xl font-black text-blue-600">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : getInitials(user.name)}
                  </div>
                </div>
                {user.subscription?.plan === 'premium' && (
                  <div className="absolute -top-3 -right-3 bg-amber-400 p-2 rounded-xl shadow-lg border-2 border-white dark:border-[#0a0f1e] animate-bounce">
                    <Crown size={16} fill="white" className="text-white" />
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-black dark:text-white leading-tight">{user.name}</h1>
              <p className="text-sm text-slate-500 font-medium mb-4">{user.email}</p>
              
              <div className="flex justify-center gap-2 mb-6">
                <span className="badge bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                  <ShieldCheck size={12} /> Verified Student
                </span>
                <span className="badge bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {formatDate(user.createdAt)}
                </span>
              </div>

              <div className="space-y-3">
                 <button 
                  onClick={() => editing ? handleSave() : setEditing(true)} 
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    editing ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                 >
                   {editing ? <><Save size={16} /> Save Changes</> : <><Edit3 size={16} /> Edit Profile</>}
                 </button>
                 {editing && (
                   <button onClick={() => setEditing(false)} className="w-full py-3 text-slate-400 font-bold text-sm">Cancel</button>
                 )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="card mt-6 p-6 grid grid-cols-2 gap-4 animate-enter" style={{ animationDelay: '100ms' }}>
               <div className="text-center">
                  <p className="text-2xl font-black dark:text-white">{user.subscription?.listingsThisMonth || 0}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Listings</p>
               </div>
               <div className="text-center border-l border-slate-100 dark:border-slate-800">
                  <p className="text-2xl font-black text-blue-600">Premium</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Status</p>
               </div>
            </div>
          </div>

          {/* Right Side: Wallet & Form */}
          <div className="flex-1 space-y-8 animate-enter" style={{ animationDelay: '200ms' }}>
            
            {/* Bento Wallet Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-blue-800 text-white relative overflow-hidden group shadow-2xl shadow-blue-500/30 border border-white/10">
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20"><Wallet size={24} /></div>
                      <Link to="/notifications" className="text-white/60 hover:text-white transition-colors bg-white/10 p-2 rounded-xl"><History size={16} /></Link>
                   </div>
                   <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-3">Available Balance</p>
                   <h2 className="text-5xl font-black leading-none mb-8">₹{user.wallet?.balance || 0}</h2>
                   <div className="flex gap-2">
                     <input type="number" id="wallet-amount" placeholder="Amt" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-white/40 font-bold focus:bg-white/20 transition-all text-white" />
                     <button 
                        onClick={async () => {
                          const amt = document.getElementById('wallet-amount').value;
                          if (!amt || amt < 10) return toast.error('Minimum ₹10');
                          const loaded = await loadRazorpay();
                          if (!loaded) return toast.error('Check internet');
                          try {
                            const { data } = await api.post('/payment/create-wallet-order', { amount: amt });
                            const options = {
                              key: data.key, amount: data.order.amount, currency: data.order.currency,
                              name: 'CampsMart Wallet', order_id: data.order.id,
                              handler: async (r) => { 
                                const v = await api.post('/payment/verify-wallet-deposit', { ...r, amount: amt });
                                updateUser({ ...user, wallet: { ...user.wallet, balance: v.data.balance } });
                                toast.success('Added!'); document.getElementById('wallet-amount').value = '';
                              }
                            };
                            new window.Razorpay(options).open();
                          } catch { toast.error('Failed'); }
                        }}
                        className="bg-white text-blue-700 px-6 rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg"
                     >ADD</button>
                   </div>
                </div>
              </div>

              <div className={`p-8 rounded-[2rem] border-2 transition-all duration-500 flex flex-col justify-between ${user.subscription?.plan === 'premium' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10' : 'bg-white dark:bg-[#0a0f1e] border-slate-100 dark:border-slate-800'}`}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${user.subscription?.plan === 'premium' ? 'bg-amber-400 text-white shadow-xl shadow-amber-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        <Crown size={24} fill={user.subscription?.plan === 'premium' ? 'white' : 'none'} />
                    </div>
                    <div>
                        <h3 className="font-black dark:text-white leading-none text-lg">Subscription</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{user.subscription?.plan} Membership</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {user.subscription?.plan === 'free' 
                      ? 'Upgrade for unlimited listings, zero commission and premium rental access.' 
                      : 'Premium active. You have full access to Renting & Priority Marketplace features.'}
                  </p>
                </div>
                {user.subscription?.plan === 'free' && (
                  <button onClick={handleUpgrade} disabled={upgrading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                    GO PREMIUM <ArrowUpRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Form Content */}
            <div className="card p-8 bg-white dark:bg-[#0a0f1e]/60">
              <h2 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                 <User size={18} className="text-blue-600" /> Bio & Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {[
                  { icon: User, label: 'Display Name', key: 'name', type: 'text' },
                  { icon: Building, label: 'University', key: 'university', type: 'text' },
                  { icon: Phone, label: 'Phone Number', key: 'phone', type: 'tel' },
                  { icon: MapPin, label: 'Campus Area', key: 'location', type: 'text' },
                ].map(({ icon: Icon, label, key, type }) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ml-1"><Icon size={11} /> {label}</label>
                    {editing ? (
                      <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="input" />
                    ) : (
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 py-3 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/20">{user[key] || 'Not specified'}</p>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ml-1"><Edit3 size={11} /> About Me</label>
                {editing ? (
                  <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="input resize-none h-28" />
                ) : (
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 py-4 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/20 leading-relaxed min-h-[100px]">{user.bio || 'Tell other students about yourself...'}</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
